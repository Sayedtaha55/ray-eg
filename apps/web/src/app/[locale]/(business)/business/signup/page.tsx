'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck, Store } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { apiSignup, resolvePostLoginRedirect, setSessionCookies } from '@/lib/auth/helpers';

function BusinessSignupPageInner() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { locale, dir } = useLocale();

  const rawReturnTo = params.get('returnTo') || '';
  const returnTo = useMemo(() => {
    const v = String(rawReturnTo || '');
    if (!v.startsWith('/')) return '';
    if (v.startsWith('//')) return '';
    const parts = v.split('/');
    const maybeLocale = parts[1];
    if (maybeLocale === 'ar' || maybeLocale === 'en') {
      return `/${parts.slice(2).join('/')}` || '/';
    }
    return v;
  }, [rawReturnTo]);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [shopName, setShopName] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopEmail, setShopEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiSignup({
        role: 'merchant',
        fullName,
        name: fullName,
        phone,
        email,
        password,
        shopName,
        governorate,
        city,
        storePhone: shopPhone,
        shopPhone,
        storeEmail: shopEmail,
        shopEmail,
        workingHours: openingHours,
        openingHours,
        address,
        description,
      });
      await setSessionCookies(res.session.access_token, res.user);
      const target = resolvePostLoginRedirect(res.user.role, returnTo || undefined, true);
      router.replace(`/${locale}${target === '/' ? '' : target}`);
    } catch (err: any) {
      const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
      setError(msg || t('auth.signupFailed', 'Signup failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-16 flex items-center justify-center min-h-[80vh]" dir={dir}>
      <div className={`w-full max-w-2xl bg-white border border-slate-100 p-8 md:p-12 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] ${dir === 'rtl' ? 'text-right' : 'text-left'} text-slate-900`}>
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] opacity-100" />
            <Store className="relative z-10 text-white" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">{t('auth.signupBusiness', 'Sign Up as Business')}</h1>
          <p className="text-slate-400 font-bold text-sm">{t('business.noCreditCard', 'No credit card required. Start in 30 seconds.')}</p>
        </div>

        {error && (
          <div className={`bg-red-50 border-r-4 border-red-500 p-4 mb-8 flex items-center gap-3 text-red-600 font-bold text-sm ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.fullNameLabel', 'FULL NAME')}</label>
              <input
                type="text"
                required
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('auth.fullNamePlaceholder', 'Your full name')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.mobileLabel', 'MOBILE NUMBER')}</label>
              <input
                type="tel"
                required
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('auth.mobilePlaceholder', '01xxxxxxxxx')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.emailLabel', 'EMAIL')}</label>
              <input
                type="email"
                required
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder', 'example@email.com')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.passwordLabel', 'PASSWORD')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 ${dir === 'rtl' ? 'pr-5 pl-14 text-right' : 'pl-5 pr-14 text-left'} outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  disabled={loading}
                  aria-label={showPassword ? t('auth.hidePasswordAria', 'Hide password') : t('auth.showPasswordAria', 'Show password')}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 ${dir === 'rtl' ? 'left-4' : 'right-4'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.shopNameLabel', 'STORE NAME')}</label>
              <input
                type="text"
                required
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={t('auth.shopNamePlaceholder', 'Your store name')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.governorateLabel', 'GOVERNORATE')}</label>
              <input
                type="text"
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                placeholder={t('auth.governoratePlaceholder', 'Cairo')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.cityLabel', 'CITY')}</label>
              <input
                type="text"
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('auth.cityPlaceholder', 'Nasr City')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.shopPhoneLabel', 'STORE PHONE')}</label>
              <input
                type="tel"
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.shopEmailLabel', 'STORE EMAIL')}</label>
              <input
                type="email"
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={shopEmail}
                onChange={(e) => setShopEmail(e.target.value)}
                placeholder={t('auth.shopEmailPlaceholder', 'store@example.com')}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.openingHoursLabel', 'OPENING HOURS')}</label>
              <input
                type="text"
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder={t('auth.openingHoursPlaceholder', '9 AM - 10 PM')}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.addressLabel', 'ADDRESS')}</label>
              <input
                type="text"
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('auth.addressPlaceholder', 'Full store address')}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.descriptionLabel', 'DESCRIPTION')}</label>
              <textarea
                disabled={loading}
                rows={4}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('auth.descriptionPlaceholder', 'Brief description of your business')}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} className="text-[#00E5FF]" />}
            {loading ? t('auth.preparing', 'Preparing...') : t('business.startFreeNow', 'Start Now — Free')}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-50 text-center">
          <Link href={`/${locale}/business`} className="text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors">
            {t('common.back', 'Back')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BusinessSignupPage() {
  return (
    <Suspense>
      <BusinessSignupPageInner />
    </Suspense>
  );
}
