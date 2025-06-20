// Utility to help prevent hydration mismatches
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? 
    require('react').useLayoutEffect : 
    require('react').useEffect;

export const useHasMounted = () => {
  const [hasMounted, setHasMounted] = require('react').useState(false);
  
  require('react').useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
};

// Generate deterministic random values that are safe for SSR
export const createSafeRandomArray = (length, seed = 0) => {
  const array = [];
  let currentSeed = seed;
  
  for (let i = 0; i < length; i++) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const random = currentSeed / 233280;
    array.push(random);
  }
  
  return array;
};
