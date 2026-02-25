import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

interface CartIconWithAnimationProps {
  count: number;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export const CartIconWithAnimation: React.FC<CartIconWithAnimationProps> = ({ count, className, onClick, ariaLabel }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(count);

  useEffect(() => {
    if (count > prevCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(count);
  }, [count, prevCount]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative transition-transform active:scale-95 ${className}`}
      aria-label={ariaLabel || `سلة المشتريات (${count})`}
      title={ariaLabel || 'سلة المشتريات'}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <ShoppingCart className="w-5 h-5" />
      </motion.div>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-[#BD00FF] text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};
