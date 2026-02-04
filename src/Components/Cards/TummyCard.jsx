import React from "react";
import Link from "next/link";
import styles from "./TummyCard.module.css";

const TummyCard = ({ image, title, description, href = "#" }) => {
  return (
    <div className={styles.tummyCard}>
      <div className={styles.imageContainer}>
        <img 
          src={image || "/images/tummy-friendly-placeholder.jpg"} 
          alt={title}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.tag}>100% Fresh</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <Link href={href} className={styles.viewMoreLink}>
          View More
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={styles.arrowIcon}
          >
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default TummyCard;
