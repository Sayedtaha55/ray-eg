import React, { useState } from 'react';
import { MessageSquare, Send, Search, X, Mail, Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Message = { id: string; customerName: string; phone: string; message: string; date: string; direction: 'outgoing' | 'incoming'; status: 'sent' | 'delivered' | 'read' };

const MessagesPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', customerName: 'Ahmed', phone: '01000000000', message: isArabic ? 'مرحباً، طلبك جاهز للاستلام' : 'Hello, your order is ready', date: '2026-07-28', direction: 'outgoing', status: 'read' },
    { id: '2', customerName: 'Sara', phone: '01100000000', message: isArabic ? 'هل المنتج متوفر؟' : 'Is the product available?', date: '2026-07-28', direction: 'incoming', status: 'read' },
    { id: '3', customerName: 'Omar', phone: '01200000000', message: isArabic ? 'شكراً لكم' : 'Thank you', date: '2026-07-27', direction: 'incoming', status: 'delivered' },
  ]);

  const filtered = messages.filter(m => m.customerName.toLowerCase().includes(search.toLowerCase()) || m.message.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الرسائل' : 'Messages'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'مراسلات العملاء' : 'Customer messages'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Send size={18} /> {isArabic ? 'رسالة جديدة' : 'New Message'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الرسائل' : 'Total Messages', value: messages.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'واردة' : 'Incoming', value: messages.filter(m => m.direction === 'incoming').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'صادرة' : 'Outgoing', value: messages.filter(m => m.direction === 'outgoing').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'تمت القراءة' : 'Read', value: messages.filter(m => m.status === 'read').length, color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><MessageSquare size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((m) => (
          <div key={m.id} className={`flex items-start gap-3 p-4 rounded-2xl border ${m.direction === 'incoming' ? 'border-blue-100 bg-blue-50/30' : 'border-slate-100'}`}>
            <div className={`p-2 rounded-xl ${m.direction === 'incoming' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}><MessageSquare size={20} /></div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-sm">{m.customerName} <span className="text-xs font-normal text-slate-400">{m.phone}</span></p>
                <span className="text-xs text-slate-400">{new Date(m.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
              </div>
              <p className="text-sm text-slate-600">{m.message}</p>
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${m.status === 'read' ? 'bg-green-100 text-green-600' : m.status === 'delivered' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{m.status === 'read' ? (isArabic ? 'مقروء' : 'Read') : m.status === 'delivered' ? (isArabic ? 'تم التسليم' : 'Delivered') : (isArabic ? 'مرسل' : 'Sent')}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'رسالة جديدة' : 'New Message'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <textarea placeholder={isArabic ? 'الرسالة' : 'Message'} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إرسال' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
