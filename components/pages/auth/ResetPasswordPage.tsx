import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components';

const { useLocation, useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tokenFromUrl = String(params.get('token') || '').trim();

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const t = String(token || '').trim();
    if (!t) {
      setError('رابط غير صالح. يرجى التأكد من التوكن.');
      return;
    }

    if (!password || password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);
    try {
      await ApiService.resetPassword({ token: t, newPassword: password });
      addToast('تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.', 'success');
      navigate('/login');
    } catch (e2: any) {
      setError(e2?.message || 'فشل تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 flex items-center justify-center min-h-[80vh]">
      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white border border-slate-100 p-8 md:p-16 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] text-right"
      >
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl">
            <Lock className="text-[#00E5FF]" size={34} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">تعيين كلمة مرور جديدة</h1>
          <p className="text-slate-400 font-bold text-sm">اكتب كلمة مرور جديدة قوية لحماية حسابك.</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border-r-4 border-red-500 p-4 mb-8 flex items-center gap-3 flex-row-reverse text-red-600 font-bold text-sm"
            >
              <AlertCircle size={20} />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mr-4">التوكن</label>
            <input
              type="text"
              disabled={loading}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black text-right"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="الصق التوكن هنا"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mr-4">كلمة المرور الجديدة</label>
            <input
              type="password"
              required
              disabled={loading}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black text-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mr-4">تأكيد كلمة المرور</label>
            <input
              type="password"
              required
              disabled={loading}
              className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-5 px-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-black text-right"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} className="text-[#00E5FF]" />}
            {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
          </button>
        </form>
      </MotionDiv>
    </div>
  );
};

export default ResetPasswordPage;
