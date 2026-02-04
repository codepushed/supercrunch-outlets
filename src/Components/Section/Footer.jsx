import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>SUPERCRUNCH</h1>
          <p className={styles.copyright}>© {currentYear} Supercrunch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
