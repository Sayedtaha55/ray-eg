import React from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
  min?: string;
  max?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  label,
  className = '',
  icon,
  min,
  max,
}) => {
  const baseClasses = 'w-full bg-slate-800 border-none rounded-2xl py-5 px-8 text-white font-bold outline-none transition-all';
  const focusClasses = 'focus:ring-2 focus:ring-[#BD00FF]/50';
  const errorClasses = error ? 'ring-2 ring-red-500' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          className={`${baseClasses} ${focusClasses} ${errorClasses} ${disabledClasses} ${icon ? 'pr-12' : ''}`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm font-bold">{error}</p>
      )}
    </div>
  );
};

export default Input;
