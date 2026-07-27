import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, User, Mail, Phone, ShoppingCart, TrendingUp, CheckCircle } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';

type Props = {
  shopId: string;
  shop?: any;
};

const AbandonedCartTab: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const isEnabled = (() => {
    const enabled = (shop as any)?.layoutConfig?.enabledModules;
    return Array.isArray(enabled) && enabled.includes('abandonedCart');
  })();

  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!shopId) return;
    setLoading(true);
    setError('');
    try {
      const [statsRes, listRes] = await Promise.all([
        (ApiService as any).getAbandonedCartStats({ shopId }),
        (ApiService as any).getAbandonedCarts({ shopId, page, limit: 20 }),
      ]);
      setStats(statsRes);
      setList(Array.isArray(listRes?.items) ? listRes.items : []);
      setTotal(Number(listRes?.total) || 0);
    } catch (e: any) {
      setError(String(e?.message || t('business.abandonedCart.loadError')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [shopId]);

  const handleMarkRecovered = async (id: string) => {
    try {
      await (ApiService as any).markCartEventRecovered(id);
      await loadData();
    } catch (e: any) {
      setError(String(e?.message || t('business.abandonedCart.recoverError')));
    }
  };

  const formatMoney = (v: any) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return '0.00';
    return n.toFixed(2);
  };

  const formatDate = (dateStr: any) => {
    const d = new Date(String(dateStr));
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US');
  };

  const handleRequestUpgrade = async () => {
    setRequesting(true);
    try {
      await (ApiService as any).createMyModuleUpgradeRequest?.({
        requestedModules: ['abandonedCart'],
      });
      setRequestSent(true);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('already') || msg.includes('بالفعل')) {
        setRequestSent(true);
      }
    } finally {
      setRequesting(false);
    }
  };

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
        <ShoppingCart size={48} className="text-slate-300" />
        <h2 className="text-xl font-black text-slate-900">{t('business.abandonedCart.tabTitle')}</h2>
        <p className="text-sm font-black text-slate-500 text-center max-w-md">
          {t('business.abandonedCart.upgradeRequired')}
        </p>
        {requestSent ? (
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <CheckCircle size={18} className="text-emerald-600" />
            <span className="font-black text-emerald-700 text-sm">{t('business.abandonedCart.requestSentMsg')}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRequestUpgrade}
            disabled={requesting}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all disabled:opacity-60"
          >
            {requesting ? t('common.loading') : t('business.abandonedCart.requestUpgrade')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[11px] font-black text-slate-500 mb-2">{t('business.abandonedCart.addedToCart')}</div>
          <div className="text-2xl font-black text-slate-900">{stats?.addedToCart ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[11px] font-black text-slate-500 mb-2">{t('business.abandonedCart.checkoutStarted')}</div>
          <div className="text-2xl font-black text-slate-900">{stats?.checkoutStarted ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[11px] font-black text-slate-500 mb-2">{t('business.abandonedCart.abandoned')}</div>
          <div className="text-2xl font-black text-slate-900">{stats?.abandoned ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[11px] font-black text-slate-500 mb-2">{t('business.abandonedCart.recovered')}</div>
          <div className="text-2xl font-black text-slate-900">{stats?.recovered ?? 0}</div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-[11px] font-black text-slate-500 mb-2">{t('business.abandonedCart.abandonmentRate')}</div>
          <div className="text-2xl font-black text-slate-900">{stats?.abandonmentRate ?? 0}%</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-[11px] font-black text-slate-500 mb-2">{t('business.abandonedCart.recoveryRate')}</div>
          <div className="text-2xl font-black text-slate-900">{stats?.recoveryRate ?? 0}%</div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="font-black text-slate-900">{t('business.abandonedCart.listTitle')}</div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {t('business.abandonedCart.refresh')}
          </button>
        </div>

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="text-sm font-black text-slate-500 text-right">{t('common.loading')}</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl px-4 py-3 font-black text-sm text-right">{error}</div>
          ) : list.length === 0 ? (
            <div className="text-sm font-black text-slate-500 text-right">{t('business.abandonedCart.noData')}</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-[720px] w-full">
                <thead>
                  <tr className="text-right">
                    <th className="text-[12px] font-black text-slate-500 pb-3">{t('business.abandonedCart.date')}</th>
                    <th className="text-[12px] font-black text-slate-500 pb-3">{t('business.abandonedCart.event')}</th>
                    <th className="text-[12px] font-black text-slate-500 pb-3">{t('business.abandonedCart.customer')}</th>
                    <th className="text-[12px] font-black text-slate-500 pb-3">{t('business.abandonedCart.product')}</th>
                    <th className="text-[12px] font-black text-slate-500 pb-3">{t('business.abandonedCart.quantity')}</th>
                    <th className="text-[12px] font-black text-slate-500 pb-3">{t('business.abandonedCart.price')}</th>
                    <th className="text-[12px] font-black text-slate-500 pb-3">{t('business.abandonedCart.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row: any) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="py-3 text-right font-black text-slate-700">{formatDate(row.createdAt)}</td>
                      <td className="py-3 text-right font-black text-slate-700">{String(row.event || '').replace('_', ' ')}</td>
                      <td className="py-3 text-right font-black text-slate-700">
                        {row.customerName ? (
                          <div>
                            <div>{row.customerName}</div>
                            {row.customerEmail && <div className="text-xs text-slate-500">{row.customerEmail}</div>}
                            {row.customerPhone && <div className="text-xs text-slate-500">{row.customerPhone}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right font-black text-slate-700">{row.product?.name || '-'}</td>
                      <td className="py-3 text-right font-black text-slate-700">{row.quantity || 1}</td>
                      <td className="py-3 text-right font-black text-slate-900">{t('business.pos.egp')} {formatMoney(row.unitPrice)}</td>
                      <td className="py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          {!row.isRecovered ? (
                            <button
                              type="button"
                              onClick={() => handleMarkRecovered(row.id)}
                              className="px-3 py-2 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-colors"
                            >
                              {t('business.abandonedCart.recover')}
                            </button>
                          ) : (
                            <span className="px-3 py-2 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center gap-1">
                              <CheckCircle size={14} />
                              {t('business.abandonedCart.recovered')}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AbandonedCartTab;
