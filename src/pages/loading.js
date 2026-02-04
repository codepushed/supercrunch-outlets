import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import styles from '@/styles/Loading.module.css';

const Loading = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress > 90 ? 90 : newProgress; // Cap at 90% until we're actually done
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loadingContainer}>
      <Head>
        <title>Loading... | Super Crunch</title>
        <meta name="description" content="Preparing your Super Crunch experience" />
      </Head>

      <div className={styles.logoContainer}>
        <div className={styles.logo}>
          <img 
            src="/supercrunchLogomobile.png" 
            alt="Super Crunch" 
            className={styles.logoImage}
          />
        </div>
        <div className={styles.progressContainer}>
          <motion.div 
            className={styles.progressBar}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
