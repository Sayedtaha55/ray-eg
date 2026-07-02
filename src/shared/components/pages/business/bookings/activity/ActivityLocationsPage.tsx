/**
 * ═══════════════════════════════════════════
 * activity/ActivityLocationsPage.tsx
 * إدارة مواقع الاستلام / الفروع
 * يُستخدم في: تأجير سيارات، مواعيد عامة
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { MapPin, Plus, Search, Edit2, Trash2, Phone, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import type { BookingActivityType } from '../config';

type Location = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  workingHours?: string;
  isActive: boolean;
  notes?: string;
};

type Props = { activityType: BookingActivityType };

const LABELS: Record<string, { title: string; singular: string }> = {
  vehicle_rental:       { title: 'مواقع الاستلام والتسليم', singular: 'موقع' },
  general_appointments: { title: 'الفروع والمواقع',          singular: 'فرع' },
};

const ActivityLocationsPage: React.FC<Props> = ({ activityType }) => {
  const lbl = LABELS[activityType] || LABELS.vehicle_rental;
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: 'الفرع الرئيسي - الرياض', address: 'حي العليا، شارع التحلية، مبنى 45', phone: '0112345678', workingHours: '8:00 ص - 10:00 م', isActive: true },
    { id: '2', name: 'مطار الملك خالد', address: 'صالة الوصول، بوابة 3', phone: '0119876543', workingHours: '24 ساعة', isActive: true },
    { id: '3', name: 'فرع جدة', address: 'حي الروضة، شارع فلسطين', phone: '0125554444', workingHours: '9:00 ص - 9:00 م', isActive: true },
    { id: '4', name: 'فرع الدمام (قريباً)', address: 'حي الفيصلية، الدمام', isActive: false, notes: 'تحت التجهيز' },
  ]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '', workingHours: '', notes: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.address.trim()) return;
    setLocations(prev => [{
      id: Date.now().toString(), name: form.name, address: form.address,
      phone: form.phone || undefined, workingHours: form.workingHours || undefined,
      isActive: true, notes: form.notes || undefined,
    }, ...prev]);
    setForm({ name: '', address: '', phone: '', workingHours: '', notes: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setLocations(prev => prev.filter(l => l.id !== id));
  const toggle = (id: string) => setLocations(prev => prev.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l));

  const filtered = locations.filter(l => {
    const q = search.toLowerCase();
    return !q || l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <MapPin className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{lbl.title}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{locations.filter(l => l.isActive).length} {lbl.singular} نشط</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> إضافة {lbl.singular}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">إضافة {lbl.singular} جديد</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">الاسم *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={`مثال: ${lbl.singular} الرياض`}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">العنوان *</label>
              <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="الحي، الشارع، المبنى"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">رقم الهاتف</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="01xxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">أوقات العمل</label>
              <input type="text" value={form.workingHours} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))}
                placeholder="8:00 ص - 10:00 م"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">إلغاء</button>
            <button onClick={handleAdd} disabled={!form.name.trim() || !form.address.trim()}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">حفظ</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder={`ابحث في ${lbl.title}...`} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <MapPin className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">لم تضف مواقع بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {filtered.map(loc => (
            <div key={loc.id} className={`bg-white rounded-[2rem] border shadow-sm p-5 space-y-3 hover:shadow-md transition-all ${loc.isActive ? 'border-slate-100' : 'border-slate-200 opacity-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900">{loc.name}</div>
                    <div className="text-xs text-slate-400 font-bold mt-0.5">{loc.address}</div>
                  </div>
                </div>
                <button onClick={() => toggle(loc.id)}>
                  {loc.isActive ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                </button>
              </div>
              <div className="flex items-center gap-3 flex-wrap text-xs font-bold text-slate-500">
                {loc.phone && <span className="flex items-center gap-1"><Phone size={11} /> {loc.phone}</span>}
                {loc.workingHours && <span className="flex items-center gap-1"><Clock size={11} /> {loc.workingHours}</span>}
              </div>
              {loc.notes && <p className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg">{loc.notes}</p>}
              <div className="flex gap-2 pt-1">
                <button className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                  <Edit2 size={12} /> تعديل
                </button>
                <button onClick={() => handleDelete(loc.id)}
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

export default ActivityLocationsPage;
