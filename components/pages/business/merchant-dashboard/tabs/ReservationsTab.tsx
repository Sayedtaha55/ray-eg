import React, { useState } from 'react';
import { CalendarCheck, Clock, Phone, User, UserCheck, Users } from 'lucide-react';
import { Reservation } from '@/types';

type Props = {
  reservations: Reservation[];
  onUpdateStatus: (id: string, s: string) => void;
};

const normalizeReservationStatus = (status: any): 'pending' | 'completed' | 'expired' => {
  const s = String(status || '').trim().toUpperCase();
  if (s === 'COMPLETED') return 'completed';
  if (s === 'CANCELLED' || s === 'CANCELED' || s === 'EXPIRED') return 'expired';
  return 'pending';
};

export const ReservationsTab: React.FC<Props> = ({ reservations, onUpdateStatus }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'expired'>('pending');

  const filteredReservations = reservations.filter((res) => {
    if (filter === 'all') return true;
    const normalized = normalizeReservationStatus((res as any).status);
    if (filter === 'pending') return normalized === 'pending';
    if (filter === 'completed') return normalized === 'completed';
    if (filter === 'expired') return normalized === 'expired';
    return false;
  });

  const pendingCount = reservations.filter((r) => normalizeReservationStatus((r as any).status) === 'pending').length;
  const completedCount = reservations.filter((r) => normalizeReservationStatus((r as any).status) === 'completed').length;
  const expiredCount = reservations.filter((r) => normalizeReservationStatus((r as any).status) === 'expired').length;

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 flex-row-reverse">
        <div>
          <h3 className="text-2xl md:text-3xl font-black">طلبات الحجز</h3>
          <p className="text-slate-400 font-black text-xs md:text-sm mt-2">
            عند تحويل الحجز لـ "تم الاستلام" سيتم إضافة العميل تلقائياً لقاعدة العملاء
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="bg-amber-100 text-amber-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[11px] md:text-xs uppercase tracking-normal md:tracking-widest whitespace-nowrap">
            {pendingCount} طلب ينتظر
          </span>
          <span className="bg-green-100 text-green-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[11px] md:text-xs uppercase tracking-normal md:tracking-widest whitespace-nowrap">
            {completedCount} منفذ
          </span>
          <span className="bg-red-100 text-red-600 px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black text-[11px] md:text-xs uppercase tracking-normal md:tracking-widest whitespace-nowrap">
            {expiredCount} مرفوض
          </span>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-slate-50 p-1 rounded-2xl w-full overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[12px] md:text-sm transition-all whitespace-nowrap ${
            filter === 'pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          الحجوزات الجديدة ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[12px] md:text-sm transition-all whitespace-nowrap ${
            filter === 'completed' ? 'bg-green-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          الحجوزات المنفذة ({completedCount})
        </button>
        <button
          onClick={() => setFilter('expired')}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[12px] md:text-sm transition-all whitespace-nowrap ${
            filter === 'expired' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          الحجوزات المرفوضة ({expiredCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-[12px] md:text-sm transition-all whitespace-nowrap ${
            filter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          الكل ({reservations.length})
        </button>
      </div>

      <div className="space-y-6">
        {filteredReservations.length === 0 ? (
          <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300">
            <CalendarCheck size={64} className="mx-auto mb-6 opacity-10" />
            <p className="font-black text-xl">
              {filter === 'pending'
                ? 'لا توجد حجوزات جديدة حالياً.'
                : filter === 'completed'
                  ? 'لا توجد حجوزات منفذة حالياً.'
                  : filter === 'expired'
                    ? 'لا توجد حجوزات مرفوضة حالياً.'
                    : 'لا توجد حجوزات حالياً.'}
            </p>
          </div>
        ) : (
          filteredReservations.map((res) => (
            <div
              key={res.id}
              className="bg-slate-50/50 p-5 md:p-8 rounded-[2.5rem] border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-4 md:gap-8 flex-row-reverse w-full lg:w-auto min-w-0">
                <img src={(res as any).itemImage} className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-xl group-hover:rotate-3 transition-transform" />
                <div className="text-right min-w-0 flex-1">
                  <p className="font-black text-xl md:text-2xl text-slate-900 mb-2 break-words">
                    {(res as any).itemName}
                  </p>
                  <div className="space-y-1">
                    <p className="text-slate-500 font-black text-sm flex items-center justify-end gap-2 break-words">
                      <User size={14} /> العميل: {(res as any).customerName}
                    </p>
                    <p className="text-slate-400 font-bold text-sm flex items-center justify-end gap-2 break-all">
                      <Phone size={14} /> {(res as any).customerPhone}
                    </p>
                  </div>
                  <p className="text-[10px] text-[#00E5FF] font-black mt-3 uppercase tracking-tighter flex items-center justify-end gap-1">
                    <Clock size={12} /> {new Date((res as any).createdAt).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
                <div className="text-right md:text-left px-0 md:px-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المبلغ المطلوب</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900">ج.م {(res as any).itemPrice}</p>
                </div>
                {normalizeReservationStatus((res as any).status) === 'pending' ? (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => onUpdateStatus(res.id, 'completed')}
                      className="flex-1 md:w-40 py-4 md:py-5 bg-green-500 text-white rounded-2xl font-black text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                    >
                      <UserCheck size={14} /> تم الاستلام
                    </button>
                    <button
                      onClick={() => onUpdateStatus(res.id, 'expired')}
                      className="flex-1 md:w-40 py-4 md:py-5 bg-white border border-slate-200 text-red-500 rounded-2xl font-black text-xs hover:bg-red-50 transition-all"
                    >
                      إلغاء الحجز
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {normalizeReservationStatus((res as any).status) === 'completed' ? (
                      <span className="bg-green-100 text-green-600 px-4 py-2 rounded-xl font-black text-xs">تم الاستلام</span>
                    ) : (
                      <span className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-black text-xs">ملغي</span>
                    )}
                    <span className="text-slate-400 font-black text-xs">{new Date((res as any).createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReservationsTab;
