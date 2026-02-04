import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import styles from './DynamicIsland.module.css';

const orders = [
  { name: 'Ajay', order: 'White Sauce Pasta', location: 'A1101', emoji: '🍝' },
  { name: 'Rahul', order: 'Margherita Pizza', location: 'B304', emoji: '🍕' },
  { name: 'Priya', order: 'Butter Chicken', location: 'D205', emoji: '🍗' },
  { name: 'Vikram', order: 'Veg Biryani', location: 'A112', emoji: '🍛' },
  { name: 'Ananya', order: 'Chocolate Brownie', location: 'E409', emoji: '🍫' },
];

const DynamicIsland = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(orders[0]); // Start with first order
  const [isVisible, setIsVisible] = useState(true); // Start visible
  const [circleSize, setCircleSize] = useState(0);
  const [circleCenter, setCircleCenter] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);
  const islandRef = useRef(null);
  const controls = useAnimation();

  const triggerHapticFeedback = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([0, 10, 5]);
    }
  }, []);

  const showRandomOrder = useCallback(() => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Trigger haptic feedback
    triggerHapticFeedback();

    // Get random order
    const randomOrder = orders[Math.floor(Math.random() * orders.length)];
    setCurrentOrder(randomOrder);
    
    // Calculate circle size and center for reveal effect
    if (islandRef.current) {
      const rect = islandRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.5;
      setCircleSize(size);
      setCircleCenter({ x: rect.width / 2, y: rect.height / 2 });
    }

    // Start animation sequence
    controls.start('visible').then(() => {
      setIsVisible(true);
      setIsExpanded(true);
      
      // Auto-collapse after 3 seconds
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
        
        // Hide completely after collapse animation
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false);
          controls.start('hidden');
        }, 400);
      }, 3000);
    });
  }, [controls, triggerHapticFeedback]);

  useEffect(() => {
    // Show first notification immediately
    showRandomOrder();
    
    // Set interval for subsequent notifications
    const interval = setInterval(showRandomOrder, 10000);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Animation variants
  const containerVariants = {
    collapsed: {
      width: 120,
      height: 36,
      borderRadius: 20,
      clipPath: `circle(18px at ${circleCenter.x}px ${circleCenter.y}px)`,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 400,
        mass: 0.6,
        restDelta: 0.001,
        clipPath: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
      }
    },
    expanded: {
      width: 320,
      height: 65,
      borderRadius: 20,
      clipPath: `circle(${circleSize}px at ${circleCenter.x}px ${circleCenter.y}px)`,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 400,
        mass: 0.6,
        restDelta: 0.001,
        clipPath: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
      }
    },
    initial: {
      clipPath: `circle(0px at ${circleCenter.x}px ${circleCenter.y}px)`,
      opacity: 0
    },
    visible: {
      clipPath: `circle(${circleSize}px at ${circleCenter.x}px ${circleCenter.y}px)`,
      opacity: 1,
      transition: {
        clipPath: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.2 }
      }
    },
    hidden: {
      clipPath: `circle(0px at ${circleCenter.x}px ${circleCenter.y}px)`,
      opacity: 0,
      transition: {
        clipPath: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.2, delay: 0.2 }
      }
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: -5,
      transition: {
        duration: 0.2
      }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.15,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0,
      y: -5,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleClick = useCallback(() => {
    triggerHapticFeedback();
    setIsExpanded(!isExpanded);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
        setTimeout(() => {
          setIsVisible(false);
          controls.start('hidden');
        }, 400);
      }, 3000);
    }
  }, [isExpanded, controls, triggerHapticFeedback]);

  return (
    <AnimatePresence>
      {(isVisible || isExpanded) && currentOrder && (
        <motion.div
          ref={islandRef}
          className={styles.dynamicIsland}
          initial="initial"
          animate={controls}
          variants={containerVariants}
          style={{
            '--gradient-start': 'rgba(36, 36, 36, 0.95)',
            '--gradient-end': 'rgba(45, 45, 45, 0.95)',
          }}
        >
          <AnimatePresence mode="wait">
            {!isExpanded ? (
              <motion.div 
                key="collapsed"
                className={styles.collapsedContent}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={contentVariants}
                style={{
                  opacity: isExpanded ? 0 : 1,
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                <div className={styles.pillDot} />
              </motion.div>
            ) : (
              <motion.div 
                key="expanded"
                className={styles.expandedContent}
                initial="hidden"
                animate={isExpanded ? "visible" : "hidden"}
                exit="exit"
                variants={contentVariants}
                style={{
                  opacity: isExpanded ? 1 : 0,
                  transition: 'opacity 0.2s ease-in-out'
                }}
              >
                <div className={styles.notificationIcon}>
                  <span className={styles.emoji}>{currentOrder.emoji}</span>
                </div>
                <div className={styles.notificationText}>
                  <span className={styles.highlight}>{currentOrder.name}</span> from{' '}
                  <span className={styles.highlight}>{currentOrder.location}</span> just ordered
                  <div className={styles.orderText}>{currentOrder.order}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DynamicIsland;
