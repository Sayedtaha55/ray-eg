import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  overlay?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className = '',
  overlay = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const Component = overlay ? motion.div : 'div';
  const componentProps = overlay ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    className: 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
  } : {
    className: `flex items-center justify-center gap-3 ${className}`
  };

  return (
    React.createElement(
      Component,
      componentProps,
      <>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={`${sizeClasses[size]} text-[#00E5FF]`}
        >
          <Loader2 className="w-full h-full" />
        </motion.div>
        {text && (
          <span className="text-white font-bold animate-pulse">{text}</span>
        )}
      </>
    )
  );
};

export default Loading;
