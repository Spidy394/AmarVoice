/**
 * Performance utilities for React optimizations
 */

// Debounce function for scroll events
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for resize events
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    return new IntersectionObserver(callback, defaultOptions);
  }
  
  return null;
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
  return fn();
};

// Preload critical resources
export const preloadResource = (href, as = 'script') => {
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }
};

// Optimize images by adding loading attribute
export const optimizeImage = (img) => {
  if (img && typeof img.setAttribute === 'function') {
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
  }
};

// Layout shift prevention utilities
export const useLayoutStable = () => {
  return {
    containerClasses: 'will-change-transform transform-gpu',
    buttonClasses: 'transition-transform duration-200 will-change-transform',
    dropdownClasses: 'will-change-contents transform-gpu backface-hidden',
    listClasses: 'will-change-scroll transform-gpu'
  };
};

// Notification-specific performance optimizations
export const optimizeNotificationRender = (notifications) => {
  // Pre-calculate notification heights to prevent layout shifts
  const baseHeight = 72; // Base notification item height in pixels
  const expectedHeight = notifications.length * baseHeight;
  
  return {
    containerStyle: {
      minHeight: `${Math.min(expectedHeight, 384)}px`, // Max 384px (h-96)
      contain: 'layout style paint'
    },
    listStyle: {
      willChange: 'scroll-position'
    }
  };
};
