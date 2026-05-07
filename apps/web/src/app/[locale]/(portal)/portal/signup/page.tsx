'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { persistPortalSession, portalRegister } from '@/lib/auth/portal';

export default function PortalSignupPage() {
  const t = useT();
  const router = useRouter();
  const { locale, dir } = useLocale();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await portalRegister(email, password, { name, phone });
      persistPortalSession({ access_token: res.access_token, owner: res.owner });
      router.replace(`/${locale}/portal`);
    } catch (err: any) {
      const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
      setError(msg || t('portal.signupFailed', 'Signup failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center min-h-[80vh]" dir={dir}>
      <div className={`w-full max-w-xl bg-white border border-slate-100 p-8 md:p-16 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] ${dir === 'rtl' ? 'text-right' : 'text-left'} text-slate-900`}>
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-[#1A1A1A] rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] opacity-100" />
            <span className="text-white font-black text-4xl relative z-10">P</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4">{t('portal.signupTitle', 'Create Portal Account')}</h1>
          <p className="text-slate-400 font-bold text-sm">{t('portal.signupSubtitle', 'Claim and manage your listing')}</p>
        </div>

        {error && (
          <div className={`bg-red-50 border-r-4 border-red-500 p-4 mb-8 flex items-center gap-3 text-red-600 font-bold text-sm ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.fullNameLabel', 'FULL NAME')}</label>
            <input
              type="text"
              disabled={loading}
              className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.mobileLabel', 'MOBILE NUMBER')}</label>
            <input
              type="tel"
              disabled={loading}
              className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.emailLabel', 'EMAIL')}</label>
            <input
              type="email"
              required
              disabled={loading}
              className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('auth.passwordLabel', 'PASSWORD')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 ${dir === 'rtl' ? 'pr-6 pl-16 text-right' : 'pl-6 pr-16 text-left'} outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                disabled={loading}
                aria-label={showPassword ? t('auth.hidePasswordAria', 'Hide password') : t('auth.showPasswordAria', 'Show password')}
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 ${dir === 'rtl' ? 'left-5' : 'right-5'}`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} className="text-[#00E5FF]" />}
            {loading ? t('auth.preparing', 'Preparing...') : t('portal.signupCta', 'Create Account')}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
          <p className="text-center text-slate-400 font-bold text-xs mb-4">{t('portal.haveAccount', 'Already have a portal account?')}</p>
          <div className="grid grid-cols-1 gap-4">
            <Link href={`/${locale}/portal/login`} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all text-slate-900">
              <span className="font-black text-[10px]">{t('portal.loginCta', 'Login')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
