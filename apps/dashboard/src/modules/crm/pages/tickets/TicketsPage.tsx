import React, { useState } from 'react';
import { TicketIcon, Plus, Search, Edit, Trash2, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type TicketItem = { id: string; subject: string; customerName: string; priority: 'low' | 'medium' | 'high' | 'urgent'; status: 'open' | 'pending' | 'resolved' | 'closed'; date: string; category: string };

const PRIORITY_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  low: { ar: 'منخفض', en: 'Low', color: 'text-slate-600', bg: 'bg-slate-100' },
  medium: { ar: 'متوسط', en: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100' },
  high: { ar: 'عالي', en: 'High', color: 'text-orange-600', bg: 'bg-orange-100' },
  urgent: { ar: 'عاجل', en: 'Urgent', color: 'text-red-600', bg: 'bg-red-100' },
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  open: { ar: 'مفتوح', en: 'Open', color: 'text-blue-600', bg: 'bg-blue-100' },
  pending: { ar: 'قيد المعالجة', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  resolved: { ar: 'تم الحل', en: 'Resolved', color: 'text-green-600', bg: 'bg-green-100' },
  closed: { ar: 'مغلق', en: 'Closed', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const TicketsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState<TicketItem[]>([
    { id: '1', subject: isArabic ? 'مشكلة في الطلب' : 'Order issue', customerName: 'Ahmed', priority: 'high', status: 'open', date: '2026-07-28', category: isArabic ? 'طلبات' : 'Orders' },
    { id: '2', subject: isArabic ? 'استفسار عن منتج' : 'Product inquiry', customerName: 'Sara', priority: 'low', status: 'resolved', date: '2026-07-27', category: isArabic ? 'منتجات' : 'Products' },
    { id: '3', subject: isArabic ? 'مشكلة دفع' : 'Payment problem', customerName: 'Omar', priority: 'urgent', status: 'pending', date: '2026-07-28', category: isArabic ? 'مدفوعات' : 'Payments' },
  ]);

  const filtered = tickets.filter(tk => tk.subject.toLowerCase().includes(search.toLowerCase()) || tk.customerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'التذاكر' : 'Tickets'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة تذاكر الدعم' : 'Manage support tickets'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'تذكرة جديدة' : 'New Ticket'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي التذاكر' : 'Total Tickets', value: tickets.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'مفتوحة' : 'Open', value: tickets.filter(t => t.status === 'open').length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'تم الحل' : 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'عاجلة' : 'Urgent', value: tickets.filter(t => t.priority === 'urgent').length, color: 'bg-red-50 text-red-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><TicketIcon size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-right border-b border-slate-100">
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الموضوع' : 'Subject'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العميل' : 'Customer'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الفئة' : 'Category'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الأولوية' : 'Priority'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'التاريخ' : 'Date'}</th>
          </tr></thead>
          <tbody>
            {filtered.map((tk) => {
              const pr = PRIORITY_STYLES[tk.priority] || PRIORITY_STYLES.low;
              const st = STATUS_STYLES[tk.status] || STATUS_STYLES.open;
              return (
                <tr key={tk.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-bold">{tk.subject}</td>
                  <td className="py-3 text-slate-500">{tk.customerName}</td>
                  <td className="py-3 text-slate-500">{tk.category}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${pr.bg} ${pr.color}`}>{isArabic ? pr.ar : pr.en}</span></td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span></td>
                  <td className="py-3 text-slate-500">{new Date(tk.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'تذكرة جديدة' : 'New Ticket'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'الموضوع' : 'Subject'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'منخفض' : 'Low'}</option><option>{isArabic ? 'متوسط' : 'Medium'}</option><option>{isArabic ? 'عالي' : 'High'}</option><option>{isArabic ? 'عاجل' : 'Urgent'}</option></select>
              <textarea placeholder={isArabic ? 'الوصف' : 'Description'} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
