import React, { useState } from 'react';
import { BookOpen, Plus, Search, Edit, Trash2, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type JournalEntry = { id: string; date: string; description: string; account: string; debit: number; credit: number; reference: string };

const JournalPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([
    { id: '1', date: '2026-07-28', description: isArabic ? 'بيع منتجات' : 'Product sale', account: isArabic ? 'الإيرادات' : 'Revenue', debit: 0, credit: 1500, reference: 'ORD-001' },
    { id: '2', date: '2026-07-28', description: isArabic ? 'شراء مخزون' : 'Inventory purchase', account: isArabic ? 'المخزون' : 'Inventory', debit: 3000, credit: 0, reference: 'PO-001' },
    { id: '3', date: '2026-07-27', description: isArabic ? 'دفع إيجار' : 'Rent payment', account: isArabic ? 'مصاريف عامة' : 'General Expenses', debit: 2000, credit: 0, reference: 'EXP-001' },
  ]);

  const filtered = entries.filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || e.account.toLowerCase().includes(search.toLowerCase()));
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'القيود' : 'Journal Entries'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'دفتر اليومية المحاسبي' : 'Accounting journal ledger'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'قيد جديد' : 'New Entry'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي القيود' : 'Total Entries', value: entries.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'إجمالي المدين' : 'Total Debit', value: `${t('business.reports.currency')} ${totalDebit.toLocaleString()}`, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'إجمالي الدائن' : 'Total Credit', value: `${t('business.reports.currency')} ${totalCredit.toLocaleString()}`, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'الرصيد' : 'Balance', value: `${t('business.reports.currency')} ${(totalDebit - totalCredit).toLocaleString()}`, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><BookOpen size={20} /></div>
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
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'التاريخ' : 'Date'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الوصف' : 'Description'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحساب' : 'Account'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المرجع' : 'Reference'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'مدين' : 'Debit'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'دائن' : 'Credit'}</th>
          </tr></thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-3 text-slate-500">{new Date(e.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</td>
                <td className="py-3 font-bold">{e.description}</td>
                <td className="py-3 text-slate-500">{e.account}</td>
                <td className="py-3 text-slate-400 text-xs">{e.reference}</td>
                <td className="py-3 font-bold text-green-600">{e.debit ? `${t('business.reports.currency')} ${e.debit.toLocaleString()}` : '---'}</td>
                <td className="py-3 font-bold text-amber-600">{e.credit ? `${t('business.reports.currency')} ${e.credit.toLocaleString()}` : '---'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'قيد جديد' : 'New Entry'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'الوصف' : 'Description'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'الحساب' : 'Account'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <div className="grid grid-cols-2 gap-3"><input type="number" placeholder={isArabic ? 'مدين' : 'Debit'} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /><input type="number" placeholder={isArabic ? 'دائن' : 'Credit'} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalPage;
