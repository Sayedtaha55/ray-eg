import React, { useState } from 'react';
import { PhoneCall, Plus, Search, X, Calendar, CheckCircle2, Clock, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type FollowUp = { id: string; customerName: string; phone: string; reason: string; dueDate: string; status: 'pending' | 'completed' | 'overdue'; notes: string };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  completed: { ar: 'تم', en: 'Completed', color: 'text-green-600', bg: 'bg-green-100' },
  overdue: { ar: 'متأخر', en: 'Overdue', color: 'text-red-600', bg: 'bg-red-100' },
};

const FollowUpsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[]>([
    { id: '1', customerName: 'Ahmed', phone: '01000000000', reason: isArabic ? 'متابعة طلب' : 'Order follow-up', dueDate: '2026-07-30', status: 'pending', notes: isArabic ? 'تأكيد موعد التوصيل' : 'Confirm delivery date' },
    { id: '2', customerName: 'Sara', phone: '01100000000', reason: isArabic ? 'عرض جديد' : 'New offer', dueDate: '2026-07-25', status: 'overdue', notes: isArabic ? 'عرض خصم' : 'Discount offer' },
    { id: '3', customerName: 'Omar', phone: '01200000000', reason: isArabic ? 'رد على استفسار' : 'Inquiry response', dueDate: '2026-07-28', status: 'completed', notes: isArabic ? 'تم الرد' : 'Responded' },
  ]);

  const filtered = followUps.filter(f => f.customerName.toLowerCase().includes(search.toLowerCase()) || f.reason.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'المتابعات' : 'Follow-ups'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'متابعة العملاء' : 'Customer follow-ups'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'متابعة جديدة' : 'New Follow-up'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي المتابعات' : 'Total Follow-ups', value: followUps.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'قيد الانتظار' : 'Pending', value: followUps.filter(f => f.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'تم' : 'Completed', value: followUps.filter(f => f.status === 'completed').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'متأخر' : 'Overdue', value: followUps.filter(f => f.status === 'overdue').length, color: 'bg-red-50 text-red-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><PhoneCall size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((f) => {
          const st = STATUS_STYLES[f.status] || STATUS_STYLES.pending;
          return (
            <div key={f.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><PhoneCall size={20} /></div>
                <div>
                  <p className="font-bold text-sm">{f.customerName} <span className="text-xs font-normal text-slate-400 flex items-center gap-1"><Phone size={10} /> {f.phone}</span></p>
                  <p className="text-xs text-slate-500">{f.reason} · {isArabic ? 'موعد' : 'Due'}: {new Date(f.dueDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'متابعة جديدة' : 'New Follow-up'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'السبب' : 'Reason'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <textarea placeholder={isArabic ? 'ملاحظات' : 'Notes'} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpsPage;
