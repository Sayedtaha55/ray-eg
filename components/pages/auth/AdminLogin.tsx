import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2, KeyRound, ArrowRight } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
             <button type="button" onClick={() => navigate('/login')} className="w-full py-4 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:text-white transition-colors">
               <ArrowRight size={16} /> العودة لتسجيل دخول المستخدمين
             </button>
          </form>
       </MotionDiv>
    </div>
  );
};

export default AdminLogin;
