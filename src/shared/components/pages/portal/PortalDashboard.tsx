import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { portalGetMe, portalGetListings, portalGetAnalytics, type PortalListing, type PortalOwner } from '@/services/api/modules/portal';

const PortalDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [owner, setOwner] = useState<PortalOwner | null>(null);
  const [listings, setListings] = useState<PortalListing[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [meRes, listRes] = await Promise.all([portalGetMe(), portalGetListings()]);
        setOwner(meRes);
        setListings(listRes);

        // Aggregate analytics for first 5 listings
        let views = 0, clicks = 0;
        const top5 = listRes.slice(0, 5);
        const analyticsPromises = top5.map((l: PortalListing) =>
          portalGetAnalytics(l.id, 30).catch(() => null)
        );
        const analyticsResults = await Promise.all(analyticsPromises);
        for (const a of analyticsResults) {
          if (!a) continue;
          views += (a.byType?.LISTING_VIEW || 0);
          clicks += (a.byType?.WEBSITE_CLICK || 0) + (a.byType?.WHATSAPP_CLICK || 0) + (a.byType?.PHONE_CLICK || 0) + (a.byType?.DIRECTIONS_CLICK || 0);
        }
        setTotalViews(views);
        setTotalClicks(clicks);
      } catch {
        // token expired
        navigate('/portal/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      APPROVED: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
      SUSPENDED: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.PENDING}`}>
        {t(`portal.listings.${status.toLowerCase()}`)}
      </span>
    );
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {owner?.name ? t('portal.dashboard.welcome', { name: owner.name }) : t('portal.dashboard.welcomeEmail', { email: owner?.email || '' })}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{owner?.email || owner?.phone || ''}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('portal.dashboard.totalListings')}</p>
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('portal.dashboard.totalViews')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0m-2.828 2.828a8 8 0 0111.314 0m-4.97 4.97L12 18l-1.689-1.689a1 1 0 010-1.414 1 1 0 011.414 0z" /></svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('portal.dashboard.totalClicks')}</p>
              <p className="text-2xl font-bold text-gray-900">{totalClicks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('portal.dashboard.quickActions')}</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/portal/listings" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
            {t('portal.dashboard.editListing')}
          </Link>
          <Link to="/map/add-listing" className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
            {t('portal.listings.addNew')}
          </Link>
          <Link to="/portal/analytics" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
            {t('portal.dashboard.viewAnalytics')}
          </Link>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t('portal.layout.listings')}</h2>
          <Link to="/portal/listings" className="text-sm text-blue-600 hover:text-blue-800 font-medium">{t('portal.listings.edit')} →</Link>
        </div>
        {listings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">{t('portal.dashboard.noListings')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('portal.dashboard.claimFirst')}</p>
            <Link to="/map" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              {t('portal.dashboard.goToMap')}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t('portal.edit.titleField')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('portal.listings.status')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('portal.listings.role')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('portal.listings.branches')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('portal.listings.views')}</th>
                  <th className="px-4 py-3 text-start font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{l.title}</td>
                    <td className="px-4 py-3">{statusBadge(l.status)}</td>
                    <td className="px-4 py-3 text-gray-600">{t(`portal.listings.${l.role?.toLowerCase() || 'owner'}`)}</td>
                    <td className="px-4 py-3 text-gray-600">{l.branches?.length || 0}</td>
                    <td className="px-4 py-3 text-gray-600">{l._count?.analyticsEvents || 0}</td>
                    <td className="px-4 py-3">
                      <Link to={`/portal/listings/${l.id}/edit`} className="text-blue-600 hover:text-blue-800 font-medium">
                        {t('portal.listings.edit')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalDashboard;
