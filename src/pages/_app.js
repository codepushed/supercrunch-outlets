import "@/styles/globals.css";
import { CartProvider } from "../../contexts/CartContext";
import ReactGA from "react-ga4";
import { useEffect } from "react";
import { useRouter } from "next/router";

// Initialize Google Analytics with your tracking ID
// Replace GA_MEASUREMENT_ID with your actual GA4 measurement ID
const GA_MEASUREMENT_ID = "G-9N920P2CC0";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // Initialize GA4
    ReactGA.initialize(GA_MEASUREMENT_ID);
    
    // Only track non-admin pages
    const path = window.location.pathname;
    if (!path.startsWith('/admin')) {
      // Send pageview with the initial page load
      ReactGA.send({ hitType: "pageview", page: path + window.location.search });
    }
    
    // Track page views on route changes
    const handleRouteChange = (url) => {
      // Skip tracking for admin pages
      if (!url.startsWith('/admin')) {
        ReactGA.send({ hitType: "pageview", page: url });
      }
    };
    
    // Subscribe to router events
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Unsubscribe on unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}
