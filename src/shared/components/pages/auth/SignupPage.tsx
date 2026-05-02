
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Store, Mail, Lock, Phone, ShieldCheck, Loader2, AlertCircle, MapPin, UtensilsCrossed, Package, ChevronRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import { Category } from '@/types';
import { clearSession, persistMerchantContext, persistSession, syncMerchantContextFromBackend } from '@/services/authStorage';
import { normalizeSafeReturnTo, resolvePostAuthDestination } from '@/services/authRedirect';

const { Link, useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const MERCHANT_ONBOARDING_STORAGE_KEY = 'ray_merchant_onboarding';

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const [role, setRole] = useState<'customer' | 'merchant'>('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    category: Category.RETAIL,
    governorate: '',
    city: '',
    shopEmail: '',
    shopPhone: '',
    openingHours: '',
    addressDetailed: '',
    shopDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const roleParam = params.get('role');
  const categoryParam = params.get('category');

  const returnTo = normalizeSafeReturnTo(params.get('returnTo'));
  const followShopId = params.get('followShopId');

  const shouldStoreBearerToken =
    String(((import.meta as any)?.env?.VITE_ENABLE_BEARER_TOKEN as any) || '').trim().toLowerCase() === 'true';

  const allowMerchantSignup =
    String(location?.pathname || '').startsWith('/business') ||
    roleParam === 'merchant';

  const backendBaseUrl =
    ((import.meta as any)?.env?.VITE_BACKEND_URL as string) ||
    ((import.meta as any)?.env?.VITE_API_URL as string) ||
    `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4000`;

  const [merchantOnboardingConfig, setMerchantOnboardingConfig] = useState<null | {
    enabledModules?: string[];
    dashboardMode?: string;
    activityId?: string;
    category?: string;
  }>(null);

  useEffect(() => {
    if (roleParam === 'merchant') {
      setRole('merchant');
      return;
    }
    if (!allowMerchantSignup) {
      setRole('customer');
    }
  }, [roleParam]);

  useEffect(() => {
    if (roleParam !== 'merchant') return;
    try {
      const raw = sessionStorage.getItem(MERCHANT_ONBOARDING_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setMerchantOnboardingConfig(parsed && typeof parsed === 'object' ? parsed : null);
      const cat = String(parsed?.category || '').trim().toUpperCase();
      const allowed = new Set(Object.values(Category).map((v) => String(v).toUpperCase()));
      if (cat && allowed.has(cat)) {
        setFormData((prev) => ({
          ...prev,
          category: cat as any,
        }));
      }
    } catch {
      setMerchantOnboardingConfig(null);
    }
  }, [roleParam]);

  useEffect(() => {
    const cat = String(categoryParam || '').trim().toUpperCase();
    if (!cat) return;
    const allowed = new Set(Object.values(Category).map((v) => String(v).toUpperCase()));
    if (!allowed.has(cat)) return;
    setFormData((prev) => ({
      ...prev,
      category: cat as any,
    }));
  }, [categoryParam]);

  const categoryLabelMap: Record<string, string> = {
    [Category.RETAIL]: t('auth.signup.category.retail'),
    [Category.RESTAURANT]: t('auth.signup.category.restaurant'),
    [Category.FASHION]: t('auth.signup.category.fashion'),
    [Category.ELECTRONICS]: t('auth.signup.category.electronics'),
    [Category.HEALTH]: t('auth.signup.category.health'),
    [Category.FOOD]: t('auth.signup.category.food'),
    [Category.OTHER]: t('auth.signup.category.other'),
  };

  const buildLoginLink = () => {
    const q = new URLSearchParams();
    if (returnTo) q.set('returnTo', returnTo);
    if (followShopId) q.set('followShopId', followShopId);
    const qs = q.toString();
    const base = role === 'merchant' ? '/business/login' : '/login';
    return `${base}${qs ? `?${qs}` : ''}`;
  };

  useEffect(() => {
    if (role !== 'merchant') return;

    const hasOnboarding = (() => {
      try {
        const raw = sessionStorage.getItem(MERCHANT_ONBOARDING_STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        const cat = String((parsed as any)?.category || '').trim().toUpperCase();
        const allowed = new Set(Object.values(Category).map((v) => String(v).toUpperCase()));
        return Boolean(cat && allowed.has(cat));
      } catch {
        return false;
      }
    })();

    if (hasOnboarding) return;

    const q = new URLSearchParams();
    if (returnTo) q.set('returnTo', returnTo);
    if (followShopId) q.set('followShopId', followShopId);
    navigate(`/business/onboarding${q.toString() ? `?${q.toString()}` : ''}`, { replace: true } as any);
  }, [role, returnTo, followShopId, navigate]);

  const handleGoogleLogin = () => {
    const q = new URLSearchParams();
    if (returnTo) q.set('returnTo', returnTo);
    if (followShopId) q.set('followShopId', followShopId);
    if (role === 'merchant') q.set('target', '/business/dashboard');
    const qs = q.toString();
    window.location.href = `${backendBaseUrl}/api/v1/auth/google${qs ? `?${qs}` : ''}`;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = { ...formData, role };

      if (role === 'merchant') {
        const cfg = merchantOnboardingConfig;

        const enabledModules = Array.isArray(cfg?.enabledModules)
          ? cfg?.enabledModules.map((x: any) => String(x || '').trim()).filter(Boolean)
          : [];

        if (enabledModules.length > 0) {
          payload.enabledModules = enabledModules;
        }

        const dashboardMode = String(cfg?.dashboardMode || '').trim();
        if (dashboardMode) {
          payload.dashboardMode = dashboardMode;
        }
      }

      const response = await ApiService.signup(payload);
      const isPending = Boolean((response as any)?.pending);
      if (isPending) {
        clearSession('signup-pending');
        navigate('/business/pending');
        return;
      }

      if (role === 'merchant') {
        try {
          sessionStorage.removeItem(MERCHANT_ONBOARDING_STORAGE_KEY);
        } catch {
        }
      }

      persistSession({
        user: (response as any).user,
        accessToken: (response as any).session?.access_token,
        persistBearer: shouldStoreBearerToken,
      }, 'signup');

      if (returnTo) {
        try {
          if (followShopId) {
            await ApiService.followShop(followShopId);
            window.dispatchEvent(new Event('ray-db-update'));
          }
        } catch {
          // ignore
        }
        navigate(returnTo);
        return;
      }

      const normalizedRole = String((response as any)?.user?.role || role || '').trim().toLowerCase();

      if (normalizedRole === 'merchant') {
        const responseShop = (response as any)?.shop;
        const responseShopStatus = String(responseShop?.status || '').trim().toLowerCase();

        if (responseShopStatus) {
          persistMerchantContext({
            shopId: responseShop?.id ? String(responseShop.id) : undefined,
            status: responseShopStatus,
          });
        } else {
          try {
            await syncMerchantContextFromBackend((response as any)?.user);
          } catch {
            const fallbackStatus = String(((response as any)?.user?.shop?.status) || '').trim().toLowerCase();
            if (fallbackStatus) {
              persistMerchantContext({
                shopId: (response as any)?.user?.shopId ? String((response as any)?.user?.shopId) : undefined,
                status: fallbackStatus,
              });
            }
          }
        }
      }

      const targetRoute = await resolvePostAuthDestination({
        role: normalizedRole,
        user: (response as any)?.user,
        returnTo,
        merchantStatus: (response as any)?.shop?.status,
      });

      navigate(targetRoute, { replace: true } as any);
    } catch (err: any) {
      setError(err.message || t('auth.signup.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center min-h-[80vh]">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white border border-slate-100 p-8 md:p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] text-right"
      >
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{t('auth.signup.title')} <span className="text-[#00E5FF]">{t('auth.signup.titleHighlight')}</span></h1>
          <p className="text-slate-400 font-bold">{t('auth.signup.subtitle')}</p>
        </header>

        <div className="flex p-2 bg-slate-50 rounded-[2rem] mb-10">
           <button
             type="button"
             onClick={() => setRole('customer')}
             className={`flex-1 py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all ${role === 'customer' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-400'}`}
           >
              <User size={18} /> {t('auth.signup.roleCustomer')}
           </button>
           {allowMerchantSignup && (
             <button
               type="button"
               onClick={() => setRole('merchant')}
               className={`flex-1 py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all ${role === 'merchant' ? 'bg-white shadow-xl text-[#00E5FF]' : 'text-slate-400'}`}
             >
                <Store size={18} /> {t('auth.signup.roleMerchant')}
             </button>
           )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border-r-4 border-red-500 p-4 mb-8 flex items-center gap-3 flex-row-reverse text-red-600 font-bold text-sm">
              <AlertCircle size={20} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSignup} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.fullNameLabel')}</label>
                <input
                  required
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                  placeholder={t('auth.signup.fullNamePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.mobileLabel')}</label>
                <input
                  required
                  type="tel"
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                  placeholder={t('auth.signup.mobilePlaceholder')}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
           </div>

           {role === 'merchant' && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="space-y-6 pt-4 border-t border-slate-50"
             >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest mr-4">{t('auth.signup.shopNameLabel')}</label>
                     <input
                       required={role === 'merchant'}
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                       placeholder={t('auth.signup.shopNamePlaceholder')}
                       value={formData.shopName}
                       onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                     />
                   </div>
                   <div />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.governorateLabel')}</label>
                     <input
                       required={role === 'merchant'}
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                       placeholder={t('auth.signup.governoratePlaceholder')}
                       value={formData.governorate}
                       onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.cityLabel')}</label>
                     <input
                       required={role === 'merchant'}
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                       placeholder={t('auth.signup.cityPlaceholder')}
                       value={formData.city}
                       onChange={(e) => setFormData({...formData, city: e.target.value})}
                     />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.shopPhoneLabel')}</label>
                     <input
                       required={role === 'merchant'}
                       type="tel"
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                       placeholder={t('auth.signup.mobilePlaceholder')}
                       value={formData.shopPhone}
                       onChange={(e) => setFormData({...formData, shopPhone: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.openingHoursLabel')}</label>
                     <input
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                       placeholder={t('auth.signup.openingHoursPlaceholder')}
                       value={formData.openingHours}
                       onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                     />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.shopEmailLabel')}</label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                    placeholder={t('auth.signup.shopEmailPlaceholder')}
                    value={formData.shopEmail}
                    onChange={(e) => setFormData({ ...formData, shopEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.addressLabel')}</label>
                  <textarea
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none resize-none"
                    rows={3}
                    placeholder={t('auth.signup.addressPlaceholder')}
                    value={formData.addressDetailed}
                    onChange={(e) => setFormData({...formData, addressDetailed: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.descriptionLabel')}</label>
                  <textarea
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none resize-none"
                    rows={3}
                    placeholder={t('auth.signup.descriptionPlaceholder')}
                    value={formData.shopDescription}
                    onChange={(e) => setFormData({...formData, shopDescription: e.target.value})}
                  />
                </div>
             </motion.div>
           )}

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.emailLabel')}</label>
              <input
                required
                type="email"
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                placeholder={t('auth.signup.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{t('auth.signup.passwordLabel')}</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-8 pl-16 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={showPassword ? t('auth.signup.hidePasswordAria') : t('auth.signup.showPasswordAria')}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
           </div>

           <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <Sparkles size={20} className="text-[#BD00FF]" />
            {t('auth.signup.googleLogin')}
          </button>
        </form>

        <div className="mt-10 text-center">
           <p className="text-slate-400 font-bold">{t('auth.signup.haveAccount')} <Link to={buildLoginLink()} className="text-[#00E5FF] hover:underline">{t('auth.signup.loginNow')}</Link></p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default SignupPage;
