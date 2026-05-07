import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2, KeyRound, ArrowRight, Store, MapPin, Eye, EyeOff } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import * as ReactRouterDOM from 'react-router-dom';
import { persistSession } from '@/services/authStorage';
import { useTranslation } from 'react-i18next';

const { useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const AdminLogin: React.FC = () => {
  const { t } = useTranslation();
  const allowBootstrapUi =
    !Boolean((import.meta as any)?.env?.PROD) &&
    String(((import.meta as any)?.env?.VITE_SHOW_ADMIN_BOOTSTRAP_UI as string) || '').toLowerCase() === 'true';
  const showDevMerchantLogin = !Boolean((import.meta as any)?.env?.PROD);
  const shouldStoreBearerToken =
    String(((import.meta as any)?.env?.VITE_ENABLE_BEARER_TOKEN as any) || '').trim().toLowerCase() === 'true';
  const [email, setEmail] = useState('admin@mnmknk.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [bootstrapToken, setBootstrapToken] = useState('');
  const [bootstrapEmail, setBootstrapEmail] = useState('admin@mnmknk.com');
  const [bootstrapPassword, setBootstrapPassword] = useState('');
  const [bootstrapName, setBootstrapName] = useState('Admin');
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [isDevActivityMenuOpen, setIsDevActivityMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showBootstrapToken, setShowBootstrapToken] = useState(false);
  const [showBootstrapPassword, setShowBootstrapPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // سيتم التعرف على admin / 1234 عبر ApiService.login
      const res = await ApiService.login(email, password);
      persistSession({
        user: res.user,
        accessToken: res.session?.access_token,
        persistBearer: shouldStoreBearerToken,
      }, 'admin-login');
      const role = String(res.user?.role || '').toLowerCase();
      if (role === 'admin') {
        const params = new URLSearchParams(location.search);
        const returnTo = String(params.get('returnTo') || '').trim();
        if (returnTo && returnTo.startsWith('/admin')) {
          navigate(returnTo);
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        throw new Error(t('auth.admin.adminsOnly'));
      }
    } catch (err: any) {
      setError(err.message || t('auth.admin.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleDevMerchantLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ApiService.devMerchantLogin();
      persistSession({
        user: res.user,
        accessToken: res.session?.access_token,
        persistBearer: shouldStoreBearerToken,
      }, 'dev-merchant-login');
      try {
        localStorage.removeItem('ray_dev_shop_category');
      } catch {
      }
      navigate('/business/dashboard');
    } catch (err: any) {
      setError(err?.message || t('auth.admin.devMerchantLoginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDevMerchantLoginWithCategory = async (shopCategory?: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await ApiService.devMerchantLogin(shopCategory ? { shopCategory } : undefined);
      persistSession({
        user: res.user,
        accessToken: res.session?.access_token,
        persistBearer: shouldStoreBearerToken,
      }, 'dev-merchant-login-category');
      try {
        if (shopCategory) {
          localStorage.setItem('ray_dev_shop_category', String(shopCategory).toUpperCase());
        } else {
          localStorage.removeItem('ray_dev_shop_category');
        }
      } catch {
      }
      navigate('/business/dashboard');
    } catch (err: any) {
      setError(err?.message || t('auth.admin.devMerchantLoginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDevCourierLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ApiService.devCourierLogin();
      persistSession({
        user: res.user,
        accessToken: res.session?.access_token,
        persistBearer: shouldStoreBearerToken,
      }, 'dev-courier-login');
      navigate('/courier/orders');
    } catch (err: any) {
      setError(err?.message || t('auth.login.devCourierLoginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapLoading(true);
    setError('');
    try {
      await ApiService.bootstrapAdmin({
        token: bootstrapToken,
        email: bootstrapEmail,
        password: bootstrapPassword,
        name: bootstrapName,
      });
      setEmail(bootstrapEmail);
      setPassword(bootstrapPassword);
      setBootstrapOpen(false);
      setError(t('auth.admin.bootstrapped'));
    } catch (err: any) {
      setError(err?.message || t('auth.admin.bootstrapFailed'));
    } finally {
      setBootstrapLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-right" dir="rtl">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border border-white/5 p-12 rounded-[4rem] shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#BD00FF] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(189,0,255,0.4)]">
            <ShieldAlert size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">{t('auth.admin.title')}</h1>
          <p className="text-slate-500 font-bold mt-2">{t('auth.admin.subtitle')}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-8 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">{t('auth.admin.usernameLabel')}</label>
            <input
              required
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin"
              className="w-full bg-slate-800 border-none rounded-2xl py-5 px-8 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">{t('auth.admin.passwordLabel')}</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="1234"
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
            className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-xl hover:bg-[#BD00FF] hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <KeyRound />}
            {t('auth.admin.login')}
          </button>

          {showDevMerchantLogin && (
            <>
              <div className="relative">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsDevActivityMenuOpen((v) => !v)}
                  className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                >
                  <Store size={18} />
                  {t('auth.admin.devLogin')}
                </button>

                {isDevActivityMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDevActivityMenuOpen(false)} />
                    <div className="absolute z-50 left-0 right-0 mt-3 bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => { setIsDevActivityMenuOpen(false); handleDevMerchantLogin(); }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.retail')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => { setIsDevActivityMenuOpen(false); handleDevMerchantLoginWithCategory('RESTAURANT'); }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.restaurant')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => { setIsDevActivityMenuOpen(false); handleDevMerchantLoginWithCategory('FASHION'); }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.fashion')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'homeTextiles');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('RETAIL');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.homeTextiles')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('FOOD');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.grocery')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('ELECTRONICS');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.electronics')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('HEALTH');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.health')}
                      </button>
                                            <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'furniture');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('SERVICE');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.furniture')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'homeGoods');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('RETAIL');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.homeGoods')}
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'realEstate');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('SERVICE');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.realEstate')}
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.setItem('ray_dev_activity_id', 'carShowroom');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('RETAIL');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.carShowroom')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('SERVICE');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.reservations')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          setIsDevActivityMenuOpen(false);
                          try {
                            localStorage.removeItem('ray_dev_activity_id');
                          } catch {
                          }
                          handleDevMerchantLoginWithCategory('OTHER');
                        }}
                        className="w-full py-4 px-6 text-right hover:bg-slate-800 transition-all font-black text-sm text-white/90"
                      >
                        {t('auth.admin.devActivity.other')}
                      </button>
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
                {t('auth.admin.devCourierLogin')}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setError('');
                  try {
                    const { portalDevLogin } = await import('@/services/api/modules/portal');
                    const res = await portalDevLogin();
                    if (res.access_token) {
                      localStorage.setItem('portal_token', res.access_token);
                      localStorage.setItem('portal_owner', JSON.stringify(res.owner));
                      window.open('/portal', '_blank');
                    }
                  } catch (err: any) {
                    setError(err?.message || t('auth.admin.devMerchantLoginFailed'));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
              >
                <Store size={18} />
                دخول مطور بورتال (نشاط خارجي)
              </button>
            </>
          )}

          {allowBootstrapUi && (
            <>
              <button
                type="button"
                onClick={() => setBootstrapOpen((v) => !v)}
                className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all"
              >
                {t('auth.admin.bootstrap')}
              </button>

              {bootstrapOpen && (
                <div className="p-6 bg-slate-950/40 border border-white/5 rounded-[2.5rem] space-y-4">
                  <div className="text-[11px] font-black text-slate-400">{t('auth.admin.bootstrapHelp')}</div>
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
                        placeholder={t('auth.admin.adminPasswordPlaceholder')}
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
                      placeholder={t('auth.admin.adminNamePlaceholder')}
                      className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                    />
                    <button
                      disabled={bootstrapLoading}
                      className="w-full py-4 bg-[#BD00FF] text-white rounded-[2rem] font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                      {bootstrapLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
                      {t('auth.admin.runBootstrap')}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-4 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:text-white transition-colors"
          >
            <ArrowRight size={16} /> {t('auth.admin.backToUsersLogin')}
          </button>
        </form>
      </MotionDiv>
    </div>
  );
};

export default AdminLogin;
