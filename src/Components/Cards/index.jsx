import React, { useState } from "react";
import { useCart } from "../../../contexts/CartContext";
import styles from "@/styles/FunFair.module.css";
import TestimonialCard from "./TestimonialCard";

export { TestimonialCard };

const Cards = ({ menuItems = [], isLoading = false }) => {
  const { 
    cart,
    addToCart, 
    removeFromCart, 
    getItemQuantity, 
    getTotalItems, 
    getTotalPrice,
    clearCart,
    isRestaurantOpen
  } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleRemoveFromCart = (product) => {
    removeFromCart(product);
  };

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [cookingInstructions, setCookingInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [total, setTotal] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryInstructions, setDeliveryInstructions] = useState({
    dontRingBell: false,
    dropAtDoor: false,
    avoidCalling: false
  });

  const openCheckoutModal = () => {
    setShowCheckoutModal(true);
  };

  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCookingInstructions("");
    setOrderSuccess(false);
    setOrderId(null);
    setTotal(0);
  };

  const handleDeliveryInstructionChange = (instruction) => {
    setDeliveryInstructions(prev => ({
      ...prev,
      [instruction]: !prev[instruction]
    }));
  };

  const applyCoupon = () => {
    // Just apply any coupon code entered - no validation
    if (!couponCode || couponCode.trim() === '') {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Apply the coupon with 0 discount (just for UI display)
    setAppliedCoupon({
      code: couponCode.toUpperCase().trim(),
      value: 0,
      amount: 0
    });
    setDiscount(0);
    setCouponError('');
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError('');
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare delivery instructions
      const selectedDeliveryInstructions = [];
      if (deliveryInstructions.dontRingBell) selectedDeliveryInstructions.push("Don't ring bell, just call or text");
      if (deliveryInstructions.dropAtDoor) selectedDeliveryInstructions.push("Drop at the door, will pay now, and text me");
      if (deliveryInstructions.avoidCalling) selectedDeliveryInstructions.push("Avoid Calling");
      
      // Calculate totals
      const subtotal = getTotalPrice();
      const total = subtotal - discount;
      setTotal(total);
      
      // Prepare order data
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        subtotal: subtotal,
        discount: discount,
        total: total,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        delivery_instructions: selectedDeliveryInstructions.length > 0 ? selectedDeliveryInstructions : null,
        cooking_instructions: cookingInstructions.trim() || null
      };
      
      // Send order to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to place order');
      }
      
      // Show success message with order details
      setOrderSuccess(true);
      setOrderId(result.order.order_number);
      
      // Clear cart after successful order
      setTimeout(() => {
        clearCart();
        setIsSubmitting(false);
      }, 500);
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message}`);
      setIsSubmitting(false);
    }
  }; 

  // Group menu items by category
  const CATEGORY_ORDER = [
    {name: 'New Arrivals', desc: "Fresh on the menu, hot on your cravings."},
    {name: 'Crunch Corner', desc: "Because snacking matters."},
    {name: 'Sip & Chill', desc: "Cool drinks, cooler vibes"},
    {name: 'Bowl Stories', desc: "Comfort served in a bowl"},
    {name: 'Pasta Special', desc: "Twirl. Slurp. Repeat."},
    {name: 'Desserts', desc: "Sweet endings that make it all worth it"}
  ];
  const grouped = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Snacks';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Sort categories by defined order, unknown categories go at the end
 const sortedCategories = Object.keys(grouped).sort((a, b) => {
  const idxA = CATEGORY_ORDER.findIndex(cat => cat.name === a);
  const idxB = CATEGORY_ORDER.findIndex(cat => cat.name === b);
  return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
});





  return (
    <>
      {isLoading ? (
        <div className={styles.menuGrid}>
          <div className={styles.loadingMessage}>Loading menu items...</div>
        </div>
      ) : menuItems.length === 0 ? (
        <div className={styles.menuGrid}>
          <div className={styles.noItemsMessage}>No menu items available</div>
        </div>
      ) : sortedCategories.map((category) => (
        <div key={category} className={styles.categorySection}>
          <h2 className={styles.categoryHeading}>{category}</h2>
          <h3 className={styles.categoryDescription}>{CATEGORY_ORDER.find(cat => cat.name === category)?.desc}</h3>
          <div className={styles.menuGrid}>
            {grouped[category].map((product) => (
              <div key={product.id} className={styles.menuCard} onClick={() => setSelectedProduct(product)} style={{ cursor: 'pointer' }}>
                <div className={styles.menuCardImage}>
                  <img
                    src={product.image || '/fallbackImag.png'}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = '/fallbackImag.png';
                    }}
                  />
                </div>
                <div className={styles.menuCardContent}>
                  <h3 className={styles.menuCardTitle}>{product.name}</h3>
                  <p className={styles.menuCardDescription}>{product.description}</p>
                  <p className={styles.menuCardPrice}>₹{product.price}</p>

                  <div className={styles.quantityControl} onClick={(e) => e.stopPropagation()}>
                    {getItemQuantity(product.name) > 0 ? (
                      <>
                        <button
                          className={styles.quantityButton}
                          onClick={() => handleRemoveFromCart(product)}
                          disabled={!isRestaurantOpen}
                        >
                          -
                        </button>
                        <span className={styles.quantityDisplay}>
                          {getItemQuantity(product.name)}
                        </span>
                        <button
                          className={styles.quantityButton}
                          onClick={() => handleAddToCart(product)}
                          disabled={!isRestaurantOpen}
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <button
                        className={styles.orderButton}
                        onClick={() => handleAddToCart(product)}
                        disabled={!isRestaurantOpen}
                        title={!isRestaurantOpen ? "Restaurant is currently closed" : ""}
                      >
                        {isRestaurantOpen ? "Add to Cart" : "Currently Closed"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className={styles.detailOverlay} onClick={() => setSelectedProduct(null)}>
          <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.detailClose} onClick={() => setSelectedProduct(null)}>
              &times;
            </button>
            <div className={styles.detailImage}>
              <img
                src={selectedProduct.image || '/fallbackImag.png'}
                alt={selectedProduct.name}
                onError={(e) => { e.target.src = '/fallbackImag.png'; }}
              />
            </div>
            <div className={styles.detailBody}>
              <h2 className={styles.detailTitle}>{selectedProduct.name}</h2>
              <p className={styles.detailDescription}>{selectedProduct.description}</p>
              <p className={styles.detailPrice}>₹{selectedProduct.price}</p>

              <div className={styles.detailActions} onClick={(e) => e.stopPropagation()}>
                {getItemQuantity(selectedProduct.name) > 0 ? (
                  <div className={styles.detailQuantity}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleRemoveFromCart(selectedProduct)}
                      disabled={!isRestaurantOpen}
                    >
                      -
                    </button>
                    <span className={styles.quantityDisplay}>
                      {getItemQuantity(selectedProduct.name)}
                    </span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => handleAddToCart(selectedProduct)}
                      disabled={!isRestaurantOpen}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.orderButton}
                    onClick={() => handleAddToCart(selectedProduct)}
                    disabled={!isRestaurantOpen}
                    title={!isRestaurantOpen ? "Restaurant is currently closed" : ""}
                    style={{ width: '100%' }}
                  >
                    {isRestaurantOpen ? "Add to Cart" : "Currently Closed"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Checkout Button */}
      {getTotalItems() > 0 && (
        <button 
          className={styles.checkoutButton}
          onClick={openCheckoutModal}
          disabled={!isRestaurantOpen}
          title={!isRestaurantOpen ? "Restaurant is currently closed" : ""}
        >
          <span className={styles.checkoutItems}>{getTotalItems()}</span>
          <span>{isRestaurantOpen ? "Checkout" : "Closed"}</span>
          <span className={styles.checkoutPrice}>₹{getTotalPrice()}</span>
        </button>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={closeCheckoutModal}>
              &times;
            </button>
            
            {orderSuccess ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>✓</div>
                <h3>Order Placed Successfully!</h3>
                <p>Thank you for your order, {customerName}!</p>
                {orderId && (
                  <div className={styles.orderIdContainer}>
                    <p className={styles.orderIdLabel}>Your Order Number:</p>
                    <p className={styles.orderId}>{orderId}</p>
                    <div className={styles.orderDetails}>
                      <p><strong>Total Amount:</strong> ₹{total}</p>
                      <p><strong>Delivery Address:</strong> {customerAddress}</p>
                      <p><strong>Contact:</strong> {customerPhone}</p>
                    </div>
                    <p className={styles.cookingMessage}>🍳 We're preparing your delicious order now!</p>
                    <p className={styles.deliveryMessage}>You'll receive a message shortly for confirmation.</p>
                  </div>
                )}
                <button 
                  onClick={closeCheckoutModal}
                  className={styles.closeSuccessButton}
                >
                  Close
                </button>
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
                        <p className={styles.cartTotalLabel}>Subtotal:</p>
                        <p className={styles.cartTotalAmount}>₹{getTotalPrice()}</p>
                      </div>
                      
                      {appliedCoupon && appliedCoupon.amount > 0 && (
                        <div className={styles.cartTotal}>
                          <p className={styles.cartTotalLabel} style={{ color: '#28a745' }}>
                            Discount ({appliedCoupon.code}):
                          </p>
                          <p className={styles.cartTotalAmount} style={{ color: '#28a745', fontWeight: '600' }}>
                            -₹{appliedCoupon.amount}
                          </p>
                        </div>
                      )}
                      
                      <div className={styles.cartTotal} style={{ marginTop: '5px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                        <p className={styles.cartTotalLabel} style={{ fontWeight: 'bold' }}>Total:</p>
                        <p className={styles.cartTotalAmount} style={{ fontWeight: 'bold' }}>
                          ₹{getTotalPrice() - discount}
                        </p>
                      </div>
                    </div>
                    
                    <form onSubmit={placeOrder} className={styles.orderForm}>
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
                        <label htmlFor="address">Wing name, Flat no</label>
                        <textarea
                          id="address"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Your delivery address, A1602"
                          required
                          rows="3"
                        />
                      </div>
                      
                      <div className={styles.deliveryInstructions}>
                        <p style={{ marginBottom: '0.5rem' }}>Delivery Instructions:</p>
                        <div className={styles.instructionCheckbox}>
                          <input
                            type="checkbox"
                            id="dontRingBell"
                            checked={deliveryInstructions.dontRingBell}
                            onChange={() => handleDeliveryInstructionChange('dontRingBell')}
                          />
                          <label htmlFor="dontRingBell">Don't ring bell, just call or text</label>
                        </div>
                        <div className={styles.instructionCheckbox}>
                          <input
                            type="checkbox"
                            id="dropAtDoor"
                            checked={deliveryInstructions.dropAtDoor}
                            onChange={() => handleDeliveryInstructionChange('dropAtDoor')}
                          />
                          <label htmlFor="dropAtDoor">Drop at the door, will pay now, and text me</label>
                        </div>
                        <div className={styles.instructionCheckbox}>
                          <input
                            type="checkbox"
                            id="avoidCalling"
                            checked={deliveryInstructions.avoidCalling}
                            onChange={() => handleDeliveryInstructionChange('avoidCalling')}
                          />
                          <label htmlFor="avoidCalling">Avoid Calling</label>
                        </div>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="cookingInstructions">Cooking Instructions (Optional)</label>
                        <textarea
                          id="cookingInstructions"
                          value={cookingInstructions}
                          onChange={(e) => setCookingInstructions(e.target.value)}
                          placeholder="Any special cooking instructions?"
                          rows="2"
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Coupon Code</label>
                        {!appliedCoupon ? (
                          <>
                            <div className={styles.couponInputGroup}>
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Enter coupon code"
                              />
                              <button 
                                type="button" 
                                onClick={applyCoupon}
                                className={styles.couponButton}
                              >
                                Apply
                              </button>
                            </div>
                            {couponError && <p className={styles.couponError}>⚠️ {couponError}</p>}
                          </>
                        ) : (
                          <div className={styles.appliedCouponBadge}>
                            <div className={styles.appliedCouponText}>
                              <span>✓</span>
                              <span>Coupon Applied:</span>
                              <span className={styles.appliedCouponCode}>{appliedCoupon.code}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={removeCoupon}
                              className={styles.removeCouponButton}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isSubmitting || !isRestaurantOpen}
                        title={!isRestaurantOpen ? "Restaurant is currently closed" : ""}
                      >
                        {isSubmitting ? 'Placing Order...' : !isRestaurantOpen ? 'Restaurant Closed' : 'Place Order'}
                      </button>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Cards;