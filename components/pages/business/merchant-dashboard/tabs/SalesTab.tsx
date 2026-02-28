import React, { useEffect, useState } from 'react';
import SalesChannelView from './sales/SalesChannelView';

type Props = { sales: any[]; posEnabled?: boolean };

const SalesTab: React.FC<Props> = ({ sales, posEnabled = false }) => {
  const [channel, setChannel] = useState<'shop' | 'pos'>('shop');

  useEffect(() => {
    if (!posEnabled && channel !== 'shop') {
      setChannel('shop');
    }
  }, [posEnabled, channel]);

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-10 flex-row-reverse">
        <h3 className="text-3xl font-black">سجل الفواتير والعمليات</h3>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setChannel('shop')}
            className={`px-4 md:px-6 py-2 rounded-full font-black text-xs ${channel === 'shop' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
          >
            طلبات المتجر
          </button>
          {posEnabled ? (
            <button
              onClick={() => setChannel('pos')}
              className={`px-4 md:px-6 py-2 rounded-full font-black text-xs ${channel === 'pos' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
            >
              فواتير الكاشير
            </button>
          ) : null}
        </div>
      </div>

      <SalesChannelView sales={sales} channel={channel} />
    </div>
  );
};

export default SalesTab;
