import React, { useState } from 'react';
import { ArrowLeftRight, Plus, Search, X, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Transfer = { id: string; transferNumber: string; fromWarehouse: string; toWarehouse: string; items: number; status: 'pending' | 'in_transit' | 'received' | 'cancelled'; date: string };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  in_transit: { ar: 'قيد النقل', en: 'In Transit', color: 'text-blue-600', bg: 'bg-blue-100' },
  received: { ar: 'استلامت', en: 'Received', color: 'text-green-600', bg: 'bg-green-100' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100' },
};

const TransfersPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([
    { id: '1', transferNumber: 'TR-001', fromWarehouse: isArabic ? 'المخزن الرئيسي' : 'Main', toWarehouse: isArabic ? 'مخزن الفرع' : 'Branch', items: 20, status: 'received', date: '2026-07-20' },
    { id: '2', transferNumber: 'TR-002', fromWarehouse: isArabic ? 'مخزن الفرع' : 'Branch', toWarehouse: isArabic ? 'مخزن الإسكندرية' : 'Alex', items: 15, status: 'in_transit', date: '2026-07-28' },
  ]);

  const filtered = transfers.filter(tr => tr.transferNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'النقل بين المخازن' : 'Transfers'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'نقل المنتجات بين المخازن' : 'Transfer products between warehouses'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'نقل جديد' : 'New Transfer'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي النقل' : 'Total Transfers', value: transfers.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'قيد النقل' : 'In Transit', value: transfers.filter(t => t.status === 'in_transit').length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'استلامت' : 'Received', value: transfers.filter(t => t.status === 'received').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'قيد الانتظار' : 'Pending', value: transfers.filter(t => t.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><ArrowLeftRight size={20} /></div>
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
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'رقم النقل' : 'Transfer #'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'من' : 'From'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'إلى' : 'To'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العناصر' : 'Items'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'التاريخ' : 'Date'}</th>
          </tr></thead>
          <tbody>
            {filtered.map((tr) => {
              const st = STATUS_STYLES[tr.status] || STATUS_STYLES.pending;
              return (
                <tr key={tr.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-bold">{tr.transferNumber}</td>
                  <td className="py-3 text-slate-500">{tr.fromWarehouse}</td>
                  <td className="py-3 text-slate-500">{tr.toWarehouse}</td>
                  <td className="py-3 text-slate-500">{tr.items}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span></td>
                  <td className="py-3 text-slate-500">{new Date(tr.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'نقل جديد' : 'New Transfer'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'من مخزن' : 'From warehouse'}</option></select>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'إلى مخزن' : 'To warehouse'}</option></select>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;
