
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Loader2, MapPin, ShieldCheck, Store, User } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components';

const { Link, useLocation, useNavigate } = ReactRouterDOM as any;
const MotionDiv = motion.div as any;

const MerchantProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const impersonateShopId = useMemo(() => new URLSearchParams(String(location?.search || '')).get('impersonateShopId'), [location?.search]);

  const buildDashboardUrl = (tab?: string) => {
    const params = new URLSearchParams(String(location?.search || ''));
    if (!tab || tab === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    const qs = params.toString();
    return `/business/dashboard${qs ? `?${qs}` : ''}`;
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const savedUserStr = localStorage.getItem('ray_user');
        if (!savedUserStr) {
          navigate('/login');
          return;
        }

        const savedUser = JSON.parse(savedUserStr);
        setUser(savedUser);

        const role = String(savedUser?.role || '').toLowerCase();
        if (role !== 'merchant' && !(role === 'admin' && impersonateShopId)) {
          addToast('هذه الصفحة للتجار فقط', 'error');
          navigate('/login');
          return;
        }

        const effectiveShop =
          savedUser?.role === 'admin' && impersonateShopId
            ? await ApiService.getShopAdminById(String(impersonateShopId))
            : await ApiService.getMyShop();

        if (!cancelled) {
          setShop(effectiveShop);
        }
      } catch (e) {
        const message = (e as any)?.message || 'حدث خطأ أثناء تحميل بيانات البروفايل';
        addToast(message, 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [addToast, impersonateShopId, navigate]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-black text-slate-400">تحميل ملف التاجر...</p>
      </div>
    );
  }

  if (!user) return null;

  const shopSlug = String(shop?.slug || '');
  const shopName = String(shop?.name || '');
  const shopCity = String(shop?.city || '');
  const shopCategory = String(shop?.category || '');
  const shopStatus = String(shop?.status || '');

  return (
    <div className="max-w-[1200px] mx-auto text-right font-sans" dir="rtl">
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6 flex-row-reverse">
            <div className="w-20 h-20 rounded-[2.25rem] bg-slate-900 flex items-center justify-center text-[#00E5FF] shadow-lg shadow-cyan-500/10">
              <User className="w-9 h-9" />
            </div>
            <div className="text-right">
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                {user?.name || 'صاحب العمل'}
              </h1>
              <div className="flex items-center gap-3 justify-end mt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">تاجر</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className="text-xs font-bold text-slate-500">{user?.email || ''}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={buildDashboardUrl('settings')}
              className="px-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm text-center hover:bg-black transition-all"
            >
              إعدادات المتجر
            </Link>

            {shopSlug ? (
              <Link
                to={`/shop/${shopSlug}`}
                className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm text-center hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                فتح صفحة المتجر
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-10"
        >
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6">بيانات المتجر</h2>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse text-slate-900 font-black">
                <Store className="w-5 h-5 text-slate-400" />
                <span>اسم المتجر</span>
              </div>
              <span className="font-bold text-slate-600">{shopName || '-'}</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse text-slate-900 font-black">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span>المدينة</span>
              </div>
              <span className="font-bold text-slate-600">{shopCity || '-'}</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse text-slate-900 font-black">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
                <span>الحالة</span>
              </div>
              <span className="font-bold text-slate-600">{shopStatus || '-'}</span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-3 flex-row-reverse text-slate-900 font-black">
                <Store className="w-5 h-5 text-slate-400" />
                <span>التصنيف</span>
              </div>
              <span className="font-bold text-slate-600">{shopCategory || '-'}</span>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-5 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-10"
        >
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6">روابط سريعة</h2>

          <div className="space-y-3">
            <Link
              to={buildDashboardUrl()}
              className="w-full flex items-center justify-between flex-row-reverse gap-3 px-6 py-5 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all"
            >
              <span>لوحة التحكم</span>
              <span className="text-white/70">→</span>
            </Link>

            <Link
              to={buildDashboardUrl('builder')}
              className="w-full flex items-center justify-between flex-row-reverse gap-3 px-6 py-5 rounded-2xl bg-slate-100 text-slate-900 font-black text-sm hover:bg-slate-200 transition-all"
            >
              <span>هوية المتجر (Page Builder)</span>
              <span className="text-slate-500">→</span>
            </Link>
          </div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default MerchantProfilePage;
