import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface PlaceholderTabProps {
  tabId: string;
  title?: string;
  icon?: React.ReactNode;
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title, icon }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center mb-6">
        {icon || <Sparkles className="w-10 h-10 text-cyan-500" />}
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        {title || (isArabic ? 'قريباً' : 'Coming Soon')}
      </h2>
      <p className="text-sm font-semibold text-slate-500 max-w-md">
        {isArabic
          ? 'هذه الصفحة قيد التطوير وستكون متاحة قريباً. يمكنك تفعيلها من إعدادات الوحدات.'
          : 'This page is under development and will be available soon. You can enable it from module settings.'}
      </p>
    </div>
  );
};

export default PlaceholderTab;
