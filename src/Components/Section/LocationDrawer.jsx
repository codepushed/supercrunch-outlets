import { useState, useEffect } from 'react';
import styles from './LocationDrawer.module.css';

const locations = [
  {
    id: 'roshan-milestone',
    name: 'Roshan Milestone',
    image: '/locations/roshan-milestone.png',
    isLocal: true, // This location stays on the current site
  },
  {
    id: 'rohan-ananta',
    name: 'Rohan Ananta',
    image: '/locations/rohan-ananta.png',
    isLocal: false,
  },
  {
    id: 'zolo-sparks',
    name: 'Zolo Sparks',
    image: '/locations/zolo-sparks.png',
    isLocal: false,
  },
  {
    id: 'bilvadal-pg',
    name: 'Bilvadal PG',
    image: '/locations/Bilvadal-pg.png',
    isLocal: false,
  },
];

export default function LocationDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal on page load
    setIsOpen(true);
  }, []);

  const handleLocationClick = (location) => {
    if (location.isLocal) {
      // Roshan Milestone - just close the modal
      setIsOpen(false);
    } else {
      // Other locations - redirect to outlets site
      window.location.href = 'https://outlets.supercrunch.in';
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.drawer}>
        <button className={styles.closeButton} onClick={handleClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <h2 className={styles.title}>Choose your location?</h2>

        <div className={styles.locationsGrid}>
          {locations.map((location) => (
            <div
              key={location.id}
              className={styles.locationCard}
              onClick={() => handleLocationClick(location)}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={location.image}
                  alt={location.name}
                  className={styles.locationImage}
                />
              </div>
              <p className={styles.locationName}>{location.name}</p>
            </div>
          ))}
        </div>

        <p className={styles.subtitle}>Only available in Tathawade</p>
      </div>
    </div>
  );
}
