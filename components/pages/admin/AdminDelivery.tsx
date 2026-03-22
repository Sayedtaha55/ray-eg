import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { Loader2, Truck, Users, UserPlus, Search, Check, X, Eye, Phone, Mail, MapPin, ShieldCheck, ShieldOff, Clock3, PackageCheck } from 'lucide-react';
import { useSmartRefreshListener } from '@/hooks/useSmartRefresh';
import Modal from '@/components/common/ui/Modal';

const MotionDiv = motion.div as any;
type TabKey = 'couriers' | 'pending' | 'create';
const { useLocation } = ReactRouterDOM as any;

const fmtDate = (value: any) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ar-EG');
};

const AdminDelivery: React.FC = () => {
  const { addToast } = useToast();
  const location = useLocation();

  const [tab, setTab] = useState<TabKey>('couriers');
  const [couriers, setCouriers] = useState<any[]>([]);
  const [pendingCouriers, setPendingCouriers] = useState<any[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [search, setSearch] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [actionId, setActionId] = useState('');

  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [creating, setCreating] = useState(false);

  const loadCouriers = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoadingCouriers(true);
    try {
      const data = await ApiService.getCouriers();
      setCouriers(Array.isArray(data) ? data : []);
    } catch {
      setCouriers([]);
    } finally {
      if (!silent) setLoadingCouriers(false);
    }
  };

  const loadPendingCouriers = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoadingPending(true);
    try {
      const data = await ApiService.getPendingCouriers();
      setPendingCouriers(Array.isArray(data) ? data : []);
    } catch {
      setPendingCouriers([]);
    } finally {
      if (!silent) setLoadingPending(false);
    }
  };

  useEffect(() => {
    loadCouriers();
    loadPendingCouriers();
  }, []);

  useSmartRefreshListener(['all'], () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    loadCouriers({ silent: true });
    loadPendingCouriers({ silent: true });
  });

  useEffect(() => {
    try {
      const q = new URLSearchParams(String(location?.search || ''));
      const t = String(q.get('tab') || '').trim().toLowerCase();
      if (t === 'couriers' || t === 'pending' || t === 'create') setTab(t as TabKey);
    } catch {}
  }, [location?.search]);

  const filteredCouriers = useMemo(() => {
    const q = String(search || '').trim().toLowerCase();
    if (!q) return couriers;
    return couriers.filter((c: any) => {
      const blob = [c?.name, c?.email, c?.phone].map((x) => String(x || '').toLowerCase()).join(' ');
      return blob.includes(q);
    });
  }, [couriers, search]);

  const openCourierDetails = async (courier: any) => {
    setSelectedCourier(courier);
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const data = await (ApiService as any).getCourierAdminDetails(String(courier?.id || ''));
      setDetails(data || null);
    } catch (e: any) {
      addToast(String(e?.message || 'فشل تحميل تفاصيل المندوب'), 'error');
      setDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionId(id);
      await ApiService.approveCourier(id);
      addToast('تم قبول المندوب وتفعيله', 'success');
      await Promise.all([loadCouriers({ silent: true }), loadPendingCouriers({ silent: true })]);
      if (selectedCourier?.id === id) {
        setDetails((prev: any) => prev ? ({ ...prev, courier: { ...prev.courier, isActive: true } }) : prev);
      }
    } catch {
      addToast('حدث خطأ في العملية', 'error');
    } finally {
      setActionId('');
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionId(id);
      await ApiService.rejectCourier(id);
      addToast('تم رفض طلب المندوب', 'success');
      await loadPendingCouriers({ silent: true });
      if (selectedCourier?.id === id) {
        setDetailsOpen(false);
        setDetails(null);
        setSelectedCourier(null);
      }
    } catch {
      addToast('حدث خطأ في العملية', 'error');
    } finally {
      setActionId('');
    }
  };

  const handleSetCourierStatus = async (id: string, isActive: boolean) => {
    try {
      setActionId(id);
      await (ApiService as any).setCourierActiveStatus(id, { isActive });
      addToast(isActive ? 'تم تفعيل المندوب' : 'تم إيقاف المندوب مؤقتاً', 'success');
      await loadCouriers({ silent: true });
      if (selectedCourier?.id === id) {
        const data = await (ApiService as any).getCourierAdminDetails(id);
        setDetails(data || null);
      }
    } catch (e: any) {
      addToast(String(e?.message || 'فشلت العملية'), 'error');
    } finally {
      setActionId('');
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
      await loadCouriers({ silent: true });
    } catch (e: any) {
      addToast(String(e?.message || 'فشل إنشاء المندوب'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const selectedCourierData = details?.courier || selectedCourier;
  const state = details?.state || null;
  const stats = details?.stats || {};
  const recentOrders = Array.isArray(details?.recentOrders) ? details.recentOrders : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl"><Truck size={24} /></div>
          <div>
            <h2 className="text-3xl font-black text-white">إدارة التوصيل</h2>
            <p className="text-slate-500 text-sm font-bold">مراجعة كاملة للمندوبين، حالاتهم، ونشاطهم الأخير.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ['couriers', 'المندوبين', Users],
            ['pending', 'طلبات المندوبين', Check],
            ['create', 'إضافة مندوب', UserPlus],
          ].map(([id, label, Icon]: any) => (
            <button key={id} onClick={() => setTab(id)} className={`px-5 py-3 rounded-2xl text-xs font-black transition ${tab === id ? 'bg-[#00E5FF] text-black' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}>
              <Icon size={14} className="inline ml-2" /> {label}
              {id === 'pending' && pendingCouriers.length ? <span className="mr-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{pendingCouriers.length}</span> : null}
            </button>
          ))}
        </div>
      </div>

      {tab === 'couriers' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative w-full md:col-span-2">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm" placeholder="ابحث بالاسم أو البريد أو الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-slate-900 border border-white/5 p-4 text-center"><div className="text-slate-500 text-xs font-black">إجمالي</div><div className="mt-2 text-white font-black text-xl">{couriers.length}</div></div>
              <div className="rounded-2xl bg-slate-900 border border-white/5 p-4 text-center"><div className="text-slate-500 text-xs font-black">نشط</div><div className="mt-2 text-emerald-400 font-black text-xl">{couriers.filter((c: any) => c?.isActive).length}</div></div>
              <div className="rounded-2xl bg-slate-900 border border-white/5 p-4 text-center"><div className="text-slate-500 text-xs font-black">موقوف</div><div className="mt-2 text-amber-400 font-black text-xl">{couriers.filter((c: any) => !c?.isActive).length}</div></div>
            </div>
          </div>

          <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
            {loadingCouriers ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : filteredCouriers.length === 0 ? (
              <div className="py-24 text-center"><Users size={48} className="mx-auto text-slate-700 mb-4 opacity-20" /><p className="text-slate-500 font-bold">لا يوجد مندوبين حالياً.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[980px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">المندوب</th>
                      <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">التواصل</th>
                      <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الإنشاء</th>
                      <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الحالة</th>
                      <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCouriers.map((c: any) => (
                      <tr key={String(c?.id)} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00E5FF] font-black">{String(c?.name || 'C').charAt(0)}</div>
                            <div className="min-w-0">
                              <div className="text-white font-black">{c?.name || 'مندوب'}</div>
                              <div className="text-slate-500 text-xs font-bold truncate">#{String(c?.id || '').slice(0, 8).toUpperCase()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-slate-300 text-sm font-bold">
                          <div>{c?.email || '-'}</div>
                          <div className="text-slate-500 mt-1">{c?.phone || '-'}</div>
                        </td>
                        <td className="p-6 text-slate-400 text-sm font-bold">{fmtDate(c?.createdAt)}</td>
                        <td className="p-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${c?.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{c?.isActive ? 'مفعل' : 'موقوف'}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => openCourierDetails(c)} className="p-3 rounded-xl bg-white/5 text-slate-300 hover:text-white" title="عرض التفاصيل"><Eye className="w-4 h-4" /></button>
                            <button disabled={actionId === String(c?.id)} onClick={() => handleSetCourierStatus(String(c?.id), !Boolean(c?.isActive))} className={`px-4 py-2 rounded-xl font-black text-xs ${c?.isActive ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                              {c?.isActive ? 'إيقاف' : 'تفعيل'}
                            </button>
                          </div>
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
              <div className="py-24 text-center"><Truck size={48} className="mx-auto text-slate-700 mb-4 opacity-20" /><p className="text-slate-500 font-bold">لا توجد طلبات مندوبين معلقة حالياً.</p></div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-6">
                {pendingCouriers.map((c: any) => (
                  <MotionDiv key={String(c?.id)} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-950/40 border border-white/5 p-6 rounded-[2.5rem] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-row-reverse">
                      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[#00E5FF] text-2xl">{String(c?.name || 'C').charAt(0)}</div>
                      <div className="text-right">
                        <h4 className="text-xl font-black text-white">{c?.name || 'مندوب'}</h4>
                        <div className="text-slate-400 text-xs font-bold mt-1">{c?.email}</div>
                        {c?.phone ? <div className="text-slate-500 text-xs font-bold mt-1">{c.phone}</div> : null}
                        <div className="text-slate-600 text-[11px] font-bold mt-2">تاريخ الطلب: {fmtDate(c?.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => openCourierDetails(c)} className="px-5 py-4 bg-white/5 text-slate-200 rounded-2xl font-black text-sm flex items-center gap-2"><Eye size={18} /> عرض التفاصيل</button>
                      <button disabled={actionId === String(c?.id)} onClick={() => handleApprove(String(c.id))} className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"><Check size={18} /> قبول المندوب</button>
                      <button disabled={actionId === String(c?.id)} onClick={() => handleReject(String(c.id))} className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"><X size={18} /> رفض الطلب</button>
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
              <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl"><UserPlus size={22} /></div>
              <div>
                <h3 className="text-2xl font-black text-white">إضافة مندوب جديد</h3>
                <p className="text-slate-500 text-sm font-bold">إنشاء حساب مندوب مباشر مع بيانات كاملة من الأدمن.</p>
              </div>
            </div>
            <form onSubmit={handleCreateCourier} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  ['الاسم', createName, setCreateName, 'text', 'اسم المندوب'],
                  ['البريد الإلكتروني', createEmail, setCreateEmail, 'email', 'email@example.com'],
                  ['الهاتف', createPhone, setCreatePhone, 'text', '01xxxxxxxxx'],
                  ['كلمة المرور', createPassword, setCreatePassword, 'password', '8 أحرف على الأقل'],
                ].map(([label, value, setter, type, placeholder]: any, index) => (
                  <div className="space-y-2" key={index}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">{label}</label>
                    <input required={label !== 'الهاتف'} type={type} disabled={creating} className="w-full bg-slate-950/40 border border-white/5 rounded-2xl py-4 px-5 font-black text-right text-white focus:border-[#00E5FF]/30 transition-all outline-none" value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} />
                  </div>
                ))}
              </div>
              <button disabled={creating} className="px-8 py-4 bg-[#00E5FF] text-black rounded-2xl font-black text-sm disabled:opacity-60">{creating ? 'جاري الإنشاء...' : 'إنشاء المندوب'}</button>
            </form>
          </div>
        </div>
      ) : null}

      <Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} title="تفاصيل المندوب" size="xl">
        {detailsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
        ) : selectedCourierData ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-right">
                    <h3 className="text-2xl font-black text-white">{selectedCourierData?.name || 'مندوب'}</h3>
                    <div className="mt-2 space-y-2 text-sm font-bold text-slate-300">
                      <div className="flex items-center gap-2 justify-end"><Mail size={14} className="text-slate-500" /> {selectedCourierData?.email || '-'}</div>
                      <div className="flex items-center gap-2 justify-end"><Phone size={14} className="text-slate-500" /> {selectedCourierData?.phone || '-'}</div>
                      <div className="flex items-center gap-2 justify-end"><Clock3 size={14} className="text-slate-500" /> آخر دخول: {fmtDate(selectedCourierData?.lastLogin)}</div>
                      <div className="flex items-center gap-2 justify-end"><Users size={14} className="text-slate-500" /> تاريخ الإنشاء: {fmtDate(selectedCourierData?.createdAt)}</div>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-3xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center font-black text-2xl">{String(selectedCourierData?.name || 'C').charAt(0)}</div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 justify-end">
                  <span className={`px-4 py-2 rounded-full text-xs font-black ${selectedCourierData?.isActive ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>{selectedCourierData?.isActive ? 'الحساب مفعل' : 'الحساب موقوف/بانتظار التفعيل'}</span>
                  {state ? <span className={`px-4 py-2 rounded-full text-xs font-black ${state?.isAvailable ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20' : 'bg-slate-500/10 text-slate-300 border border-white/10'}`}>{state?.isAvailable ? 'متاح حالياً' : 'غير متاح حالياً'}</span> : null}
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-right">
                <div className="text-slate-400 text-xs font-black">إجراءات سريعة</div>
                <div className="mt-4 space-y-3">
                  {!selectedCourierData?.isActive ? (
                    <button disabled={actionId === String(selectedCourierData?.id)} onClick={() => handleSetCourierStatus(String(selectedCourierData?.id), true)} className="w-full px-4 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2"><ShieldCheck size={16} /> تفعيل المندوب</button>
                  ) : (
                    <button disabled={actionId === String(selectedCourierData?.id)} onClick={() => handleSetCourierStatus(String(selectedCourierData?.id), false)} className="w-full px-4 py-3 rounded-2xl bg-amber-500/15 text-amber-300 font-black text-sm flex items-center justify-center gap-2"><ShieldOff size={16} /> إيقاف مؤقت</button>
                  )}
                  {!selectedCourierData?.isActive && pendingCouriers.some((x: any) => String(x?.id) === String(selectedCourierData?.id)) ? (
                    <button disabled={actionId === String(selectedCourierData?.id)} onClick={() => handleApprove(String(selectedCourierData?.id))} className="w-full px-4 py-3 rounded-2xl bg-green-500 text-white font-black text-sm flex items-center justify-center gap-2"><Check size={16} /> قبول الطلب</button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                ['إجمالي الطلبات', stats.totalOrders || 0],
                ['النشطة', stats.activeOrders || 0],
                ['المسلمة', stats.deliveredOrders || 0],
                ['الملغاة', stats.cancelledOrders || 0],
                ['قيمة المسلم', `ج.م ${Number(stats.deliveredRevenue || 0).toLocaleString()}`],
              ].map(([label, value]: any) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <div className="text-slate-500 text-[11px] font-black">{label}</div>
                  <div className="mt-2 text-white text-xl font-black">{value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-right">
                <div className="flex items-center gap-2 justify-end text-white font-black"><MapPin size={16} /> حالة الموقع</div>
                <div className="mt-4 space-y-3 text-sm font-bold text-slate-300">
                  <div className="flex justify-between gap-3"><span className="text-slate-500">آخر ظهور</span><span>{fmtDate(state?.lastSeenAt)}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">خط العرض</span><span>{state?.lastLat ?? '-'}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">خط الطول</span><span>{state?.lastLng ?? '-'}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-slate-500">الدقة</span><span>{state?.accuracy != null ? `${state.accuracy}m` : '-'}</span></div>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-right">
                <div className="flex items-center gap-2 justify-end text-white font-black"><PackageCheck size={16} /> آخر الطلبات</div>
                <div className="mt-4 space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {recentOrders.length === 0 ? <div className="text-slate-500 font-bold text-sm">لا توجد طلبات مرتبطة بهذا المندوب حتى الآن.</div> : recentOrders.map((order: any) => (
                    <div key={String(order?.id)} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-right min-w-0">
                          <div className="text-white font-black">طلب #{String(order?.id || '').slice(0, 8).toUpperCase()}</div>
                          <div className="text-slate-400 text-xs font-bold mt-1">{order?.shop?.name || 'متجر'}{order?.customer?.name ? ` • ${order.customer.name}` : ''}</div>
                          <div className="text-slate-500 text-[11px] font-bold mt-1">{fmtDate(order?.createdAt)}</div>
                        </div>
                        <div className="text-left shrink-0">
                          <div className="text-[#00E5FF] font-black">ج.م {Number(order?.total || 0).toLocaleString()}</div>
                          <div className="text-[11px] text-slate-400 font-bold mt-1">{String(order?.status || '-').toUpperCase()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 font-bold text-center py-16">لا توجد بيانات لعرضها.</div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDelivery;
