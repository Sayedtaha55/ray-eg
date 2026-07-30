import React, { useState } from 'react';
import { MessageCircleWarning, Plus, Search, X, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Complaint = { id: string; subject: string; customerName: string; severity: 'low' | 'medium' | 'high'; status: 'pending' | 'investigating' | 'resolved'; date: string; description: string };

const SEVERITY_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  low: { ar: 'منخفض', en: 'Low', color: 'text-slate-600', bg: 'bg-slate-100' },
  medium: { ar: 'متوسط', en: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100' },
  high: { ar: 'عالي', en: 'High', color: 'text-red-600', bg: 'bg-red-100' },
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  investigating: { ar: 'قيد التحقيق', en: 'Investigating', color: 'text-blue-600', bg: 'bg-blue-100' },
  resolved: { ar: 'تم الحل', en: 'Resolved', color: 'text-green-600', bg: 'bg-green-100' },
};

const ComplaintsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([
    { id: '1', subject: isArabic ? 'منتج تالف' : 'Damaged product', customerName: 'Ahmed', severity: 'high', status: 'investigating', date: '2026-07-28', description: isArabic ? 'وصل المنتج تالف' : 'Product arrived damaged' },
    { id: '2', subject: isArabic ? 'تأخر التوصيل' : 'Late delivery', customerName: 'Sara', severity: 'medium', status: 'resolved', date: '2026-07-27', description: isArabic ? 'تأخر الطلب 3 أيام' : 'Order delayed 3 days' },
  ]);

  const filtered = complaints.filter(c => c.subject.toLowerCase().includes(search.toLowerCase()) || c.customerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الشكاوى' : 'Complaints'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة شكاوى العملاء' : 'Manage customer complaints'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'شكوى جديدة' : 'New Complaint'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الشكاوى' : 'Total Complaints', value: complaints.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'قيد التحقيق' : 'Investigating', value: complaints.filter(c => c.status === 'investigating').length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'تم الحل' : 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'عالية الخطورة' : 'High Severity', value: complaints.filter(c => c.severity === 'high').length, color: 'bg-red-50 text-red-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><AlertTriangle size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((c) => {
          const sv = SEVERITY_STYLES[c.severity] || SEVERITY_STYLES.low;
          const st = STATUS_STYLES[c.status] || STATUS_STYLES.pending;
          return (
            <div key={c.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><AlertTriangle size={20} /></div>
                  <div><p className="font-bold text-sm">{c.subject}</p><p className="text-xs text-slate-400">{c.customerName} · {new Date(c.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${sv.bg} ${sv.color}`}>{isArabic ? sv.ar : sv.en}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 ml-11">{c.description}</p>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'شكوى جديدة' : 'New Complaint'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'الموضوع' : 'Subject'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'منخفض' : 'Low'}</option><option>{isArabic ? 'متوسط' : 'Medium'}</option><option>{isArabic ? 'عالي' : 'High'}</option></select>
              <textarea placeholder={isArabic ? 'الوصف' : 'Description'} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
