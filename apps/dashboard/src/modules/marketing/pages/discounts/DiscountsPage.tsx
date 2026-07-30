import React, { useState } from 'react';
import { Percent, Plus, Search, Edit, Trash2, X, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Discount = { id: string; name: string; type: 'percentage' | 'fixed' | 'bogo'; value: number; appliesTo: string; status: 'active' | 'inactive'; minOrder?: number };

const DiscountsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([
    { id: '1', name: isArabic ? 'خصم العملاء الجدد' : 'New Customer Discount', type: 'percentage', value: 15, appliesTo: isArabic ? 'كل المنتجات' : 'All products', status: 'active', minOrder: 100 },
    { id: '2', name: isArabic ? 'اشتري 1 احصل على 1' : 'Buy 1 Get 1', type: 'bogo', value: 1, appliesTo: isArabic ? 'منتجات محددة' : 'Specific products', status: 'active' },
    { id: '3', name: isArabic ? 'خصم الطلب الكبير' : 'Bulk Order Discount', type: 'fixed', value: 50, appliesTo: isArabic ? 'الطلبات فوق 500' : 'Orders over 500', status: 'active', minOrder: 500 },
  ]);

  const filtered = discounts.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الخصومات' : 'Discounts'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة خصومات المنتجات' : 'Manage product discounts'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'خصم جديد' : 'New Discount'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الخصومات' : 'Total Discounts', value: discounts.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: discounts.filter(d => d.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'نسبة' : 'Percentage', value: discounts.filter(d => d.type === 'percentage').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'ثابت' : 'Fixed', value: discounts.filter(d => d.type === 'fixed').length, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Percent size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((d) => (
          <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Tag size={20} /></div>
              <div>
                <p className="font-bold text-sm">{d.name}</p>
                <p className="text-xs text-slate-400">{d.type === 'percentage' ? `${d.value}%` : d.type === 'bogo' ? (isArabic ? 'اشتري 1 احصل على 1' : 'BOGO') : `${t('business.reports.currency')} ${d.value}`} · {d.appliesTo}{d.minOrder ? ` · ${isArabic ? 'حد أدنى' : 'Min'}: ${t('business.reports.currency')} ${d.minOrder}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${d.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{d.status === 'active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}</span>
              <Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
              <Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'خصم جديد' : 'New Discount'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم الخصم' : 'Discount name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'نسبة مئوية' : 'Percentage'}</option><option>{isArabic ? 'مبلغ ثابت' : 'Fixed'}</option><option>{isArabic ? 'اشتري 1 احصل على 1' : 'BOGO'}</option></select>
              <input type="number" placeholder={isArabic ? 'القيمة' : 'Value'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountsPage;
