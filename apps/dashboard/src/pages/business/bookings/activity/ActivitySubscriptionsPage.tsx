/**
 * ═══════════════════════════════════════════
 * activity/ActivitySubscriptionsPage.tsx
 * إدارة الاشتراكات وخطط التدريب / التعليم
 * يُستخدم في: ملاعب ومدربين، دورات تعليمية
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { CreditCard, Plus, Search, Edit2, Trash2, DollarSign, Users, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { useTranslation } from 'react-i18next';

type Subscription = {
  id: string;
  name: string;
  price: number;
  duration: string;
  sessionsPerWeek?: number;
  maxMembers?: number;
  currentMembers: number;
  features: string[];
  isActive: boolean;
};

type Props = { activityType: BookingActivityType };

const LABELS_AR: Record<string, { title: string; type: string }> = {
  sports_trainers: { title: 'اشتراكات التدريب', type: 'اشتراك' },
  education_courses: { title: 'خطط الاشتراك', type: 'خطة' },
};
const LABELS_EN: Record<string, { title: string; type: string }> = {
  sports_trainers: { title: 'Training Subscriptions', type: 'Subscription' },
  education_courses: { title: 'Subscription Plans', type: 'Plan' },
};

const ActivitySubscriptionsPage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const LABELS = isEn ? LABELS_EN : LABELS_AR;
  const lbl = LABELS[activityType] || LABELS.sports_trainers;
  const [subs, setSubs] = useState<Subscription[]>([
    { id: '1', name: 'اشتراك شهري', price: 300, duration: 'شهر', sessionsPerWeek: 3, maxMembers: 50, currentMembers: 38, features: ['3 حصص أسبوعياً', 'مدرب خاص', 'خزانة'], isActive: true },
    { id: '2', name: 'اشتراك ربع سنوي', price: 750, duration: '3 أشهر', sessionsPerWeek: 5, maxMembers: 30, currentMembers: 22, features: ['5 حصص أسبوعياً', 'مدرب خاص', 'خزانة', 'تقييم شهري'], isActive: true },
    { id: '3', name: 'اشتراك سنوي VIP', price: 2500, duration: 'سنة', sessionsPerWeek: 7, maxMembers: 15, currentMembers: 12, features: ['حصص يومية', 'مدرب خاص', 'برنامج غذائي', 'ساونا'], isActive: true },
    { id: '4', name: 'باقة الطالب', price: 150, duration: 'شهر', sessionsPerWeek: 2, maxMembers: 100, currentMembers: 0, features: ['2 حصص أسبوعياً', 'صالة عامة'], isActive: false },
  ]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', duration: '', sessionsPerWeek: '', maxMembers: '', features: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.price) return;
    setSubs(prev => [{
      id: Date.now().toString(), name: form.name, price: Number(form.price), duration: form.duration || 'شهر',
      sessionsPerWeek: form.sessionsPerWeek ? Number(form.sessionsPerWeek) : undefined,
      maxMembers: form.maxMembers ? Number(form.maxMembers) : undefined, currentMembers: 0,
      features: form.features.split(',').map(s => s.trim()).filter(Boolean), isActive: true,
    }, ...prev]);
    setForm({ name: '', price: '', duration: '', sessionsPerWeek: '', maxMembers: '', features: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setSubs(prev => prev.filter(s => s.id !== id));
  const toggle = (id: string) => setSubs(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));

  const filtered = subs.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{lbl.title}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{subs.filter(s => s.isActive).length} {lbl.type} {isEn ? 'active' : 'نشط'}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> {isEn ? 'Add' : 'إضافة'} {lbl.type}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">{isEn ? `Add New ${lbl.type}` : `إضافة ${lbl.type} جديد`}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Name *' : 'الاسم *'}</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={isEn ? 'e.g. Monthly Subscription' : 'مثال: اشتراك شهري'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Price (EGP) *' : 'السعر (ج.م) *'}</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="300"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Duration' : 'المدة'}</label>
              <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300">
                <option value="شهر">{isEn ? 'Month' : 'شهر'}</option>
                <option value="3 أشهر">{isEn ? '3 Months' : '3 أشهر'}</option>
                <option value="6 أشهر">{isEn ? '6 Months' : '6 أشهر'}</option>
                <option value="سنة">{isEn ? 'Year' : 'سنة'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Sessions/Week' : 'حصص/أسبوع'}</label>
              <input type="number" value={form.sessionsPerWeek} onChange={e => setForm(f => ({ ...f, sessionsPerWeek: e.target.value }))}
                placeholder="3" min="1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Max Members' : 'الحد الأقصى للأعضاء'}</label>
              <input type="number" value={form.maxMembers} onChange={e => setForm(f => ({ ...f, maxMembers: e.target.value }))}
                placeholder="50"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Features (comma-separated)' : 'المميزات (فاصلة)'}</label>
              <input type="text" value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                placeholder={isEn ? 'Private trainer, Locker, Sauna' : 'مدرب خاص, خزانة, ساونا'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">{isEn ? 'Cancel' : 'إلغاء'}</button>
            <button onClick={handleAdd} disabled={!form.name.trim() || !form.price}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">{isEn ? 'Save' : 'حفظ'}</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder={isEn ? `Search ${lbl.title}...` : `ابحث في ${lbl.title}...`} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <CreditCard className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{isEn ? 'No subscriptions added yet' : 'لم تضف اشتراكات بعد'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(sub => {
            const pct = sub.maxMembers ? (sub.currentMembers / sub.maxMembers) * 100 : 0;
            return (
              <div key={sub.id} className={`bg-white rounded-[2rem] border shadow-sm p-5 space-y-3 hover:shadow-md transition-all ${sub.isActive ? 'border-slate-100' : 'border-red-100 opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <div className="font-black text-slate-900">{sub.name}</div>
                  <button onClick={() => toggle(sub.id)}>
                    {sub.isActive ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} className="text-slate-300" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg"><DollarSign size={13} /> {sub.price} {isEn ? 'EGP' : 'ج.م'}</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg"><Calendar size={11} className="inline mr-0.5" /> {sub.duration}</span>
                  {sub.sessionsPerWeek && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{sub.sessionsPerWeek} {isEn ? 'sessions/week' : 'حصص/أسبوع'}</span>}
                </div>
                {sub.maxMembers && (
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                      <span><Users size={11} className="inline mr-0.5" /> {sub.currentMembers}/{sub.maxMembers}</span>
                      <span>{Math.round(pct)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${pct > 90 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {sub.features.map((f, i) => (
                    <span key={i} className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">✓ {f}</span>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5"><Edit2 size={12} /> {isEn ? 'Edit' : 'تعديل'}</button>
                  <button onClick={() => handleDelete(sub.id)} className="py-2 px-3 rounded-xl border border-red-100 text-xs font-black text-red-500 hover:bg-red-50 flex items-center justify-center gap-1.5"><Trash2 size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivitySubscriptionsPage;
