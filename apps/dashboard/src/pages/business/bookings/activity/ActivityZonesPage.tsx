/**
 * ═══════════════════════════════════════════
 * activity/ActivityZonesPage.tsx
 * إدارة مناطق الخدمة
 * يُستخدم في: صيانة وزيارات منزلية
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Map, Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { useTranslation } from 'react-i18next';

type Zone = {
  id: string;
  name: string;
  areas: string[];
  deliveryFee: number;
  estimatedTime?: string;
  isActive: boolean;
};

type Props = { activityType: BookingActivityType };

const ActivityZonesPage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const [zones, setZones] = useState<Zone[]>([
    { id: '1', name: 'المنطقة المركزية', areas: ['العليا', 'السليمانية', 'الملز', 'الروضة'], deliveryFee: 0, estimatedTime: '30 دقيقة', isActive: true },
    { id: '2', name: 'شمال الرياض', areas: ['النرجس', 'العارض', 'الياسمين', 'حطين'], deliveryFee: 50, estimatedTime: '45 دقيقة', isActive: true },
    { id: '3', name: 'جنوب الرياض', areas: ['العزيزية', 'الدار البيضاء', 'السعادة'], deliveryFee: 75, estimatedTime: '60 دقيقة', isActive: true },
    { id: '4', name: 'خارج النطاق', areas: ['الخرج', 'الدرعية'], deliveryFee: 150, estimatedTime: '90 دقيقة', isActive: false },
  ]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', areas: '', deliveryFee: '', estimatedTime: '' });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    setZones(prev => [{
      id: Date.now().toString(), name: form.name,
      areas: form.areas.split(',').map(s => s.trim()).filter(Boolean),
      deliveryFee: Number(form.deliveryFee) || 0,
      estimatedTime: form.estimatedTime || undefined, isActive: true,
    }, ...prev]);
    setForm({ name: '', areas: '', deliveryFee: '', estimatedTime: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setZones(prev => prev.filter(z => z.id !== id));
  const toggle = (id: string) => setZones(prev => prev.map(z => z.id === id ? { ...z, isActive: !z.isActive } : z));

  const filtered = zones.filter(z => {
    const q = search.toLowerCase();
    return !q || z.name.toLowerCase().includes(q) || z.areas.some(a => a.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <Map className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{isEn ? 'Service Zones' : 'مناطق الخدمة'}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{zones.filter(z => z.isActive).length} {isEn ? 'active zones' : 'منطقة نشطة'}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> {isEn ? 'Add Zone' : 'إضافة منطقة'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Add Service Zone' : 'إضافة منطقة خدمة'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Zone Name *' : 'اسم المنطقة *'}</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={isEn ? 'e.g. North Riyadh' : 'مثال: شمال الرياض'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Delivery Fee (EGP)' : 'رسوم الانتقال (ج.م)'}</label>
              <input type="number" value={form.deliveryFee} onChange={e => setForm(f => ({ ...f, deliveryFee: e.target.value }))}
                placeholder="50"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Districts (comma-separated)' : 'الأحياء (مفصولة بفاصلة)'}</label>
              <input type="text" value={form.areas} onChange={e => setForm(f => ({ ...f, areas: e.target.value }))}
                placeholder={isEn ? 'Olaya, Sulaimaniya, Malaz' : 'العليا, السليمانية, الملز'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Estimated Time' : 'الوقت المتوقع'}</label>
              <input type="text" value={form.estimatedTime} onChange={e => setForm(f => ({ ...f, estimatedTime: e.target.value }))}
                placeholder={isEn ? '30 min' : '30 دقيقة'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">{isEn ? 'Cancel' : 'إلغاء'}</button>
            <button onClick={handleAdd} disabled={!form.name.trim()}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">{isEn ? 'Save' : 'حفظ'}</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder={isEn ? 'Search zones or districts...' : 'ابحث في المناطق أو الأحياء...'} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <Map className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{isEn ? 'No service zones added yet' : 'لم تضف مناطق خدمة بعد'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(zone => (
            <div key={zone.id} className={`bg-white rounded-[2rem] border shadow-sm p-5 hover:shadow-md transition-all ${zone.isActive ? 'border-slate-100' : 'border-slate-200 opacity-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-slate-900 mb-1">{zone.name}</div>
                    <div className="flex items-center gap-3 mb-2 text-xs font-bold flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg ${zone.deliveryFee === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {zone.deliveryFee === 0 ? (isEn ? 'Free' : 'مجاني') : (isEn ? `${zone.deliveryFee} EGP fee` : `${zone.deliveryFee} ج.م رسوم`)}
                      </span>
                      {zone.estimatedTime && <span className="text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">⏱ {zone.estimatedTime}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.areas.map((area, i) => (
                        <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">{area}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(zone.id)}>
                    {zone.isActive ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-50"><Edit2 size={14} className="text-slate-400" /></button>
                  <button onClick={() => handleDelete(zone.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityZonesPage;
