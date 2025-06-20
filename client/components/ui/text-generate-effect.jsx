"use client";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export const TextGenerateEffect = memo(({
  words,
  className = "",
  onComplete,
  highlightAfterComplete = false,
  highlightClassName = "",
  glowColor = "default", // 'green', 'blue', 'default'
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) =>
    words.slice(0, latest)
  );
  const [isComplete, setIsComplete] = useState(false);

  // Memoized completion handler
  const handleComplete = useCallback(() => {
    setIsComplete(true);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    const controls = animate(count, words.length, {
      type: "tween",
      duration: 2.5,
      ease: "easeInOut",
      onComplete: handleComplete
    });
    return controls.stop;
  }, [words, handleComplete, count]);

  // Memoized glow class calculation
  const glowClass = useMemo(() => {
    if (!highlightAfterComplete || !isComplete) return '';
    
    if (glowColor === 'green' || words.toLowerCase().includes('grievance')) {
      return 'animate-glow-up-green';
    } else if (glowColor === 'blue' || words.toLowerCase().includes('voice')) {
      return 'animate-glow-up-blue';
    }
    return 'animate-glow-up';
  }, [highlightAfterComplete, isComplete, glowColor, words]);

  // Memoized glow shadow calculation
  const glowShadow = useMemo(() => {
    if (glowColor === 'green' || words.toLowerCase().includes('grievance')) {
      return [
        "0 0 0px rgba(34, 197, 94, 0)",
        "0 0 20px rgba(34, 197, 94, 0.6)",
        "0 0 30px rgba(34, 197, 94, 0.4)",
        "0 0 15px rgba(34, 197, 94, 0.2)",
        "0 0 5px rgba(34, 197, 94, 0.1)"
      ];
    } else if (glowColor === 'blue' || words.toLowerCase().includes('voice')) {
      return [
        "0 0 0px rgba(59, 130, 246, 0)",
        "0 0 20px rgba(59, 130, 246, 0.6)",
        "0 0 30px rgba(59, 130, 246, 0.4)",
        "0 0 15px rgba(59, 130, 246, 0.2)",
        "0 0 5px rgba(59, 130, 246, 0.1)"
      ];
    }
    return [
      "0 0 0px rgba(100, 100, 100, 0)",
      "0 0 20px rgba(100, 100, 100, 0.4)",
      "0 0 30px rgba(100, 100, 100, 0.3)",
      "0 0 15px rgba(100, 100, 100, 0.2)",
      "0 0 5px rgba(100, 100, 100, 0.1)"
    ];
  }, [glowColor, words]);
  return (
    <motion.span 
      className={`${className} transition-all duration-1000 ease-out ${
        isComplete && highlightAfterComplete 
          ? `${highlightClassName} ${glowClass}` 
          : ''
      }`}
      initial={false}
      animate={isComplete && highlightAfterComplete ? {
        textShadow: glowShadow,
        scale: [1, 1.03, 1.01, 1]
      } : {}}
      transition={{
        textShadow: {
          duration: 2.5,
          times: [0, 0.2, 0.5, 0.8, 1],
          ease: [0.25, 0.1, 0.25, 1] // Custom cubic-bezier for smoother ending
        },
        scale: {
          duration: 2.5,
          times: [0, 0.3, 0.7, 1],
          ease: [0.25, 0.1, 0.25, 1]
        }
      }}
    >
      {displayText}
    </motion.span>
  );
});

TextGenerateEffect.displayName = 'TextGenerateEffect';
