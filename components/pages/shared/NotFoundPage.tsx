
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

const { Link, useLocation } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const NotFoundPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.title = '404 - الصفحة غير موجودة';
    const key = 'robots';
    let tag = document.querySelector(`meta[name="${key}"]`) as HTMLMetaElement | null;
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', key);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', 'noindex, nofollow');
  }, []);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('ray_user') || 'null');
    } catch {
      return null;
    }
  })();

  const role = String(user?.role || '').toLowerCase();
  const isMerchant = role === 'merchant';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white border border-slate-100 rounded-[3rem] p-8 md:p-12 text-right shadow-[0_40px_80px_-30px_rgba(0,0,0,0.08)]"
        dir="rtl"
      >
        <div className="flex items-center gap-4 flex-row-reverse mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
              {isMerchant ? 'تم استلام طلبك' : 'الصفحة غير موجودة'}
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-2">
              {isMerchant
                ? 'حساب النشاط التجاري قيد المراجعة الآن. برجاء الانتظار حتى تتم الموافقة من الأدمن قبل تفعيل لوحة التحكم.'
                : 'المسار الذي تحاول فتحه غير موجود داخل الموقع.'}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
          <div className="text-slate-500 font-bold text-xs">
            المسار الحالي: <span className="font-black text-slate-700">{String(location?.pathname || '')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isMerchant ? (
              <Link
                to="/business/pending"
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-3"
              >
                متابعة حالة الطلب
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-3"
              >
                <LogIn size={18} />
                تسجيل الدخول
              </Link>
            )}

            <Link
              to="/"
              className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black flex items-center justify-center gap-3"
            >
              <Home size={18} />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default NotFoundPage;
