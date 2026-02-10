import React from 'react';
import { cn } from '@/lib/utils';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

export const PurchaseModeButton: React.FC<Props> = ({
  label = 'وضع الشراء',
  className,
  type,
  ...props
}) => {
  return (
    <button
      type={type ?? 'button'}
      className={cn(
        'px-5 py-3 rounded-2xl bg-[#00E5FF] text-black font-black hover:opacity-90',
        className,
      )}
      {...props}
    >
      {label}
    </button>
  );
};
