import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Loader2, Store, MapPin, ShieldAlert } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { BackendRequestError } from '@/services/api/httpClient';

const MotionDiv = motion.div as any;

const AdminApprovals: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [moduleRequests, setModuleRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);
  const { addToast } = useToast();

  const loadShops = async () => {
    setLoading(true);
    try {
      const [data, courierData] = await Promise.all([
        ApiService.getPendingShops(),
        ApiService.getPendingCouriers(),
      ]);
      setShops(data);
      setCouriers(Array.isArray(courierData) ? courierData : []);
    } catch (e) {
      addToast('فشل تحميل الطلبات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadModuleRequests = async () => {
    setModuleLoading(true);
    try {
      const res = await (ApiService as any).adminListModuleUpgradeRequests?.({ status: 'PENDING', take: 100 });
      setModuleRequests(Array.isArray(res) ? res : []);
    } catch (e) {
      const status = e instanceof BackendRequestError ? e.status : undefined;
      if (status === 401 || status === 403) {
        addToast('لا تملك صلاحية عرض طلبات ترقية الأزرار', 'error');
      } else {
        addToast('فشل تحميل طلبات ترقية الأزرار', 'error');
      }
    } finally {
      setModuleLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
    loadModuleRequests();
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await ApiService.updateShopStatus(id, action);
      addToast(action === 'approved' ? 'تم تفعيل المحل بنجاح' : 'تم رفض الطلب', 'success');
      loadShops();
    } catch (e) {
      addToast('حدث خطأ في العملية', 'error');
    }
  };

  const handleCourierAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      if (action === 'approved') {
        await ApiService.approveCourier(id);
        addToast('تم قبول المندوب وتفعيله', 'success');
      } else {
        await ApiService.rejectCourier(id);
        addToast('تم رفض طلب المندوب', 'success');
      }
      loadShops();
    } catch (e) {
      addToast('حدث خطأ في العملية', 'error');
    }
  };

  const handleModuleRequestApprove = async (id: string) => {
    try {
      await (ApiService as any).adminApproveModuleUpgradeRequest?.(id);
      addToast('تمت الموافقة على الترقية وتفعيل الأزرار فورًا', 'success');
      loadModuleRequests();
    } catch {
      addToast('حدث خطأ في الموافقة على الترقية', 'error');
    }
  };

  const handleModuleRequestReject = async (id: string) => {
    const note = prompt('سبب الرفض (اختياري):') || '';
    try {
      await (ApiService as any).adminRejectModuleUpgradeRequest?.(id, { note: note || null });
      addToast('تم رفض طلب الترقية', 'success');
      loadModuleRequests();
    } catch {
      addToast('حدث خطأ في رفض طلب الترقية', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">طلبات الانضمام</h2>
          <p className="text-slate-500 text-sm font-bold">مراجعة وتفعيل حسابات التجار الجدد.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
      ) : (
        <div className="space-y-10">
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">طلبات ترقية الأزرار</h3>
            {moduleLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : moduleRequests.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">لا توجد طلبات ترقية معلقة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {moduleRequests.map((r: any) => {
                  const shopName = r?.shop?.name || '';
                  const shopSlug = r?.shop?.slug || '';
                  const modules = Array.isArray(r?.requestedModules) ? r.requestedModules : [];
                  const createdAt = r?.createdAt ? String(r.createdAt) : '';
                  return (
                    <MotionDiv
                      key={r.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                      <div className="text-right flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xl font-black text-white">{shopName || 'متجر'}</h4>
                            <div className="text-slate-500 text-xs font-bold mt-1">{shopSlug ? `/${shopSlug}` : ''}</div>
                          </div>
                          <div className="text-slate-500 text-xs font-bold">{createdAt ? new Date(createdAt).toLocaleString() : ''}</div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                          {(modules || []).map((m: any) => (
                            <span key={String(m)} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-black">
                              {String(m)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleModuleRequestApprove(String(r.id))}
                          className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
                        >
                          <Check size={18} /> موافقة
                        </button>
                        <button
                          onClick={() => handleModuleRequestReject(String(r.id))}
                          className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"
                        >
                          <X size={18} /> رفض
                        </button>
                      </div>
                    </MotionDiv>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">طلبات انضمام التجار</h3>
            {shops.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">لا توجد طلبات تجار معلقة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {shops.map((shop) => (
                  <MotionDiv
                    key={shop.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6 flex-row-reverse">
                      <img src={shop.logo_url} className="w-20 h-20 rounded-2xl object-cover bg-slate-800" />
                      <div className="text-right">
                        <h4 className="text-xl font-black text-white">{shop.name}</h4>
                        <div className="flex items-center gap-4 text-slate-500 text-xs font-bold mt-1">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {shop.governorate}</span>
                          <span className="flex items-center gap-1"><Store size={12} /> {shop.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(shop.id, 'approved')}
                        className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
                      >
                        <Check size={18} /> قبول التاجر
                      </button>
                      <button
                        onClick={() => handleAction(shop.id, 'rejected')}
                        className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"
                      >
                        <X size={18} /> رفض الطلب
                      </button>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">طلبات تسجيل المندوبين</h3>
            {couriers.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">لا توجد طلبات مندوبين معلقة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {couriers.map((c: any) => (
                  <MotionDiv
                    key={c.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6 flex-row-reverse">
                      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[#00E5FF] text-2xl">
                        {String(c?.name || 'C').charAt(0)}
                      </div>
                      <div className="text-right">
                        <h4 className="text-xl font-black text-white">{c?.name || 'مندوب'}</h4>
                        <div className="text-slate-400 text-xs font-bold mt-1">{c?.email}</div>
                        {c?.phone ? <div className="text-slate-500 text-xs font-bold mt-1">{c.phone}</div> : null}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCourierAction(String(c.id), 'approved')}
                        className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
                      >
                        <Check size={18} /> قبول المندوب
                      </button>
                      <button
                        onClick={() => handleCourierAction(String(c.id), 'rejected')}
                        className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"
                      >
                        <X size={18} /> رفض الطلب
                      </button>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
