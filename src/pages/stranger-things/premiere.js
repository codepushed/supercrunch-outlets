import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from '../../styles/StrangerThings.module.css';

export default function PremierePage() {
  const router = useRouter();
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

  const handleBookTicket = () => {
    router.push('/stranger-things/booking');
  };

  return (
    <div className={styles.premiereContainer}>
      {/* Background Image - Eleven */}
      <div className={styles.backgroundImageWrapper}>
        <Image
          src="/stranger-things/el.png"
          alt="Eleven - Stranger Things Season 5"
          fill
          className={styles.backgroundImage}
          priority
          quality={100}
        />
      </div>

      {/* Scanline effect */}
      <div className={styles.scanlines}></div>

      {/* VHS noise overlay */}
      <div className={styles.vhsNoise}></div>

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

      {/* Content overlay */}
      <motion.div 
        className={styles.premiereContentOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Super Crunch Branding */}
        <motion.div 
          className={styles.superCrunchBranding}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <h1 className={styles.superCrunchTitle}>SUPER CRUNCH</h1>
          <p className={styles.presentsText}>presents</p>
        </motion.div>

        {/* Stranger Things Logo */}
        <motion.div 
          className={styles.logoImageContainer}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <Image
            src="/stranger-things/logo.png"
            alt="Stranger Things 5"
            width={700}
            height={250}
            className={styles.logoImage}
          />
        </motion.div>

        {/* Event Details */}
        <motion.div 
          className={styles.eventDetails}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <p className={styles.premiereText}>PREMIERING EPISODE 1 & 2 AT 6PM</p>
          <p className={styles.dateText}>SUNDAY 30 NOVEMBER 2025.</p>
        </motion.div>

        {/* Book Ticket Button */}
        <motion.button
          className={styles.bookButton}
          onClick={handleBookTicket}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(255, 100, 100, 1)' }}
          whileTap={{ scale: 0.95 }}
        >
         GRAB YOUR SEAT NOW
        </motion.button>

        {/* Rules at bottom */}
        <motion.div 
          className={styles.rulesContainer}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className={styles.rule}>
            <div className={styles.ruleIcon}>🚭</div>
            <p>NO SMOKING</p>
          </div>
          <div className={styles.rule}>
            <div className={styles.ruleIcon}>🚫</div>
            <p>NO DRINKING</p>
          </div>
          <div className={styles.rule}>
            <div className={styles.ruleIcon}>🍔</div>
            <p>NO OUTSIDE FOOD</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Glitch effect overlay */}
      <div className={styles.glitchOverlay}></div>
    </div>
  );
}
