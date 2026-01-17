
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';

const { useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const BusinessPendingApproval: React.FC = () => {
  const navigate = useNavigate();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    setError('');

    try {
      const userStr = localStorage.getItem('ray_user');
      if (!userStr) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(userStr);
      const role = String(user?.role || '').toLowerCase();
      if (role !== 'merchant') {
        navigate('/login');
        return;
      }

      const myShop = await ApiService.getMyShop();
      setShop(myShop);

      const status = String(myShop?.status || '').toLowerCase();
      if (status === 'approved') {
        const isRestaurant = String(myShop?.category || '').toUpperCase() === 'RESTAURANT';
        navigate(`/business/dashboard${isRestaurant ? '?tab=reservations' : ''}`, { replace: true } as any);
      }
    } catch (e: any) {
      setError(e?.message || 'فشل تحميل حالة الحساب');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const status = String(shop?.status || '').toLowerCase();

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
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
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">حسابك قيد المراجعة</h1>
            <p className="text-slate-500 font-bold text-sm mt-2">
              {status === 'rejected'
                ? 'تم رفض طلب الانضمام. يمكنك تعديل البيانات وإعادة المحاولة أو التواصل مع الدعم.'
                : 'تم استلام طلبك وسيقوم الأدمن بمراجعته أولاً قبل تفعيل لوحة التحكم.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-2xl text-red-600 font-bold mb-6">
            {error}
          </div>
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center justify-between flex-row-reverse">
            <p className="font-black text-slate-900">الحالة الحالية</p>
            <span className={`px-4 py-2 rounded-2xl text-xs font-black ${
              status === 'approved'
                ? 'bg-green-500/15 text-green-700'
                : status === 'rejected'
                  ? 'bg-red-500/10 text-red-600'
                  : 'bg-amber-500/15 text-amber-700'
            }`}>
              {status === 'approved' ? 'موافق عليه' : status === 'rejected' ? 'مرفوض' : 'في الانتظار'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={loadStatus}
              disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-3 disabled:bg-slate-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
              {loading ? 'جاري التحقق...' : 'تحديث الحالة'}
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black"
            >
              العودة للرئيسية
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-bold text-xs flex-row-reverse">
            <CheckCircle2 size={16} className="text-slate-400" />
            لو تمت الموافقة سيتم تحويلك تلقائياً للوحة التحكم عند تحديث الحالة.
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default BusinessPendingApproval;
