import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(true); // Default to open until we know otherwise

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('supercrunch_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        setCart([]);
      }
    }
    setIsLoaded(true);
  }, []);
  
  // Fetch restaurant status
  useEffect(() => {
    const fetchRestaurantStatus = async () => {
      try {
        const response = await fetch('/api/restaurant/status');
        
        if (!response.ok) {
          console.error('Error fetching restaurant status:', await response.text());
          return;
        }
        
        const data = await response.json();
        setIsRestaurantOpen(data.is_open);
        
        // If restaurant is closed, we might want to show a notification
        // that ordering is disabled
        if (!data.is_open) {
          console.log('Restaurant is currently closed. Ordering is disabled.');
        }
      } catch (error) {
        console.error('Error fetching restaurant status:', error);
        // Default to open if there's an error
        setIsRestaurantOpen(true);
      }
    };
    
    fetchRestaurantStatus();
    
    // Set up polling to check restaurant status every minute
    const intervalId = setInterval(fetchRestaurantStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('supercrunch_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Add item to cart
  const addToCart = (item) => {
    // For Fun Fair, we don't check restaurant status
    const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item.name);
    
    if (existingItemIndex !== -1) {
      // Item already exists in cart, update quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (item) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.name === item.name);
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingItemIndex].quantity > 1) {
        // Decrease quantity if more than 1
        updatedCart[existingItemIndex].quantity -= 1;
        setCart(updatedCart);
      } else {
        // Remove item if quantity is 1
        setCart(updatedCart.filter(cartItem => cartItem.name !== item.name));
      }
    }
  };

  // Get item quantity in cart
  const getItemQuantity = (itemName) => {
    const item = cart.find(cartItem => cartItem.name === itemName);
    return item ? item.quantity : 0;
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total items in cart
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      // Handle different price formats (with ₹ symbol, or just number)
      let priceStr = item.price;
      if (typeof priceStr === 'string') {
        // Remove any non-numeric characters except decimal point
        priceStr = priceStr.replace(/[^0-9.]/g, '');
      }
      
      const price = parseFloat(priceStr);
      return isNaN(price) ? total : total + (price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      getItemQuantity, 
      clearCart, 
      getTotalItems, 
      getTotalPrice,
      isRestaurantOpen // Expose restaurant status to components
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
