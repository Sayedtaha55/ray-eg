import React, { useState } from 'react';
import { Globe, Plus, Search, X, CheckCircle2, AlertCircle, ExternalLink, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Domain = { id: string; domain: string; status: 'active' | 'pending' | 'expired'; ssl: boolean; expiresAt: string; primary: boolean };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'text-green-600', bg: 'bg-green-100' },
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  expired: { ar: 'منتهي', en: 'Expired', color: 'text-red-600', bg: 'bg-red-100' },
};

const DomainsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([
    { id: '1', domain: 'mystore.com', status: 'active', ssl: true, expiresAt: '2027-07-28', primary: true },
    { id: '2', domain: 'mystore.net', status: 'active', ssl: true, expiresAt: '2026-12-15', primary: false },
    { id: '3', domain: 'mystore-shop.com', status: 'pending', ssl: false, expiresAt: '---', primary: false },
  ]);

  const filtered = domains.filter(d => d.domain.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'النطاقات' : 'Domains'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة نطاقات الموقع' : 'Manage website domains'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'ربط نطاق' : 'Connect Domain'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي النطاقات' : 'Total Domains', value: domains.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: domains.filter(d => d.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'قيد الانتظار' : 'Pending', value: domains.filter(d => d.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'مع SSL' : 'With SSL', value: domains.filter(d => d.ssl).length, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Globe size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((d) => {
          const st = STATUS_STYLES[d.status] || STATUS_STYLES.active;
          return (
            <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Globe size={20} /></div>
                <div>
                  <p className="font-bold text-sm flex items-center gap-2">{d.domain} {d.primary && <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 text-xs font-bold">{isArabic ? 'رئيسي' : 'Primary'}</span>}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-2"><Server size={10} /> {isArabic ? 'ينتهي' : 'Expires'}: {d.expiresAt !== '---' ? new Date(d.expiresAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US') : '---'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {d.ssl ? <CheckCircle2 size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-amber-500" />}
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
                <ExternalLink size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'ربط نطاق' : 'Connect Domain'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم النطاق' : 'Domain name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono" />
              <p className="text-xs text-slate-400">{isArabic ? 'سيتم توجيه النطاق إلى موقعك تلقائياً' : 'The domain will be automatically pointed to your site'}</p>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'ربط' : 'Connect'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainsPage;
