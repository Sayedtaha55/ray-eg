/**
 * ═══════════════════════════════════════════
 * activity/ActivitySchedulePage.tsx
 * جدول الفعاليات / الحصص / المواعيد
 * يُستخدم في: فعاليات وقاعات
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { CalendarDays, Plus, Clock, MapPin, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { BookingActivityType } from '../config';

type ScheduleEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  venue?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendees?: number;
};

type Props = { activityType: BookingActivityType };

const STATUS_MAP = {
  upcoming:  { label: 'قادمة',   color: 'text-blue-700',    bg: 'bg-blue-50' },
  ongoing:   { label: 'جارية',   color: 'text-emerald-700', bg: 'bg-emerald-50' },
  completed: { label: 'منتهية',  color: 'text-slate-500',   bg: 'bg-slate-50' },
  cancelled: { label: 'ملغية',   color: 'text-red-700',     bg: 'bg-red-50' },
};

const ActivitySchedulePage: React.FC<Props> = ({ activityType }) => {
  const [events, setEvents] = useState<ScheduleEvent[]>([
    { id: '1', title: 'حفل الافتتاح الكبير', date: '2025-07-01', startTime: '19:00', endTime: '23:00', venue: 'القاعة الرئيسية', status: 'upcoming', attendees: 200 },
    { id: '2', title: 'معرض فني تشكيلي', date: '2025-07-05', startTime: '10:00', endTime: '18:00', venue: 'صالة العرض', status: 'upcoming', attendees: 50 },
    { id: '3', title: 'ورشة عمل فنية', date: '2025-06-28', startTime: '14:00', endTime: '17:00', venue: 'غرفة التدريب', status: 'ongoing', attendees: 15 },
    { id: '4', title: 'حفل خاص', date: '2025-06-15', startTime: '20:00', endTime: '00:00', venue: 'التراس', status: 'completed', attendees: 80 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', venue: '' });

  const handleAdd = () => {
    if (!form.title.trim() || !form.date) return;
    setEvents(prev => [{
      id: Date.now().toString(), title: form.title, date: form.date,
      startTime: form.startTime || '00:00', endTime: form.endTime || '23:59',
      venue: form.venue || undefined, status: 'upcoming', attendees: 0,
    }, ...prev]);
    setForm({ title: '', date: '', startTime: '', endTime: '', venue: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">جدول الفعاليات</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{events.filter(e => e.status === 'upcoming').length} فعالية قادمة</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> إضافة فعالية
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">إضافة فعالية للجدول</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">عنوان الفعالية *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="مثال: حفل الافتتاح" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">التاريخ *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">وقت البداية</label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">وقت النهاية</label>
              <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">المكان</label>
              <input type="text" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                placeholder="مثال: القاعة الرئيسية" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">إلغاء</button>
            <button onClick={handleAdd} disabled={!form.title.trim() || !form.date}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">حفظ</button>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <CalendarDays className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">لا توجد فعاليات في الجدول</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => {
            const st = STATUS_MAP[ev.status];
            return (
              <div key={ev.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-cyan-600">{new Date(ev.date).toLocaleDateString('ar', { month: 'short' })}</span>
                      <span className="text-lg font-black text-slate-900 leading-none">{new Date(ev.date).getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900">{ev.title}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-bold flex-wrap">
                        <span className="flex items-center gap-1"><Clock size={11} /> {ev.startTime} - {ev.endTime}</span>
                        {ev.venue && <span className="flex items-center gap-1"><MapPin size={11} /> {ev.venue}</span>}
                        {ev.attendees != null && <span>{ev.attendees} حاضر</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
                    <button onClick={() => handleDelete(ev.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivitySchedulePage;
