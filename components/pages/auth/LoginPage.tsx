import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Loader2, AlertCircle, KeyRound, X, Sparkles, UserPlus, Store } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';

const { Link, useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isForgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotResult, setForgotResult] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo');
  const followShopId = params.get('followShopId');

  const backendBaseUrl =
    ((import.meta as any)?.env?.VITE_BACKEND_URL as string) ||
    ((import.meta as any)?.env?.VITE_API_URL as string) ||
    `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4000`;

  const buildSignupLink = (role?: string) => {
    const q = new URLSearchParams();
    if (role) q.set('role', role);
    if (returnTo) q.set('returnTo', returnTo);
    if (followShopId) q.set('followShopId', followShopId);
    const qs = q.toString();
    return `/signup${qs ? `?${qs}` : ''}`;
  };

  const handleGoogleLogin = () => {
    const q = new URLSearchParams();
    if (returnTo) q.set('returnTo', returnTo);
    if (followShopId) q.set('followShopId', followShopId);
    const qs = q.toString();
    window.location.href = `${backendBaseUrl}/api/v1/auth/google${qs ? `?${qs}` : ''}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await ApiService.login(email, password);
      localStorage.setItem('ray_user', JSON.stringify(response.user));
      localStorage.setItem('ray_token', response.session?.access_token || '');
      window.dispatchEvent(new Event('auth-change'));
      
      addToast(`أهلاً بك مجدداً، ${response.user.name}`, 'success');

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

      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.user.role === 'merchant') {
        try {
          const myShop = await ApiService.getMyShop();
          const status = String(myShop?.status || '').toLowerCase();
          if (status !== 'approved') {
            navigate('/business/pending');
            return;
          }
          navigate('/business/dashboard');
        } catch {
          navigate('/business/pending');
        }
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      const status = typeof err?.status === 'number' ? err.status : undefined;
      if (status === 403) {
        navigate('/business/pending');
        return;
      }
      setError(err.message || 'فشل تسجيل الدخول، تأكد من بياناتك');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center min-h-[80vh]">
      <AnimatePresence>
        {isForgotModalOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => {
              if (forgotLoading) return;
              setForgotModalOpen(false);
              setForgotResult(null);
            }}
          >
            <MotionDiv
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="w-full max-w-xl bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 md:p-10 text-right"
              onClick={(e: any) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between flex-row-reverse gap-4 mb-6">
                <div className="text-right">
                  <h3 className="text-2xl font-black tracking-tight">نسيت كلمة المرور</h3>
                  <p className="text-slate-400 font-bold text-sm mt-1">اكتب بريدك الإلكتروني علشان نجهز لك رابط إعادة تعيين.</p>
                </div>
                <button
                  type="button"
                  disabled={forgotLoading}
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotResult(null);
                  }}
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full disabled:opacity-60"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mr-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    disabled={forgotLoading}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black text-right"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="example@email.com"
                  />
                </div>

                {forgotResult?.resetUrlHash && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                    <div className="text-sm font-black text-slate-700">رابط إعادة تعيين</div>
                    <div className="text-[11px] font-bold text-slate-500 break-all bg-white border border-slate-100 rounded-xl p-3">
                      {String(forgotResult.resetUrlHash)}
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(String(forgotResult.resetUrlHash));
                            addToast('تم نسخ الرابط', 'success');
                          } catch {
                            addToast('تعذر نسخ الرابط', 'error');
                          }
                        }}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-black transition-all"
                      >
                        نسخ الرابط
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const url = String(forgotResult.resetUrlHash);
                          const tokenParam = url.split('token=')[1] || '';
                          const token = decodeURIComponent(tokenParam.split('&')[0] || '').trim();
                          navigate(`/reset-password?token=${encodeURIComponent(token)}`);
                          setForgotModalOpen(false);
                          setForgotResult(null);
                        }}
                        className="flex-1 py-3 bg-[#00E5FF] text-slate-900 rounded-xl font-black text-xs hover:brightness-95 transition-all"
                      >
                        فتح الصفحة
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={forgotLoading}
                  onClick={async () => {
                    const e = String(forgotEmail || '').trim();
                    if (!e) {
                      addToast('اكتب البريد الإلكتروني أولاً', 'error');
                      return;
                    }
                    setForgotLoading(true);
                    setForgotResult(null);
                    try {
                      const res = await ApiService.forgotPassword({ email: e });
                      setForgotResult(res);
                      addToast('إذا كان البريد موجود، هتوصلك خطوات إعادة التعيين.', 'success');
                    } catch (err: any) {
                      addToast(err?.message || 'فشل إرسال رابط إعادة التعيين', 'error');
                    } finally {
                      setForgotLoading(false);
                    }
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {forgotLoading ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} className="text-[#00E5FF]" />}
                  {forgotLoading ? 'جاري التجهيز...' : 'إرسال رابط إعادة التعيين'}
                </button>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <MotionDiv 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white border border-slate-100 p-8 md:p-16 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] text-right"
      >
        <div className="flex flex-col items-center text-center mb-12">
           <div 
              onClick={() => navigate('/admin/gate')}
              className="w-20 h-20 bg-[#1A1A1A] rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl relative group overflow-hidden cursor-pointer"
           >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="text-white font-black text-4xl relative z-10">R</span>
           </div>
           <h1 className="text-4xl font-black tracking-tighter mb-4">أهلاً بك <span className="text-[#00E5FF]">مجدداً.</span></h1>
           <p className="text-slate-400 font-bold text-sm">سجل دخولك أو افتح حساب نشاط تجاري جديد.</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 border-r-4 border-red-500 p-4 mb-8 flex items-center gap-3 flex-row-reverse text-red-600 font-bold text-sm">
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mr-4">البريد الإلكتروني</label>
            <input 
              type="email" required disabled={loading}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black text-right"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center flex-row-reverse mr-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">كلمة المرور</label>
              <button type="button" onClick={() => setForgotModalOpen(true)} className="text-[10px] font-black text-[#BD00FF]">نسيت كلمة المرور؟</button>
            </div>
            <input 
              type="password" required disabled={loading}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black text-right"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} className="text-[#00E5FF]" />}
            {loading ? 'جاري التحقق...' : 'دخول آمن'}
          </button>
        </form>

        <div className="mt-6">
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] font-black text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <Sparkles size={20} className="text-[#BD00FF]" />
            تسجيل الدخول عبر Google
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
           <p className="text-center text-slate-400 font-bold text-xs mb-4">ليس لديك حساب؟</p>
           <div className="grid grid-cols-2 gap-4">
              <Link to={buildSignupLink()} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                 <UserPlus size={20} className="text-slate-900" />
                 <span className="font-black text-[10px]">تسجيل زبون</span>
              </Link>
              <Link to={buildSignupLink('merchant')} className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                 <Store size={20} className="text-[#BD00FF]" />
                 <span className="font-black text-[10px]">تسجيل نشاط</span>
              </Link>
           </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default LoginPage;
