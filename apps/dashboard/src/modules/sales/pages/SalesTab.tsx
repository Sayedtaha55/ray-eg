import React from 'react';
import SalesChannelView from './sales/SalesChannelView';
import { useTranslation } from 'react-i18next';
import { getShopActivityVocabulary } from '@/utils/businessActivityVocabulary';

type Props = { sales: any[]; shop?: any };

const SalesTab: React.FC<Props> = ({ sales, shop }) => {
  const { t, i18n } = useTranslation();
  const activityVocab = getShopActivityVocabulary(shop, i18n.language);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex flex-col gap-4 md:gap-6 mb-4 sm:mb-6 md:flex-row md:items-center md:justify-between md:flex-row-reverse">
        <div className="text-right">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold">{activityVocab.salesTabLabel}</h3>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">{t('business.sales.subtitle')}</p>
        </div>
      </div>

      <SalesChannelView sales={sales} channel="shop" />
    </div>
  );
};

export default SalesTab;
