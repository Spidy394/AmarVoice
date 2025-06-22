import { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { debounce } from '@/lib/performance-utils';

/**
 * Higher-order component for performance optimization
 * Provides common optimizations like debounced handlers and memoization
 */
export const withPerformanceOptimization = (Component) => {
  const PerformanceOptimizedComponent = memo((props) => {
    const [isVisible, setIsVisible] = useState(false);
    
    // Intersection observer for lazy loading
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );
      
      const element = document.querySelector(`[data-component="${Component.name}"]`);
      if (element) {
        observer.observe(element);
      }
      
      return () => observer.disconnect();
    }, []);
    
    // Memoized props to prevent unnecessary re-renders
    const memoizedProps = useMemo(() => props, [props]);
      return (
      <div data-component={Component.name}>
        <Component {...memoizedProps} isVisible={isVisible} />
      </div>
    );
  });
  
  // Set display name for debugging
  PerformanceOptimizedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name || 'Component'})`;
  
  return PerformanceOptimizedComponent;
};

/**
 * Hook for optimized scroll handling
 */
export const useOptimizedScroll = (callback, delay = 100) => {
  const debouncedCallback = useMemo(() => debounce(callback, delay), [callback, delay]);
  
  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(debouncedCallback);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [debouncedCallback]);
};

/**
 * Hook for optimized resize handling
 */
export const useOptimizedResize = (callback, delay = 150) => {
  const debouncedCallback = useMemo(() => debounce(callback, delay), [callback, delay]);
  
  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(debouncedCallback);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [debouncedCallback]);
};

/**
 * Hook for reduced motion preference
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
    return prefersReducedMotion;
};
