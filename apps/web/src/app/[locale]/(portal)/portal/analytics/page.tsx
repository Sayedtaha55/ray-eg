'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

export default function PortalAnalyticsPage() {
  const t = useT();
  const { dir } = useLocale();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('listingId') || '');
  const [range, setRange] = useState(30);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await clientFetch<any[]>('/v1/portal/listings');
        const list = Array.isArray(res) ? res : [];
        setListings(list);
        const id = searchParams.get('listingId') || (list[0]?.id);
        if (id) {
          setSelectedId(id);
          const a = await clientFetch<any>(`/v1/portal/listings/${id}/analytics?days=${range}`);
          setAnalytics(a);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, [searchParams]);

  const loadAnalytics = async (id: string, days: number) => {
    if (!id) return;
    setLoading(true);
    try { const a = await clientFetch<any>(`/v1/portal/listings/${id}/analytics?days=${days}`); setAnalytics(a); } catch { setAnalytics(null); }
    finally { setLoading(false); }
  };

  const handleListingChange = (id: string) => { setSelectedId(id); loadAnalytics(id, range); };
  const handleRangeChange = (days: number) => { setRange(days); if (selectedId) loadAnalytics(selectedId, days); };

  const typeLabels: Record<string, string> = {
    LISTING_VIEW: t('portal.analytics.listingViews', 'مشاهدات'),
    WEBSITE_CLICK: t('portal.analytics.websiteClicks', 'نقرات الموقع'),
    WHATSAPP_CLICK: t('portal.analytics.whatsappClicks', 'واتساب'),
    PHONE_CLICK: t('portal.analytics.phoneClicks', 'اتصالات'),
    DIRECTIONS_CLICK: t('portal.analytics.directionsClicks', 'اتجاهات'),
  };
  const typeColors: Record<string, string> = { LISTING_VIEW: 'bg-blue-500', WEBSITE_CLICK: 'bg-green-500', WHATSAPP_CLICK: 'bg-emerald-500', PHONE_CLICK: 'bg-orange-500', DIRECTIONS_CLICK: 'bg-purple-500' };
  const maxDaily = analytics?.daily ? Math.max(...Object.values(analytics.daily as Record<string, number>) as number[], 1) : 1;

  return (
    <div dir={dir} className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('portal.analytics.title', 'التحليلات')}</h1>

      <div className="flex flex-wrap items-center gap-4">
        <select value={selectedId} onChange={e => handleListingChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="">{t('portal.analytics.selectListing', 'اختر قائمة')}</option>
          {listings.map((l: any) => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <div className="flex gap-1">
          {[7, 30, 90, 365].map(d => (
            <button key={d} onClick={() => handleRangeChange(d)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${range === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{d}</button>
          ))}
        </div>
      </div>

      {!selectedId ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><p className="text-gray-500">{t('portal.analytics.selectListing', 'اختر قائمة')}</p></div>
      ) : loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : !analytics || analytics.total === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><p className="text-gray-500">{t('portal.analytics.noData', 'لا توجد بيانات')}</p></div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
              <p className="text-sm text-gray-500 mt-1">{t('portal.analytics.totalEvents', 'إجمالي الأحداث')}</p>
            </div>
            {Object.entries(analytics.byType || {}).map(([type, count]: any) => (
              <div key={type} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className={`w-3 h-3 rounded-full ${typeColors[type] || 'bg-gray-400'} mx-auto mb-1`} />
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-1">{typeLabels[type] || type}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('portal.analytics.dailyChart', 'الرسم اليومي')}</h2>
            <div className="flex items-end gap-1 h-40">
              {Object.entries(analytics.daily || {})
                .sort(([a]: any, [b]: any) => a.localeCompare(b))
                .slice(-30)
                .map(([day, count]: any) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-500 rounded-t-sm min-h-[2px] transition-all" style={{ height: `${Math.max(2, (count / maxDaily) * 100)}%` }} title={`${day}: ${count}`} />
                    <span className="text-[9px] text-gray-400 rotate-45 origin-top-left">{day.slice(5)}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('portal.analytics.listingViews', 'مشاهدات')}</h2>
            <div className="space-y-3">
              {Object.entries(analytics.byType || {}).map(([type, count]: any) => {
                const pct = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{typeLabels[type] || type}</span>
                      <span className="font-medium text-gray-900">{count} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${typeColors[type] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
