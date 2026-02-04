import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from '../../styles/StrangerThings.module.css';
import supabase from '../../lib/supabaseClient';

const ENTRY_FEE = 99;

export default function BookingPage() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [menuItems, setMenuItems] = useState({});
  const [menuData, setMenuData] = useState([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Fetch menu from API
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setIsLoadingMenu(true);
      const response = await fetch('/api/dishes');
      if (response.ok) {
        const data = await response.json();
        setMenuData(data);
      } else {
        console.error('Failed to fetch menu');
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setIsLoadingMenu(false);
    }
  };

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

  // Generate random barcode
  const generateBarcode = () => {
    const chars = '0123456789';
    let barcode = '';
    for (let i = 0; i < 30; i++) {
      barcode += chars[Math.floor(Math.random() * chars.length)];
    }
    return barcode;
  };

  const handleQuantityChange = (itemId, change) => {
    // Convert to string to ensure consistency
    const id = String(itemId);
    setMenuItems(prev => {
      const currentQty = prev[id] || 0;
      const newQty = Math.max(0, currentQty + change);
      if (newQty === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      const updated = { ...prev, [id]: newQty };
      console.log('Updated menuItems:', updated);
      return updated;
    });
  };

  const calculateMenuTotal = () => {
    const total = Object.entries(menuItems).reduce((sum, [itemId, qty]) => {
      // Try to find by converting both to strings for comparison
      const item = menuData.find(m => String(m.id) === String(itemId));
      const itemTotal = item ? item.price * qty : 0;
      console.log(`Item ${itemId}: qty=${qty}, price=${item?.price}, subtotal=${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    console.log('Menu Total:', total);
    return total;
  };

  const calculateGrandTotal = () => {
    return ENTRY_FEE + calculateMenuTotal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name && age && phone && gender) {
      setIsSubmitting(true);
      
      try {
        // Prepare menu items data
        const selectedMenuItems = Object.entries(menuItems).map(([itemId, qty]) => {
          const item = menuData.find(m => String(m.id) === String(itemId));
          console.log(`Preparing item ${itemId}:`, item);
          return {
            id: itemId,
            name: item?.name || '',
            quantity: qty,
            price: item?.price || 0
          };
        });
        console.log('Selected menu items for DB:', selectedMenuItems);

        // Save to Supabase
        const { data, error } = await supabase
          .from('premieres')
          .insert([
            {
              name: name,
              age: parseInt(age),
              phone: phone,
              gender: gender,
              menu_items: selectedMenuItems,
              menu_total: calculateMenuTotal(),
              entry_fee: ENTRY_FEE,
              grand_total: calculateGrandTotal(),
              payment_status: 'pending'
            }
          ])
          .select();

        if (error) {
          console.error('Error saving booking:', error);
          alert('Failed to save booking. Please try again.');
        } else {
          console.log('Booking saved:', data);
          setShowPass(true);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDownloadPass = () => {
    // In a real app, this would generate a PDF or image
    alert('Access pass downloaded! Check your downloads folder.');
  };

  console.log(menuData, "menuData")

  return (
    <div className={styles.bookingContainer}>
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

      {/* Scanline effect */}
      <div className={styles.scanlines}></div>

      {/* VHS noise overlay */}
      <div className={styles.vhsNoise}></div>

      {/* CRT screen effect background */}
      <div className={styles.crtBackground}></div>

      {/* Glitch bars on sides */}
      <div className={styles.glitchBars}>
        <div className={styles.glitchBarLeft}></div>
        <div className={styles.glitchBarRight}></div>
      </div>

      <motion.div 
        className={styles.bookingContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {!showPass ? (
          <motion.div 
            className={styles.bookingForm}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={styles.bookingTitle}>SECURE YOUR SPOT</h1>

            <form onSubmit={handleSubmit}>
              {/* Tickets Section - Fixed to 1 */}
              <div className={styles.formSection}>
                <label className={styles.formLabel}>TICKETS: 1 (FIXED)</label>
              </div>

              <div className={styles.divider}></div>

              {/* Menu Section */}
              <div className={styles.formSection}>
                <label className={styles.formLabel}>MENU:</label>
                {isLoadingMenu ? (
                  <p className={styles.loadingText}>Loading menu...</p>
                ) : (
                  <>
                    <div className={styles.menuList}>
                      {menuData &&menuData.map((item, index) => (
                        <div key={index} className={styles.menuItem}>
                          <div className={styles.menuItemInfo}>
                            <span className={styles.menuItemName}>{item.name}</span>
                            <span className={styles.menuItemPrice}>₹{item.price}</span>
                          </div>
                          <div className={styles.menuItemControls}>
                            <button
                              type="button"
                              className={styles.menuBtn}
                              onClick={() => handleQuantityChange(item.id, -1)}
                            >
                              [-]
                            </button>
                            <span className={styles.menuQty}>{menuItems[String(item.id)] || 0}</span>
                            <button
                              type="button"
                              className={styles.menuBtn}
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              [+]
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.pricingBreakdown}>
                      <div className={styles.priceRow}>
                        <span className={styles.priceLabel}>Entry Fee:</span>
                        <span className={styles.priceValue}>₹{ENTRY_FEE}</span>
                      </div>
                      {Object.keys(menuItems).length > 0 && (
                        <div className={styles.priceRow}>
                          <span className={styles.priceLabel}>Menu Items:</span>
                          <span className={styles.priceValue}>₹{calculateMenuTotal()}</span>
                        </div>
                      )}
                      <div className={styles.totalSection}>
                        <span className={styles.totalLabel}>GRAND TOTAL:</span>
                        <span className={styles.totalAmount}>₹{calculateGrandTotal()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.divider}></div>

              {/* Details Section */}
              <div className={styles.formSection}>
                <label className={styles.formLabel}>DETAILS:</label>
                <input
                  type="text"
                  placeholder="NAME [_________________________________]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.formInput}
                  required
                />
                <input
                  type="number"
                  placeholder="AGE [____]"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={styles.formInput}
                  required
                  min="1"
                  max="120"
                />
                <input
                  type="tel"
                  placeholder="PHONE [_________________________________]"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.formInput}
                  required
                  pattern="[0-9]{10}"
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={styles.formSelect}
                  required
                >
                  <option value="">SELECT GENDER [___________]</option>
                  <option value="male">MALE</option>
                  <option value="female">FEMALE</option>
                  <option value="other">OTHER</option>
                </select>
              </div>

              <div className={styles.divider}></div>

              {/* Submit Section */}
              <div className={styles.submitSection}>
                <motion.button
                  type="submit"
                  className={styles.submitButton}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '[ PROCESSING... ]' : '[ PROCEED TO PAYMENT ]'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            className={styles.accessPass}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className={styles.passTitle}>BOOKING CONFIRMED!</h2>
            
            <div className={styles.passContent}>
              <div className={styles.passInfo}>
                <p><strong>NAME:</strong> {name}</p>
                <p><strong>AGE:</strong> {age}</p>
                <p><strong>PHONE:</strong> {phone}</p>
                <p><strong>GENDER:</strong> {gender.toUpperCase()}</p>
                <p><strong>TICKETS:</strong> 1</p>
                <p><strong>ENTRY FEE:</strong> ₹{ENTRY_FEE}</p>
                {Object.keys(menuItems).length > 0 && (
                  <>
                    <p><strong>MENU ITEMS:</strong></p>
                    <ul className={styles.menuItemsList}>
                      {Object.entries(menuItems).map(([id, qty]) => {
                        const item = menuData.find(m => String(m.id) === String(id));
                        console.log(`Displaying item ${id}:`, item);
                        return item ? (
                          <li key={id}>{item.name} x{qty} - ₹{item.price * qty}</li>
                        ) : null;
                      })}
                    </ul>
                    <p><strong>MENU TOTAL:</strong> ₹{calculateMenuTotal()}</p>
                  </>
                )}
                <p className={styles.grandTotalText}><strong>GRAND TOTAL:</strong> ₹{calculateGrandTotal()}</p>
              </div>

              <div className={styles.divider}></div>

              {/* Scan to Pay Section */}
              <div className={styles.paymentSection}>
                <h3 className={styles.paymentTitle}>SCAN TO PAY</h3>
                <div className={styles.qrCodeContainer}>
                  <Image
                    src="/stranger-things/boi.jpg"
                    alt="Scan to Pay"
                    width={250}
                    height={250}
                    className={styles.qrCode}
                  />
                </div>
                <p className={styles.paymentInstructions}>
                  MAKE THE PAYMENT AND SEND US THE SCREENSHOT TO CONFIRM YOUR SPOT
                </p>
                <p className={styles.contactInfo}>
                  SEND SCREENSHOT TO: <strong>+91-7999699952</strong>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Static noise particles */}
      <div className={styles.staticNoise}></div>
    </div>
  );
}
