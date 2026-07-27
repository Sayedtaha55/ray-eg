/**
 * ═══════════════════════════════════════════
 * activity/ActivityPoliciesPage.tsx
 * إدارة سياسات الدخول / الوصول / القواعد
 * يُستخدم في: شاليهات، فنادق، مواعيد عامة
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { ShieldAlert, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { useTranslation } from 'react-i18next';

type Policy = {
  id: string;
  title: string;
  description: string;
  type: 'required' | 'optional' | 'info';
  isActive: boolean;
};

type Props = { activityType: BookingActivityType };

const LABELS_AR: Record<string, { title: string; desc: string }> = {
  chalets_resorts: { title: 'سياسات الدخول', desc: 'قواعد وشروط دخول الشاليهات والمنتجعات' },
  hotels_rooms: { title: 'سياسات الوصول', desc: 'قواعد وشروط الوصول والمغادرة' },
  general_appointments: { title: 'قواعد المواعيد', desc: 'قواعد الحجز والإلغاء والتأخير' },
};
const LABELS_EN: Record<string, { title: string; desc: string }> = {
  chalets_resorts: { title: 'Entry Policies', desc: 'Rules and conditions for chalets and resorts entry' },
  hotels_rooms: { title: 'Access Policies', desc: 'Check-in and check-out rules and conditions' },
  general_appointments: { title: 'Appointment Rules', desc: 'Booking, cancellation, and delay rules' },
};

const TYPE_MAP_AR = {
  required: { label: 'إلزامي', color: 'text-red-700', bg: 'bg-red-50' },
  optional: { label: 'اختياري', color: 'text-amber-700', bg: 'bg-amber-50' },
  info: { label: 'معلومات', color: 'text-blue-700', bg: 'bg-blue-50' },
};
const TYPE_MAP_EN = {
  required: { label: 'Required', color: 'text-red-700', bg: 'bg-red-50' },
  optional: { label: 'Optional', color: 'text-amber-700', bg: 'bg-amber-50' },
  info: { label: 'Info', color: 'text-blue-700', bg: 'bg-blue-50' },
};

const ActivityPoliciesPage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const LABELS = isEn ? LABELS_EN : LABELS_AR;
  const TYPE_MAP = isEn ? TYPE_MAP_EN : TYPE_MAP_AR;
  const lbl = LABELS[activityType] || LABELS.chalets_resorts;
  const [policies, setPolicies] = useState<Policy[]>([
    { id: '1', title: 'هوية رسمية مطلوبة', description: 'يجب إحضار هوية وطنية أو جواز سفر ساري عند الوصول.', type: 'required', isActive: true },
    { id: '2', title: 'وقت الدخول والخروج', description: 'الدخول من الساعة 4:00 مساءً والخروج قبل 12:00 ظهراً.', type: 'required', isActive: true },
    { id: '3', title: 'الحيوانات الأليفة', description: 'غير مسموح باصطحاب حيوانات أليفة داخل الوحدة.', type: 'info', isActive: true },
    { id: '4', title: 'تأمين استرجاعي', description: 'يُخصم مبلغ 500 ج.م كتأمين يُسترجع بعد المغادرة.', type: 'optional', isActive: false },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'required' as Policy['type'] });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    setPolicies(prev => [{ id: Date.now().toString(), ...form, isActive: true }, ...prev]);
    setForm({ title: '', description: '', type: 'required' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setPolicies(prev => prev.filter(p => p.id !== id));
  const toggle = (id: string) => setPolicies(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{lbl.title}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{lbl.desc}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> {isEn ? 'Add Policy' : 'إضافة سياسة'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Add New Policy' : 'إضافة سياسة جديدة'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Policy Title *' : 'عنوان السياسة *'}</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder={isEn ? 'e.g. Check-in and Check-out times' : 'مثال: وقت الدخول والخروج'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Type' : 'النوع'}</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Policy['type'] }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300">
                <option value="required">{isEn ? 'Required' : 'إلزامي'}</option>
                <option value="optional">{isEn ? 'Optional' : 'اختياري'}</option>
                <option value="info">{isEn ? 'Info' : 'معلومات'}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Description' : 'الوصف'}</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder={isEn ? 'Policy details...' : 'تفاصيل السياسة...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">{isEn ? 'Cancel' : 'إلغاء'}</button>
            <button onClick={handleAdd} disabled={!form.title.trim()}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">{isEn ? 'Save' : 'حفظ'}</button>
          </div>
        </div>
      )}

      {policies.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <ShieldAlert className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{isEn ? 'No policies added yet' : 'لم تضف سياسات بعد'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map(policy => {
            const t = TYPE_MAP[policy.type];
            return (
              <div key={policy.id} className={`bg-white rounded-[2rem] border shadow-sm p-5 hover:shadow-md transition-all ${policy.isActive ? 'border-slate-100' : 'border-slate-200 opacity-50'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl ${t.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <AlertTriangle className={`w-5 h-5 ${t.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-900">{policy.title}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${t.bg} ${t.color}`}>{t.label}</span>
                      </div>
                      {policy.description && <p className="text-xs text-slate-500 font-bold leading-relaxed">{policy.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggle(policy.id)} className="text-slate-400 hover:text-slate-600">
                      {policy.isActive ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} />}
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-slate-50"><Edit2 size={14} className="text-slate-400" /></button>
                    <button onClick={() => handleDelete(policy.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityPoliciesPage;
