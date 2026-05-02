import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { portalGetListings, portalClaimListing, type PortalListing } from '@/services/api/modules/portal';

const PortalListingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [listings, setListings] = useState<PortalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimId, setClaimId] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMsg, setClaimMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await portalGetListings();
        setListings(res);
      } catch {
        navigate('/portal/login');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleClaim = async () => {
    if (!claimId.trim()) return;
    setClaimLoading(true);
    setClaimMsg('');
    try {
      const res = await portalClaimListing(claimId);
      if (res.autoApproved) {
        setClaimMsg(t('portal.listings.claimModal.autoApproved'));
      } else {
        setClaimMsg(t('portal.listings.claimModal.pendingApproval'));
      }
      // Refresh listings
      const updated = await portalGetListings();
      setListings(updated);
    } catch (err: any) {
      setClaimMsg(err?.message || t('portal.common.error'));
    } finally {
      setClaimLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('portal.listings.title')}</h1>
        <button
          onClick={() => setShowClaimModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {t('portal.listings.claimListing')}
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">{t('portal.listings.empty')}</p>
          <p className="text-gray-400 text-sm mt-2">{t('portal.listings.emptyDesc')}</p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => setShowClaimModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              {t('portal.listings.claimListing')}
            </button>
            <Link to="/map/add-listing" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              {t('portal.listings.addNew')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{l.title}</h3>
                    {statusBadge(l.status)}
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {t(`portal.listings.${l.role?.toLowerCase() || 'owner'}`)}
                    </span>
                  </div>
                  {l.category && <p className="text-sm text-gray-500">{t('portal.listings.category')}: {l.category}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{t('portal.listings.branches')}: {l.branches?.length || 0}</span>
                    <span>{t('portal.listings.views')}: {l._count?.analyticsEvents || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ms-4">
                  <Link
                    to={`/portal/listings/${l.id}/edit`}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    {t('portal.listings.edit')}
                  </Link>
                  <Link
                    to={`/portal/listings/${l.id}/branches`}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
                  >
                    {t('portal.listings.manageBranches')}
                  </Link>
                  <Link
                    to={`/portal/analytics?listingId=${l.id}`}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100"
                  >
                    {t('portal.listings.viewAnalytics')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('portal.listings.claimModal.title')}</h2>
            {claimMsg && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${claimMsg.includes('موافقة') || claimMsg.includes('Auto') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                {claimMsg}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listing ID</label>
                <input
                  type="text"
                  dir="ltr"
                  value={claimId}
                  onChange={(e) => setClaimId(e.target.value)}
                  placeholder="clxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowClaimModal(false); setClaimId(''); setClaimMsg(''); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  {t('portal.common.cancel')}
                </button>
                <button
                  onClick={handleClaim}
                  disabled={claimLoading || !claimId.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {claimLoading ? t('portal.common.loading') : t('portal.listings.claimModal.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalListingsPage;
