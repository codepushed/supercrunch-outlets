import ReactGA from 'react-ga4';

/**
 * Track a page view in Google Analytics
 * @param {string} path - The path of the page (e.g., '/products')
 */
export const trackPageView = (path) => {
  // Skip tracking for admin pages
  if (path.startsWith('/admin')) {
    return;
  }
  ReactGA.send({ hitType: 'pageview', page: path });
};

/**
 * Track an event in Google Analytics
 * @param {string} category - Event category (e.g., 'Product')
 * @param {string} action - Event action (e.g., 'View')
 * @param {string} [label] - Optional event label
 * @param {number} [value] - Optional event value
 */
export const trackEvent = (category, action, label = null, value = null) => {
  // Skip tracking for admin-related events
  if (category.toLowerCase().includes('admin')) {
    return;
  }
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

/**
 * Track product interactions
 * @param {string} action - The action performed (e.g., 'view', 'add_to_cart')
 * @param {string} productId - The ID of the product
 * @param {string} [productName] - Optional product name
 */
export const trackProductEvent = (action, productId, productName = null) => {
  trackEvent('Product', action, productName || productId);
};

/**
 * Track checkout events
 * @param {string} action - The checkout action (e.g., 'begin_checkout', 'purchase')
 * @param {number} [value] - Optional order value
 */
export const trackCheckoutEvent = (action, value = null) => {
  trackEvent('Checkout', action, null, value);
};
