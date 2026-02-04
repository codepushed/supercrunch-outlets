import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Checkout.module.css";
import { useCart } from "../../contexts/CartContext";
import Link from "next/link";
import { trackCheckoutEvent, trackProductEvent } from "../../lib/analytics";

// Helper function to format price
const formatPrice = (price) => {
  if (typeof price === 'string') {
    // If price already has ₹ symbol, return as is
    if (price.includes('₹')) return price;
    // Otherwise add the symbol
    return `₹${price}`;
  }
  // If price is a number, format it with ₹ symbol
  return `₹${price}`;
};

export default function Checkout() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [cookingInstructions, setCookingInstructions] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState({
    dontRingBell: false,
    dropAtDoor: false,
    avoidCalling: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to home if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push("/");
    } else {
      // Track begin checkout event when the page loads with items in cart
      trackCheckoutEvent('begin_checkout', getTotalPrice());
    }
  }, [cart, router, getTotalPrice]);

  // Function to send order to WhatsApp
  const sendToWhatsApp = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const phoneNumber = "917999699952"; // Replace with your actual WhatsApp number
    
    // Create order message
    let orderMessage = `*New Order from ${customerName}*\n\n`;
    orderMessage += `*Contact:* ${customerPhone}\n`;
    orderMessage += `*Address:* ${customerAddress}\n\n`;
    
    // Add delivery instructions if any are selected
    const selectedDeliveryInstructions = [];
    if (deliveryInstructions.dontRingBell) selectedDeliveryInstructions.push("Don't ring bell, just call or text");
    if (deliveryInstructions.dropAtDoor) selectedDeliveryInstructions.push("Drop at the door, will pay now, and text me");
    if (deliveryInstructions.avoidCalling) selectedDeliveryInstructions.push("Avoid Calling");
    
    if (selectedDeliveryInstructions.length > 0) {
      orderMessage += `*Delivery Instructions:*\n${selectedDeliveryInstructions.join('\n')}\n\n`;
    }
    
    // Add cooking instructions if provided
    if (cookingInstructions.trim()) {
      orderMessage += `*Cooking Instructions:*\n${cookingInstructions}\n\n`;
    }
    orderMessage += "*Order Details:*\n";
    
    cart.forEach(item => {
      orderMessage += `${item.quantity}x ${item.name} - ${formatPrice(item.price)} each\n`;
    });
    
    // Calculate total
    const total = getTotalPrice();
    
    orderMessage += `\n*Total: ${formatPrice(total)}*`;
    
    // Track purchase event
    trackCheckoutEvent('purchase', total);
    
    // Track individual items purchased
    cart.forEach(item => {
      trackProductEvent('purchase', item.id || item.name, item.name);
    });
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(orderMessage);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Clear cart and redirect to home after a short delay
    setTimeout(() => {
      clearCart();
      router.push("/");
    }, 1000);
  };

  return (
    <>
      <Head>
        <title>Checkout - Super Crunch</title>
        <meta name="description" content="Complete your order at Super Crunch" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/seo.png" type="image/png" />
        <link href="https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <i className="fas fa-arrow-left"></i> Back to Menu
          </Link>
          <h1 className={styles.title}>Checkout</h1>
        </header>

        <main className={styles.main}>
          <div className={styles.orderSummary}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            
            {cart.length > 0 ? (
              <div className={styles.cartItems}>
                {cart.map((item, index) => (
                  <div key={index} className={styles.cartItem}>
                    <div className={styles.cartItemInfo}>
                      <h3 className={styles.cartItemTitle}>{item.name}</h3>
                      <p className={styles.cartItemPrice}>{formatPrice(item.price)} x {item.quantity}</p>
                    </div>
                    <div className={styles.cartItemQuantity}>
                      <button 
                        className={styles.quantityButton}
                        onClick={() => removeFromCart(item)}
                      >
                        -
                      </button>
                      <span className={styles.quantityDisplay}>{item.quantity}</span>
                      <button 
                        className={styles.quantityButton}
                        onClick={() => addToCart(item)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyCart}>Your cart is empty</p>
            )}
            
            <div className={styles.cartTotal}>
              <h3>Total:</h3>
              <p className={styles.totalPrice}>{formatPrice(getTotalPrice())}</p>
            </div>
          </div>

          <div className={styles.customerInfo}>
            <h2 className={styles.sectionTitle}>Delivery Information</h2>
            
            <form className={styles.checkoutForm} onSubmit={sendToWhatsApp}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Your phone number"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="address">Wing name, Flat no,</label>
                <textarea 
                  id="address" 
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Your delivery address, A1602"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Delivery Instructions</label>
                <div className={styles.checkboxGroup}>
                  <div className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id="dontRingBell"
                      checked={deliveryInstructions.dontRingBell}
                      onChange={(e) => setDeliveryInstructions({
                        ...deliveryInstructions,
                        dontRingBell: e.target.checked
                      })}
                    />
                    <label htmlFor="dontRingBell">Don't ring bell, just call or text</label>
                  </div>
                  
                  <div className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id="dropAtDoor"
                      checked={deliveryInstructions.dropAtDoor}
                      onChange={(e) => setDeliveryInstructions({
                        ...deliveryInstructions,
                        dropAtDoor: e.target.checked
                      })}
                    />
                    <label htmlFor="dropAtDoor">Drop at the door, will pay now, and text me</label>
                  </div>
                  
                  <div className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id="avoidCalling"
                      checked={deliveryInstructions.avoidCalling}
                      onChange={(e) => setDeliveryInstructions({
                        ...deliveryInstructions,
                        avoidCalling: e.target.checked
                      })}
                    />
                    <label htmlFor="avoidCalling">Avoid Calling</label>
                  </div>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="cookingInstructions">Cooking Instructions</label>
                <textarea
                  id="cookingInstructions"
                  value={cookingInstructions}
                  onChange={(e) => setCookingInstructions(e.target.value)}
                  placeholder="Any special requests? (e.g. make it spicy, no onions, etc.)"
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.menuButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
        </main>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            WE MAKE FOOD WITH HEART
            <img src="/heart.png" alt="heart" className={styles.heartIcon} />
          </p>
        </footer>
      </div>
    </>
  );
}
