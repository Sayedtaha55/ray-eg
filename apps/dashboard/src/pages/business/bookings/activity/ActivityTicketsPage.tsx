/**
 * ═══════════════════════════════════════════
 * activity/ActivityTicketsPage.tsx
 * إدارة التذاكر والسعات
 * يُستخدم في: فعاليات وقاعات
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Ticket, Plus, Search, Edit2, Trash2, DollarSign, Users } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { useTranslation } from 'react-i18next';

type TicketType = {
  id: string;
  name: string;
  price: number;
  totalSeats: number;
  soldSeats: number;
  eventName?: string;
  isActive: boolean;
};

type Props = { activityType: BookingActivityType };

const ActivityTicketsPage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const [tickets, setTickets] = useState<TicketType[]>([
    { id: '1', name: 'تذكرة عادية', price: 100, totalSeats: 200, soldSeats: 145, eventName: 'حفل الافتتاح', isActive: true },
    { id: '2', name: 'تذكرة VIP', price: 350, totalSeats: 50, soldSeats: 48, eventName: 'حفل الافتتاح', isActive: true },
    { id: '3', name: 'دخول حر', price: 0, totalSeats: 100, soldSeats: 30, eventName: 'معرض فني', isActive: true },
    { id: '4', name: 'تذكرة عائلية', price: 250, totalSeats: 30, soldSeats: 0, eventName: 'يوم العائلة', isActive: false },
  ]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', totalSeats: '', eventName: '' });

  const handleAdd = () => {
    if (!form.name.trim() || !form.totalSeats) return;
    setTickets(prev => [{
      id: Date.now().toString(), name: form.name, price: Number(form.price) || 0,
      totalSeats: Number(form.totalSeats), soldSeats: 0,
      eventName: form.eventName || undefined, isActive: true,
    }, ...prev]);
    setForm({ name: '', price: '', totalSeats: '', eventName: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setTickets(prev => prev.filter(t => t.id !== id));
  const toggleActive = (id: string) => setTickets(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || (t.eventName || '').toLowerCase().includes(q);
  });

  const totalRevenue = tickets.filter(t => t.isActive).reduce((s, t) => s + (t.price * t.soldSeats), 0);
  const totalSold = tickets.filter(t => t.isActive).reduce((s, t) => s + t.soldSeats, 0);

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <Ticket className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{isEn ? 'Tickets & Seating' : 'التذاكر والسعات'}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{totalSold} {isEn ? 'tickets sold' : 'تذكرة مباعة'} • {totalRevenue.toLocaleString()} {isEn ? 'EGP revenue' : 'ج.م إيرادات'}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> {isEn ? 'Add Ticket' : 'إضافة تذكرة'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Add Ticket Type' : 'إضافة نوع تذكرة'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Ticket Type *' : 'نوع التذكرة *'}</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={isEn ? 'e.g. VIP Ticket' : 'مثال: تذكرة VIP'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Price (EGP)' : 'السعر (ج.م)'}</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Total Seats *' : 'عدد المقاعد *'}</label>
              <input type="number" value={form.totalSeats} onChange={e => setForm(f => ({ ...f, totalSeats: e.target.value }))}
                placeholder="200" min="1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Event' : 'الفعالية'}</label>
              <input type="text" value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))}
                placeholder={isEn ? 'e.g. Opening Ceremony' : 'مثال: حفل الافتتاح'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">{isEn ? 'Cancel' : 'إلغاء'}</button>
            <button onClick={handleAdd} disabled={!form.name.trim() || !form.totalSeats}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">{isEn ? 'Save' : 'حفظ'}</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder={isEn ? 'Search tickets...' : 'ابحث في التذاكر...'} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <Ticket className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{isEn ? 'No tickets added yet' : 'لم تضف تذاكر بعد'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {filtered.map(ticket => {
            const pct = ticket.totalSeats > 0 ? (ticket.soldSeats / ticket.totalSeats) * 100 : 0;
            return (
              <div key={ticket.id} className={`bg-white rounded-[2rem] border shadow-sm p-5 space-y-3 hover:shadow-md transition-all ${ticket.isActive ? 'border-slate-100' : 'border-red-100 opacity-60'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-black text-slate-900">{ticket.name}</div>
                    {ticket.eventName && <div className="text-xs text-cyan-600 font-bold mt-0.5">{ticket.eventName}</div>}
                  </div>
                  <button onClick={() => toggleActive(ticket.id)}
                    className={`text-xs font-black px-2.5 py-1 rounded-full ${ticket.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {ticket.isActive ? (isEn ? 'Active' : 'نشط') : (isEn ? 'Disabled' : 'معطل')}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    <DollarSign size={13} /> {ticket.price} {isEn ? 'EGP' : 'ج.م'}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                    <Users size={11} /> {ticket.soldSeats}/{ticket.totalSeats}
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                    <Edit2 size={12} /> {isEn ? 'Edit' : 'تعديل'}
                  </button>
                  <button onClick={() => handleDelete(ticket.id)}
                    className="py-2 px-3 rounded-xl border border-red-100 text-xs font-black text-red-500 hover:bg-red-50 flex items-center justify-center gap-1.5">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTicketsPage;
