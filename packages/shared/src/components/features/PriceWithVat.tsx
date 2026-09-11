'use client';

import React from 'react';
import { Truck } from 'lucide-react';

interface PriceWithVatProps {
  price: number;
  currency?: string;
  vatInclusive?: boolean;
  shippingCost?: number | null;
  oldPrice?: number | null;
  className?: string;
}

function formatCurrency(amount: number, currency?: string): string {
  try {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency || 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency || 'ج.م'}`;
  }
}

export default function PriceWithVat({
  price,
  currency = 'EGP',
  vatInclusive,
  shippingCost,
  oldPrice,
  className = '',
}: PriceWithVatProps) {
  const hasDiscount = oldPrice && oldPrice > price;

  return (
    <div className={`flex flex-col gap-1 ${className}`} dir="rtl">
      <div className="flex items-center gap-2">
        <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {formatCurrency(price, currency)}
        </span>
        {hasDiscount && (
          <span className="text-sm text-slate-400 line-through font-semibold">
            {formatCurrency(oldPrice!, currency)}
          </span>
        )}
      </div>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md inline-block w-fit
        ${vatInclusive
          ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'}
      `}>
        {vatInclusive ? 'شامل الضريبة' : '(قبل الضريبة)'}
      </span>
      {shippingCost != null && shippingCost > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
          <Truck className="w-3.5 h-3.5" />
          <span>شحن: {formatCurrency(shippingCost, currency)}</span>
        </div>
      )}
    </div>
  );
}
