import React, { useState } from 'react';
import { Megaphone, Plus, Search, Edit, Trash2, X, Calendar, Eye, MousePointerClick } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Campaign = { id: string; name: string; channel: 'email' | 'sms' | 'social' | 'push'; status: 'draft' | 'active' | 'completed' | 'scheduled'; sent: number; opened: number; clicked: number; startDate: string; endDate: string };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  active: { ar: 'نشطة', en: 'Active', color: 'text-green-600', bg: 'bg-green-100' },
  completed: { ar: 'منتهية', en: 'Completed', color: 'text-blue-600', bg: 'bg-blue-100' },
  scheduled: { ar: 'مجدولة', en: 'Scheduled', color: 'text-amber-600', bg: 'bg-amber-100' },
};

const CHANNEL_LABELS: Record<string, { ar: string; en: string }> = {
  email: { ar: 'بريد إلكتروني', en: 'Email' }, sms: { ar: 'رسائل', en: 'SMS' }, social: { ar: 'سوشيال', en: 'Social' }, push: { ar: 'إشعارات', en: 'Push' },
};

const CampaignsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    { id: '1', name: isArabic ? 'حملة الصيف' : 'Summer Campaign', channel: 'email', status: 'active', sent: 500, opened: 320, clicked: 150, startDate: '2026-07-01', endDate: '2026-08-31' },
    { id: '2', name: isArabic ? 'عرض الجمعة البيضاء' : 'Black Friday', channel: 'sms', status: 'completed', sent: 1000, opened: 800, clicked: 400, startDate: '2026-06-15', endDate: '2026-06-30' },
    { id: '3', name: isArabic ? 'حملة العملاء الجدد' : 'New Customers', channel: 'push', status: 'scheduled', sent: 0, opened: 0, clicked: 0, startDate: '2026-08-01', endDate: '2026-08-15' },
  ]);

  const filtered = campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const avgOpenRate = campaigns.length ? Math.round(campaigns.reduce((s, c) => s + (c.sent ? (c.opened / c.sent) * 100 : 0), 0) / campaigns.length) : 0;

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الحملات' : 'Campaigns'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة الحملات التسويقية' : 'Manage marketing campaigns'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'حملة جديدة' : 'New Campaign'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الحملات' : 'Total Campaigns', value: campaigns.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: campaigns.filter(c => c.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'إجمالي المرسلة' : 'Total Sent', value: campaigns.reduce((s, c) => s + c.sent, 0).toLocaleString(), color: 'bg-purple-50 text-purple-600' },
          { label: isArabic ? 'متوسط الفتح' : 'Avg Open Rate', value: avgOpenRate + '%', color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Megaphone size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const st = STATUS_STYLES[c.status] || STATUS_STYLES.draft;
          const ch = CHANNEL_LABELS[c.channel] || CHANNEL_LABELS.email;
          const openRate = c.sent ? Math.round((c.opened / c.sent) * 100) : 0;
          const clickRate = c.sent ? Math.round((c.clicked / c.sent) * 100) : 0;
          return (
            <div key={c.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Megaphone size={20} /></div><div><p className="font-bold text-sm">{c.name}</p><p className="text-xs text-slate-400">{isArabic ? ch.ar : ch.en}</p></div></div>
                <div className="flex items-center gap-2"><Edit size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="p-2 rounded-xl bg-slate-50"><p className="text-xs text-slate-400">{isArabic ? 'أرسلت' : 'Sent'}</p><p className="font-black text-sm">{c.sent}</p></div>
                <div className="p-2 rounded-xl bg-slate-50"><p className="text-xs text-slate-400">{isArabic ? 'فتحت' : 'Opened'}</p><p className="font-black text-sm">{openRate}%</p></div>
                <div className="p-2 rounded-xl bg-slate-50"><p className="text-xs text-slate-400">{isArabic ? 'نقرت' : 'Clicked'}</p><p className="font-black text-sm">{clickRate}%</p></div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={10} /> {new Date(c.startDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'حملة جديدة' : 'New Campaign'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم الحملة' : 'Campaign name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'بريد إلكتروني' : 'Email'}</option><option>{isArabic ? 'رسائل' : 'SMS'}</option><option>{isArabic ? 'إشعارات' : 'Push'}</option></select>
              <div className="grid grid-cols-2 gap-3"><input type="date" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /><input type="date" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
