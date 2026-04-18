import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'public' | 'business';
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'public', className = '' }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const toggle = () => {
    const next = isAr ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };

  const baseClasses = variant === 'business'
    ? 'flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all'
    : 'flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-[10px] md:text-xs transition-all';

  const colorClasses = variant === 'business'
    ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 hover:border-white/40'
    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900';

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${baseClasses} ${colorClasses} ${className}`}
      aria-label={isAr ? t('common.languageToggle.switchToEnglish') : t('common.languageToggle.switchToArabic')}
    >
      <Languages className="w-3.5 h-3.5" />
      <span>{isAr ? t('common.languageToggle.englishShort') : t('common.languageToggle.arabicShort')}</span>
    </button>
  );
};

export default LanguageToggle;
