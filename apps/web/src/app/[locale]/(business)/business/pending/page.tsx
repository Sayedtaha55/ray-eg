'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldAlert, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as merchantApi from '@/lib/api/merchant';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

const MotionDiv = motion.div as any;

export default function BusinessPendingApprovalPage() {
  const t = useT();
  const { locale, dir } = useLocale();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isLoggedInMerchant = (() => {
    try {
      const raw = localStorage.getItem('ray_user');
      if (!raw) return false;
      const u = JSON.parse(raw);
      return String(u?.role || '').toLowerCase() === 'merchant';
    } catch { return false; }
  })();

  const loadStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const userStr = localStorage.getItem('ray_user');
      if (!userStr) { setShop(null); setLoading(false); return; }
      const user = JSON.parse(userStr);
      const role = String(user?.role || '').toLowerCase();
      if (role !== 'merchant') { router.push(`/${locale}/login`); return; }

      const myShop = await merchantApi.merchantGetMyShop();
      setShop(myShop);

      const status = String(myShop?.status || '').toLowerCase();
      if (status === 'approved') {
        router.replace(`/${locale}/business/dashboard`);
      }
    } catch (e: any) {
      setError(e?.message || t('business.pendingApproval.loadFailed', 'فشل تحميل الحالة'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const status = String(shop?.status || '').toLowerCase();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <MotionDiv
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-2xl bg-white border border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.08)] ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
        dir={dir}
      >
        <div className={`flex items-center gap-4 ${dir === 'rtl' ? 'flex-row-reverse' : ''} mb-8`}>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">{t('business.pendingApproval.title', 'في انتظار الموافقة')}</h1>
            <p className="text-slate-500 font-bold text-sm mt-2">
              {status === 'rejected'
                ? t('business.pendingApproval.rejectedHint', 'تم رفض طلبك')
                : t('business.pendingApproval.pendingHint', 'طلبك قيد المراجعة')}
            </p>
          </div>
        </div>

        {error && (
          <div className={`bg-red-50 ${dir === 'rtl' ? 'border-r-4' : 'border-l-4'} border-red-500 p-4 rounded-2xl text-red-600 font-bold mb-6`}>
            {error}
          </div>
        )}

        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 space-y-4">
          <div className={`flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <p className="font-black text-slate-900">{t('business.pendingApproval.currentStatus', 'الحالة الحالية')}</p>
            <span className={`px-4 py-2 rounded-2xl text-xs font-black ${
              status === 'approved' ? 'bg-green-500/15 text-green-700'
                : status === 'rejected' ? 'bg-red-500/10 text-red-600'
                : 'bg-amber-500/15 text-amber-700'
            }`}>
              {status === 'approved' ? t('business.pendingApproval.status.approved', 'مقبول')
                : status === 'rejected' ? t('business.pendingApproval.status.rejected', 'مرفوض')
                : t('business.pendingApproval.status.pending', 'قيد المراجعة')}
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {isLoggedInMerchant && (
              <button
                onClick={loadStatus}
                disabled={loading}
                className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center gap-3 disabled:bg-slate-300"
              >
                {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                {loading ? t('business.pendingApproval.checking', 'جاري التحقق...') : t('business.pendingApproval.refreshStatus', 'تحديث الحالة')}
              </button>
            )}
            <button
              onClick={() => router.push(`/${locale}`)}
              className="flex-1 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-black"
            >
              {t('business.pendingApproval.backHome', 'الرئيسية')}
            </button>
          </div>

          <div className={`flex items-center gap-3 text-slate-500 font-bold text-xs ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <CheckCircle2 size={16} className="text-slate-400" />
            {t('business.pendingApproval.autoRedirectHint', 'سيتم تحويلك تلقائياً عند الموافقة')}
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
