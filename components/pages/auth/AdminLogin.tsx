import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2, KeyRound, ArrowRight, Store } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const AdminLogin: React.FC = () => {
  const allowBootstrapUi =
    !Boolean((import.meta as any)?.env?.PROD) &&
    String(((import.meta as any)?.env?.VITE_SHOW_ADMIN_BOOTSTRAP_UI as string) || '').toLowerCase() === 'true';
  const showDevMerchantLogin = !Boolean((import.meta as any)?.env?.PROD);
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // سيتم التعرف على admin / 1234 عبر ApiService.login
      const res = await ApiService.login(email, password);
      localStorage.setItem('ray_user', JSON.stringify(res.user));
      localStorage.setItem('ray_token', res.session?.access_token || '');
      window.dispatchEvent(new Event('auth-change'));
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
        throw new Error('هذه المنطقة للمشرفين فقط!');
      }
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const handleDevMerchantLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ApiService.devMerchantLogin();
      localStorage.setItem('ray_user', JSON.stringify(res.user));
      localStorage.setItem('ray_token', res.session?.access_token || '');
      window.dispatchEvent(new Event('auth-change'));
      navigate('/business/dashboard');
    } catch (err: any) {
      setError(err?.message || 'تعذر تسجيل دخول المطور');
    } finally {
      setLoading(false);
    }
  };

  const handleDevRestaurantLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ApiService.devMerchantLogin({ shopCategory: 'RESTAURANT' });
      localStorage.setItem('ray_user', JSON.stringify(res.user));
      localStorage.setItem('ray_token', res.session?.access_token || '');
      window.dispatchEvent(new Event('auth-change'));
      navigate('/business/dashboard');
    } catch (err: any) {
      setError(err?.message || 'تعذر تسجيل دخول المطور');
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
      setError('تم تهيئة الأدمن. يمكنك تسجيل الدخول الآن.');
    } catch (err: any) {
      setError(err?.message || 'فشل تهيئة الأدمن');
    } finally {
      setBootstrapLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-right" dir="rtl">
       <MotionDiv 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border border-white/5 p-12 rounded-[4rem] shadow-2xl"
       >
          <div className="text-center mb-10">
             <div className="w-20 h-20 bg-[#BD00FF] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(189,0,255,0.4)]">
                <ShieldAlert size={40} className="text-white" />
             </div>
             <h1 className="text-3xl font-black text-white tracking-tighter">بوابة الآدمن</h1>
             <p className="text-slate-500 font-bold mt-2">يرجى إثبات هويتك للوصول لبيانات السيرفر.</p>
          </div>

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-8 text-sm font-bold">{error}</div>}

          <form onSubmit={handleAdminLogin} className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">اسم المستخدم</label>
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
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">كلمة المرور</label>
                <input 
                  required 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="1234"
                  className="w-full bg-slate-800 border-none rounded-2xl py-5 px-8 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all" 
                />
             </div>
             <button disabled={loading} className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-xl hover:bg-[#BD00FF] hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <KeyRound />}
              دخول للنظام
            </button>

             {showDevMerchantLogin && (
               <>
                 <button
                   type="button"
                   disabled={loading}
                   onClick={handleDevMerchantLogin}
                   className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                 >
                   <Store size={18} />
                   دخول المطور (تاجر)
                 </button>
                 <button
                   type="button"
                   disabled={loading}
                   onClick={handleDevRestaurantLogin}
                   className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                 >
                   <Store size={18} />
                   دخول المطور (مطعم)
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
                   تهيئة الأدمن (Bootstrap)
                 </button>

                 {bootstrapOpen && (
                   <div className="p-6 bg-slate-950/40 border border-white/5 rounded-[2.5rem] space-y-4">
                     <div className="text-[11px] font-black text-slate-400">استخدم ADMIN_BOOTSTRAP_TOKEN من Railway لعمل/تحديث حساب الأدمن على الإنتاج.</div>
                     <form onSubmit={handleBootstrap} className="space-y-4">
                       <input
                         required
                         type="password"
                         value={bootstrapToken}
                         onChange={(e) => setBootstrapToken(e.target.value)}
                         placeholder="ADMIN_BOOTSTRAP_TOKEN"
                         className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                       />
                       <input
                         required
                         type="email"
                         value={bootstrapEmail}
                         onChange={(e) => setBootstrapEmail(e.target.value)}
                         placeholder="admin@mnmknk.com"
                         className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                       />
                       <input
                         required
                         type="password"
                         value={bootstrapPassword}
                         onChange={(e) => setBootstrapPassword(e.target.value)}
                         placeholder="كلمة مرور الأدمن (8 أحرف على الأقل)"
                         className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                       />
                       <input
                         type="text"
                         value={bootstrapName}
                         onChange={(e) => setBootstrapName(e.target.value)}
                         placeholder="اسم الأدمن"
                         className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                       />
                       <button
                         disabled={bootstrapLoading}
                         className="w-full py-4 bg-[#BD00FF] text-white rounded-[2rem] font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                       >
                         {bootstrapLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
                         تنفيذ التهيئة
                       </button>
                     </form>
                   </div>
                 )}
               </>
             )}

             <button type="button" onClick={() => navigate('/login')} className="w-full py-4 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:text-white transition-colors">
               <ArrowRight size={16} /> العودة لتسجيل دخول المستخدمين
             </button>
          </form>
       </MotionDiv>
    </div>
  );
};

export default AdminLogin;
