import React, { useState } from 'react';
import { Warehouse, Plus, Search, Edit, Trash2, Loader2, X, MapPin, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type WarehouseItem = { id: string; name: string; location: string; capacity: number; used: number; manager: string; phone: string };

const WarehousesPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([
    { id: '1', name: isArabic ? 'المخزن الرئيسي' : 'Main Warehouse', location: isArabic ? 'القاهرة' : 'Cairo', capacity: 5000, used: 3200, manager: 'Ahmed', phone: '01000000000' },
  { id: '2', name: isArabic ? 'مخزن الفرع' : 'Branch Warehouse', location: isArabic ? 'الجيزة' : 'Giza', capacity: 2000, used: 800, manager: 'Sara', phone: '01100000000' },
  { id: '3', name: isArabic ? 'مخزن الإسكندرية' : 'Alex Warehouse', location: isArabic ? 'الإسكندرية' : 'Alexandria', capacity: 3000, used: 1500, manager: 'Omar', phone: '01200000000' },
  ]);

  const filtered = warehouses.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'المخازن' : 'Warehouses'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة مخازن المنتجات' : 'Manage product warehouses'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'مخزن جديد' : 'New Warehouse'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي المخازن' : 'Total Warehouses', value: warehouses.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'السعة الإجمالية' : 'Total Capacity', value: warehouses.reduce((s, w) => s + w.capacity, 0).toLocaleString(), color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'المستخدم' : 'Used Space', value: warehouses.reduce((s, w) => s + w.used, 0).toLocaleString(), color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'المتاح' : 'Available', value: (warehouses.reduce((s, w) => s + w.capacity, 0) - warehouses.reduce((s, w) => s + w.used, 0)).toLocaleString(), color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Warehouse size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((w) => {
          const usage = Math.round((w.used / w.capacity) * 100);
          return (
            <div key={w.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Warehouse size={20} /></div><div><p className="font-bold text-sm">{w.name}</p><p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10} /> {w.location}</p></div></div>
                <div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1"><span className="font-bold text-slate-400">{isArabic ? 'الاستخدام' : 'Usage'}</span><span className="font-bold">{usage}%</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${usage > 80 ? 'bg-red-500' : usage > 50 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${usage}%` }} /></div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400"><span>{w.used} / {w.capacity} {isArabic ? 'وحدة' : 'units'}</span><span>{w.manager}</span></div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'مخزن جديد' : 'New Warehouse'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم المخزن' : 'Warehouse name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'الموقع' : 'Location'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="number" placeholder={isArabic ? 'السعة' : 'Capacity'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;
