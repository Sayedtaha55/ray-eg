import React, { useState } from 'react';
import { CalendarOff, Plus, Search, X, Calendar, Check, X as XIcon, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Leave = { id: string; employeeName: string; type: 'annual' | 'sick' | 'unpaid' | 'emergency'; startDate: string; endDate: string; days: number; reason: string; status: 'pending' | 'approved' | 'rejected' };

const TYPE_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  annual: { ar: 'سنوي', en: 'Annual', color: 'text-blue-600', bg: 'bg-blue-100' },
  sick: { ar: 'مرضي', en: 'Sick', color: 'text-red-600', bg: 'bg-red-100' },
  unpaid: { ar: 'بدون أجر', en: 'Unpaid', color: 'text-slate-600', bg: 'bg-slate-100' },
  emergency: { ar: 'طارئ', en: 'Emergency', color: 'text-amber-600', bg: 'bg-amber-100' },
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  approved: { ar: 'موافق', en: 'Approved', color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { ar: 'مرفوض', en: 'Rejected', color: 'text-red-600', bg: 'bg-red-100' },
};

const LeavesPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [leaves, setLeaves] = useState<Leave[]>([
    { id: '1', employeeName: 'Ahmed', type: 'annual', startDate: '2026-08-01', endDate: '2026-08-07', days: 7, reason: isArabic ? 'إجازة صيفية' : 'Summer vacation', status: 'approved' },
    { id: '2', employeeName: 'Sara', type: 'sick', startDate: '2026-07-30', endDate: '2026-07-31', days: 2, reason: isArabic ? 'وعكة صحية' : 'Illness', status: 'pending' },
    { id: '3', employeeName: 'Omar', type: 'emergency', startDate: '2026-07-28', endDate: '2026-07-28', days: 1, reason: isArabic ? 'ظرف طارئ' : 'Family emergency', status: 'approved' },
  ]);

  const filtered = leaves.filter(l => l.employeeName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الإجازات' : 'Leaves'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة إجازات الموظفين' : 'Manage employee leaves'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'طلب إجازة' : 'Request Leave'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الطلبات' : 'Total Requests', value: leaves.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'موافق' : 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'قيد الانتظار' : 'Pending', value: leaves.filter(l => l.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'إجمالي الأيام' : 'Total Days', value: leaves.reduce((s, l) => s + l.days, 0), color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><CalendarOff size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((l) => {
          const tp = TYPE_STYLES[l.type] || TYPE_STYLES.annual;
          const st = STATUS_STYLES[l.status] || STATUS_STYLES.pending;
          return (
            <div key={l.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><CalendarOff size={20} /></div>
                <div>
                  <p className="font-bold text-sm">{l.employeeName} · <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${tp.bg} ${tp.color}`}>{isArabic ? tp.ar : tp.en}</span></p>
                  <p className="text-xs text-slate-400 flex items-center gap-2"><Calendar size={10} /> {new Date(l.startDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')} → {new Date(l.endDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')} · {l.days} {isArabic ? 'أيام' : 'days'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{l.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {l.status === 'pending' && (
                  <>
                    <button className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"><Check size={16} /></button>
                    <button className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><XIcon size={16} /></button>
                  </>
                )}
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'طلب إجازة' : 'Request Leave'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم الموظف' : 'Employee name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'سنوي' : 'Annual'}</option><option>{isArabic ? 'مرضي' : 'Sick'}</option><option>{isArabic ? 'بدون أجر' : 'Unpaid'}</option><option>{isArabic ? 'طارئ' : 'Emergency'}</option></select>
              <div className="grid grid-cols-2 gap-3"><input type="date" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /><input type="date" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <textarea placeholder={isArabic ? 'السبب' : 'Reason'} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إرسال' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesPage;
