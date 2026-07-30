import React, { useState } from 'react';
import { ShoppingCart, Plus, Search, Eye, Loader2, X, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type PurchaseOrder = { id: string; poNumber: string; supplier: string; items: number; total: number; status: 'draft' | 'sent' | 'received' | 'partial' | 'cancelled'; date: string; expectedDate: string };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  sent: { ar: 'مرسلة', en: 'Sent', color: 'text-blue-600', bg: 'bg-blue-100' },
  received: { ar: 'استلامت', en: 'Received', color: 'text-green-600', bg: 'bg-green-100' },
  partial: { ar: 'استلام جزئي', en: 'Partial', color: 'text-amber-600', bg: 'bg-amber-100' },
  cancelled: { ar: 'ملغاة', en: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100' },
};

const PurchaseOrdersPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState<PurchaseOrder[]>([
    { id: '1', poNumber: 'PO-001', supplier: isArabic ? 'مورد رئيسي' : 'Main Supplier', items: 15, total: 5000, status: 'received', date: '2026-07-20', expectedDate: '2026-07-25' },
    { id: '2', poNumber: 'PO-002', supplier: isArabic ? 'مورد إلكترونيات' : 'Electronics Supplier', items: 30, total: 12000, status: 'sent', date: '2026-07-28', expectedDate: '2026-08-05' },
    { id: '3', poNumber: 'PO-003', supplier: isArabic ? 'مورد ملابس' : 'Clothing Supplier', items: 50, total: 8000, status: 'partial', date: '2026-07-15', expectedDate: '2026-07-22' },
  ]);

  const filtered = orders.filter(o => o.poNumber.toLowerCase().includes(search.toLowerCase()) || o.supplier.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'أوامر الشراء' : 'Purchase Orders'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة أوامر شراء المخزون' : 'Manage inventory purchase orders'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'أمر شراء جديد' : 'New PO'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الأوامر' : 'Total POs', value: orders.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'استلامت' : 'Received', value: orders.filter(o => o.status === 'received').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'مرسلة' : 'Sent', value: orders.filter(o => o.status === 'sent').length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'إجمالي القيمة' : 'Total Value', value: `${t('business.reports.currency')} ${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}`, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><ShoppingCart size={20} /></div>
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
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'رقم الأمر الشراء' : 'PO #'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المورد' : 'Supplier'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العناصر' : 'Items'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الإجمالي' : 'Total'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'تاريخ التسليم' : 'Expected'}</th>
          </tr></thead>
          <tbody>
            {filtered.map((o) => {
              const st = STATUS_STYLES[o.status] || STATUS_STYLES.draft;
              return (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-bold">{o.poNumber}</td>
                  <td className="py-3 font-medium">{o.supplier}</td>
                  <td className="py-3 text-slate-500">{o.items}</td>
                  <td className="py-3 font-bold">{t('business.reports.currency')} {o.total.toLocaleString()}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span></td>
                  <td className="py-3 text-slate-500">{new Date(o.expectedDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'أمر شراء جديد' : 'New Purchase Order'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'المورد' : 'Supplier'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" placeholder={isArabic ? 'تاريخ التسليم المتوقع' : 'Expected date'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
