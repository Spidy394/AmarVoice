import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for managing mounted state with better performance
 */
export const useMounted = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return mounted;
};

/**
 * Custom hook for stable random values that don't change on re-renders
 */
export const useStableRandom = (generator, dependencies = []) => {
  const [value, setValue] = useState(null);
  const hasGeneratedRef = useRef(false);
  
  useEffect(() => {
    if (!hasGeneratedRef.current && typeof generator === 'function') {
      try {
        setValue(generator());
        hasGeneratedRef.current = true;
      } catch (error) {
        console.warn('Error generating stable random value:', error);
      }
    }
  }, dependencies);
  
  return value;
};

/**
 * Custom hook for managing timer state with cleanup
 */
export const useTimer = (initialTime = 0, interval = 1000) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);
  
  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  const reset = useCallback(() => {
    setTime(initialTime);
    setIsRunning(false);
  }, [initialTime]);
  
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, interval]);
  
  return {
    time,
    isRunning,
    start,
    stop,
    reset
  };
};

/**
 * Custom hook for managing animation state with performance optimization
 */
export const useAnimationState = (duration = 4000) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  
  const setMaxItems = useCallback((count) => {
    setMaxIndex(count - 1);
  }, []);
  
  useEffect(() => {
    if (maxIndex > 0) {
      const interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % (maxIndex + 1));
      }, duration);
      
      return () => clearInterval(interval);
    }
  }, [maxIndex, duration]);
  
  return {
    activeIndex,
    setMaxItems
  };
};
