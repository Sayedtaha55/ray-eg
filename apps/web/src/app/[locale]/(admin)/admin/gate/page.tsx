'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, Loader2, KeyRound, ArrowRight, Store, MapPin, Eye, EyeOff } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import {
  apiLogin,
  apiDevMerchantLogin,
  apiDevCourierLogin,
  apiBootstrapAdmin,
  setSessionCookies,
  resolvePostLoginRedirect,
} from '@/lib/auth/helpers';

type DevActivity = { label: string; category?: string; activityId?: string };

const DEV_ACTIVITIES: DevActivity[] = [
  { label: 'تجزئة / Retail', category: undefined },
  { label: 'مطعم / Restaurant', category: 'RESTAURANT' },
  { label: 'أزياء / Fashion', category: 'FASHION' },
  { label: 'منسوجات / Home Textiles', category: 'RETAIL', activityId: 'homeTextiles' },
  { label: 'بقالة / Grocery', category: 'FOOD' },
  { label: 'إلكترونيات / Electronics', category: 'ELECTRONICS' },
  { label: 'صيدلية / Health', category: 'HEALTH' },
  { label: 'أثاث / Furniture', category: 'SERVICE', activityId: 'furniture' },
  { label: 'مستلزمات / Home Goods', category: 'RETAIL', activityId: 'homeGoods' },
  { label: 'عقارات / Real Estate', category: 'SERVICE', activityId: 'realEstate' },
  { label: 'سيارات / Car Showroom', category: 'RETAIL', activityId: 'carShowroom' },
  { label: 'حجوزات / Reservations', category: 'SERVICE' },
  { label: 'أخرى / Other', category: 'OTHER' },
];

function AdminGateInner() {
  const t = useT();
  const router = useRouter();
  const { locale, dir } = useLocale();
  const params = useSearchParams();

  const isDev = process.env.NODE_ENV !== 'production';

  const [email, setEmail] = useState('admin@mnmknk.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isDevMenuOpen, setIsDevMenuOpen] = useState(false);

  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [bootstrapToken, setBootstrapToken] = useState('');
  const [bootstrapEmail, setBootstrapEmail] = useState('admin@mnmknk.com');
  const [bootstrapPassword, setBootstrapPassword] = useState('');
  const [bootstrapName, setBootstrapName] = useState('Admin');
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [showBootstrapToken, setShowBootstrapToken] = useState(false);
  const [showBootstrapPassword, setShowBootstrapPassword] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiLogin(email, password);
      const role = String(res.user?.role || '').toLowerCase();
      if (role !== 'admin') {
        setError(t('auth.adminsOnly', 'دخول المسؤولين فقط'));
        return;
      }
      await setSessionCookies(res.session.access_token, res.user);
      const returnTo = params.get('returnTo') || '';
      const redirect = resolvePostLoginRedirect(role, returnTo || undefined);
      router.push(`/${locale}${redirect}`);
    } catch (err: any) {
      setError(err?.message || t('auth.loginFailed', 'فشل تسجيل الدخول'));
    } finally {
      setLoading(false);
    }
  };

  const handleDevMerchantLogin = async (activity?: DevActivity) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiDevMerchantLogin(activity?.category ? { shopCategory: activity.category } : undefined);
      await setSessionCookies(res.session.access_token, res.user);
      try {
        if (activity?.activityId) {
          localStorage.setItem('ray_dev_activity_id', activity.activityId);
        } else {
          localStorage.removeItem('ray_dev_activity_id');
        }
        if (activity?.category) {
          localStorage.setItem('ray_dev_shop_category', activity.category);
        } else {
          localStorage.removeItem('ray_dev_shop_category');
        }
      } catch {}
      // Full page reload so middleware sees the new cookies
      window.location.href = `/${locale}/business/dashboard`;
      return;
    } catch (err: any) {
      setError(err?.message || t('auth.admin.devMerchantLoginFailed', 'فشل دخول المطور'));
    } finally {
      setLoading(false);
    }
  };

  const handleDevCourierLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiDevCourierLogin();
      await setSessionCookies(res.session.access_token, res.user);
      // Full page reload so middleware sees the new cookies
      window.location.href = `/${locale}/courier/orders`;
      return;
    } catch (err: any) {
      setError(err?.message || t('auth.admin.devCourierLoginFailed', 'فشل دخول المندوب'));
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapLoading(true);
    setError('');
    try {
      await apiBootstrapAdmin({
        token: bootstrapToken,
        email: bootstrapEmail,
        password: bootstrapPassword,
        name: bootstrapName,
      });
      setEmail(bootstrapEmail);
      setPassword(bootstrapPassword);
      setBootstrapOpen(false);
      setError(t('auth.admin.bootstrapped', 'تم إنشاء المسؤول بنجاح — سجّل دخولك الآن'));
    } catch (err: any) {
      setError(err?.message || t('auth.admin.bootstrapFailed', 'فشل إنشاء المسؤول'));
    } finally {
      setBootstrapLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir={dir}>
      <div className="w-full max-w-lg bg-slate-900 border border-white/5 p-12 rounded-[4rem] shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#BD00FF] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(189,0,255,0.4)]">
            <ShieldAlert size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">{t('admin.gate.title', 'لوحة التحكم')}</h1>
          <p className="text-slate-500 font-bold mt-2">{t('admin.gate.subtitle', 'أدخل بيانات المسؤول')}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-8 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">
              {t('admin.gate.emailLabel', 'البريد الإلكتروني')}
            </label>
            <input
              required
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              className="w-full bg-slate-800 border-none rounded-2xl py-5 px-8 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">
              {t('admin.gate.passwordLabel', 'كلمة المرور')}
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-800 border-none rounded-2xl py-5 px-8 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            disabled={loading}
            className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-xl hover:bg-[#BD00FF] hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" /> : <KeyRound />}
            {t('admin.gate.login', 'دخول')}
          </button>

          {/* ── Dev quick-login buttons (development only) ── */}
          {isDev && (
            <>
              <div className="relative">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsDevMenuOpen((v) => !v)}
                  className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                >
                  <Store size={18} />
                  دخول مطور تاجر
                </button>

                {isDevMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDevMenuOpen(false)} />
                    <div className="absolute z-50 left-0 right-0 mt-3 bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl max-h-80 overflow-y-auto">
                      {DEV_ACTIVITIES.map((act) => (
                        <button
                          key={act.label}
                          type="button"
                          disabled={loading}
                          onClick={() => { setIsDevMenuOpen(false); handleDevMerchantLogin(act); }}
                          className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleDevCourierLogin}
                className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
              >
                <MapPin size={18} />
                دخول مطور مندوب
              </button>

              <button
                type="button"
                onClick={() => setBootstrapOpen((v) => !v)}
                className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all"
              >
                Bootstrap Admin
              </button>

              {bootstrapOpen && (
                <div className="p-6 bg-slate-950/40 border border-white/5 rounded-[2.5rem] space-y-4">
                  <div className="text-[11px] font-black text-slate-400">
                    أنشئ حساب مسؤول أولي باستخدام ADMIN_BOOTSTRAP_TOKEN
                  </div>
                  <form onSubmit={handleBootstrap} className="space-y-4">
                    <div className="relative">
                      <input
                        required
                        type={showBootstrapToken ? 'text' : 'password'}
                        value={bootstrapToken}
                        onChange={(e) => setBootstrapToken(e.target.value)}
                        placeholder="ADMIN_BOOTSTRAP_TOKEN"
                        className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBootstrapToken(!showBootstrapToken)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showBootstrapToken ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <input
                      required
                      type="email"
                      value={bootstrapEmail}
                      onChange={(e) => setBootstrapEmail(e.target.value)}
                      placeholder="admin@mnmknk.com"
                      className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                    />
                    <div className="relative">
                      <input
                        required
                        type={showBootstrapPassword ? 'text' : 'password'}
                        value={bootstrapPassword}
                        onChange={(e) => setBootstrapPassword(e.target.value)}
                        placeholder="كلمة مرور المسؤول"
                        className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBootstrapPassword(!showBootstrapPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showBootstrapPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={bootstrapName}
                      onChange={(e) => setBootstrapName(e.target.value)}
                      placeholder="اسم المسؤول"
                      className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                    />
                    <button
                      disabled={bootstrapLoading}
                      className="w-full py-4 bg-[#BD00FF] text-white rounded-[2rem] font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                      {bootstrapLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
                      Run Bootstrap
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => router.push(`/${locale}/login`)}
            className="w-full py-4 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:text-white transition-colors"
          >
            <ArrowRight size={16} />
            {t('admin.gate.backToLogin', 'العودة لتسجيل الدخول')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminGatePage() {
  return (
    <Suspense>
      <AdminGateInner />
    </Suspense>
  );
}
