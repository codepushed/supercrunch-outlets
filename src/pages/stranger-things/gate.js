import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import styles from '../../styles/StrangerThings.module.css';

export default function GatePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Auto-play background music
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log('Autoplay prevented:', err);
      });
      setIsPlaying(true);
    }
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Access code is "SUPERCRUNCH" or "1983" (Stranger Things reference)
    if (code.toUpperCase() === 'SUPERCRUNCH' || code === '1983') {
      router.push('/stranger-things/premiere');
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setError(false);
      }, 1000);
    }
  };

  return (
    <div className={styles.gateContainer}>
      {/* Background Music */}
      <audio ref={audioRef} loop>
        <source src="/stranger-things/bgm.mp3" type="audio/mpeg" />
      </audio>

      {/* Music Toggle Button */}
      <motion.button
        className={styles.musicToggle}
        onClick={toggleMusic}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.1 }}
      >
        {isPlaying ? '🔊' : '🔇'}
      </motion.button>

      {/* Animated background portal effect */}
      <div className={styles.portalBackground}>
        <div className={styles.portalRing}></div>
        <div className={styles.portalRing}></div>
        <div className={styles.portalRing}></div>
        <div className={styles.portalRing}></div>
        <div className={styles.portalRing}></div>
      </div>

      {/* Scanline effect */}
      <div className={styles.scanlines}></div>

      {/* VHS noise overlay */}
      <div className={styles.vhsNoise}></div>

      <motion.div 
        className={styles.gateContent}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.h1 
          className={styles.gateTitle}
          animate={{ 
            textShadow: [
              '0 0 5px #ff0000, 0 0 10px #ff0000',
              '0 0 8px #ff0000, 0 0 15px #ff0000',
              '0 0 5px #ff0000, 0 0 10px #ff0000',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          THE GATE IS LOCKED
        </motion.h1>

        <form onSubmit={handleSubmit} className={styles.gateForm}>
          <motion.div 
            className={`${styles.inputContainer} ${error ? styles.inputError : ''}`}
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="[ ENTER ACCESS CODE ]"
              className={styles.gateInput}
              autoFocus
            />
          </motion.div>
          
          {error && (
            <motion.p 
              className={styles.errorText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ACCESS DENIED
            </motion.p>
          )}
        </form>

        {/* Flickering particles */}
        <div className={styles.particles}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className={styles.particle}></div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
