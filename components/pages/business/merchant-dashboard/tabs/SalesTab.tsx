import React, { useEffect, useState } from 'react';
import SalesChannelView from './sales/SalesChannelView';
import SalesReturnsView from './sales/SalesReturnsView';
import { useTranslation } from 'react-i18next';

type Props = { sales: any[]; posEnabled?: boolean };

const SalesTab: React.FC<Props> = ({ sales, posEnabled = false }) => {
  const { t } = useTranslation();
  const [channel, setChannel] = useState<'shop' | 'pos' | 'returns'>('shop');

  useEffect(() => {
    if (!posEnabled && channel === 'pos') {
      setChannel('shop');
    }
  }, [posEnabled, channel]);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-10 md:flex-row md:items-center md:justify-between md:flex-row-reverse">
        <div className="text-right">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">{t('business.sales.title')}</h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{t('business.sales.subtitle')}</p>
        </div>

        <div className="max-w-full sm:overflow-x-auto sm:touch-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:whitespace-nowrap sm:w-max sm:min-w-full sm:pb-2">
            <button
              onClick={() => setChannel('shop')}
              className={`w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 rounded-full font-black text-[11px] sm:text-xs ${channel === 'shop' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
            >
              {t('business.sales.shopOrders')}
            </button>
            {posEnabled ? (
              <button
                onClick={() => setChannel('pos')}
                className={`w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 rounded-full font-black text-[11px] sm:text-xs ${channel === 'pos' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
              >
                {t('business.sales.posInvoices')}
              </button>
            ) : null}
            <button
              onClick={() => setChannel('returns')}
              className={`w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 rounded-full font-black text-[11px] sm:text-xs ${channel === 'returns' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
            >
              {t('business.sales.returns')}
            </button>
          </div>
        </div>
      </div>

      {channel === 'returns' ? <SalesReturnsView sales={sales} /> : <SalesChannelView sales={sales} channel={channel} />}
    </div>
  );
};

export default SalesTab;
