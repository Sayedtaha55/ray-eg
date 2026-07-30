import React, { useState } from 'react';
import { BookMarked, Plus, Search, Edit, Trash2, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Account = { id: string; code: string; name: string; type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'; balance: number; status: 'active' | 'inactive' };

const TYPE_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  asset: { ar: 'أصول', en: 'Asset', color: 'text-green-600', bg: 'bg-green-100' },
  liability: { ar: 'خصوم', en: 'Liability', color: 'text-red-600', bg: 'bg-red-100' },
  equity: { ar: 'حقوق ملكية', en: 'Equity', color: 'text-purple-600', bg: 'bg-purple-100' },
  revenue: { ar: 'إيرادات', en: 'Revenue', color: 'text-blue-600', bg: 'bg-blue-100' },
  expense: { ar: 'مصروفات', en: 'Expense', color: 'text-amber-600', bg: 'bg-amber-100' },
};

const AccountsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', code: '1000', name: isArabic ? 'النقدية' : 'Cash', type: 'asset', balance: 15000, status: 'active' },
    { id: '2', code: '1100', name: isArabic ? 'الذمم المدينة' : 'Accounts Receivable', type: 'asset', balance: 8000, status: 'active' },
    { id: '3', code: '2000', name: isArabic ? 'الذمم الدائنة' : 'Accounts Payable', type: 'liability', balance: 5000, status: 'active' },
    { id: '4', code: '3000', name: isArabic ? 'رأس المال' : 'Capital', type: 'equity', balance: 20000, status: 'active' },
    { id: '5', code: '4000', name: isArabic ? 'إيرادات المبيعات' : 'Sales Revenue', type: 'revenue', balance: 45000, status: 'active' },
    { id: '6', code: '5000', name: isArabic ? 'مصاريف عامة' : 'General Expenses', type: 'expense', balance: 12000, status: 'active' },
  ]);

  const filtered = accounts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الحسابات' : 'Chart of Accounts'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'دليل الحسابات المحاسبي' : 'Accounting chart of accounts'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'حساب جديد' : 'New Account'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الحسابات' : 'Total Accounts', value: accounts.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'الأصول' : 'Assets', value: `${t('business.reports.currency')} ${accounts.filter(a => a.type === 'asset').reduce((s, a) => s + a.balance, 0).toLocaleString()}`, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'الخصوم' : 'Liabilities', value: `${t('business.reports.currency')} ${accounts.filter(a => a.type === 'liability').reduce((s, a) => s + a.balance, 0).toLocaleString()}`, color: 'bg-red-50 text-red-600' },
          { label: isArabic ? 'الإيرادات' : 'Revenue', value: `${t('business.reports.currency')} ${accounts.filter(a => a.type === 'revenue').reduce((s, a) => s + a.balance, 0).toLocaleString()}`, color: 'bg-blue-50 text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><BookMarked size={20} /></div>
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
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الرمز' : 'Code'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الاسم' : 'Name'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'النوع' : 'Type'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الرصيد' : 'Balance'}</th>
            <th className="pb-3"></th>
          </tr></thead>
          <tbody>
            {filtered.map((a) => {
              const st = TYPE_STYLES[a.type] || TYPE_STYLES.asset;
              return (
                <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-mono font-bold">{a.code}</td>
                  <td className="py-3 font-bold">{a.name}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span></td>
                  <td className="py-3 font-bold">{t('business.reports.currency')} {a.balance.toLocaleString()}</td>
                  <td className="py-3"><div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'حساب جديد' : 'New Account'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'الرمز' : 'Code'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'الاسم' : 'Name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
                <option>{isArabic ? 'أصول' : 'Asset'}</option><option>{isArabic ? 'خصوم' : 'Liability'}</option><option>{isArabic ? 'حقوق ملكية' : 'Equity'}</option><option>{isArabic ? 'إيرادات' : 'Revenue'}</option><option>{isArabic ? 'مصروفات' : 'Expense'}</option>
              </select>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
