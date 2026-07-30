import React, { useState } from 'react';
import { Ticket, Plus, Search, Edit, Trash2, X, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Coupon = { id: string; code: string; type: 'percentage' | 'fixed'; value: number; usageLimit: number; used: number; status: 'active' | 'expired' | 'disabled'; validFrom: string; validUntil: string };

const CouponsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: '1', code: 'SUMMER20', type: 'percentage', value: 20, usageLimit: 100, used: 45, status: 'active', validFrom: '2026-07-01', validUntil: '2026-08-31' },
    { id: '2', code: 'WELCOME50', type: 'fixed', value: 50, usageLimit: 200, used: 120, status: 'active', validFrom: '2026-06-01', validUntil: '2026-12-31' },
    { id: '3', code: 'FLASH10', type: 'percentage', value: 10, usageLimit: 50, used: 50, status: 'expired', validFrom: '2026-05-01', validUntil: '2026-06-30' },
  ]);

  const filtered = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));
  const copyCode = (code: string) => { navigator.clipboard?.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 2000); };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الكوبونات' : 'Coupons'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة كوبونات الخصم' : 'Manage discount coupons'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'كوبون جديد' : 'New Coupon'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الكوبونات' : 'Total Coupons', value: coupons.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: coupons.filter(c => c.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'منتهية' : 'Expired', value: coupons.filter(c => c.status === 'expired').length, color: 'bg-red-50 text-red-600' },
          { label: isArabic ? 'إجمالي الاستخدام' : 'Total Used', value: coupons.reduce((s, c) => s + c.used, 0), color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Ticket size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث بكود الكوبون...' : 'Search by coupon code...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Ticket size={20} /></div>
                <div><p className="font-mono font-black text-sm">{c.code}</p><p className="text-xs text-slate-400">{c.type === 'percentage' ? `${c.value}%` : `${t('business.reports.currency')} ${c.value}`} {isArabic ? 'خصم' : 'off'}</p></div>
              </div>
              <button onClick={() => copyCode(c.code)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">{copied === c.code ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-400" />}</button>
            </div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">{isArabic ? 'الاستخدام' : 'Usage'}: {c.used}/{c.usageLimit}</span>
              <div className="flex-1 mx-2 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min((c.used / c.usageLimit) * 100, 100)}%` }} /></div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${c.status === 'active' ? 'bg-green-100 text-green-600' : c.status === 'expired' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>{c.status === 'active' ? (isArabic ? 'نشط' : 'Active') : c.status === 'expired' ? (isArabic ? 'منتهي' : 'Expired') : (isArabic ? 'معطل' : 'Disabled')}</span>
              <div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'كوبون جديد' : 'New Coupon'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'كود الكوبون' : 'Coupon code'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'نسبة مئوية' : 'Percentage'}</option><option>{isArabic ? 'مبلغ ثابت' : 'Fixed amount'}</option></select>
              <input type="number" placeholder={isArabic ? 'القيمة' : 'Value'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="number" placeholder={isArabic ? 'حد الاستخدام' : 'Usage limit'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
