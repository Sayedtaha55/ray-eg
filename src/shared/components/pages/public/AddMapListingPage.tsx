import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPin, Globe, MessageCircle, Store, ChevronLeft, ChevronRight, Check, Loader2, Mail, Lock } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { portalLogin, portalRegister } from '@/services/api/modules/portal';

type Step = 1 | 2 | 3;

const AddMapListingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isRtl = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');

  const [branchName, setBranchName] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [pickingLocation, setPickingLocation] = useState(false);

  const handlePickLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t('map.mapListing.geoUnsupported'));
      return;
    }
    setPickingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setPickingLocation(false);
        setError('');
      },
      (err) => {
        setError(t('map.mapListing.geoError'));
        setPickingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [t]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError(t('map.mapListing.titleRequired'));
      return;
    }
    if (latitude == null || longitude == null) {
      setError(t('map.mapListing.locationRequired'));
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const email = portalEmail.trim();
      const pass = String(portalPassword || '');
      if (!email) throw new Error(t('portal.common.error'));
      if (!pass || pass.length < 8) throw new Error(t('portal.common.error'));

      let authRes: any;
      try {
        authRes = await portalRegister(email, pass);
      } catch (err: any) {
        const msg = String(err?.message || '');
        const looksLikeExistingEmail = msg.includes('البريد') && msg.includes('مستخدم');
        if (!looksLikeExistingEmail) throw err;
        authRes = await portalLogin(email, pass);
      }
      localStorage.setItem('portal_token', authRes.access_token);
      localStorage.setItem('portal_owner', JSON.stringify(authRes.owner));

      await ApiService.submitMapListing({
        title: title.trim(),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        branch: {
          name: branchName.trim() || undefined,
          latitude,
          longitude,
          addressLabel: addressLabel.trim() || undefined,
          governorate: governorate.trim() || undefined,
          city: city.trim() || undefined,
        },
      });
      setSubmitted(true);
    } catch (e: any) {
      setError(String(e?.message || t('map.mapListing.submitError')));
    } finally {
      setSubmitting(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return latitude != null && longitude != null;
    return true;
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 md:p-12 space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{t('map.mapListing.submittedTitle')}</h2>
          <p className="text-slate-500 font-bold">{t('map.mapListing.submittedDesc')}</p>
          <button
            onClick={() => navigate('/map')}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all"
          >
            {t('map.mapListing.goToMap')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 md:py-12" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <button
          onClick={() => navigate('/map')}
          className="text-slate-500 hover:text-slate-900 font-bold text-sm flex items-center gap-1 mb-4"
        >
          <ChevronRight size={16} />
          {t('map.mapListing.backToMap')}
        </button>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter">{t('map.mapListing.pageTitle')}</h1>
        <p className="text-slate-400 font-bold mt-2">{t('map.mapListing.pageSubtitle')}</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step >= s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s ? <Check size={14} /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 rounded-full ${step > s ? 'bg-slate-900' : 'bg-slate-100'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-red-600 text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Step 1: Business info */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.businessName')} *</label>
            <div className="relative">
              <Store className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('map.mapListing.businessNamePlaceholder')}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.category')}</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t('map.mapListing.categoryPlaceholder')}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('map.mapListing.descriptionPlaceholder')}
              rows={3}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">Email *</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  dir="ltr"
                  value={portalEmail}
                  onChange={(e) => setPortalEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">Password *</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  dir="ltr"
                  value={portalPassword}
                  onChange={(e) => setPortalPassword(e.target.value)}
                  placeholder="********"
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.whatsapp')}</label>
            <div className="relative">
              <MessageCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="tel"
                dir="ltr"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.website')}</label>
            <div className="relative">
              <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.branchName')}</label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder={t('map.mapListing.branchNamePlaceholder')}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.pickLocation')} *</label>
            <button
              onClick={handlePickLocation}
              disabled={pickingLocation}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 transition-all"
            >
              {pickingLocation ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <MapPin size={16} />
                  {latitude != null ? t('map.mapListing.locationPicked') : t('map.mapListing.pickLocationBtn')}
                </>
              )}
            </button>
            {latitude != null && longitude != null && (
              <p className="text-xs text-slate-400 font-bold mt-2 text-center">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.addressLabel')}</label>
            <input
              type="text"
              value={addressLabel}
              onChange={(e) => setAddressLabel(e.target.value)}
              placeholder={t('map.mapListing.addressLabelPlaceholder')}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.governorate')}</label>
              <input
                type="text"
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                placeholder={t('map.mapListing.governoratePlaceholder')}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">{t('map.mapListing.city')}</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('map.mapListing.cityPlaceholder')}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & submit */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-black text-slate-900">{t('map.mapListing.reviewInfo')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">{t('map.mapListing.businessName')}</span>
                <span className="font-black text-slate-900">{title}</span>
              </div>
              {category && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">{t('map.mapListing.category')}</span>
                  <span className="font-black text-slate-900">{category}</span>
                </div>
              )}
              {whatsapp && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">{t('map.mapListing.whatsapp')}</span>
                  <span className="font-black text-slate-900">{whatsapp}</span>
                </div>
              )}
              {websiteUrl && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">{t('map.mapListing.website')}</span>
                  <span className="font-black text-slate-900 truncate max-w-[200px]">{websiteUrl}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-3">
            <h3 className="font-black text-amber-900">{t('map.mapListing.reviewLocation')}</h3>
            <div className="space-y-2 text-sm">
              {branchName && (
                <div className="flex justify-between">
                  <span className="text-amber-700 font-bold">{t('map.mapListing.branchName')}</span>
                  <span className="font-black text-amber-900">{branchName}</span>
                </div>
              )}
              {addressLabel && (
                <div className="flex justify-between">
                  <span className="text-amber-700 font-bold">{t('map.mapListing.addressLabel')}</span>
                  <span className="font-black text-amber-900">{addressLabel}</span>
                </div>
              )}
              {governorate && (
                <div className="flex justify-between">
                  <span className="text-amber-700 font-bold">{t('map.mapListing.governorate')}</span>
                  <span className="font-black text-amber-900">{governorate}</span>
                </div>
              )}
              {city && (
                <div className="flex justify-between">
                  <span className="text-amber-700 font-bold">{t('map.mapListing.city')}</span>
                  <span className="font-black text-amber-900">{city}</span>
                </div>
              )}
              {latitude != null && (
                <div className="flex justify-between">
                  <span className="text-amber-700 font-bold">{t('map.mapListing.coordinates')}</span>
                  <span className="font-black text-amber-900">{latitude.toFixed(4)}, {longitude!.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
            <p className="text-blue-800 text-xs font-bold">{t('map.mapListing.reviewNote')}</p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8 gap-4">
        {step > 1 ? (
          <button
            onClick={() => setStep((step - 1) as Step)}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all flex items-center gap-1"
          >
            <ChevronRight size={16} />
            {t('map.mapListing.prev')}
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep((step + 1) as Step)}
            disabled={!canGoNext()}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm disabled:opacity-40 hover:bg-slate-800 transition-all flex items-center gap-1"
          >
            {t('map.mapListing.next')}
            <ChevronLeft size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm disabled:opacity-50 hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
            {t('map.mapListing.submit')}
          </button>
        )}
      </div>
    </div>
  );
};

export default AddMapListingPage;
