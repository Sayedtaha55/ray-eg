import React, { useState } from 'react';
import { Award, Plus, Search, Edit, Trash2, X, Star, Gift, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Program = { id: string; name: string; pointsPerCurrency: number; minPoints: number; reward: string; status: 'active' | 'inactive'; members: number };

const LoyaltyProgramsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([
    { id: '1', name: isArabic ? 'برنامج النقاط الذهبي' : 'Golden Points Program', pointsPerCurrency: 1, minPoints: 100, reward: isArabic ? 'خصم 10%' : '10% discount', status: 'active', members: 250 },
    { id: '2', name: isArabic ? 'برنامج العملاء الفضيين' : 'Silver Members', pointsPerCurrency: 0.5, minPoints: 50, reward: isArabic ? 'منتج مجاني' : 'Free product', status: 'active', members: 180 },
  ]);

  const filtered = programs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'برامج الولاء' : 'Loyalty Programs'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة برامج الولاء والمكافآت' : 'Manage loyalty and reward programs'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'برنامج جديد' : 'New Program'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي البرامج' : 'Total Programs', value: programs.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: programs.filter(p => p.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'إجمالي الأعضاء' : 'Total Members', value: programs.reduce((s, p) => s + p.members, 0), color: 'bg-purple-50 text-purple-600' },
          { label: isArabic ? 'متوسط الأعضاء' : 'Avg Members', value: programs.length ? Math.round(programs.reduce((s, p) => s + p.members, 0) / programs.length) : 0, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Award size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Crown size={20} /></div><div><p className="font-bold text-sm">{p.name}</p><p className="text-xs text-slate-400">{p.members} {isArabic ? 'عضو' : 'members'}</p></div></div>
              <div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-slate-400">{isArabic ? 'نقاط لكل' : 'Points per'} {t('business.reports.currency')}</span><span className="font-bold">{p.pointsPerCurrency}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">{isArabic ? 'حد الأدنى' : 'Min points'}</span><span className="font-bold">{p.minPoints}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-400">{isArabic ? 'المكافأة' : 'Reward'}</span><span className="font-bold text-green-600">{p.reward}</span></div>
            </div>
            <div className="mt-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{p.status === 'active' ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}</span></div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'برنامج جديد' : 'New Program'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم البرنامج' : 'Program name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="number" step="0.1" placeholder={isArabic ? 'نقاط لكل عملة' : 'Points per currency'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="number" placeholder={isArabic ? 'حد الأدنى للنقاط' : 'Min points'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'المكافأة' : 'Reward'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyProgramsPage;
