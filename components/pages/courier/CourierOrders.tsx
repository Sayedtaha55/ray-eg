import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { MapPin, Loader2, CheckCircle, Banknote, RefreshCw } from 'lucide-react';
import { ApiService } from '@/services/api.service';

const { useNavigate } = ReactRouterDOM as any;

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  product?: { name?: string };
};

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

const CourierOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('ray_user');
    const user = userStr ? JSON.parse(userStr) : {};
    if (String(user?.role || '').toLowerCase() !== 'courier') {
      navigate('/login');
    }
  }, [navigate]);

  const loadOrders = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    try {
      const data = await ApiService.getCourierOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrder = async (id: string, payload: { status?: string; codCollected?: boolean }) => {
    const updated = await ApiService.updateCourierOrder(id, payload);
    setOrders((prev) => prev.map((o) => (String(o.id) === String(updated?.id) ? { ...o, ...updated } : o)));
  };

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const delivered = orders.filter((o) => String(o.status || '').toUpperCase() === 'DELIVERED').length;
    return { totalOrders, delivered };
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">لوحة المندوب</h1>
            <p className="text-slate-400 text-sm font-bold">طلباتك المعيّنة وتحديث حالتها وتحصيل الكاش.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900 border border-white/5 rounded-2xl px-5 py-3">
              <p className="text-xs text-slate-500 font-black uppercase">إجمالي الطلبات</p>
              <p className="text-2xl font-black text-[#00E5FF]">{summary.totalOrders}</p>
            </div>
            <div className="bg-slate-900 border border-white/5 rounded-2xl px-5 py-3">
              <p className="text-xs text-slate-500 font-black uppercase">تم التوصيل</p>
              <p className="text-2xl font-black text-emerald-400">{summary.delivered}</p>
            </div>
            <button
              onClick={() => loadOrders(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-black"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              تحديث
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-12 text-center text-slate-400 font-bold">
            لا توجد طلبات مخصصة لك حالياً.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const fee = getDeliveryFeeFromNotes(order.notes) || 0;
              const grandTotal = Number(order.total || 0) + fee;
              const delivered = String(order.status || '').toUpperCase() === 'DELIVERED';
              const codCollected = !!order.codCollectedAt;
              const location = parseCodLocation(order.notes);

              return (
                <div key={order.id} className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-black uppercase">طلب #{order.id.slice(0, 8)}</p>
                      <h3 className="text-xl font-black">{order?.shop?.name || 'متجر غير معروف'}</h3>
                      <p className="text-sm text-slate-400 font-bold">
                        العميل: {order?.user?.name || 'غير معروف'} {order?.user?.phone ? `• ${order.user.phone}` : ''}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(order.created_at || order.createdAt).toLocaleString('ar-EG')}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {location && (
                        <a
                          href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] font-black text-xs"
                        >
                          <MapPin size={14} /> فتح الخريطة
                        </a>
                      )}
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 text-slate-200 font-black text-xs">
                        الإجمالي: ج.م {grandTotal.toLocaleString()}
                      </span>
                      {fee > 0 && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 text-amber-300 font-black text-xs">
                          رسوم التوصيل: ج.م {fee}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4">
                      <p className="text-xs text-slate-500 font-black mb-3">الأصناف</p>
                      <ul className="space-y-2 text-sm text-slate-300">
                        {(order.items || []).map((item: OrderItem) => (
                          <li key={item.id} className="flex items-center justify-between">
                            <span>{item.product?.name || 'منتج'}</span>
                            <span className="text-slate-400">× {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 font-black">الحالة الحالية</p>
                        <p className="text-sm font-black text-white">{String(order.status || 'PENDING')}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          disabled={delivered}
                          onClick={() => updateOrder(String(order.id), { status: 'DELIVERED' })}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black ${delivered ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'}`}
                        >
                          <CheckCircle size={14} /> تم التوصيل
                        </button>
                        <button
                          disabled={codCollected}
                          onClick={() => updateOrder(String(order.id), { codCollected: true })}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black ${codCollected ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'}`}
                        >
                          <Banknote size={14} /> {codCollected ? 'تم تحصيل الكاش' : 'تحصيل الكاش'}
                        </button>
                      </div>
                      {(location?.address || location?.note) && (
                        <div className="text-xs text-slate-400">
                          {location?.address && <p>العنوان: {location.address}</p>}
                          {location?.note && <p>ملاحظات: {location.note}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierOrders;
