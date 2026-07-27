import React from 'react';
import { cn } from '@/lib/utils';
import i18n from '@/i18n';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

export const PurchaseModeButton: React.FC<Props> = ({
  label = i18n.t('common.purchaseModeButton.label'),
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
