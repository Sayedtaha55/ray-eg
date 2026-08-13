import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Search, Calendar, LogIn, LogOut, Timer, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type AttendanceRecord = { id: string; employeeName: string; checkIn: string; checkOut: string; date: string; hours: string; status: 'present' | 'late' | 'absent' };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  present: { ar: 'حاضر', en: 'Present', color: 'text-green-600', bg: 'bg-green-100' },
  late: { ar: 'متأخر', en: 'Late', color: 'text-amber-600', bg: 'bg-amber-100' },
  absent: { ar: 'غائب', en: 'Absent', color: 'text-red-600', bg: 'bg-red-100' },
};

const CheckOutPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sid = String(shopId || '').trim();
    if (!sid) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCheckOuts(sid);
      setRecords(
        (Array.isArray(data) ? data : []).map((r: any) => ({
          id: String(r.id || ''),
          employeeName: String(r.employeeName || r.employee_name || ''),
          checkIn: String(r.checkIn || r.check_in || '---'),
          checkOut: String(r.checkOut || r.check_out || '---'),
          date: String(r.date || ''),
          hours: String(r.hours || '0h'),
          status: (String(r.status || 'present') as AttendanceRecord['status']),
        })),
      );
    } catch (e: any) {
      setError(e?.message || 'Failed to load checkouts');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r => r.employeeName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الحضور والانصراف' : 'Check-in / Check-out'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'سجل حضور وانصراف الموظفين' : 'Employee attendance and check-out records'}</p></div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الموظفين' : 'Total Employees', value: records.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'حاضرون' : 'Present', value: records.filter(r => r.status === 'present').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'متأخرون' : 'Late', value: records.filter(r => r.status === 'late').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'غائبون' : 'Absent', value: records.filter(r => r.status === 'absent').length, color: 'bg-red-50 text-red-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Clock size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-right border-b border-slate-100">
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الموظف' : 'Employee'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'التاريخ' : 'Date'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'حضور' : 'Check In'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'انصراف' : 'Check Out'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'ساعات' : 'Hours'}</th>
            <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
          </tr></thead>
          <tbody>
            {filtered.map((r) => {
              const st = STATUS_STYLES[r.status] || STATUS_STYLES.present;
              return (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-bold">{r.employeeName}</td>
                  <td className="py-3 text-slate-500">{new Date(r.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</td>
                  <td className="py-3"><span className="flex items-center gap-1 text-green-600"><LogIn size={12} /> {r.checkIn}</span></td>
                  <td className="py-3"><span className="flex items-center gap-1 text-red-600"><LogOut size={12} /> {r.checkOut}</span></td>
                  <td className="py-3 text-slate-500 flex items-center gap-1"><Timer size={12} /> {r.hours}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CheckOutPage;
