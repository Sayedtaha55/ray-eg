/**
 * ═══════════════════════════════════════════
 * activity/ActivityInsurancePage.tsx
 * إدارة التأمين والشروط
 * يُستخدم في: تأجير سيارات
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { ShieldCheck, Plus, Edit2, Trash2, DollarSign, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { useTranslation } from 'react-i18next';

type InsurancePlan = {
  id: string;
  name: string;
  coverage: string;
  pricePerDay: number;
  deductible: number;
  includes: string[];
  isActive: boolean;
};

type Props = { activityType: BookingActivityType };

const ActivityInsurancePage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const [plans, setPlans] = useState<InsurancePlan[]>([
    { id: '1', name: 'تأمين شامل', coverage: 'تغطية كاملة ضد الحوادث والسرقة والحريق', pricePerDay: 75, deductible: 500, includes: ['حوادث', 'سرقة', 'حريق', 'أضرار طبيعية'], isActive: true },
    { id: '2', name: 'تأمين أساسي', coverage: 'تغطية ضد الحوادث فقط', pricePerDay: 35, deductible: 2000, includes: ['حوادث', 'طرف ثالث'], isActive: true },
    { id: '3', name: 'تأمين بدون خصم', coverage: 'تغطية شاملة بدون خصم في حالة الحادث', pricePerDay: 120, deductible: 0, includes: ['حوادث', 'سرقة', 'حريق', 'بدون خصم'], isActive: false },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', coverage: '', pricePerDay: '', deductible: '', includes: '' });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    setPlans(prev => [{
      id: Date.now().toString(), name: form.name, coverage: form.coverage,
      pricePerDay: Number(form.pricePerDay) || 0, deductible: Number(form.deductible) || 0,
      includes: form.includes.split(',').map(s => s.trim()).filter(Boolean), isActive: true,
    }, ...prev]);
    setForm({ name: '', coverage: '', pricePerDay: '', deductible: '', includes: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setPlans(prev => prev.filter(p => p.id !== id));
  const toggle = (id: string) => setPlans(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{isEn ? 'Insurance & Terms' : 'التأمين والشروط'}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{plans.length} {isEn ? 'plans' : 'خطة تأمين'} • {plans.filter(p => p.isActive).length} {isEn ? 'active' : 'نشطة'}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> {isEn ? 'Add Plan' : 'إضافة خطة'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Add Insurance Plan' : 'إضافة خطة تأمين'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Plan Name *' : 'اسم الخطة *'}</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={isEn ? 'e.g. Comprehensive Insurance' : 'مثال: تأمين شامل'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Daily Price (EGP)' : 'السعر اليومي (ج.م)'}</label>
              <input type="number" value={form.pricePerDay} onChange={e => setForm(f => ({ ...f, pricePerDay: e.target.value }))}
                placeholder="75"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Deductible (EGP)' : 'مبلغ الخصم (ج.م)'}</label>
              <input type="number" value={form.deductible} onChange={e => setForm(f => ({ ...f, deductible: e.target.value }))}
                placeholder="500"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Coverages (comma-separated)' : 'التغطيات (مفصولة بفاصلة)'}</label>
              <input type="text" value={form.includes} onChange={e => setForm(f => ({ ...f, includes: e.target.value }))}
                placeholder={isEn ? 'Accidents, Theft, Fire' : 'حوادث, سرقة, حريق'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Coverage Description' : 'وصف التغطية'}</label>
            <textarea value={form.coverage} onChange={e => setForm(f => ({ ...f, coverage: e.target.value }))}
              rows={2} placeholder={isEn ? 'Coverage details...' : 'تفاصيل التغطية...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">{isEn ? 'Cancel' : 'إلغاء'}</button>
            <button onClick={handleAdd} disabled={!form.name.trim()}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">{isEn ? 'Save' : 'حفظ'}</button>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <ShieldCheck className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{isEn ? 'No insurance plans added yet' : 'لم تضف خطط تأمين بعد'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white rounded-[2rem] border shadow-sm p-5 hover:shadow-md transition-all ${plan.isActive ? 'border-slate-100' : 'border-slate-200 opacity-50'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-slate-900 mb-1">{plan.name}</div>
                    {plan.coverage && <p className="text-xs text-slate-500 font-bold leading-relaxed mb-2">{plan.coverage}</p>}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <DollarSign size={11} /> {plan.pricePerDay} {isEn ? 'EGP/day' : 'ج.م/يوم'}
                      </span>
                      <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                        {isEn ? 'Deductible:' : 'خصم:'} {plan.deductible} {isEn ? 'EGP' : 'ج.م'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {plan.includes.map((item, i) => (
                        <span key={i} className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">✓ {item}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(plan.id)}>
                    {plan.isActive ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-50"><Edit2 size={14} className="text-slate-400" /></button>
                  <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityInsurancePage;
