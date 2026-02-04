import React, { useState, useEffect } from "react";
import styles from "./TestimonialCard.module.css";
import modalStyles from "@/styles/FunFair.module.css";

const MAX_LINES = 4;
const MAX_CHARS = 150; // Adjust based on your needs

const TestimonialCard = ({ 
  testimonial, 
  name, 
  location, 
  gender
}) => {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = testimonial.length > MAX_CHARS || testimonial.split('\n').length > MAX_LINES;
  
  // Function to truncate text to a certain number of lines
  const truncateText = (text) => {
    if (!needsTruncation || expanded) return text;
    
    const lines = text.split('\n');
    if (lines.length > MAX_LINES) {
      return lines.slice(0, MAX_LINES).join('\n') + '...';
    }
    
    if (text.length > MAX_CHARS) {
      return text.substring(0, MAX_CHARS) + '...';
    }
    
    return text;
  };

  const [showModal, setShowModal] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  return (
    <>
      <div className={styles.testimonialCard}>
        <div className={styles.testimonialTextContainer}>
          <p className={styles.testimonialText}>
            {truncateText(testimonial)}
          </p>
          {needsTruncation && (
            <button 
              className={styles.seeMoreButton}
              onClick={() => setShowModal(true)}
            >
              See more
            </button>
          )}
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.userDetails}>
            <div className={styles.avatarContainer}>
              <img 
                src={gender === "male" ? "/maleAvatarSuper.png" : "/femaleAvatarSuper.png"} 
                alt={`${name}'s avatar`} 
                className={styles.avatar}
                onError={(e) => {
                  // Fallback to default avatar if image fails to load
                  e.target.onerror = null;
                  e.target.src = "/images/avatar-placeholder.png";
                }}
              />
            </div>
            <div className={styles.userText}>
              <h4 className={styles.userName}>{name}</h4>
              <p className={styles.userLocation}>{location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Testimonial Modal */}
      {showModal && (
        <div className={modalStyles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={modalStyles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={modalStyles.modalClose}
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(false);
              }}
              aria-label="Close modal"
            >
              &times;
            </button>
            
            <div className={styles.modalTestimonialContent}>
              <p className={styles.fullTestimonialText}>{testimonial}</p>
              
              <div className={styles.modalUserInfo}>
                <div className={styles.modalAvatarContainer}>
                  <img 
                    src={gender === "male" ? "/maleAvatarSuper.png" : "/femaleAvatarSuper.png"} 
                    alt={`${name}'s avatar`} 
                    className={styles.modalAvatar}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/avatar-placeholder.png";
                    }}
                  />
                </div>
                <div className={styles.modalUserText}>
                  <h4 className={styles.modalUserName}>{name}</h4>
                  <p className={styles.modalUserLocation}>{location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestimonialCard;
