import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { portalGetListings, portalGetAnalytics, type PortalListing, type PortalAnalytics } from '@/services/api/modules/portal';

const PortalAnalyticsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRtl = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [listings, setListings] = useState<PortalListing[]>([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('listingId') || '');
  const [range, setRange] = useState(30);
  const [analytics, setAnalytics] = useState<PortalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await portalGetListings();
        setListings(res);
        const id = searchParams.get('listingId') || (res[0]?.id as string | undefined);
        if (id) {
          setSelectedId(id);
          const a = await portalGetAnalytics(id, range);
          setAnalytics(a);
        }
      } catch {
        navigate('/portal/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const loadAnalytics = async (id: string, days: number) => {
    if (!id) return;
    setLoading(true);
    try {
      const a = await portalGetAnalytics(id, days);
      setAnalytics(a);
    } catch {
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const handleListingChange = (id: string) => {
    setSelectedId(id);
    setSearchParams({ listingId: id });
    loadAnalytics(id, range);
  };

  const handleRangeChange = (days: number) => {
    setRange(days);
    if (selectedId) loadAnalytics(selectedId, days);
  };

  const typeLabels: Record<string, string> = {
    LISTING_VIEW: t('portal.analytics.listingViews'),
    WEBSITE_CLICK: t('portal.analytics.websiteClicks'),
    WHATSAPP_CLICK: t('portal.analytics.whatsappClicks'),
    PHONE_CLICK: t('portal.analytics.phoneClicks'),
    DIRECTIONS_CLICK: t('portal.analytics.directionsClicks'),
  };

  const typeColors: Record<string, string> = {
    LISTING_VIEW: 'bg-blue-500',
    WEBSITE_CLICK: 'bg-green-500',
    WHATSAPP_CLICK: 'bg-emerald-500',
    PHONE_CLICK: 'bg-orange-500',
    DIRECTIONS_CLICK: 'bg-purple-500',
  };

  const maxDaily = analytics?.daily ? Math.max(...Object.values(analytics.daily), 1) : 1;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('portal.analytics.title')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={selectedId}
          onChange={(e) => handleListingChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">{t('portal.analytics.selectListing')}</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {[7, 30, 90, 365].map((d) => (
            <button
              key={d}
              onClick={() => handleRangeChange(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                range === d ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`portal.analytics.days${d}`)}
            </button>
          ))}
        </div>
      </div>

      {!selectedId ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">{t('portal.analytics.selectListing')}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : !analytics || analytics.total === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">{t('portal.analytics.noData')}</p>
        </div>
      ) : (
        <>
          {/* Total */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
              <p className="text-sm text-gray-500 mt-1">{t('portal.analytics.totalEvents')}</p>
            </div>
            {Object.entries(analytics.byType).map(([type, count]) => (
              <div key={type} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className={`w-3 h-3 rounded-full ${typeColors[type] || 'bg-gray-400'} mx-auto mb-1`} />
                <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                <p className="text-xs text-gray-500 mt-1">{typeLabels[type] || type}</p>
              </div>
            ))}
          </div>

          {/* Daily Chart (simple bar chart) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('portal.analytics.dailyChart')}</h2>
            <div className="flex items-end gap-1 h-40">
              {Object.entries(analytics.daily)
                .sort(([a], [b]) => a.localeCompare(b))
                .slice(-30)
                .map(([day, count]) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t-sm min-h-[2px] transition-all"
                      style={{ height: `${Math.max(2, ((count as number) / maxDaily) * 100)}%` }}
                      title={`${day}: ${count as number}`}
                    />
                    <span className="text-[9px] text-gray-400 rotate-45 origin-top-left">{day.slice(5)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* By Type Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('portal.analytics.listingViews')}</h2>
            <div className="space-y-3">
              {Object.entries(analytics.byType).map(([type, count]) => {
                const pct = analytics.total > 0 ? ((count as number) / analytics.total) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{typeLabels[type] || type}</span>
                      <span className="font-medium text-gray-900">{count as number} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${typeColors[type] || 'bg-gray-400'}`}
                        style={{ width: `${pct}%` }}
                      />
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
};

export default PortalAnalyticsPage;
