/**
 * ═══════════════════════════════════════════
 * activity/ActivityCapacityPage.tsx
 * إدارة قواعد السعة القصوى
 * يُستخدم في: مطاعم، ملاعب
 * ═══════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { ApiService } from '@/services/api.service';

type CapacityRule = {
  id: string;
  name: string;
  maxCapacity: number;
  period: string;
  notes?: string;
};

type Props = { activityType: BookingActivityType };

const ActivityCapacityPage: React.FC<Props> = ({ activityType }) => {
  const [rules, setRules] = useState<CapacityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', maxCapacity: '', period: '', notes: '' });

  const loadRules = async () => {
    setLoading(true);
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) { setLoading(false); return; }
      const data = await ApiService.getBookingActivityData(shop.id, 'activityCapacityRules');
      setRules(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.maxCapacity) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const newRule: CapacityRule = {
        id: `cap-${Date.now()}`,
        name: form.name,
        maxCapacity: Number(form.maxCapacity),
        period: form.period || 'يومياً',
        notes: form.notes || undefined,
      };
      const nextRules = [newRule, ...rules];
      await ApiService.saveBookingActivityData(shop.id, 'activityCapacityRules', nextRules);
      setRules(nextRules);
      setForm({ name: '', maxCapacity: '', period: '', notes: '' });
      setShowForm(false);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const nextRules = rules.filter(r => r.id !== id);
      await ApiService.saveBookingActivityData(shop.id, 'activityCapacityRules', nextRules);
      setRules(nextRules);
    } catch {}
  };

  const filtered = rules.filter(r => {
    const q = search.toLowerCase();
    return !q || r.name.toLowerCase().includes(q) || r.period.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">قواعد السعة القصوى</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{rules.length} قاعدة نشطة</p>
          </div>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} title="إضافة قاعدة سعة جديدة"
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> إضافة قاعدة
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">إضافة قاعدة سعة جديدة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">اسم القاعدة *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="مثال: سعة الصالة الرئيسية"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">الحد الأقصى *</label>
              <input type="number" value={form.maxCapacity} onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))}
                placeholder="50" min="1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">الفترة</label>
              <input type="text" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                placeholder="يومياً / أسبوعياً"
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
            <button type="button" onClick={handleAdd} disabled={!form.name.trim() || !form.maxCapacity} title="حفظ قاعدة السعة"
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">حفظ</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder="ابحث في القواعد..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
          <p className="font-bold text-slate-400">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <Users className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{search ? `لا نتائج لـ "${search}"` : 'لم تضف قواعد بعد'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(rule => (
            <div key={rule.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-black text-slate-900">{rule.name}</div>
                  <div className="text-xs text-slate-400 font-bold mt-0.5">{rule.period}</div>
                </div>
                <div className="flex items-center gap-1 text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <Users size={12} /> {rule.maxCapacity} شخص
                </div>
              </div>
              {rule.notes && <p className="text-xs text-slate-400 font-bold">{rule.notes}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" title="تعديل القاعدة" className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                  <Edit2 size={12} /> تعديل
                </button>
                <button type="button" onClick={() => handleDelete(rule.id)} title="حذف القاعدة"
                  className="py-2 px-3 rounded-xl border border-red-100 text-xs font-black text-red-500 hover:bg-red-50 flex items-center justify-center gap-1.5">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityCapacityPage;