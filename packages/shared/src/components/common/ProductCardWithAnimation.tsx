import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardWithAnimationProps {
  children: React.ReactNode;
  isAdded?: boolean;
  onAnimationEnd?: () => void;
}

export const ProductCardWithAnimation: React.FC<ProductCardWithAnimationProps> = ({ children, isAdded, onAnimationEnd }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAdded && !isAnimating) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onAnimationEnd?.();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isAdded, isAnimating, onAnimationEnd]);

  return (
    <AnimatePresence>
      {!isAnimating ? (
        <motion.div
          key="card"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="card-adding"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0.8, y: -20 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
