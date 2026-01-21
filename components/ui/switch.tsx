import React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked = false, disabled = false, onCheckedChange, className }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onCheckedChange?.(!checked);
      }}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full border border-slate-300 transition-colors',
        checked ? 'bg-[#00E5FF]' : 'bg-slate-200',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? '-translate-x-[1px]' : '-translate-x-[22px]',
        )}
      />
    </button>
  );
};
