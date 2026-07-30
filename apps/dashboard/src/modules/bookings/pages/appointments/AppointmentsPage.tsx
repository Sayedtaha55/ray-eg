import React, { useState } from 'react';
import { CalendarCheck, Plus, Search, X, Clock, User, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Appointment = { id: string; customerName: string; service: string; date: string; time: string; duration: string; status: 'confirmed' | 'pending' | 'cancelled' | 'completed'; notes: string };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  confirmed: { ar: 'مؤكد', en: 'Confirmed', color: 'text-green-600', bg: 'bg-green-100' },
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'text-blue-600', bg: 'bg-blue-100' },
};

const AppointmentsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', customerName: 'Ahmed', service: isArabic ? 'كشف عام' : 'General checkup', date: '2026-07-30', time: '10:00', duration: '30 min', status: 'confirmed', notes: '' },
    { id: '2', customerName: 'Sara', service: isArabic ? 'استشارة' : 'Consultation', date: '2026-07-30', time: '11:30', duration: '45 min', status: 'pending', notes: isArabic ? 'حالة خاصة' : 'Special case' },
    { id: '3', customerName: 'Omar', service: isArabic ? 'متابعة' : 'Follow-up', date: '2026-07-29', time: '14:00', duration: '20 min', status: 'completed', notes: '' },
  ]);

  const filtered = appointments.filter(a => a.customerName.toLowerCase().includes(search.toLowerCase()) || a.service.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'المواعيد' : 'Appointments'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة المواعيد والحجوزات' : 'Manage appointments and bookings'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'موعد جديد' : 'New Appointment'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي المواعيد' : 'Total Appointments', value: appointments.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'مؤكدة' : 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'قيد الانتظار' : 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'مكتملة' : 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: 'bg-blue-50 text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><CalendarCheck size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((a) => {
          const st = STATUS_STYLES[a.status] || STATUS_STYLES.pending;
          return (
            <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><CalendarCheck size={20} /></div>
                <div>
                  <p className="font-bold text-sm">{a.customerName} · {a.service}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-2"><Calendar size={10} /> {new Date(a.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')} <Clock size={10} /> {a.time} ({a.duration})</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'موعد جديد' : 'New Appointment'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'الخدمة' : 'Service'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <div className="grid grid-cols-2 gap-3"><input type="date" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /><input type="time" className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <input placeholder={isArabic ? 'المدة' : 'Duration'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
