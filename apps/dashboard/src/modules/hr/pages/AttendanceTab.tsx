import React, { useEffect, useState, useCallback } from 'react';
import { Clock, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';

type Props = {
  shopId: string;
  shop: any;
};

const AttendanceTab: React.FC<Props> = ({ shopId }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const data = await ApiService.getAttendance(shopId);
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US');

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          {isArabic ? 'تتبع الحضور' : 'Attendance Tracking'}
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          {isArabic ? `سجلات الحضور ليوم ${today}` : `Attendance records for ${today}`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p className="font-bold text-slate-400 text-sm">
            {isArabic ? 'لا توجد سجلات حضور' : 'No attendance records'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {records.map((rec, idx) => (
              <div key={rec.id || idx} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    rec.status === 'present' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    {rec.status === 'present' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{rec.employeeName || rec.name || '—'}</div>
                    <div className="text-xs text-slate-500 font-semibold">
                      {rec.checkIn ? `In: ${rec.checkIn}` : ''} {rec.checkOut ? `Out: ${rec.checkOut}` : ''}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  rec.status === 'present'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-red-50 text-red-500'
                }`}>
                  {rec.status === 'present' ? (isArabic ? 'حاضر' : 'Present') : (isArabic ? 'غائب' : 'Absent')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
