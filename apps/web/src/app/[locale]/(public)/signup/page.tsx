'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck, User, Store, MapPin } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { apiSignup, resolvePostLoginRedirect, setSessionCookies } from '@/lib/auth/helpers';
import { portalRegister, persistPortalSession } from '@/lib/auth/portal';

type SignupRole = 'customer' | 'merchant' | 'portal';

function SignupPageInner() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { locale, dir } = useLocale();

  const rawReturnTo = params.get('returnTo') || '';
  const returnTo = useMemo(() => {
    const v = String(rawReturnTo || '');
    if (!v.startsWith('/')) return '';
    const parts = v.split('/');
    const maybeLocale = parts[1];
    if (maybeLocale === 'ar' || maybeLocale === 'en') {
      return `/${parts.slice(2).join('/')}` || '/';
    }
    return v;
  }, [rawReturnTo]);

  const roleParam = params.get('role') || '';
  const activeRole: SignupRole = roleParam === 'merchant' ? 'merchant' : roleParam === 'portal' ? 'portal' : 'customer';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shopName, setShopName] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopEmail, setShopEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [addressDetailed, setAddressDetailed] = useState('');
  const [shopDescription, setShopDescription] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeRole === 'portal') {
        const portalRes = await portalRegister(email, password, { name: fullName, phone });
        persistPortalSession(portalRes);
        router.replace(`/${locale}/portal`);
        return;
      }

      const payload: Record<string, string> = {
        role: activeRole,
        fullName,
        name: fullName,
        phone,
        email,
        password,
      };

      if (activeRole === 'merchant') {
        payload.shopName = shopName;
        payload.storeType = shopName;
        payload.governorate = governorate;
        payload.city = city;
        payload.shopPhone = shopPhone;
        payload.workingHours = openingHours;
        payload.shopEmail = shopEmail;
        payload.address = addressDetailed;
        payload.description = shopDescription;

        // Merge onboarding data from sessionStorage
        try {
          const raw = sessionStorage.getItem('ray_merchant_onboarding');
          if (raw) {
            const ob = JSON.parse(raw);
            if (ob.activityId) payload.activityId = ob.activityId;
            if (ob.category) payload.category = ob.category;
            if (Array.isArray(ob.enabledModules)) payload.enabledModules = ob.enabledModules.join(',');
            sessionStorage.removeItem('ray_merchant_onboarding');
          }
        } catch (e) {
          console.error('Failed to read onboarding data', e);
        }
      }

      const res = await apiSignup(payload);
      await setSessionCookies(res.session.access_token, res.user);
      const isBusiness = activeRole === 'merchant';
      const target = resolvePostLoginRedirect(res.user.role, returnTo || undefined, isBusiness);
      router.replace(`/${locale}${target === '/' ? '' : target}`);
    } catch (err: any) {
      const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
      setError(msg || t('auth.signupFailed', 'Signup failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = (r: SignupRole) => {
    if (r === 'customer') return t('auth.roleCustomer', 'Customer');
    if (r === 'merchant') return t('auth.roleMerchant', 'Business');
    return t('auth.portalTitle', 'External Business Owner');
  };

  const subtitleText = () => {
    if (activeRole === 'customer') return t('auth.signupSubtitle', 'Join MNMKNK and start exploring');
    if (activeRole === 'merchant') return t('auth.signupBusinessSubtitle', 'Create your business account and start selling');
    return t('portal.signupSubtitle', 'Manage your map listing');
  };

  const inputCls = `w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center min-h-[80vh]" dir={dir}>
      <div className={`w-full max-w-2xl bg-white border border-slate-100 p-8 md:p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] ${dir === 'rtl' ? 'text-right' : 'text-left'} text-slate-900`}>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-[#1A1A1A] rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] opacity-100" />
            <Image src="/brand/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 relative z-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4">
            {t('auth.signupTitle', 'Create Account')} <span className="text-[#00E5FF]">{t('auth.signupTitleHighlight', '✨')}</span>
          </h1>
          <p className="text-slate-400 font-bold text-sm">{subtitleText()}</p>
        </div>

        {error && (
          <div className={`bg-red-50 border-r-4 border-red-500 p-4 mb-8 flex items-center gap-3 text-red-600 font-bold text-sm ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.fullNameLabel', 'FULL NAME')}</label>
              <input type="text" required disabled={loading} className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('auth.fullNamePlaceholder', 'Your full name')} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.mobileLabel', 'MOBILE')}</label>
              <input type="tel" required disabled={loading} className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('auth.mobilePlaceholder', '01xxxxxxxxx')} />
            </div>
          </div>

          {activeRole === 'merchant' && (
            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-[0.3em]">{t('auth.shopNameLabel', 'SHOP NAME')}</label>
                  <input type="text" required disabled={loading} className={inputCls} value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder={t('auth.shopNamePlaceholder', 'Your shop name')} />
                </div>
                <div />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.governorateLabel', 'GOVERNORATE')}</label>
                  <input type="text" required disabled={loading} className={inputCls} value={governorate} onChange={(e) => setGovernorate(e.target.value)} placeholder={t('auth.governoratePlaceholder', 'Cairo')} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.cityLabel', 'CITY')}</label>
                  <input type="text" required disabled={loading} className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('auth.cityPlaceholder', 'Nasr City')} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.shopPhoneLabel', 'SHOP PHONE')}</label>
                  <input type="tel" disabled={loading} className={inputCls} value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} placeholder={t('auth.mobilePlaceholder', '01xxxxxxxxx')} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.openingHoursLabel', 'OPENING HOURS')}</label>
                  <input type="text" disabled={loading} className={inputCls} value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder={t('auth.openingHoursPlaceholder', '9 AM - 10 PM')} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.shopEmailLabel', 'SHOP EMAIL')}</label>
                <input type="email" disabled={loading} className={inputCls} value={shopEmail} onChange={(e) => setShopEmail(e.target.value)} placeholder={t('auth.shopEmailPlaceholder', 'store@example.com')} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.addressLabel', 'ADDRESS')}</label>
                <textarea disabled={loading} className={`${inputCls} resize-none`} rows={3} value={addressDetailed} onChange={(e) => setAddressDetailed(e.target.value)} placeholder={t('auth.addressPlaceholder', 'Full shop address')} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.descriptionLabel', 'DESCRIPTION')}</label>
                <textarea disabled={loading} className={`${inputCls} resize-none`} rows={3} value={shopDescription} onChange={(e) => setShopDescription(e.target.value)} placeholder={t('auth.descriptionPlaceholder', 'Brief description of your business')} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.emailLabel', 'EMAIL')}</label>
            <input type="email" required disabled={loading} className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.emailPlaceholder', 'example@email.com')} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.passwordLabel', 'PASSWORD')}</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required disabled={loading} className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 ${dir === 'rtl' ? 'pr-6 pl-16 text-right' : 'pl-6 pr-16 text-left'} outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black`} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword((p) => !p)} disabled={loading} aria-label={showPassword ? t('auth.hidePasswordAria', 'Hide password') : t('auth.showPasswordAria', 'Show password')} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 ${dir === 'rtl' ? 'left-5' : 'right-5'}`}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-6 rounded-[2rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70 ${
            activeRole === 'customer' ? 'bg-slate-900 text-white hover:bg-black'
              : activeRole === 'merchant' ? 'bg-[#BD00FF] text-white hover:bg-purple-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}>
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} className={activeRole === 'customer' ? 'text-[#00E5FF]' : 'text-white'} />}
            {loading ? t('auth.preparing', 'Preparing...') : t('common.signup', 'Sign Up')}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 font-bold text-sm">{t('auth.haveAccount', 'Already have an account?')}{' '}
            <Link href={`/${locale}/login?role=${activeRole}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`} className="text-[#00E5FF] hover:underline font-black">
              {t('auth.loginNow', 'Login Now')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupPageInner />
    </Suspense>
  );
}
