import React, { useEffect, useRef, useState } from "react";
import styles from "./FoodYouSection.module.css";

const FoodYouSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const sectionRef = useRef(null);

  // Handle window width for responsive scaling
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Handle scroll for parallax effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        if (sectionRef.current) {
          const rect = sectionRef.current.getBoundingClientRect();
          const isInView = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isInView) {
            // Calculate how far the section is from the center of the viewport
            const distanceFromCenter = rect.top - window.innerHeight / 2;
            setScrollY(distanceFromCenter * 0.05); // Adjust the multiplier for more/less effect
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Intersection observer for fade-in effect
  useEffect(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.2 }
      );

      if (sectionRef.current) {
        observer.observe(sectionRef.current);
      }

      return () => {
        if (sectionRef.current) {
          observer.unobserve(sectionRef.current);
        }
      };
    } else {
      // Fallback for environments without IntersectionObserver
      setIsVisible(true);
    }
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.foodYouSection} ${isVisible ? styles.visible : ''}`}
    >
      <div className={styles.foodYouContent}>
        <h1 
          className={styles.foodYouText}
          style={{
            transform: `scale(${windowWidth > 1200 ? 1.2 : windowWidth > 1024 ? 1.1 : 1}) translateY(${scrollY}px)`
          }}
        >
          FOOD YOU
        </h1>
      </div>
    </section>
  );
};

export default FoodYouSection;
