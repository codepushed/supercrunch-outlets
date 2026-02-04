import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import { Luckiest_Guy, Poppins, Kaushan_Script, Smooch_Sans } from "next/font/google";
import styles from "@/styles/FunFair.module.css";
import supabase from "@/lib/supabaseClient";
import { useCart } from "../../../contexts/CartContext";
import menuItemsData from "@/data/funFairMenu.json";

const luckiestGuy = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-luckiest-guy",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const kaushanScript = Kaushan_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kaushan-script",
});

const smoochSans = Smooch_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-smooch-sans",
});

export default function FunFair() {
  const [scrollY, setScrollY] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [menuItems, setMenuItems] = useState(menuItemsData);
  const [isLoading, setIsLoading] = useState(false);
  const headerImageRef = useRef(null);
  
  // Use cart context
  const { cart, addToCart, removeFromCart, getItemQuantity, clearCart, getTotalItems, getTotalPrice } = useCart();

  // Function to handle order submission
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!orderName || !orderPhone || cart.length === 0) {
      alert('Please fill in all fields and add items to your cart');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare order items from cart
      const orderItems = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price || 0
      }));
      
      const orderData = {
        name: orderName.trim(),
        phone: orderPhone.trim(),
        items: orderItems,
        total: getTotalPrice()
      };
      
      console.log('Submitting order:', orderData);
      
      // Submit order via API endpoint
      const response = await fetch('/api/fun-fair/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Order submission failed:', result);
        throw new Error(result.error || 'Failed to submit order. Please try again.');
      }
      
      if (!result.success) {
        console.error('Order submission unsuccessful:', result);
        throw new Error(result.message || 'Order submission was not successful');
      }
      
      console.log('Order submitted successfully:', result);
      
      // Set order ID from response (now using client-generated ID)
      if (result.orderId) {
        setOrderId(result.orderId);
      }
      
      // Show success message
      setOrderSuccess(true);
      
      // Clear cart
      clearCart();
      
      // Reset form after 5 seconds (giving more time for user to see the success message)
      setTimeout(() => {
        setShowModal(false);
        setOrderName('');
        setOrderPhone('');
        setOrderSuccess(false);
        setOrderId(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to open checkout modal
  const openCheckoutModal = () => {
    setShowModal(true);
  };
  
  // Function to add product to cart
  const handleAddToCart = (product) => {
    addToCart({
      name: product.name,
      price: product.price || 199, // Default price if not specified
      image: product.image
    });
  };
  
  // Function to remove product from cart
  const handleRemoveFromCart = (product) => {
    removeFromCart({
      name: product.name
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    if (imageLoaded) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [imageLoaded]);

  useEffect(() => {
    if (headerImageRef.current && headerImageRef.current.complete) {
      setImageLoaded(true);
      setTimeout(() => setPageReady(true), 300);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Fun Fair - Super Crunch</title>
        <meta name="description" content="Join us at the Super Crunch Fun Fair! It's not just a Fun Fair, it's a Crunch Fair!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/seo.png" type="image/png" />
        <link href="https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Head>

      {!pageReady && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading...</p>
        </div>
      )}

      <div
        className={`${styles.container} ${luckiestGuy.variable} ${poppins.variable} ${kaushanScript.variable} ${smoochSans.variable}`}
        style={{ visibility: pageReady ? 'visible' : 'hidden' }}
      >
        {/* Header Section */}
        <div className={styles.header}>
          <img 
            src="/fun-fair/header.png" 
            alt="Super Crunch" 
            className={styles.headerLogo}
            ref={headerImageRef}
            onLoad={() => {
              setImageLoaded(true);
              setTimeout(() => setPageReady(true), 300);
            }}
          />
        </div>

        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Fun Fair? Nah...
              <span className={styles.heroSubtitle}>it's a Crunch Fair!</span>
            </h1>
            <img 
              src="/fun-fair/hero.png" 
              alt="Super Crunch Fun Fair" 
              className={styles.heroImage} 
            />
          </div>
        </div>

        {/* Menu Section */}
        <div className={styles.menuSection}>
          <div className={styles.menuContent}>
            <h2 className={styles.menuTitle}>Checkout the <span className={styles.menuTitleBold}>menu</span></h2>
            
            {/* Menu Cards Grid */}
            <div className={styles.menuGrid}>
              {isLoading ? (
                <div className={styles.loadingMessage}>Loading menu items...</div>
              ) : menuItems.length === 0 ? (
                <div className={styles.noItemsMessage}>No menu items available</div>
              ) : menuItems.map((product) => (
                <div key={product.id} className={styles.menuCard}>
                  <div className={styles.menuCardImage}>
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className={styles.menuCardContent}>
                    <h3 className={styles.menuCardTitle}>{product.name}</h3>
                    <p className={styles.menuCardDescription}>{product.description}</p>
                    <p className={styles.menuCardPrice}>₹{product.price}</p>
                    
                    <div className={styles.quantityControl}>
                      {getItemQuantity(product.name) > 0 ? (
                        <>
                          <button 
                            className={styles.quantityButton}
                            onClick={() => handleRemoveFromCart(product)}
                          >
                            -
                          </button>
                          <span className={styles.quantityDisplay}>
                            {getItemQuantity(product.name)}
                          </span>
                          <button 
                            className={styles.quantityButton}
                            onClick={() => handleAddToCart(product)}
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <button 
                          className={styles.orderButton}
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Floating Checkout Button */}
              {getTotalItems() > 0 && (
                <button 
                  className={styles.checkoutButton}
                  onClick={openCheckoutModal}
                >
                  <span className={styles.checkoutItems}>{getTotalItems()}</span>
                  <span>Checkout</span>
                  <span className={styles.checkoutPrice}>₹{getTotalPrice()}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Calories Section */}
        <div className={styles.caloriesSection}>
          <div className={styles.caloriesTextContainer}>
            <h2 className={styles.caloriesTitle}>Calories Don't Count</h2>
            <h3 className={styles.caloriesSubtitle}>at the Fun Fair</h3>
          </div>
        </div>
        
        {/* Order Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <button 
                className={styles.modalClose} 
                onClick={() => {
                  setShowModal(false);
                  setOrderName('');
                  setOrderPhone('');
                  setOrderSuccess(false);
                  setOrderId(null);
                }}
              >
                &times;
              </button>
              
              {orderSuccess ? (
                <div className={styles.successMessage}>
                  <h3>Order Placed Successfully!</h3>
                  <p>Thank you for your order.</p>
                  {orderId && (
                    <div className={styles.orderIdContainer}>
                      <p className={styles.orderIdLabel}>Your Order ID:</p>
                      <p className={styles.orderId}>{orderId}</p>
                      <p className={styles.cookingMessage}>We're cooking your order now!</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h2 className={styles.modalTitle}>Your Order</h2>
                  
                  {cart.length === 0 ? (
                    <p className={styles.emptyCartMessage}>Your cart is empty. Add some items first!</p>
                  ) : (
                    <>
                      <div className={styles.cartItemsList}>
                        {cart.map((item, index) => (
                          <div key={index} className={styles.cartItem}>
                            <div className={styles.cartItemInfo}>
                              <p className={styles.cartItemName}>{item.name}</p>
                              <p className={styles.cartItemPrice}>₹{item.price} × {item.quantity}</p>
                            </div>
                            <p className={styles.cartItemTotal}>₹{item.price * item.quantity}</p>
                          </div>
                        ))}
                        <div className={styles.cartTotal}>
                          <p className={styles.cartTotalLabel}>Total:</p>
                          <p className={styles.cartTotalAmount}>₹{getTotalPrice()}</p>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSubmitOrder} className={styles.orderForm}>
                        <div className={styles.formGroup}>
                          <label htmlFor="name">Name</label>
                          <input
                            type="text"
                            id="name"
                            value={orderName}
                            onChange={(e) => setOrderName(e.target.value)}
                            placeholder="Your name"
                            required
                          />
                        </div>
                        
                        <div className={styles.formGroup}>
                          <label htmlFor="phone">Phone Number</label>
                          <input
                            type="tel"
                            id="phone"
                            value={orderPhone}
                            onChange={(e) => setOrderPhone(e.target.value)}
                            placeholder="Your phone number"
                            required
                          />
                        </div>
                        
                        <button 
                          type="submit" 
                          className={styles.submitButton}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Placing Order...' : 'Place Order'}
                        </button>
                      </form>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
