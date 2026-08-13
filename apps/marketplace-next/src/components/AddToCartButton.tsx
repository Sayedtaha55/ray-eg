'use client';

import { ShoppingBag, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/services';

export function AddToCartButton({
  product,
  size = 'md',
  color,
}: {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isAvailable === false) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const sizeCls = size === 'sm' ? 'px-3 py-2 text-xs' : size === 'lg' ? 'px-8 py-4 text-base' : 'px-4 py-2.5 text-sm';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  if (product.isAvailable === false) {
    return (
      <button
        disabled
        className={`${sizeCls} rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold cursor-not-allowed flex items-center gap-2`}
      >
        غير متوفر
      </button>
    );
  }

  // When a custom color is provided (from the shop's builder config), use it
  // as the button background instead of the default brand gradient.
  const colorStyle = color ? { backgroundColor: color, color: '#0F172A' } : undefined;
  const colorCls = color ? '' : 'bg-brand-gradient text-white hover:shadow-glow-cyan';

  return (
    <button
      onClick={handleAdd}
      style={colorStyle}
      className={`${sizeCls} rounded-lg ${colorCls} font-bold flex items-center gap-2 transition-all ${
        added ? '!bg-green-500 !text-white' : ''
      }`}
    >
      {added ? <Check className={iconSize} /> : <ShoppingBag className={iconSize} />}
      {added ? 'تمت الإضافة' : 'أضف للسلة'}
    </button>
  );
}
