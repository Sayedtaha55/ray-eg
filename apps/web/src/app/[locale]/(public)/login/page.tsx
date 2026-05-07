'use client';

import { Suspense, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle, Eye, EyeOff, KeyRound, Loader2, ShieldCheck,
  User, Store, MapPin, X,
} from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import {
  apiForgotPassword,
  apiLogin,
  resolvePostLoginRedirect,
  setSessionCookies,
} from '@/lib/auth/helpers';
import { portalLogin, persistPortalSession } from '@/lib/auth/portal';

type LoginRole = 'customer' | 'merchant' | 'portal';

function LoginPageInner() {
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
  const activeRole: LoginRole = roleParam === 'merchant' ? 'merchant' : roleParam === 'portal' ? 'portal' : 'customer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotOk, setForgotOk] = useState(false);

  const adminTap = useRef({ count: 0, lastAt: 0 });

  const onSecretTap = () => {
    const now = Date.now();
    const lastAt = adminTap.current.lastAt;
    const nextCount = now - lastAt > 1200 ? 1 : adminTap.current.count + 1;
    adminTap.current.count = nextCount;
    adminTap.current.lastAt = now;
    if (nextCount >= 5) {
      adminTap.current.count = 0;
      adminTap.current.lastAt = 0;
      router.push(`/${locale}/admin/gate`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeRole === 'portal') {
        const portalRes = await portalLogin(email, password);
        persistPortalSession(portalRes);
        router.replace(`/${locale}/portal`);
        return;
      }

      const res = await apiLogin(email, password);
      await setSessionCookies(res.session.access_token, res.user);
      const isBusiness = activeRole === 'merchant';
      const target = resolvePostLoginRedirect(res.user.role, returnTo || undefined, isBusiness);
      router.replace(`/${locale}${target === '/' ? '' : target}`);
    } catch (err: any) {
      if (activeRole !== 'portal') {
        try {
          const portalRes = await portalLogin(email, password);
          persistPortalSession(portalRes);
          router.replace(`/${locale}/portal`);
          return;
        } catch {
          // portal also failed
        }
      }
      const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
      setError(msg || t('auth.loginFailed', 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    const e = String(forgotEmail || '').trim();
    if (!e) return;
    setForgotLoading(true);
    setForgotOk(false);
    try {
      await apiForgotPassword(e);
      setForgotOk(true);
    } finally {
      setForgotLoading(false);
    }
  };

  const roleLabel = (r: LoginRole) => {
    if (r === 'customer') return t('auth.roleCustomer', 'Customer');
    if (r === 'merchant') return t('auth.roleMerchant', 'Business');
    return t('auth.portalTitle', 'External Business Owner');
  };

  const subtitleText = () => {
    if (activeRole === 'customer') return t('auth.loginSubtitle', 'Sign in to your account to continue');
    if (activeRole === 'merchant') return t('auth.businessLoginSubtitle', 'Sign in to your business dashboard');
    return t('portal.loginSubtitle', 'Manage your map listing');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center min-h-[80vh]" dir={dir}>
      {forgotOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => { if (!forgotLoading) { setForgotOpen(false); setForgotOk(false); } }}>
          <div className={`w-full max-w-xl bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 md:p-10 ${dir === 'rtl' ? 'text-right' : 'text-left'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-start justify-between gap-4 mb-6 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <div>
                <h3 className="text-2xl font-black tracking-tight">{t('auth.forgotPasswordTitle', 'Reset Password')}</h3>
                <p className="text-slate-400 font-bold text-sm mt-1">{t('auth.forgotPasswordSubtitle', "Enter your email and we'll send you a reset link")}</p>
              </div>
              <button type="button" disabled={forgotLoading} onClick={() => { setForgotOpen(false); setForgotOk(false); }} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full disabled:opacity-60"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.emailLabel', 'EMAIL')}</label>
                <input type="email" disabled={forgotLoading} className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder={t('auth.emailPlaceholder', 'example@email.com')} />
              </div>
              {forgotOk && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div className="text-sm font-black text-slate-700">{t('auth.requestSent', 'Request Sent!')}</div>
                  <div className="text-[12px] font-bold text-slate-500 mt-2">{t('auth.resetInstructions', 'Check your email for password reset instructions.')}</div>
                </div>
              )}
              <button type="button" disabled={forgotLoading} onClick={handleForgot} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70">
                {forgotLoading ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} className="text-[#00E5FF]" />}
                {forgotLoading ? t('auth.preparing', 'Preparing...') : t('auth.sendResetLink', 'Send Reset Link')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`w-full max-w-xl bg-white border border-slate-100 p-8 md:p-16 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] ${dir === 'rtl' ? 'text-right' : 'text-left'} text-slate-900`}>
        <div className="flex flex-col items-center text-center mb-8">
          <div onPointerDown={onSecretTap} className="w-20 h-20 bg-[#1A1A1A] rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl relative group overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image src="/brand/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 relative z-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4">
            {t('auth.loginTitle', 'Welcome Back')} <span className="text-[#00E5FF]">{t('auth.loginTitleHighlight', '👋')}</span>
          </h1>
          <p className="text-slate-400 font-bold text-sm">{subtitleText()}</p>
        </div>

        {error && (
          <div className={`bg-red-50 border-r-4 border-red-500 p-4 mb-8 flex items-center gap-3 text-red-600 font-bold text-sm ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.emailLabel', 'EMAIL')}</label>
            <input type="email" required disabled={loading} className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className={`flex justify-between items-center gap-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.passwordLabel', 'PASSWORD')}</label>
              {activeRole !== 'portal' && (
                <button type="button" onClick={() => setForgotOpen(true)} className="text-[10px] font-black text-[#BD00FF]">
                  {t('auth.forgotPasswordCta', 'Forgot Password?')}
                </button>
              )}
            </div>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required disabled={loading} className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 ${dir === 'rtl' ? 'pr-6 pl-16 text-right' : 'pl-6 pr-16 text-left'} outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black`} value={password} onChange={(e) => setPassword(e.target.value)} />
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
            {loading ? t('auth.verifying', 'Verifying...') : t('auth.secureLogin', 'Secure Login')}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
          <p className="text-center text-slate-400 font-bold text-xs mb-4">{t('auth.noAccount', "Don't have an account?")}</p>
          <div className="grid grid-cols-1 gap-4">
            {activeRole === 'customer' && (
              <Link href={`/${locale}/signup?role=customer${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all text-slate-900">
                <User size={20} className="text-slate-900" />
                <span className="font-black text-[10px]">{t('auth.signupCustomer', 'Sign Up as Customer')}</span>
              </Link>
            )}
            {activeRole === 'merchant' && (
              <Link href={`/${locale}/business/onboarding${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all text-slate-900">
                <Store size={20} className="text-[#BD00FF]" />
                <span className="font-black text-[10px]">{t('auth.signupBusiness', 'Sign Up as Business')}</span>
              </Link>
            )}
            {activeRole === 'portal' && (
              <Link href={`/${locale}/signup?role=portal${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-emerald-100 hover:bg-emerald-50 transition-all text-slate-900">
                <MapPin size={20} className="text-emerald-500" />
                <span className="font-black text-[10px]">{t('portal.createAccount', 'Create Portal Account')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
