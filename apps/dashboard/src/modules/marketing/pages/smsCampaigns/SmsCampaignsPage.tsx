import React, { useState } from 'react';
import { MessageCircle, Plus, Search, X, Send, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type SmsCampaign = { id: string; message: string; recipients: number; delivered: number; status: 'draft' | 'sent' | 'scheduled'; date: string; cost: number };

const SmsCampaignsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [campaigns, setCampaigns] = useState<SmsCampaign[]>([
    { id: '1', message: isArabic ? 'عرض خاص: خصم 20% اليوم فقط' : 'Special offer: 20% off today only', recipients: 500, delivered: 480, status: 'sent', date: '2026-07-28', cost: 75 },
    { id: '2', message: isArabic ? 'طلبك جاهز للاستلام' : 'Your order is ready for pickup', recipients: 100, delivered: 95, status: 'sent', date: '2026-07-27', cost: 15 },
  ]);

  const filtered = campaigns.filter(c => c.message.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'حملات SMS' : 'SMS Campaigns'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'حملات الرسائل النصية' : 'SMS marketing campaigns'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'حملة جديدة' : 'New Campaign'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الحملات' : 'Total Campaigns', value: campaigns.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'مرسلة' : 'Sent', value: campaigns.filter(c => c.status === 'sent').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'إجمالي المستلمين' : 'Total Recipients', value: campaigns.reduce((s, c) => s + c.recipients, 0), color: 'bg-purple-50 text-purple-600' },
          { label: isArabic ? 'إجمالي التكلفة' : 'Total Cost', value: `${t('business.reports.currency')} ${campaigns.reduce((s, c) => s + c.cost, 0)}`, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><MessageCircle size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((c) => (
          <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Smartphone size={20} /></div>
              <div className="max-w-md"><p className="font-bold text-sm truncate">{c.message}</p><p className="text-xs text-slate-400">{new Date(c.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')} · {isArabic ? 'تكلفة' : 'Cost'}: {t('business.reports.currency')} {c.cost}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center"><p className="text-xs text-slate-400">{isArabic ? 'مرسلة' : 'Sent'}</p><p className="font-bold text-sm">{c.recipients}</p></div>
              <div className="text-center"><p className="text-xs text-slate-400">{isArabic ? 'تم التسليم' : 'Delivered'}</p><p className="font-bold text-sm">{c.delivered}</p></div>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${c.status === 'sent' ? 'bg-green-100 text-green-600' : c.status === 'scheduled' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{c.status === 'sent' ? (isArabic ? 'مرسلة' : 'Sent') : c.status === 'scheduled' ? (isArabic ? 'مجدولة' : 'Scheduled') : (isArabic ? 'مسودة' : 'Draft')}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'حملة جديدة' : 'New Campaign'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <textarea placeholder={isArabic ? 'نص الرسالة' : 'Message text'} rows={3} maxLength={160} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <p className="text-xs text-slate-400 text-right">160 / 160</p>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2"><Send size={16} /> {isArabic ? 'إرسال' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsCampaignsPage;
