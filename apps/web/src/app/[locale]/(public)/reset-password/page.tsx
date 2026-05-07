'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { apiResetPassword } from '@/lib/auth/helpers';

function ResetPasswordPageInner() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const { locale, dir } = useLocale();

  const tokenFromUrl = String(params.get('token') || '').trim();

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedToken = String(token || '').trim();
    if (!trimmedToken) {
      setError(t('auth.resetPassword.invalidLink', 'Invalid or expired reset link'));
      return;
    }

    if (!password || password.length < 8) {
      setError(t('auth.resetPassword.minPassword', 'Password must be at least 8 characters'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.passwordsMismatch', 'Passwords do not match'));
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword(trimmedToken, password);
      setSuccess(true);
    } catch (err: any) {
      const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
      setError(msg || t('auth.resetPassword.failed', 'Failed to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black ${dir === 'rtl' ? 'text-right' : 'text-left'}`;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center min-h-[80vh]" dir={dir}>
      <div className={`w-full max-w-xl bg-white border border-slate-100 p-8 md:p-16 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] ${dir === 'rtl' ? 'text-right' : 'text-left'} text-slate-900`}>
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] opacity-100" />
            <Lock className="relative z-10 text-[#00E5FF]" size={34} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-4">
            {t('auth.resetPassword.title', 'Reset Password')}
          </h1>
          <p className="text-slate-400 font-bold text-sm">
            {t('auth.resetPassword.subtitle', 'Enter your new password below')}
          </p>
        </div>

        {error && (
          <div className={`bg-red-50 border-r-4 border-red-500 p-4 mb-8 flex items-center gap-3 text-red-600 font-bold text-sm ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-green-500" size={40} />
            </div>
            <h2 className="text-2xl font-black">{t('auth.resetPassword.success', 'Password updated successfully!')}</h2>
            <p className="text-slate-400 font-bold text-sm">
              {t('auth.resetPassword.successHint', 'You can now log in with your new password.')}
            </p>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl"
            >
              {t('auth.loginNow', 'Login Now')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {t('auth.resetPassword.tokenLabel', 'RESET TOKEN')}
              </label>
              <input
                type="text"
                disabled={loading}
                className={inputCls}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={t('auth.resetPassword.tokenPlaceholder', 'Paste the token from your email')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {t('auth.resetPassword.newPasswordLabel', 'NEW PASSWORD')}
              </label>
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
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 ${dir === 'rtl' ? 'left-5' : 'right-5'}`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {t('auth.resetPassword.confirmPasswordLabel', 'CONFIRM PASSWORD')}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  disabled={loading}
                  className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 ${dir === 'rtl' ? 'pr-6 pl-16 text-right' : 'pl-6 pr-16 text-left'} outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  disabled={loading}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 ${dir === 'rtl' ? 'left-5' : 'right-5'}`}
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} className="text-[#00E5FF]" />}
              {loading ? t('auth.resetPassword.updating', 'Updating...') : t('auth.resetPassword.update', 'Update Password')}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-10 text-center">
            <Link href={`/${locale}/login`} className="text-[#00E5FF] hover:underline font-black text-sm">
              {t('auth.backToLogin', 'Back to Login')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordPageInner />
    </Suspense>
  );
}
