import React, { useState } from 'react';
import { Truck, Plus, Search, Edit, Trash2, Phone, Mail, X, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Supplier = { id: string; name: string; contact: string; phone: string; email: string; products: number; totalOrders: number; status: 'active' | 'inactive' };

const SuppliersPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: '1', name: isArabic ? 'مورد رئيسي' : 'Main Supplier', contact: 'Ahmed', phone: '01000000000', email: 'main@supplier.com', products: 45, totalOrders: 120, status: 'active' },
    { id: '2', name: isArabic ? 'مورد الإلكترونيات' : 'Electronics Supplier', contact: 'Sara', phone: '01100000000', email: 'elec@supplier.com', products: 30, totalOrders: 80, status: 'active' },
    { id: '3', name: isArabic ? 'مورد ملابس' : 'Clothing Supplier', contact: 'Omar', phone: '01200000000', email: 'clothes@supplier.com', products: 60, totalOrders: 200, status: 'inactive' },
  ]);

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.contact.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الموردين' : 'Suppliers'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة الموردين وجهات الاتصال' : 'Manage suppliers and contacts'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'مورد جديد' : 'New Supplier'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الموردين' : 'Total Suppliers', value: suppliers.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشط' : 'Active', value: suppliers.filter(s => s.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'إجمالي المنتجات' : 'Total Products', value: suppliers.reduce((s, x) => s + x.products, 0), color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'إجمالي الطلبات' : 'Total Orders', value: suppliers.reduce((s, x) => s + x.totalOrders, 0), color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Truck size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div key={s.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Truck size={20} /></div><div><p className="font-bold text-sm">{s.name}</p><p className="text-xs text-slate-400">{s.contact}</p></div></div>
              <div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div>
            </div>
            <div className="space-y-1 text-xs text-slate-500">
              <p className="flex items-center gap-2"><Phone size={12} /> {s.phone}</p>
              <p className="flex items-center gap-2"><Mail size={12} /> {s.email}</p>
              <p className="flex items-center gap-2"><Package size={12} /> {s.products} {isArabic ? 'منتج' : 'products'} · {s.totalOrders} {isArabic ? 'طلب' : 'orders'}</p>
            </div>
            <div className="mt-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${s.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{s.status === 'active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}</span></div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'مورد جديد' : 'New Supplier'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم المورد' : 'Supplier name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'جهة الاتصال' : 'Contact person'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'الهاتف' : 'Phone'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'البريد الإلكتروني' : 'Email'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
