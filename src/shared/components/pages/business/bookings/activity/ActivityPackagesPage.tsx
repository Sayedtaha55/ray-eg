/**
 * ═══════════════════════════════════════════
 * activity/ActivityPackagesPage.tsx
 * إدارة الباقات والعروض
 * يُستخدم في: صالونات، سبا
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Sparkles, Plus, Search, Edit2, Trash2, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import type { BookingActivityType } from '../config';

type Package = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  services: string[];
  durationMinutes: number;
  isActive: boolean;
};

type Props = { activityType: BookingActivityType };

const LABELS: Record<string, string> = {
  salon_barber: 'باقات العناية',
  wellness_spa: 'الباقات',
};

const ActivityPackagesPage: React.FC<Props> = ({ activityType }) => {
  const title = LABELS[activityType] || 'الباقات';
  const [packages, setPackages] = useState<Package[]>([
    { id: '1', name: 'باقة العناية الكاملة', price: 450, originalPrice: 600, services: ['قص شعر', 'صبغة', 'تسريحة'], durationMinutes: 120, isActive: true },
    { id: '2', name: 'باقة العريس', price: 350, services: ['حلاقة', 'عناية بالبشرة', 'تنظيف'], durationMinutes: 90, isActive: true },
    { id: '3', name: 'باقة الاسترخاء', price: 500, originalPrice: 700, services: ['مساج', 'ساونا', 'جاكوزي'], durationMinutes: 150, isActive: false },
  ]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', originalPrice: '', services: '', duration: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.price) return;
    setPackages(prev => [{
      id: Date.now().toString(),
      name: form.name,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      services: form.services.split(',').map(s => s.trim()).filter(Boolean),
      durationMinutes: Number(form.duration) || 60,
      isActive: true,
    }, ...prev]);
    setForm({ name: '', price: '', originalPrice: '', services: '', duration: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setPackages(prev => prev.filter(p => p.id !== id));
  const toggleActive = (id: string) => setPackages(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));

  const filtered = packages.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.services.some(s => s.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{title}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{packages.length} باقة • {packages.filter(p => p.isActive).length} نشطة</p>
          </div>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} title="إضافة باقة جديدة"
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> إضافة باقة
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">إضافة باقة جديدة</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">اسم الباقة *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="مثال: باقة العناية الشاملة"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">السعر (ج.م) *</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="450"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">السعر قبل الخصم</label>
              <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                placeholder="600"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">المدة (دقيقة)</label>
              <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                placeholder="120"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">الخدمات المشمولة (مفصولة بفاصلة)</label>
            <input type="text" value={form.services} onChange={e => setForm(f => ({ ...f, services: e.target.value }))}
              placeholder="قص شعر, صبغة, تسريحة"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} title="إلغاء" className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">إلغاء</button>
            <button type="button" onClick={handleAdd} disabled={!form.name.trim() || !form.price} title="حفظ الباقة"
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">حفظ</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder="ابحث في الباقات..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <Sparkles className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{search ? `لا نتائج لـ "${search}"` : 'لم تضف باقات بعد'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(pkg => (
            <div key={pkg.id} className={`bg-white rounded-[2rem] border shadow-sm p-5 space-y-3 hover:shadow-md transition-all ${pkg.isActive ? 'border-slate-100' : 'border-red-100 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900">{pkg.name}</div>
                    <div className="text-xs text-slate-400 font-bold mt-0.5">{pkg.services.length} خدمة مشمولة</div>
                  </div>
                </div>
                <button type="button" onClick={() => toggleActive(pkg.id)} title={pkg.isActive ? 'تعطيل الباقة' : 'تفعيل الباقة'}
                  className={`text-xs font-black px-2.5 py-1 rounded-full cursor-pointer ${pkg.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {pkg.isActive ? 'نشط' : 'معطل'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <DollarSign size={13} /> {pkg.price} ج.م
                </div>
                {pkg.originalPrice && (
                  <span className="text-xs text-slate-400 line-through font-bold">{pkg.originalPrice} ج.م</span>
                )}
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                  <Clock size={11} /> {pkg.durationMinutes} د
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pkg.services.map((s, i) => (
                  <span key={i} className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={9} className="inline mr-0.5" />{s}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" title="تعديل الباقة" className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                  <Edit2 size={12} /> تعديل
                </button>
                <button type="button" onClick={() => handleDelete(pkg.id)} title="حذف الباقة"
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

export default ActivityPackagesPage;
