import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'public' | 'business';
  className?: string;
  mode?: 'toggle' | 'options';
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'public', className = '', mode = 'toggle' }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const toggle = () => {
    const next = isAr ? 'en' : 'ar';
    i18n.changeLanguage(next);
  };
  const setLanguage = (lang: 'ar' | 'en') => {
    if (i18n.language === lang) return;
    i18n.changeLanguage(lang);
  };

  const baseClasses = variant === 'business'
    ? 'flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all'
    : 'flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-[10px] md:text-xs transition-all';

  const colorClasses = variant === 'business'
    ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 hover:border-white/40'
    : 'bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900';

  if (mode === 'options') {
    const activeOptionClasses = variant === 'business'
      ? 'bg-white text-slate-900'
      : 'bg-slate-900 text-white';
    const inactiveOptionClasses = variant === 'business'
      ? 'text-white/80 hover:bg-white/15'
      : 'text-slate-500 hover:bg-slate-100';
    const groupClasses = variant === 'business'
      ? 'bg-white/10 border border-white/20'
      : 'bg-slate-50 border border-slate-200';
    return (
      <div className={`inline-flex items-center rounded-xl p-1 ${groupClasses} ${className}`} role="group" aria-label={t('common.languageToggle.switchToEnglish')}>
        <button
          type="button"
          onClick={() => setLanguage('ar')}
          className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${isAr ? activeOptionClasses : inactiveOptionClasses}`}
          aria-pressed={isAr}
        >
          {t('common.languageToggle.arabicLabel')}
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${!isAr ? activeOptionClasses : inactiveOptionClasses}`}
          aria-pressed={!isAr}
        >
          {t('common.languageToggle.englishLabel')}
        </button>
      </div>
    );
  }

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
