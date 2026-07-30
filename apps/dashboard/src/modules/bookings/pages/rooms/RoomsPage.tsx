import React, { useState } from 'react';
import { DoorOpen, Plus, Search, X, Users, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Room = { id: string; name: string; type: string; capacity: number; status: 'available' | 'occupied' | 'maintenance'; floor: string };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  available: { ar: 'متاح', en: 'Available', color: 'text-green-600', bg: 'bg-green-100' },
  occupied: { ar: 'مشغول', en: 'Occupied', color: 'text-red-600', bg: 'bg-red-100' },
  maintenance: { ar: 'صيانة', en: 'Maintenance', color: 'text-amber-600', bg: 'bg-amber-100' },
};

const RoomsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: isArabic ? 'غرفة 101' : 'Room 101', type: isArabic ? 'فحص' : 'Examination', capacity: 1, status: 'available', floor: '1st' },
    { id: '2', name: isArabic ? 'غرفة 102' : 'Room 102', type: isArabic ? 'علاج' : 'Treatment', capacity: 2, status: 'occupied', floor: '1st' },
    { id: '3', name: isArabic ? 'غرفة 201' : 'Room 201', type: isArabic ? 'استشارة' : 'Consultation', capacity: 1, status: 'available', floor: '2nd' },
    { id: '4', name: isArabic ? 'غرفة 202' : 'Room 202', type: isArabic ? 'عمليات' : 'Operation', capacity: 4, status: 'maintenance', floor: '2nd' },
  ]);

  const filtered = rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الغرف' : 'Rooms'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة الغرف والقاعات' : 'Manage rooms and halls'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'غرفة جديدة' : 'New Room'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الغرف' : 'Total Rooms', value: rooms.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'متاحة' : 'Available', value: rooms.filter(r => r.status === 'available').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'مشغولة' : 'Occupied', value: rooms.filter(r => r.status === 'occupied').length, color: 'bg-red-50 text-red-600' },
          { label: isArabic ? 'صيانة' : 'Maintenance', value: rooms.filter(r => r.status === 'maintenance').length, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><DoorOpen size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const st = STATUS_STYLES[r.status] || STATUS_STYLES.available;
          return (
            <div key={r.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-blue-50 text-blue-600"><DoorOpen size={20} /></div><div><p className="font-bold text-sm">{r.name}</p><p className="text-xs text-slate-400">{r.type} · {r.floor}</p></div></div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400"><Users size={12} /> {isArabic ? 'سعة' : 'Capacity'}: {r.capacity}</div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'غرفة جديدة' : 'New Room'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم الغرفة' : 'Room name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'النوع' : 'Type'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="number" placeholder={isArabic ? 'السعة' : 'Capacity'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'الدور' : 'Floor'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
