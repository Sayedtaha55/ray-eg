import React, { useState } from 'react';
import { Shield, Plus, Search, X, Lock, Unlock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Permission = { id: string; name: string; role: string; permissions: string[]; users: number; status: 'active' | 'inactive' };

const PermissionsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState<Permission[]>([
    { id: '1', name: isArabic ? 'مدير' : 'Manager', role: 'manager', permissions: ['all'], users: 2, status: 'active' },
    { id: '2', name: isArabic ? 'موظف مبيعات' : 'Sales Staff', role: 'sales', permissions: ['orders', 'products', 'customers'], users: 5, status: 'active' },
    { id: '3', name: isArabic ? 'محاسب' : 'Accountant', role: 'accountant', permissions: ['finance', 'reports'], users: 1, status: 'active' },
  ]);

  const filtered = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الصلاحيات' : 'Permissions'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة الأدوار والصلاحيات' : 'Manage roles and permissions'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'دور جديد' : 'New Role'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الأدوار' : 'Total Roles', value: roles.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: roles.filter(r => r.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'إجمالي المستخدمين' : 'Total Users', value: roles.reduce((s, r) => s + r.users, 0), color: 'bg-purple-50 text-purple-600' },
          { label: isArabic ? 'صلاحيات كاملة' : 'Full Access', value: roles.filter(r => r.permissions.includes('all')).length, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Shield size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Shield size={20} /></div>
              <div>
                <p className="font-bold text-sm">{r.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {r.permissions.map(p => <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-bold">{p}</span>)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 flex items-center gap-1"><User size={12} /> {r.users}</span>
              {r.permissions.includes('all') ? <Lock size={16} className="text-amber-500" /> : <Unlock size={16} className="text-green-500" />}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'دور جديد' : 'New Role'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم الدور' : 'Role name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <div className="space-y-2">
                {['orders', 'products', 'customers', 'finance', 'reports', 'settings'].map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" /> {p}</label>
                ))}
              </div>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
