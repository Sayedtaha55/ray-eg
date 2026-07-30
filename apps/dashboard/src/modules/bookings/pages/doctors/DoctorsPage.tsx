import React, { useState } from 'react';
import { Stethoscope, Plus, Search, X, Star, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Doctor = { id: string; name: string; specialty: string; phone: string; email: string; rating: number; status: 'available' | 'busy' | 'off'; appointments: number };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  available: { ar: 'متاح', en: 'Available', color: 'text-green-600', bg: 'bg-green-100' },
  busy: { ar: 'مشغول', en: 'Busy', color: 'text-amber-600', bg: 'bg-amber-100' },
  off: { ar: 'إجازة', en: 'Off', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const DoctorsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: '1', name: 'Dr. Ahmed Hassan', specialty: isArabic ? 'قلب' : 'Cardiology', phone: '01000000000', email: 'ahmed@clinic.com', rating: 4.8, status: 'available', appointments: 120 },
    { id: '2', name: 'Dr. Sara Ali', specialty: isArabic ? 'أسنان' : 'Dental', phone: '01100000000', email: 'sara@clinic.com', rating: 4.9, status: 'busy', appointments: 95 },
    { id: '3', name: 'Dr. Omar Khaled', specialty: isArabic ? 'عظام' : 'Orthopedics', phone: '01200000000', email: 'omar@clinic.com', rating: 4.5, status: 'off', appointments: 60 },
  ]);

  const filtered = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الأطباء' : 'Doctors'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة الأطباء والمختصين' : 'Manage doctors and specialists'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'طبيب جديد' : 'New Doctor'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الأطباء' : 'Total Doctors', value: doctors.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'متاحون' : 'Available', value: doctors.filter(d => d.status === 'available').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'مشغولون' : 'Busy', value: doctors.filter(d => d.status === 'busy').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'إجمالي المواعيد' : 'Total Appointments', value: doctors.reduce((s, d) => s + d.appointments, 0), color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Stethoscope size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => {
          const st = STATUS_STYLES[d.status] || STATUS_STYLES.available;
          return (
            <div key={d.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">{d.name.charAt(4)}</div>
                  <div>
                    <p className="font-bold text-sm">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.specialty}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <p className="flex items-center gap-2"><Phone size={12} /> {d.phone}</p>
                <p className="flex items-center gap-2"><Mail size={12} /> {d.email}</p>
                <p className="flex items-center gap-2"><Star size={12} className="fill-amber-400 text-amber-400" /> {d.rating} · {d.appointments} {isArabic ? 'موعد' : 'appointments'}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'طبيب جديد' : 'New Doctor'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'الاسم' : 'Name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'التخصص' : 'Specialty'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'الهاتف' : 'Phone'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'البريد' : 'Email'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
