/**
 * ═══════════════════════════════════════════
 * activity/ActivityFeesPage.tsx
 * إدارة رسوم الانتقال والتوصيل
 * يُستخدم في: صيانة وزيارات منزلية
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Coins, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, MapPin, Clock } from 'lucide-react';
import type { BookingActivityType } from '../config';

type Fee = {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'per_km' | 'percentage';
  appliesTo?: string;
  minOrder?: number;
  isActive: boolean;
  notes?: string;
};

type Props = { activityType: BookingActivityType };

const TYPE_LABELS = {
  fixed: 'مبلغ ثابت',
  per_km: 'لكل كيلومتر',
  percentage: 'نسبة مئوية',
};

const ActivityFeesPage: React.FC<Props> = ({ activityType }) => {
  const [fees, setFees] = useState<Fee[]>([
    { id: '1', name: 'رسوم الانتقال الأساسية', amount: 50, type: 'fixed', appliesTo: 'جميع الزيارات', isActive: true },
    { id: '2', name: 'رسوم المسافة البعيدة', amount: 3, type: 'per_km', appliesTo: 'أكثر من 20 كم', minOrder: 200, isActive: true, notes: 'تُحسب بعد أول 20 كم' },
    { id: '3', name: 'رسوم الزيارة العاجلة', amount: 100, type: 'fixed', appliesTo: 'حجوزات نفس اليوم', isActive: true },
    { id: '4', name: 'رسوم خارج الأوقات', amount: 15, type: 'percentage', appliesTo: 'بعد 10 مساءً', isActive: false, notes: 'نسبة إضافية على السعر الأساسي' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', type: 'fixed' as Fee['type'], appliesTo: '', minOrder: '', notes: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.amount) return;
    setFees(prev => [{
      id: Date.now().toString(), name: form.name, amount: Number(form.amount), type: form.type,
      appliesTo: form.appliesTo || undefined, minOrder: form.minOrder ? Number(form.minOrder) : undefined,
      isActive: true, notes: form.notes || undefined,
    }, ...prev]);
    setForm({ name: '', amount: '', type: 'fixed', appliesTo: '', minOrder: '', notes: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setFees(prev => prev.filter(f => f.id !== id));
  const toggle = (id: string) => setFees(prev => prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f));

  const formatAmount = (fee: Fee) => {
    if (fee.type === 'per_km') return `${fee.amount} ج.م/كم`;
    if (fee.type === 'percentage') return `${fee.amount}%`;
    return `${fee.amount} ج.م`;
  };

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <Coins className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">رسوم الانتقال</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{fees.filter(f => f.isActive).length} رسم نشط من {fees.length}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> إضافة رسم
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">إضافة رسم جديد</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">اسم الرسم *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="مثال: رسوم الانتقال"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">المبلغ *</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="50"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">النوع</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Fee['type'] }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300">
                <option value="fixed">مبلغ ثابت</option>
                <option value="per_km">لكل كيلومتر</option>
                <option value="percentage">نسبة مئوية</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">يُطبق على</label>
              <input type="text" value={form.appliesTo} onChange={e => setForm(f => ({ ...f, appliesTo: e.target.value }))}
                placeholder="مثال: جميع الزيارات"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">حد أدنى للطلب (ج.م)</label>
              <input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">ملاحظات</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="ملاحظات..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">إلغاء</button>
            <button onClick={handleAdd} disabled={!form.name.trim() || !form.amount}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">حفظ</button>
          </div>
        </div>
      )}

      {fees.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <Coins className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">لم تضف رسوم بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fees.map(fee => (
            <div key={fee.id} className={`bg-white rounded-[2rem] border shadow-sm p-5 hover:shadow-md transition-all ${fee.isActive ? 'border-slate-100' : 'border-slate-200 opacity-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-slate-900">{fee.name}</div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs font-bold">
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">{formatAmount(fee)}</span>
                      <span className="text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">{TYPE_LABELS[fee.type]}</span>
                      {fee.appliesTo && <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{fee.appliesTo}</span>}
                      {fee.minOrder && <span className="text-slate-400">حد أدنى: {fee.minOrder} ج.م</span>}
                    </div>
                    {fee.notes && <p className="text-xs text-slate-400 font-bold mt-1">{fee.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(fee.id)}>
                    {fee.isActive ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-slate-300" />}
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-50"><Edit2 size={14} className="text-slate-400" /></button>
                  <button onClick={() => handleDelete(fee.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeesPage;
