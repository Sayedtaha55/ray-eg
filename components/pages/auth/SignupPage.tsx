
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Store, Mail, Lock, Phone, ShieldCheck, Loader2, AlertCircle, MapPin, UtensilsCrossed, Package, ChevronRight, Sparkles } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { Category } from '@/types';

const { Link, useNavigate, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const SignupPage: React.FC = () => {
  const [role, setRole] = useState<'customer' | 'merchant'>('customer');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phone: '',
    shopName: '',
    category: Category.RETAIL,
    governorate: 'القاهرة',
    city: '',
    shopEmail: '',
    shopPhone: '',
    openingHours: '',
    addressDetailed: '',
    shopDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const roleParam = params.get('role');
  const categoryParam = params.get('category');
  const returnTo = params.get('returnTo');
  const followShopId = params.get('followShopId');

  const backendBaseUrl =
    ((import.meta as any)?.env?.VITE_BACKEND_URL as string) ||
    ((import.meta as any)?.env?.VITE_API_URL as string) ||
    `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:4000`;

  useEffect(() => {
    if (roleParam === 'merchant') {
      setRole('merchant');
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

  const buildLoginLink = () => {
    const q = new URLSearchParams();
    if (returnTo) q.set('returnTo', returnTo);
    if (followShopId) q.set('followShopId', followShopId);
    const qs = q.toString();
    return `/login${qs ? `?${qs}` : ''}`;
  };

  const handleGoogleLogin = () => {
    const q = new URLSearchParams();
    if (returnTo) q.set('returnTo', returnTo);
    if (followShopId) q.set('followShopId', followShopId);
    const qs = q.toString();
    window.location.href = `${backendBaseUrl}/api/v1/auth/google${qs ? `?${qs}` : ''}`;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await ApiService.signup({ ...formData, role });
      const isPending = Boolean((response as any)?.pending);
      if (isPending) {
        try {
          localStorage.removeItem('ray_user');
          localStorage.removeItem('ray_token');
        } catch {
        }
        window.dispatchEvent(new Event('auth-change'));
        navigate('/business/pending');
        return;
      }

      localStorage.setItem('ray_user', JSON.stringify((response as any).user));
      // Accessing the token correctly from session
      localStorage.setItem('ray_token', (response as any).session?.access_token || '');
      window.dispatchEvent(new Event('auth-change'));

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
      
      if (role === 'merchant') {
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
      setError(err.message || 'حدث خطأ أثناء التسجيل');
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
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">انضم إلى <span className="text-[#00E5FF]">عالم ري.</span></h1>
          <p className="text-slate-400 font-bold">ابدأ تجربتك المجانية واحصل على ميزات حصرية.</p>
        </header>

        <div className="flex p-2 bg-slate-50 rounded-[2rem] mb-10">
           <button 
             type="button"
             onClick={() => setRole('customer')}
             className={`flex-1 py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all ${role === 'customer' ? 'bg-white shadow-xl text-slate-900' : 'text-slate-400'}`}
           >
              <User size={18} /> زبون
           </button>
           <button 
             type="button"
             onClick={() => setRole('merchant')}
             className={`flex-1 py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 transition-all ${role === 'merchant' ? 'bg-white shadow-xl text-[#00E5FF]' : 'text-slate-400'}`}
           >
              <Store size={18} /> تاجر / صاحب عمل
           </button>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">الاسم بالكامل</label>
                <input 
                  required 
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" 
                  placeholder="أحمد محمد"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">رقم الموبايل</label>
                <input 
                  required 
                  type="tel" 
                  className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" 
                  placeholder="01x xxxx xxxx"
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
                     <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest mr-4">اسم المحل أو المطعم</label>
                     <input 
                       required={role === 'merchant'}
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" 
                       placeholder="مثلاً: محل الهدى"
                       value={formData.shopName}
                       onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest mr-4">نوع النشاط</label>
                     <select 
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none appearance-none"
                       value={formData.category}
                       onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                     >
                        <option value={Category.RETAIL}>محل تجاري / ملابس / إلكترونيات</option>
                        <option value={Category.RESTAURANT}>مطعم / أكلات</option>
                        <option value={Category.FASHION}>ملابس وأزياء</option>
                        <option value={Category.ELECTRONICS}>إلكترونيات وموبايلات</option>
                        <option value={Category.HEALTH}>صيدلية / مستحضرات تجميل</option>
                        <option value={Category.SERVICE}>خدمات / صيانة / ورش</option>
                        <option value={Category.FOOD}>سوبر ماركت / بقالة / عطارة</option>
                        <option value={Category.OTHER}>أخرى</option>
                     </select>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">المحافظة</label>
                     <input 
                       required={role === 'merchant'}
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" 
                       placeholder="القاهرة"
                       value={formData.governorate}
                       onChange={(e) => setFormData({...formData, governorate: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">المدينة / المنطقة</label>
                     <input 
                       required={role === 'merchant'}
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" 
                       placeholder="مدينة نصر"
                       value={formData.city}
                       onChange={(e) => setFormData({...formData, city: e.target.value})}
                     />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">موبايل المحل</label>
                     <input 
                       required={role === 'merchant'}
                       type="tel"
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" 
                       placeholder="01x xxxx xxxx"
                       value={formData.shopPhone}
                       onChange={(e) => setFormData({...formData, shopPhone: e.target.value})}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">مواعيد العمل</label>
                     <input 
                       className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" 
                       placeholder="مثال: ١٠ صباحاً - ١١ مساءً"
                       value={formData.openingHours}
                       onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                     />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">بريد المحل (اختياري)</label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none"
                    placeholder="name@gmail.com"
                    value={formData.shopEmail}
                    onChange={(e) => setFormData({ ...formData, shopEmail: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">العنوان التفصيلي</label>
                  <textarea
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none resize-none"
                    rows={3}
                    placeholder="مثال: شارع ... بجوار ..."
                    value={formData.addressDetailed}
                    onChange={(e) => setFormData({...formData, addressDetailed: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">وصف المحل</label>
                  <textarea
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none resize-none"
                    rows={3}
                    placeholder="نبذة مختصرة عن المحل..."
                    value={formData.shopDescription}
                    onChange={(e) => setFormData({...formData, shopDescription: e.target.value})}
                  />
                </div>
             </motion.div>
           )}

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">البريد الإلكتروني</label>
              <input 
                required 
                type="email" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" 
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">كلمة المرور</label>
              <input 
                required 
                type="password" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-8 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:bg-black transition-all shadow-2xl mt-6 flex items-center justify-center gap-4 disabled:bg-slate-300"
           >
             {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} className="text-[#00E5FF]" />}
             {loading ? 'جاري إنشاء حسابك الآمن...' : role === 'merchant' ? 'ابدأ كتاجر الآن' : 'تأكيد التسجيل'}
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

        <div className="mt-10 text-center">
           <p className="text-slate-400 font-bold">لديك حساب بالفعل؟ <Link to={buildLoginLink()} className="text-[#00E5FF] hover:underline">سجل دخولك</Link></p>
        </div>
      </MotionDiv>
    </div>
  );
};

export default SignupPage;
