import React, { useEffect, useState } from 'react';
import SalesChannelView from './sales/SalesChannelView';
import SalesReturnsView from './sales/SalesReturnsView';

type Props = { sales: any[]; posEnabled?: boolean };

const SalesTab: React.FC<Props> = ({ sales, posEnabled = false }) => {
  const [channel, setChannel] = useState<'shop' | 'pos' | 'returns'>('shop');

  useEffect(() => {
    if (!posEnabled && channel === 'pos') {
      setChannel('shop');
    }
  }, [posEnabled, channel]);

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-10 flex-row-reverse">
        <h3 className="text-3xl font-black">سجل الفواتير والعمليات</h3>

        <div className="max-w-full sm:overflow-x-auto sm:touch-auto">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:whitespace-nowrap sm:w-max sm:min-w-full sm:pb-2">
            <button
              onClick={() => setChannel('shop')}
              className={`w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 rounded-full font-black text-[11px] sm:text-xs ${channel === 'shop' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
            >
              طلبات المتجر
            </button>
            {posEnabled ? (
              <button
                onClick={() => setChannel('pos')}
                className={`w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 rounded-full font-black text-[11px] sm:text-xs ${channel === 'pos' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
              >
                فواتير الكاشير
              </button>
            ) : null}
            <button
              onClick={() => setChannel('returns')}
              className={`w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 rounded-full font-black text-[11px] sm:text-xs ${channel === 'returns' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
            >
              المرتجعات
            </button>
          </div>
        </div>
      </div>

      {channel === 'returns' ? <SalesReturnsView sales={sales} /> : <SalesChannelView sales={sales} channel={channel} />}
    </div>
  );
};

export default SalesTab;
