import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Phone, MessageCircle, ExternalLink, ChevronRight, Navigation } from 'lucide-react';
import { getMapListingViaBackend } from '@/services/api/modules/map-listings';

type Branch = {
  id: string;
  name: string | null;
  latitude: number;
  longitude: number;
  addressLabel: string | null;
  governorate: string | null;
  city: string | null;
  phone: string | null;
  isPrimary: boolean;
};

type Listing = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  websiteUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  status: string;
  branches: Branch[];
};

const MapListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isRtl = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getMapListingViaBackend(id);
        setListing(data);
      } catch (err: any) {
        setError(err?.message || t('map.listingDetail.notFound'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 text-right">
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 text-center">
          <p className="text-slate-500 text-lg">{error || t('map.listingDetail.notFound')}</p>
          <Link to="/map" className="inline-block mt-4 px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all">
            {t('map.listingDetail.backToMap')}
          </Link>
        </div>
      </div>
    );
  }

  const primaryBranch = listing.branches?.find((b) => b.isPrimary) || listing.branches?.[0];
  const otherBranches = listing.branches?.filter((b) => b.id !== primaryBranch?.id) || [];

  const openDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener');
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 text-right">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 font-bold mb-6">
        <Link to="/map" className="hover:text-slate-700 transition-colors">{t('map.title')}</Link>
        <ChevronRight size={14} className={isRtl ? 'rotate-180' : ''} />
        <span className="text-slate-700 truncate">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover */}
          {listing.coverUrl && (
            <div className="rounded-[2rem] overflow-hidden h-48 md:h-64">
              <img src={listing.coverUrl} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Title & Category */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8">
            <div className="flex items-start gap-4">
              {listing.logoUrl ? (
                <img src={listing.logoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin size={28} className="text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{listing.title}</h1>
                {listing.category && (
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                    {listing.category}
                  </span>
                )}
              </div>
            </div>

            {listing.description && (
              <p className="mt-4 text-slate-600 text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
            )}
          </div>

          {/* Branches */}
          {listing.branches && listing.branches.length > 0 && (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8">
              <h2 className="text-lg font-black text-slate-900 mb-4">{t('map.listingDetail.branches')}</h2>
              <div className="space-y-3">
                {/* Primary Branch */}
                {primaryBranch && (
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={16} className="text-blue-600 shrink-0" />
                          <h3 className="font-bold text-slate-900 truncate">
                            {primaryBranch.name || listing.title}
                          </h3>
                          <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-black">
                            {t('map.listingDetail.primary')}
                          </span>
                        </div>
                        {primaryBranch.addressLabel && (
                          <p className="text-sm text-slate-500 mt-1">{primaryBranch.addressLabel}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1" dir="ltr">
                          {[primaryBranch.governorate, primaryBranch.city].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                      <button
                        onClick={() => openDirections(primaryBranch.latitude, primaryBranch.longitude)}
                        className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                      >
                        <Navigation size={14} />
                        {t('map.listingDetail.directions')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Other Branches */}
                {otherBranches.map((b) => (
                  <div key={b.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <h3 className="font-bold text-slate-700 text-sm truncate">{b.name || listing.title}</h3>
                        </div>
                        {b.addressLabel && <p className="text-sm text-slate-500">{b.addressLabel}</p>}
                        <p className="text-xs text-slate-400 mt-1" dir="ltr">
                          {[b.governorate, b.city].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                      <button
                        onClick={() => openDirections(b.latitude, b.longitude)}
                        className="shrink-0 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors flex items-center gap-1"
                      >
                        <Navigation size={12} />
                        {t('map.listingDetail.directions')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{t('map.listingDetail.contact')}</h2>

            {listing.phone && (
              <a href={`tel:${listing.phone}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <Phone size={18} className="text-slate-500 shrink-0" />
                <span dir="ltr" className="text-sm font-bold text-slate-700">{listing.phone}</span>
              </a>
            )}

            {listing.whatsapp && (
              <a href={`https://wa.me/${listing.whatsapp.replace(/^0/, '20')}`} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <MessageCircle size={18} className="text-green-600 shrink-0" />
                <span dir="ltr" className="text-sm font-bold text-green-700">{listing.whatsapp}</span>
              </a>
            )}

            {listing.websiteUrl && (
              <a href={listing.websiteUrl} target="_blank" rel="noopener" className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <Globe size={18} className="text-blue-600 shrink-0" />
                <span className="text-sm font-bold text-blue-700 truncate">{listing.websiteUrl.replace(/^https?:\/\//, '')}</span>
                <ExternalLink size={14} className="text-blue-400 shrink-0" />
              </a>
            )}

            {!listing.phone && !listing.whatsapp && !listing.websiteUrl && (
              <p className="text-sm text-slate-400">{t('map.listingDetail.noContact')}</p>
            )}
          </div>

          {/* Back to Map */}
          <Link
            to="/map"
            className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm text-center hover:bg-black transition-all"
          >
            {t('map.listingDetail.backToMap')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MapListingDetailPage;
