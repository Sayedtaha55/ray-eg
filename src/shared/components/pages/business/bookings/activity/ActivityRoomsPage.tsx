/**
 * ═══════════════════════════════════════════
 * activity/ActivityRoomsPage.tsx
 * إدارة الغرف / العيادات الفرعية / الكراسي
 * يُستخدم في: عيادات، سبا، صالونات
 * ═══════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { DoorOpen, Plus, Search, Edit2, Trash2, Users, Loader2, CheckCircle2 } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { getVocabulary } from '../config';
import { ApiService } from '@/services/api.service';

type Room = {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance';
  floor?: string;
  notes?: string;
};

type Props = { activityType: BookingActivityType };

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  available:   { label: 'متاح',    color: 'text-emerald-700', bg: 'bg-emerald-50' },
  occupied:    { label: 'مشغول',   color: 'text-amber-700',   bg: 'bg-amber-50' },
  maintenance: { label: 'صيانة',   color: 'text-red-700',     bg: 'bg-red-50' },
};

const LABELS: Record<string, { title: string; singular: string; plural: string }> = {
  clinic:       { title: 'غرف وعيادات فرعية', singular: 'غرفة/عيادة', plural: 'الغرف' },
  wellness_spa: { title: 'غرف الجلسات',       singular: 'غرفة',       plural: 'الغرف' },
  salon_barber: { title: 'الكراسي والغرف',    singular: 'كرسي/غرفة',  plural: 'الكراسي' },
};

const ActivityRoomsPage: React.FC<Props> = ({ activityType }) => {
  const lbl = LABELS[activityType] || LABELS.clinic;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', capacity: '1', floor: '', notes: '' });

  const loadRooms = async () => {
    setLoading(true);
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) { setLoading(false); return; }
      const data = await ApiService.getBookingActivityData(shop.id, 'activityRoomsList');
      setRooms(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        name: form.name,
        capacity: Number(form.capacity) || 1,
        status: 'available',
        floor: form.floor,
        notes: form.notes,
      };
      const nextRooms = [newRoom, ...rooms];
      await ApiService.saveBookingActivityData(shop.id, 'activityRoomsList', nextRooms);
      setRooms(nextRooms);
      setForm({ name: '', capacity: '1', floor: '', notes: '' });
      setShowForm(false);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const nextRooms = rooms.filter(r => r.id !== id);
      await ApiService.saveBookingActivityData(shop.id, 'activityRoomsList', nextRooms);
      setRooms(nextRooms);
    } catch {}
  };

  const toggleStatus = async (id: string) => {
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const nextRooms = rooms.map(r => {
        if (r.id !== id) return r;
        const order: Room['status'][] = ['available', 'occupied', 'maintenance'];
        const next = order[(order.indexOf(r.status) + 1) % order.length];
        return { ...r, status: next };
      });
      await ApiService.saveBookingActivityData(shop.id, 'activityRoomsList', nextRooms);
      setRooms(nextRooms);
    } catch {}
  };

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase();
    return !q || r.name.toLowerCase().includes(q) || (r.floor || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <DoorOpen className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{lbl.title}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{rooms.length} {lbl.singular} مسجلة</p>
          </div>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} title={`إضافة ${lbl.singular}`}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> إضافة {lbl.singular}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">إضافة {lbl.singular} جديدة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">الاسم *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={`مثال: ${lbl.singular} 101`}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">السعة</label>
              <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                min="1" aria-label="السعة" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">الطابق / الموقع</label>
              <input type="text" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                placeholder="مثال: الطابق الأول"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">ملاحظات</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="ملاحظات إضافية..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} title="إلغاء" className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">إلغاء</button>
            <button type="button" onClick={handleAdd} disabled={!form.name.trim()} title="حفظ الغرفة"
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">حفظ</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder={`ابحث في ${lbl.plural}...`} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {(['available', 'occupied', 'maintenance'] as const).map(st => {
          const info = STATUS_MAP[st];
          const count = rooms.filter(r => r.status === st).length;
          return (
            <div key={st} className={`${info.bg} rounded-2xl p-4 text-center`}>
              <div className={`text-2xl font-black ${info.color}`}>{count}</div>
              <div className={`text-xs font-bold ${info.color} mt-1`}>{info.label}</div>
            </div>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
          <p className="font-bold text-slate-400">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <DoorOpen className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{search ? `لا نتائج لـ "${search}"` : `لم تضف ${lbl.plural} بعد`}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(room => {
            const st = STATUS_MAP[room.status];
            return (
              <div key={room.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                      <DoorOpen className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <div className="font-black text-slate-900">{room.name}</div>
                      {room.floor && <div className="text-xs text-slate-400 font-bold">{room.floor}</div>}
                    </div>
                  </div>
                  <button type="button" onClick={() => toggleStatus(room.id)} title="تغيير الحالة"
                    className={`text-xs font-black px-2.5 py-1 rounded-full ${st.bg} ${st.color} cursor-pointer hover:opacity-80`}>
                    {st.label}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Users size={11} /> سعة: {room.capacity}
                  </div>
                </div>
                {room.notes && <p className="text-xs text-slate-400 font-bold">{room.notes}</p>}
                <div className="flex gap-2 pt-1">
                  <button type="button" title="تعديل الغرفة" className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                    <Edit2 size={12} /> تعديل
                  </button>
                  <button type="button" onClick={() => handleDelete(room.id)} title="حذف الغرفة"
                    className="py-2 px-3 rounded-xl border border-red-100 text-xs font-black text-red-500 hover:bg-red-50 flex items-center justify-center gap-1.5">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityRoomsPage;
