import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldAlert, CheckCircle2, User, Mail, Phone, Lock } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';

const { useNavigate, useLocation, Link } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const CourierSignupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isPendingView = useMemo(() => {
    try {
      const q = new URLSearchParams(String(location?.search || ''));
      return q.get('pending') === '1';
    } catch {
      return false;
    }
  }, [location?.search]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const showPending = isPendingView || submitted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await ApiService.courierSignup({
        email: String(email || '').trim(),
        password: String(password || ''),
        fullName: String(fullName || '').trim(),
        ...(String(phone || '').trim() ? { phone: String(phone || '').trim() } : {}),
      });

      if (res?.pending) {
        setSubmitted(true);
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(String(err?.message || t('business.courierSignupPage.requestFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16" dir="rtl">
      <div className="min-h-[70vh] flex items-center justify-center">
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white border border-slate-100 rounded-[3rem] p-8 md:p-12 text-right shadow-[0_40px_80px_-30px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center gap-4 flex-row-reverse mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${showPending ? 'bg-amber-500/10 text-amber-600' : 'bg-[#00E5FF]/10 text-[#00E5FF]'}`}>
              <ShieldAlert size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
                {showPending ? t('business.courierSignupPage.pendingTitle') : t('business.courierSignupPage.title')}
              </h1>
              <p className="text-slate-500 font-bold text-sm mt-2">
                {showPending ? t('business.courierSignupPage.pendingSubtitle') : t('business.courierSignupPage.subtitle')}
              </p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-r-4 border-red-500 p-4 rounded-2xl text-red-600 font-bold mb-6"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {showPending ? (
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-500 font-bold text-xs flex-row-reverse">
                <CheckCircle2 size={16} className="text-slate-400" />
                {t('business.courierSignupPage.pendingHint')}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black"
                >
                  {t('business.courierSignupPage.login')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black"
                >
                  {t('business.courierSignupPage.backHome')}
                </button>
              </div>

              <div className="pt-2 text-center text-xs font-bold text-slate-400">
                {t('business.courierSignupPage.noAccount')}{' '}
                <Link to="/business/courier-signup" className="text-slate-900 hover:underline">
                  {t('business.courierSignupPage.newRequest')}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('business.courierSignupPage.fullNameLabel')}</label>
                <div className="relative">
                  <User className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    disabled={loading}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-12 pl-5 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('business.courierSignupPage.fullNamePlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('business.courierSignupPage.emailLabel')}</label>
                <div className="relative">
                  <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    type="email"
                    disabled={loading}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-12 pl-5 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="courier@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('business.courierSignupPage.phoneLabel')}</label>
                <div className="relative">
                  <Phone className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    disabled={loading}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-12 pl-5 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('business.courierSignupPage.passwordLabel')}</label>
                <div className="relative">
                  <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    type="password"
                    disabled={loading}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-12 pl-5 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-bold">{t('business.courierSignupPage.passwordHint')}</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-3 disabled:bg-slate-300"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                {loading ? t('business.courierSignupPage.sending') : t('business.courierSignupPage.sendRequest')}
              </button>

              <div className="pt-2 text-center text-xs font-bold text-slate-400">
                {t('business.courierSignupPage.haveAccount')}{' '}
                <Link to="/login" className="text-slate-900 hover:underline">
                  {t('business.courierSignupPage.login')}
                </Link>
              </div>
            </form>
          )}
        </MotionDiv>
      </div>
    </div>
  );
};

export default CourierSignupPage;
