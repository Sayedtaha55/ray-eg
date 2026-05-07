'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin, Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clientFetch } from '@/lib/api/client';
import { requestPreciseBrowserLocation, explainGeoError } from '@/lib/geolocation';

const CATEGORIES = [
  'restaurant',
  'grocery',
  'pharmacy',
  'fashion',
  'electronics',
  'home',
  'health',
  'beauty',
  'services',
  'other',
];

export default function AddMapListingPage() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Auto-locate on mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Leaflet map init
  useEffect(() => {
    if (!coords) return;
    if (!mapContainerRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        await import('leaflet/dist/leaflet.css');
        const leaflet = await import('leaflet');
        const markerIconMod: any = await import('leaflet/dist/images/marker-icon.png');
        const markerIcon2xMod: any = await import('leaflet/dist/images/marker-icon-2x.png');
        const markerShadowMod: any = await import('leaflet/dist/images/marker-shadow.png');

        if (cancelled) return;

        const L: any = (leaflet as any)?.default || leaflet;
        const defaultIcon = L.icon({
          iconUrl: String(markerIconMod?.default || markerIconMod || ''),
          iconRetinaUrl: String(markerIcon2xMod?.default || markerIcon2xMod || ''),
          shadowUrl: String(markerShadowMod?.default || markerShadowMod || ''),
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          shadowSize: [41, 41],
        });
        (L.Marker.prototype as any).options.icon = defaultIcon;

        if (!mapRef.current) {
          mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: true,
            attributionControl: false,
          }).setView([coords.lat, coords.lng], 16);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);

          markerRef.current = L.marker([coords.lat, coords.lng], { draggable: true }).addTo(mapRef.current);

          markerRef.current.on('dragend', () => {
            const p = markerRef.current?.getLatLng();
            if (p) setCoords({ lat: p.lat, lng: p.lng });
          });

          mapRef.current.on('click', (e: any) => {
            const p = e?.latlng;
            if (p) {
              setCoords({ lat: p.lat, lng: p.lng });
              markerRef.current?.setLatLng(p);
            }
          });
        } else {
          mapRef.current.setView([coords.lat, coords.lng], mapRef.current.getZoom() || 16);
          markerRef.current?.setLatLng([coords.lat, coords.lng]);
        }
      } catch {}
    })();

    return () => { cancelled = true; };
  }, [coords?.lat, coords?.lng]);

  const requestLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const nextCoords = await requestPreciseBrowserLocation();
      setCoords(nextCoords);
    } catch (err) {
      setLocationError(explainGeoError(err));
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError(t('addListing.titleRequired', 'Business name is required'));
      return;
    }
    if (!coords) {
      setError(t('addListing.locationRequired', 'Please select a location on the map'));
      return;
    }

    setSubmitting(true);
    try {
      await clientFetch('/v1/map-listings/public/submit', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          category: category || undefined,
          description: description.trim() || undefined,
          phone: phone.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
          branch: {
            latitude: coords.lat,
            longitude: coords.lng,
            addressLabel: addressLabel.trim() || undefined,
            governorate: governorate.trim() || undefined,
            city: city.trim() || undefined,
            phone: phone.trim() || undefined,
          },
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
      setError(msg || t('addListing.failed', 'Failed to submit. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = `w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-bold text-sm ${isRtl ? 'text-right' : 'text-left'}`;

  if (success) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20" dir={dir}>
        <div className="max-w-xl mx-auto bg-white border border-slate-100 p-8 md:p-16 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2">{t('addListing.successTitle', 'Listing Submitted!')}</h2>
          <p className="text-slate-400 font-bold text-sm mb-8">{t('addListing.successSubtitle', 'Your listing will appear on the map after admin review.')}</p>
          <Link href={`/${locale}/map`} className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl">
            {t('addListing.viewMap', 'View Map')} <MapPin size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8" dir={dir}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-slate-100 p-6 sm:p-10 md:p-16 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF]" />
              <MapPin className="relative z-10 text-white" size={28} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">{t('addListing.title', 'Add Your Business')}</h1>
            <p className="text-slate-400 font-bold text-sm mt-2">{t('addListing.subtitle', 'Add your business to the map for free')}</p>
          </div>

          {error && (
            <div className={`bg-red-50 border-r-4 border-red-500 p-4 mb-6 flex items-center gap-3 text-red-600 font-bold text-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.businessName', 'BUSINESS NAME')}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder={t('addListing.businessNamePlaceholder', 'e.g. Ray Store')} required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.categoryLabel', 'CATEGORY')}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} appearance-none`}>
                <option value="">{t('addListing.selectCategory', 'Select category')}</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`addListing.cat_${c}`, c)}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.descriptionLabel', 'DESCRIPTION (OPTIONAL)')}</label>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} placeholder={t('addListing.descriptionPlaceholder', 'Brief description')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.phoneLabel', 'PHONE')}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="01xxxxxxxxx" inputMode="tel" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.whatsappLabel', 'WHATSAPP')}</label>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputCls} placeholder="01xxxxxxxxx" inputMode="tel" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.websiteLabel', 'WEBSITE (OPTIONAL)')}</label>
              <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className={inputCls} placeholder="https://example.com" inputMode="url" />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.locationLabel', 'LOCATION ON MAP')}</label>
              <button type="button" onClick={requestLocation} disabled={isLocating} className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
                {isLocating ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
                {isLocating ? t('addListing.locating', 'Locating...') : t('addListing.locateMe', 'Locate Me')}
              </button>
              {locationError && <p className="text-red-500 text-xs font-bold">{locationError}</p>}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                <div ref={mapContainerRef} className="w-full h-56" />
              </div>
              {coords && <p className="text-slate-400 text-[10px] font-bold text-center">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.governorateLabel', 'GOVERNORATE')}</label>
                <input value={governorate} onChange={(e) => setGovernorate(e.target.value)} className={inputCls} placeholder={t('addListing.governoratePlaceholder', 'Cairo')} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.cityLabel', 'CITY')}</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder={t('addListing.cityPlaceholder', 'Nasr City')} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('addListing.addressLabel', 'ADDRESS')}</label>
              <input value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} className={inputCls} placeholder={t('addListing.addressPlaceholder', 'Street name, building')} />
            </div>

            <button type="submit" disabled={submitting} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl disabled:opacity-50">
              {submitting ? <Loader2 className="animate-spin" /> : <MapPin size={20} className="text-[#00E5FF]" />}
              {submitting ? t('addListing.submitting', 'Submitting...') : t('addListing.submit', 'Submit Listing')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
