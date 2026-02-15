import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { Loader2, Truck, Users, UserPlus, Search, Check, X } from 'lucide-react';

const MotionDiv = motion.div as any;

type TabKey = 'couriers' | 'pending' | 'create';

const { useLocation } = ReactRouterDOM as any;

const AdminDelivery: React.FC = () => {
  const { addToast } = useToast();

  const location = useLocation();

  const [tab, setTab] = useState<TabKey>('couriers');

  const [couriers, setCouriers] = useState<any[]>([]);
  const [pendingCouriers, setPendingCouriers] = useState<any[]>([]);

  const [loadingCouriers, setLoadingCouriers] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);

  const [search, setSearch] = useState('');

  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [creating, setCreating] = useState(false);

  const loadCouriers = async () => {
    setLoadingCouriers(true);
    try {
      const data = await ApiService.getCouriers();
      setCouriers(Array.isArray(data) ? data : []);
    } catch {
      setCouriers([]);
    } finally {
      setLoadingCouriers(false);
    }
  };

  const loadPendingCouriers = async () => {
    setLoadingPending(true);
    try {
      const data = await ApiService.getPendingCouriers();
      setPendingCouriers(Array.isArray(data) ? data : []);
    } catch {
      setPendingCouriers([]);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    loadCouriers();
    loadPendingCouriers();
  }, []);

  useEffect(() => {
    try {
      const q = new URLSearchParams(String(location?.search || ''));
      const t = String(q.get('tab') || '').trim().toLowerCase();
      if (t === 'couriers' || t === 'pending' || t === 'create') {
        setTab(t as TabKey);
      }
    } catch {
    }
  }, [location?.search]);

  const filteredCouriers = useMemo(() => {
    const q = String(search || '').trim().toLowerCase();
    if (!q) return couriers;
    return (couriers || []).filter((c: any) => {
      const name = String(c?.name || '').toLowerCase();
      const email = String(c?.email || '').toLowerCase();
      const phone = String(c?.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [couriers, search]);

  const handleApprove = async (id: string) => {
    try {
      await ApiService.approveCourier(id);
      addToast('تم قبول المندوب وتفعيله', 'success');
      await Promise.all([loadCouriers(), loadPendingCouriers()]);
    } catch {
      addToast('حدث خطأ في العملية', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await ApiService.rejectCourier(id);
      addToast('تم رفض طلب المندوب', 'success');
      await loadPendingCouriers();
    } catch {
      addToast('حدث خطأ في العملية', 'error');
    }
  };

  const handleCreateCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;

    setCreating(true);
    try {
      await ApiService.createCourier({
        name: String(createName || '').trim(),
        email: String(createEmail || '').trim(),
        password: String(createPassword || ''),
        ...(String(createPhone || '').trim() ? { phone: String(createPhone || '').trim() } : {}),
      });

      setCreateName('');
      setCreateEmail('');
      setCreatePhone('');
      setCreatePassword('');

      addToast('تم إنشاء المندوب بنجاح', 'success');
      setTab('couriers');
      await loadCouriers();
    } catch (e: any) {
      addToast(String(e?.message || 'فشل إنشاء المندوب'), 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl">
            <Truck size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">إدارة التوصيل</h2>
            <p className="text-slate-500 text-sm font-bold">إدارة المندوبين وطلبات انضمامهم.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTab('couriers')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition ${tab === 'couriers' ? 'bg-[#00E5FF] text-black' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
          >
            <Users size={14} className="inline ml-2" />
            المندوبين
          </button>
          <button
            onClick={() => setTab('pending')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition ${tab === 'pending' ? 'bg-[#00E5FF] text-black' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
          >
            <Check size={14} className="inline ml-2" />
            طلبات المندوبين
            {pendingCouriers.length ? (
              <span className="mr-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black">{pendingCouriers.length}</span>
            ) : null}
          </button>
          <button
            onClick={() => setTab('create')}
            className={`px-5 py-3 rounded-2xl text-xs font-black transition ${tab === 'create' ? 'bg-[#00E5FF] text-black' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
          >
            <UserPlus size={14} className="inline ml-2" />
            إضافة مندوب
          </button>
        </div>
      </div>

      {tab === 'couriers' ? (
        <div className="space-y-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm"
              placeholder="ابحث بالاسم أو البريد أو الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
            {loadingCouriers ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : filteredCouriers.length === 0 ? (
              <div className="py-24 text-center">
                <Users size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                <p className="text-slate-500 font-bold">لا يوجد مندوبين حالياً.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الاسم</th>
                      <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">البريد</th>
                      <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الهاتف</th>
                      <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCouriers.map((c: any) => (
                      <tr key={String(c?.id)} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 text-white font-black">{c?.name || 'مندوب'}</td>
                        <td className="p-6 text-slate-400 text-sm font-bold">{c?.email || '-'}</td>
                        <td className="p-6 text-slate-500 text-sm font-bold">{c?.phone || '-'}</td>
                        <td className="p-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${String(c?.isActive ?? true) === 'true' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {String(c?.isActive ?? true) === 'true' ? 'مفعل' : 'غير مفعل'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {tab === 'pending' ? (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
            {loadingPending ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : pendingCouriers.length === 0 ? (
              <div className="py-24 text-center">
                <Truck size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                <p className="text-slate-500 font-bold">لا توجد طلبات مندوبين معلقة حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-6">
                {pendingCouriers.map((c: any) => (
                  <MotionDiv
                    key={String(c?.id)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-950/40 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
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
                        onClick={() => handleApprove(String(c.id))}
                        className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
                      >
                        <Check size={18} /> قبول المندوب
                      </button>
                      <button
                        onClick={() => handleReject(String(c.id))}
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
      ) : null}

      {tab === 'create' ? (
        <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl">
                <UserPlus size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">إضافة مندوب جديد</h3>
                <p className="text-slate-500 text-sm font-bold">إنشاء حساب مندوب مباشر بدون انتظار موافقة.</p>
              </div>
            </div>

            <form onSubmit={handleCreateCourier} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">الاسم</label>
                  <input
                    required
                    disabled={creating}
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 px-5 font-black text-right text-white focus:border-[#00E5FF]/30 transition-all outline-none"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="اسم المندوب"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">البريد الإلكتروني</label>
                  <input
                    required
                    type="email"
                    disabled={creating}
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 px-5 font-black text-right text-white focus:border-[#00E5FF]/30 transition-all outline-none"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="courier@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">الهاتف (اختياري)</label>
                  <input
                    disabled={creating}
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 px-5 font-black text-right text-white focus:border-[#00E5FF]/30 transition-all outline-none"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">كلمة المرور</label>
                  <input
                    required
                    type="password"
                    disabled={creating}
                    className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 px-5 font-black text-right text-white focus:border-[#00E5FF]/30 transition-all outline-none"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="********"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-4 rounded-2xl bg-[#00E5FF] text-black font-black flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {creating ? <Loader2 className="animate-spin" size={18} /> : null}
                {creating ? 'جاري الإنشاء...' : 'إنشاء المندوب'}
              </button>
            </form>

            <AnimatePresence>
              {creating ? null : null}
            </AnimatePresence>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminDelivery;
