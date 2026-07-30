import React, { useState } from 'react';
import { Bell, Plus, Search, X, Send, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type PushNotification = { id: string; title: string; body: string; sent: number; delivered: number; status: 'draft' | 'sent' | 'scheduled'; date: string };

const PushNotificationsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState<PushNotification[]>([
    { id: '1', title: isArabic ? 'عرض اليوم' : 'Today Offer', body: isArabic ? 'خصم 20% على كل المنتجات' : '20% off all products', sent: 300, delivered: 280, status: 'sent', date: '2026-07-28' },
    { id: '2', title: isArabic ? 'منتج جديد' : 'New Product', body: isArabic ? 'تصفح أحدث منتجاتنا' : 'Check our latest products', sent: 0, delivered: 0, status: 'scheduled', date: '2026-08-01' },
  ]);

  const filtered = notifications.filter(n => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الإشعارات' : 'Push Notifications'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إشعارات للعملاء' : 'Push notifications to customers'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'إشعار جديد' : 'New Notification'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الإشعارات' : 'Total Notifications', value: notifications.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'مرسلة' : 'Sent', value: notifications.filter(n => n.status === 'sent').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'مجدولة' : 'Scheduled', value: notifications.filter(n => n.status === 'scheduled').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'إجمالي المرسلة' : 'Total Sent', value: notifications.reduce((s, n) => s + n.sent, 0), color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Bell size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((n) => (
          <div key={n.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Bell size={20} /></div>
              <div><p className="font-bold text-sm">{n.title}</p><p className="text-xs text-slate-400">{n.body}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center"><p className="text-xs text-slate-400">{isArabic ? 'مرسلة' : 'Sent'}</p><p className="font-bold text-sm">{n.sent}</p></div>
              <div className="text-center"><p className="text-xs text-slate-400">{isArabic ? 'تم التسليم' : 'Delivered'}</p><p className="font-bold text-sm">{n.delivered}</p></div>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${n.status === 'sent' ? 'bg-green-100 text-green-600' : n.status === 'scheduled' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{n.status === 'sent' ? (isArabic ? 'مرسلة' : 'Sent') : n.status === 'scheduled' ? (isArabic ? 'مجدولة' : 'Scheduled') : (isArabic ? 'مسودة' : 'Draft')}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'إشعار جديد' : 'New Notification'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'العنوان' : 'Title'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <textarea placeholder={isArabic ? 'المحتوى' : 'Body'} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2"><Send size={16} /> {isArabic ? 'إرسال' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PushNotificationsPage;
