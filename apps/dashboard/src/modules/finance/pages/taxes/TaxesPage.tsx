import React, { useState } from 'react';
import { Receipt, Plus, Search, Edit, Trash2, X, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Tax = { id: string; name: string; rate: number; type: 'inclusive' | 'exclusive'; appliedTo: string; status: 'active' | 'inactive' };

const TaxesPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [taxes, setTaxes] = useState<Tax[]>([
    { id: '1', name: isArabic ? 'ضريبة القيمة المضافة' : 'VAT', rate: 14, type: 'inclusive', appliedTo: isArabic ? 'جميع المنتجات' : 'All products', status: 'active' },
    { id: '2', name: isArabic ? 'ضريبة المبيعات' : 'Sales Tax', rate: 10, type: 'exclusive', appliedTo: isArabic ? 'منتجات محددة' : 'Specific products', status: 'active' },
  ]);

  const filtered = taxes.filter(tx => tx.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الضرائب' : 'Taxes'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة الضرائب المطبقة على المنتجات' : 'Manage taxes applied to products'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'ضريبة جديدة' : 'New Tax'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الضرائب' : 'Total Taxes', value: taxes.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: taxes.filter(t => t.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'متوسط السعر' : 'Avg Rate', value: `${(taxes.reduce((s, t) => s + t.rate, 0) / (taxes.length || 1)).toFixed(1)}%`, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'أعلى سعر' : 'Highest Rate', value: `${Math.max(...taxes.map(t => t.rate), 0)}%`, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Receipt size={20} /></div>
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
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الاسم' : 'Name'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'النسبة' : 'Rate'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'النوع' : 'Type'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'تطبيق على' : 'Applied To'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
            <th className="pb-3"></th>
          </tr></thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-3 font-bold">{tx.name}</td>
                <td className="py-3 font-bold text-blue-600">{tx.rate}%</td>
                <td className="py-3 text-slate-500">{tx.type === 'inclusive' ? (isArabic ? 'شامل' : 'Inclusive') : (isArabic ? 'إضافي' : 'Exclusive')}</td>
                <td className="py-3 text-slate-500">{tx.appliedTo}</td>
                <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${tx.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{tx.status === 'active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}</span></td>
                <td className="py-3"><div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'ضريبة جديدة' : 'New Tax'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم الضريبة' : 'Tax name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="number" placeholder={isArabic ? 'النسبة %' : 'Rate %'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'شامل' : 'Inclusive'}</option><option>{isArabic ? 'إضافي' : 'Exclusive'}</option></select>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxesPage;
