import React, { useState } from 'react';
import { Wallet, Plus, Search, Edit, Trash2, X, ArrowUpRight, ArrowDownRight, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type WalletItem = { id: string; name: string; type: 'cash' | 'bank' | 'mobile' | 'card'; balance: number; currency: string; number?: string; status: 'active' | 'inactive' };

const TYPE_ICONS: Record<string, React.ReactNode> = {
  cash: <Wallet size={20} />, bank: <Wallet size={20} />, mobile: <Smartphone size={20} />, card: <Wallet size={20} />,
};

const WalletsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [wallets, setWallets] = useState<WalletItem[]>([
    { id: '1', name: isArabic ? 'الصندوق' : 'Cash Box', type: 'cash', balance: 5000, currency: 'EGP', status: 'active' },
    { id: '2', name: isArabic ? 'حساب البنك' : 'Bank Account', type: 'bank', balance: 25000, currency: 'EGP', number: '****1234', status: 'active' },
    { id: '3', name: isArabic ? 'فودافون كاش' : 'Vodafone Cash', type: 'mobile', balance: 3000, currency: 'EGP', number: '01000000000', status: 'active' },
  ]);

  const filtered = wallets.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'المحافظ' : 'Wallets'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة محافظ وأرصدة النقد' : 'Manage cash wallets and balances'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'محفظة جديدة' : 'New Wallet'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي المحافظ' : 'Total Wallets', value: wallets.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'إجمالي الرصيد' : 'Total Balance', value: `${t('business.reports.currency')} ${totalBalance.toLocaleString()}`, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: wallets.filter(w => w.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'أكبر رصيد' : 'Largest Balance', value: `${t('business.reports.currency')} ${Math.max(...wallets.map(w => w.balance), 0).toLocaleString()}`, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Wallet size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((w) => (
          <div key={w.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-blue-50 text-blue-600">{TYPE_ICONS[w.type]}</div><div><p className="font-bold text-sm">{w.name}</p><p className="text-xs text-slate-400">{w.number || w.currency}</p></div></div>
              <div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div>
            </div>
            <p className="text-2xl font-black">{t('business.reports.currency')} {w.balance.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${w.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{w.status === 'active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'محفظة جديدة' : 'New Wallet'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'الاسم' : 'Name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'كاش' : 'Cash'}</option><option>{isArabic ? 'بنك' : 'Bank'}</option><option>{isArabic ? 'محفظة موبايل' : 'Mobile'}</option><option>{isArabic ? 'بطاقة' : 'Card'}</option></select>
              <input type="number" placeholder={isArabic ? 'الرصيد الافتتاحي' : 'Opening balance'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletsPage;
