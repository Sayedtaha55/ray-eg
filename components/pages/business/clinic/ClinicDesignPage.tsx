import React from 'react';
import { useTranslation } from 'react-i18next';

const ClinicDesignPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 md:p-8">
      <div className="text-lg font-black text-slate-900">{t('business.clinic.design.title')}</div>
      <div className="mt-2 text-sm font-bold text-slate-500">{t('business.clinic.design.subtitle')}</div>
    </div>
  );
};

export default ClinicDesignPage;
