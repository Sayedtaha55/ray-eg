import React, { useState, useEffect } from 'react';
import { CreditCard, Search, MoreVertical, DollarSign, Loader2, Filter, ShoppingBag, UserPlus } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM as any;

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [couriers, setCouriers] = useState<any[]>([]);

  const parseCodLocation = (notes: any): { lat: number; lng: number; note?: string; address?: string } | null => {
    try {
      const raw = typeof notes === 'string' ? notes : '';
      const prefix = 'COD_LOCATION:';
      const start = raw.indexOf(prefix);
      if (start < 0) return null;

      const after = raw.slice(start + prefix.length);
      const nl = after.search(/\r?\n/);
      const json = (nl === -1 ? after : after.slice(0, nl)).trim();
      if (!json) return null;

      const parsed = JSON.parse(json);
      const lat = Number(parsed?.coords?.lat);
      const lng = Number(parsed?.coords?.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
      return {
        lat,
        lng,
        note: typeof parsed?.note === 'string' ? parsed.note : undefined,
        address: typeof parsed?.address === 'string' ? parsed.address : undefined,
      };
    } catch {
      return null;
    }
  };

  const getDeliveryFeeFromNotes = (notes: any): number | null => {
    const raw = typeof notes === 'string' ? notes : '';
    if (!raw) return null;
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const feeLine = lines.find((l) => l.toUpperCase().startsWith('DELIVERY_FEE:'));
    if (!feeLine) return null;
    const value = feeLine.split(':').slice(1).join(':').trim();
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  };

  const setDeliveryFeeInNotes = (notes: any, fee: number) => {
    const raw = typeof notes === 'string' ? notes : '';
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !l.toUpperCase().startsWith('DELIVERY_FEE:'));
    lines.push(`DELIVERY_FEE:${fee}`);
    return lines.join('\n');
  };

  const formatStatus = (status: any) => {
    const s = String(status || '').toUpperCase();
    if (s === 'DELIVERED') return { label: 'تم التوصيل', cls: 'bg-green-500/10 text-green-500' };
    if (s === 'READY') return { label: 'جاهز', cls: 'bg-blue-500/10 text-blue-500' };
    if (s === 'PREPARING') return { label: 'قيد التجهيز', cls: 'bg-amber-500/10 text-amber-500' };
    if (s === 'CONFIRMED') return { label: 'مؤكد', cls: 'bg-amber-500/10 text-amber-500' };
    if (s === 'CANCELLED') return { label: 'ملغي', cls: 'bg-red-500/10 text-red-500' };
    return { label: 'قيد المراجعة', cls: 'bg-amber-500/10 text-amber-500' };
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await ApiService.getAllOrders();
        setOrders(data);
      } catch (e) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const loadCouriers = async () => {
    try {
      const data = await ApiService.getCouriers();
      setCouriers(Array.isArray(data) ? data : []);
    } catch {
      setCouriers([]);
    }
  };

  useEffect(() => {
    loadCouriers();
  }, []);

  const editDeliveryFee = async (order: any) => {
    const current = getDeliveryFeeFromNotes(order?.notes);
    const raw = window.prompt('رسوم التوصيل (ج.م)', current != null ? String(current) : '');
    if (raw == null) return;
    const fee = Number(String(raw).trim());
    if (Number.isNaN(fee) || fee < 0) return;

    const nextNotes = setDeliveryFeeInNotes(order?.notes, fee);
    const updated = await ApiService.updateOrder(String(order.id), { notes: nextNotes });
    setOrders((prev) => prev.map((o) => (String(o.id) === String(updated?.id) ? { ...o, ...updated } : o)));
  };

  const assignCourier = async (order: any) => {
    if (!couriers.length) {
      window.alert('لا يوجد مندوبين حالياً. أضف مندوب أولاً ثم حاول مرة أخرى.');
      return;
    }
    const token = (() => {
      try {
        return localStorage.getItem('ray_token') || '';
      } catch {
        return '';
      }
    })();
    if (!token) {
      window.alert('غير مسجل دخول كـ Admin أو التوكن غير موجود. سجّل دخول من بوابة الآدمن ثم أعد المحاولة.');
      return;
    }

    const current = order?.courier?.id ? String(order.courier.id) : '';
    const options = couriers
      .map((c) => `${c.id}::${c.name || c.email || c.phone || c.id}`)
      .join('\n');
    const raw = window.prompt(`اختر المندوب (اكتب الـID)\n${options}`, current);
    if (!raw) return;
    const courierId = String(raw).split('::')[0].trim();
    if (!courierId) return;

    try {
      const updated = await ApiService.assignCourierToOrder(String(order.id), courierId);
      setOrders((prev) => prev.map((o) => (String(o.id) === String(updated?.id) ? { ...o, ...updated } : o)));
    } catch (e: any) {
      window.alert(e?.message || 'فشل تعيين المندوب');
    }
  };

  const goToCourierCreate = () => {
    navigate('/admin/delivery?tab=create');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">إدارة العمليات</h2>
            <p className="text-slate-500 text-sm font-bold">مراقبة كافة المبيعات والتدفق المالي.</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto md:items-center">
          <button
            onClick={goToCourierCreate}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-black hover:bg-[#00E5FF]/20 transition"
          >
            <UserPlus size={16} />
            إضافة مندوب
          </button>
          <div className="relative w-full md:w-80">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input className="w-full bg-slate-900 border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white outline-none focus:border-[#00E5FF]/50 transition-all text-sm" placeholder="ابحث برقم الفاتورة..." />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">رقم العملية</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">التاريخ</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">المبلغ</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">رسوم التوصيل</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الدفع</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الموقع</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">المندوب</th>
                    <th className="p-6 text-slate-400 font-black text-xs uppercase tracking-widest">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-6 font-black text-white">#{order.id.slice(0, 8)}</td>
                      <td className="p-6 text-slate-500 text-sm">{new Date(order.created_at).toLocaleString('ar-EG')}</td>
                      <td className="p-6">
                        <span className="text-[#00E5FF] font-black">ج.م {order.total.toLocaleString()}</span>
                      </td>
                      <td className="p-6">
                        {(() => {
                          const fee = getDeliveryFeeFromNotes(order.notes);
                          return (
                            <button
                              onClick={() => editDeliveryFee(order)}
                              className="text-slate-200 font-black text-xs hover:text-[#00E5FF] transition-colors"
                            >
                              {fee == null ? 'تحديد' : `ج.م ${fee}`} 
                            </button>
                          );
                        })()}
                      </td>
                      <td className="p-6">
                        <span className="text-slate-200 font-black text-xs">{String(order.paymentMethod || order.payment_method || 'غير محدد')}</span>
                      </td>
                      <td className="p-6">
                        {(() => {
                          const loc = parseCodLocation(order.notes);
                          if (!loc) return <span className="text-slate-500 text-xs font-bold">-</span>;
                          const href = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#00E5FF] font-black text-xs hover:underline"
                            >
                              فتح الخريطة
                            </a>
                          );
                        })()}
                      </td>
                      <td className="p-6">
                        <button
                          onClick={() => assignCourier(order)}
                          className="inline-flex items-center gap-2 text-slate-200 font-black text-xs hover:text-[#00E5FF] transition-colors"
                        >
                          <UserPlus size={14} />
                          {order?.courier?.name || order?.courier?.email || order?.courier?.phone || 'تعيين'}
                        </button>
                      </td>
                      <td className="p-6">
                        {(() => {
                          const meta = formatStatus(order.status);
                          return (
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${meta.cls}`}>
                              {meta.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-3">
              {orders.map((order) => {
                const fee = getDeliveryFeeFromNotes(order.notes);
                const loc = parseCodLocation(order.notes);
                const meta = formatStatus(order.status);
                return (
                  <div key={order.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-black text-sm">#{order.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{new Date(order.created_at).toLocaleString('ar-EG')}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">المبلغ:</span>
                        <span className="text-[#00E5FF] font-black">ج.م {order.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">رسوم:</span>
                        <button
                          onClick={() => editDeliveryFee(order)}
                          className="text-slate-200 font-black hover:text-[#00E5FF] transition-colors"
                        >
                          {fee == null ? 'تحديد' : `ج.م ${fee}`}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">الدفع:</span>
                        <span className="text-slate-200 font-black">{String(order.paymentMethod || order.payment_method || 'غير محدد')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">المندوب:</span>
                        <button
                          onClick={() => assignCourier(order)}
                          className="inline-flex items-center gap-1 text-slate-200 font-black hover:text-[#00E5FF] transition-colors"
                        >
                          <UserPlus size={10} />
                          {order?.courier?.name || order?.courier?.email || order?.courier?.phone || 'تعيين'}
                        </button>
                      </div>
                    </div>
                    {loc && (
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-400 text-xs">الموقع:</span>
                        <a
                          href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#00E5FF] font-black hover:underline text-xs"
                        >
                          فتح الخريطة
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
