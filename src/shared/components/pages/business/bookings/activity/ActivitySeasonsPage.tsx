/**
 * ═══════════════════════════════════════════
 * activity/ActivitySeasonsPage.tsx
 * إدارة المواسم والأسعار الموسمية
 * يُستخدم في: شاليهات ومنتجعات
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { CalendarDays, Plus, Search, Edit2, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import type { BookingActivityType } from '../config';

type Season = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  priceMultiplier: number;
  minNights: number;
  isActive: boolean;
  notes?: string;
};

type Props = { activityType: BookingActivityType };

const ActivitySeasonsPage: React.FC<Props> = ({ activityType }) => {
  const [seasons, setSeasons] = useState<Season[]>([
    { id: '1', name: 'موسم الصيف', startDate: '2025-06-01', endDate: '2025-08-31', priceMultiplier: 1.5, minNights: 2, isActive: true, notes: 'أسعار مرتفعة - إقبال كبير' },
    { id: '2', name: 'موسم الشتاء', startDate: '2025-12-01', endDate: '2026-02-28', priceMultiplier: 1.2, minNights: 1, isActive: true },
    { id: '3', name: 'العيد', startDate: '2025-06-15', endDate: '2025-06-20', priceMultiplier: 2.0, minNights: 3, isActive: true, notes: 'حد أدنى 3 ليالي' },
    { id: '4', name: 'خارج الموسم', startDate: '2025-09-01', endDate: '2025-11-30', priceMultiplier: 0.8, minNights: 1, isActive: false },
  ]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', priceMultiplier: '1', minNights: '1', notes: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.startDate || !form.endDate) return;
    setSeasons(prev => [{
      id: Date.now().toString(), name: form.name, startDate: form.startDate, endDate: form.endDate,
      priceMultiplier: Number(form.priceMultiplier) || 1, minNights: Number(form.minNights) || 1,
      isActive: true, notes: form.notes || undefined,
    }, ...prev]);
    setForm({ name: '', startDate: '', endDate: '', priceMultiplier: '1', minNights: '1', notes: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setSeasons(prev => prev.filter(s => s.id !== id));
  const toggleActive = (id: string) => setSeasons(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));

  const filtered = seasons.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">المواسم والأسعار</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{seasons.length} موسم • {seasons.filter(s => s.isActive).length} نشط</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> إضافة موسم
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">إضافة موسم جديد</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">اسم الموسم *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="مثال: موسم الصيف" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">تاريخ البداية *</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">تاريخ النهاية *</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">مضاعف السعر</label>
              <input type="number" step="0.1" value={form.priceMultiplier} onChange={e => setForm(f => ({ ...f, priceMultiplier: e.target.value }))}
                placeholder="1.5" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">حد أدنى ليالي</label>
              <input type="number" value={form.minNights} onChange={e => setForm(f => ({ ...f, minNights: e.target.value }))}
                min="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">ملاحظات</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="ملاحظات..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">إلغاء</button>
            <button onClick={handleAdd} disabled={!form.name.trim() || !form.startDate || !form.endDate}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">حفظ</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder="ابحث في المواسم..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <CalendarDays className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">لم تضف مواسم بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(season => (
            <div key={season.id} className={`bg-white rounded-[2rem] border shadow-sm p-5 hover:shadow-md transition-all ${season.isActive ? 'border-slate-100' : 'border-red-100 opacity-60'}`}>
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900">{season.name}</div>
                    <div className="text-xs text-slate-400 font-bold mt-0.5">{season.startDate} → {season.endDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(season.id)}
                    className={`text-xs font-black px-2.5 py-1 rounded-full cursor-pointer ${season.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {season.isActive ? 'نشط' : 'معطل'}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <div className="flex items-center gap-1 text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  <TrendingUp size={11} /> مضاعف: ×{season.priceMultiplier}
                </div>
                <div className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                  حد أدنى: {season.minNights} {season.minNights === 1 ? 'ليلة' : 'ليالي'}
                </div>
                {season.notes && <span className="text-xs text-amber-600 font-bold">{season.notes}</span>}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
                  <Edit2 size={12} /> تعديل
                </button>
                <button onClick={() => handleDelete(season.id)}
                  className="py-1.5 px-3 rounded-xl border border-red-100 text-xs font-black text-red-500 hover:bg-red-50 flex items-center gap-1.5">
                  <Trash2 size={12} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitySeasonsPage;
