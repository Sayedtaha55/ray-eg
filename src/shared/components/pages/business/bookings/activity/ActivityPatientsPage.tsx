/**
 * ═══════════════════════════════════════════
 * activity/ActivityPatientsPage.tsx
 * إدارة ملفات المرضى / العملاء
 * يُستخدم في: عيادات
 * ═══════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Edit2, Trash2, Phone, Mail, Calendar, Loader2 } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { ApiService } from '@/services/api.service';

type Patient = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female';
  bloodType?: string;
  notes?: string;
  lastVisit?: string;
  totalVisits: number;
};

type Props = { activityType: BookingActivityType };

const ActivityPatientsPage: React.FC<Props> = ({ activityType }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', age: '', gender: 'male', bloodType: '', notes: '' });

  const loadPatients = async () => {
    setLoading(true);
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) { setLoading(false); return; }
      const data = await ApiService.getBookingActivityData(shop.id, 'activityPatientsList');
      setPatients(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender as 'male' | 'female',
        bloodType: form.bloodType || undefined,
        notes: form.notes || undefined,
        totalVisits: 0,
      };
      const nextPatients = [newPatient, ...patients];
      await ApiService.saveBookingActivityData(shop.id, 'activityPatientsList', nextPatients);
      setPatients(nextPatients);
      setForm({ name: '', phone: '', email: '', age: '', gender: 'male', bloodType: '', notes: '' });
      setShowForm(false);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const shop = JSON.parse(localStorage.getItem('ray_last_shop') || '{}');
      if (!shop?.id) return;
      const nextPatients = patients.filter(p => p.id !== id);
      await ApiService.saveBookingActivityData(shop.id, 'activityPatientsList', nextPatients);
      setPatients(nextPatients);
    } catch {}
  };

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.phone.includes(q) || (p.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">ملفات المرضى</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{patients.length} مريض مسجل</p>
          </div>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} title="إضافة مريض جديد"
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> إضافة مريض
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">تسجيل مريض جديد</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">الاسم الكامل *</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="مثال: أحمد محمد"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">رقم الهاتف *</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="05xxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="patient@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">العمر</label>
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="25"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">الجنس</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300">
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">فصيلة الدم</label>
              <select value={form.bloodType} onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300">
                <option value="">— اختر —</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">ملاحظات طبية</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="حساسية، أمراض مزمنة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300 resize-none" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowForm(false)} title="إلغاء" className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">إلغاء</button>
            <button type="button" onClick={handleAdd} disabled={!form.name.trim() || !form.phone.trim()} title="حفظ بيانات المريض"
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">حفظ</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder="ابحث بالاسم أو الهاتف..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
          <p className="font-bold text-slate-400">جاري التحميل...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <FileText className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{search ? `لا نتائج لـ "${search}"` : 'لم تسجل مرضى بعد'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 space-y-3 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-100 to-slate-100 flex items-center justify-center font-black text-slate-600 text-lg">
                  {p.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-slate-900 truncate">{p.name}</div>
                  <div className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                    {p.gender === 'male' ? 'ذكر' : 'أنثى'} {p.age && `• ${p.age} سنة`} {p.bloodType && `• ${p.bloodType}`}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-500"><Phone size={11} /> {p.phone}</div>
                {p.email && <div className="flex items-center gap-1 text-xs font-bold text-slate-400"><Mail size={11} /> {p.email}</div>}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{p.totalVisits} زيارة</span>
                {p.lastVisit && <span className="text-slate-400 flex items-center gap-1"><Calendar size={11} /> آخر: {p.lastVisit}</span>}
              </div>
              {p.notes && <p className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg">⚠ {p.notes}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" title="تعديل بيانات المريض" className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                  <Edit2 size={12} /> تعديل
                </button>
                <button type="button" onClick={() => handleDelete(p.id)} title="حذف ملف المريض"
                  className="py-2 px-3 rounded-xl border border-red-100 text-xs font-black text-red-500 hover:bg-red-50 flex items-center justify-center gap-1.5">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityPatientsPage;
