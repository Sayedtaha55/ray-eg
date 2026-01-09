import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'solid';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  clickable = false,
  onClick,
  variant = 'default',
}) => {
  const baseClasses = 'rounded-2xl border transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white/5 border-white/10',
    glass: 'bg-white/5 backdrop-blur-xl border-white/10',
    solid: 'bg-slate-800 border-white/20'
  };

  const hoverClasses = hover ? 'hover:bg-white/10 hover:scale-[1.02] hover:shadow-xl' : '';
  const clickableClasses = clickable ? 'cursor-pointer active:scale-[0.98]' : '';

  const Component = clickable ? motion.div : 'div';
  const motionProps = clickable ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    onClick,
  } : {};

  return (
    <Component
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${clickableClasses} ${className}`}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export default Card;
