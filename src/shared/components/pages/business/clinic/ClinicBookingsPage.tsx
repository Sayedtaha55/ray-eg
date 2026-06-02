import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  User2,
  XCircle,
  Plus,
  Phone,
  User,
  Trash2,
  Check,
} from 'lucide-react';
import { ApiService } from '@/services/api.service';

type Props = {
  shop?: any;
};

const ClinicBookingsPage: React.FC<Props> = ({ shop }) => {
  const { t, i18n } = useTranslation();
  const locale = String(i18n.language || '').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US';
  const { useLocation } = ReactRouterDOM as any;
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Secretary manual booking states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [modalErrorMsg, setModalErrorMsg] = useState('');

  // Filtering states
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');

  const getTargetShopId = useCallback(() => {
    try {
      const params = new URLSearchParams(location.search);
      const impersonateShopId = String(params.get('impersonateShopId') || '').trim();

      const userStr = localStorage.getItem('ray_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const role = String(user?.role || '').toLowerCase();
      const shopIdFromUser = String(user?.shopId || '').trim();

      if (role === 'admin' && impersonateShopId) return impersonateShopId;
      return shopIdFromUser || shop?.id || '';
    } catch {
      return shop?.id || '';
    }
  }, [location.search, shop]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const shopId = getTargetShopId();
      const list = await ApiService.getBookings(shopId || undefined);
      setBookings(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setErrorMsg(String(e?.message || 'فشل تحميل قائمة الحجوزات'));
    } finally {
      setLoading(false);
    }
  }, [getTargetShopId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Extract doctors list from shop page design or defaults
  const doctorsList = useMemo(() => {
    if (Array.isArray(shop?.pageDesign?.clinicDoctorsList) && shop.pageDesign.clinicDoctorsList.length > 0) {
      return shop.pageDesign.clinicDoctorsList;
    }
    // No hardcoded placeholder doctors — show empty list when none provided
    return [];
  }, [shop?.pageDesign?.clinicDoctorsList]);

  // Time slots list
  const slotsList = useMemo(() => {
    if (Array.isArray(shop?.pageDesign?.clinicSlotsList) && shop.pageDesign.clinicSlotsList.length > 0) {
      return shop.pageDesign.clinicSlotsList;
    }
    return [
      { time: '05:30', label: '05:30 مساءً' },
      { time: '06:00', label: '06:00 مساءً' },
      { time: '06:30', label: '06:30 مساءً' },
      { time: '07:00', label: '07:00 مساءً' },
      { time: '07:30', label: '07:30 مساءً' },
      { time: '08:00', label: '08:00 مساءً' },
    ];
  }, [shop?.pageDesign?.clinicSlotsList]);

  // Initialize first doctor in modal
  useEffect(() => {
    if (doctorsList.length > 0 && !selectedDoctor) {
      setSelectedDoctor(doctorsList[0]);
    }
  }, [doctorsList, selectedDoctor]);

  // Handle manual booking submit by Secretary
  const handleManualBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setModalErrorMsg('الرجاء إدخال اسم المريض');
      return;
    }
    if (!patientPhone.trim()) {
      setModalErrorMsg('الرجاء إدخال رقم هاتف المريض');
      return;
    }
    if (!bookingTime) {
      setModalErrorMsg('الرجاء اختيار الوقت المناسب');
      return;
    }

    setIsSubmitting(true);
    setModalErrorMsg('');
    setModalSuccessMsg('');

    try {
      const payload = {
        itemId: selectedDoctor?.id || 'general',
        itemName: selectedDoctor?.name || 'استشارة عامة',
        itemImage: selectedDoctor?.photoUrl || '',
        itemPrice: 300, // Consulting standard price
        shopId: getTargetShopId() || 'mock-shop-id',
        customerName: patientName,
        customerPhone: patientPhone,
        customerEmail: patientEmail,
        bookingDate: bookingDate,
        bookingTime: bookingTime,
        status: 'PENDING',
      };

      await ApiService.addBooking(payload);
      setModalSuccessMsg('تمت إضافة حجز المريض بنجاح!');
      
      // Reload and reset
      await loadBookings();
      setTimeout(() => {
        setIsModalOpen(false);
        setModalSuccessMsg('');
        setPatientName('');
        setPatientPhone('');
        setPatientEmail('');
        setBookingTime('');
      }, 2000);
    } catch (err: any) {
      setModalErrorMsg(err?.message || 'فشل إضافة الحجز، الرجاء إعادة المحاولة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update appointment status
  const handleStatusUpdate = async (bookingId: string, nextStatus: string) => {
    try {
      await ApiService.updateBookingStatus(bookingId, nextStatus);
      await loadBookings();
    } catch (err: any) {
      setErrorMsg(err?.message || 'فشل تحديث حالة الحجز');
    }
  };

  // Filter bookings list
  const filteredBookings = bookings.filter((b) => {
    const s = String(b.status || '').toUpperCase();
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return s === 'PENDING';
    if (activeFilter === 'confirmed') return s === 'CONFIRMED';
    if (activeFilter === 'completed') return s === 'COMPLETED';
    if (activeFilter === 'cancelled') return s === 'CANCELLED' || s === 'EXPIRED';
    return false;
  });

  const getStatusBadgeClass = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'CONFIRMED') return 'bg-sky-50 text-sky-600 border border-sky-100';
    if (s === 'COMPLETED') return 'bg-emerald-50 text-emerald-650 border border-emerald-100';
    if (s === 'CANCELLED' || s === 'EXPIRED') return 'bg-rose-50 text-rose-600 border border-rose-100';
    return 'bg-amber-50 text-amber-600 border border-amber-100';
  };

  const getStatusLabel = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'CONFIRMED') return 'مؤكد';
    if (s === 'COMPLETED') return 'مكتمل';
    if (s === 'CANCELLED' || s === 'EXPIRED') return 'ملغي';
    return 'معلق الانتظار';
  };

  // Stats counters
  const pendingCount = bookings.filter((b) => String(b.status || '').toUpperCase() === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => String(b.status || '').toUpperCase() === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => String(b.status || '').toUpperCase() === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => {
    const s = String(b.status || '').toUpperCase();
    return s === 'CANCELLED' || s === 'EXPIRED';
  }).length;

  return (
    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm text-right" dir="rtl">
      {/* 1. Header with manual addition */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 flex-row-reverse">
        <div className="text-right">
          <h3 className="text-2xl md:text-3xl font-black text-slate-900">إدارة وجدول الحجوزات الطبية</h3>
          <p className="text-slate-400 font-bold text-xs md:text-sm mt-2">
            متابعة مواعيد الكشوفات، تأكيد الحجوزات القادمة، أو تسجيل مواعيد المرضى يدوياً.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>إضافة حجز مريض جديد</span>
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 text-red-600 border border-red-100 rounded-2xl px-6 py-4 font-bold text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 2. Counters Filters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8 bg-slate-50 p-2 rounded-[2.2rem]">
        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeFilter === 'pending' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white'
          }`}
        >
          <span>معلقة الانتظار</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{pendingCount}</span>
        </button>
        <button
          onClick={() => setActiveFilter('confirmed')}
          className={`px-4 py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeFilter === 'confirmed' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white'
          }`}
        >
          <span>حجوزات مؤكدة</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{confirmedCount}</span>
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeFilter === 'completed' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white'
          }`}
        >
          <span>كشوفات مكتملة</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{completedCount}</span>
        </button>
        <button
          onClick={() => setActiveFilter('cancelled')}
          className={`px-4 py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeFilter === 'cancelled' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white'
          }`}
        >
          <span>حجوزات ملغية</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{cancelledCount}</span>
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          className={`col-span-2 md:col-span-1 px-4 py-3 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeFilter === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white'
          }`}
        >
          <span>جميع الحجوزات</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">{bookings.length}</span>
        </button>
      </div>

      {/* 3. Bookings list */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-24 text-center text-slate-500 font-bold flex items-center justify-center gap-3">
            <Loader2 className="animate-spin text-slate-900" size={24} />
            <span>جاري تحميل الحجوزات...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-350 bg-slate-50/20">
            <Calendar size={56} className="mx-auto mb-5 opacity-20" />
            <p className="font-black text-lg">لا توجد أي حجوزات تطابق هذا التصنيف حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBookings.map((b) => {
              const s = String(b.status || '').toUpperCase();
              return (
                <div
                  key={b.id}
                  className="bg-white border border-slate-100 hover:border-slate-200 p-6 sm:p-8 rounded-[2.2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 flex-row-reverse">
                    {/* Patient / Doctor icon */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform overflow-hidden shadow-inner">
                      {b.itemImage ? (
                        <img src={b.itemImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User2 size={24} />
                      )}
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-3 justify-end">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-black leading-none ${getStatusBadgeClass(b.status)}`}>
                          {getStatusLabel(b.status)}
                        </span>
                        <h4 className="text-lg font-black text-slate-900">{b.customerName || 'مريض مجهول'}</h4>
                      </div>
                      
                      <div className="flex items-center gap-2 justify-end text-xs font-bold text-slate-400">
                        <span>{b.customerPhone}</span>
                        <Phone size={12} className="text-slate-300" />
                      </div>

                      <div className="flex items-center gap-3.5 flex-wrap pt-2 justify-end text-xs font-black text-slate-650">
                        <div className="flex items-center gap-1.5 flex-row-reverse bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <User size={12} className="text-slate-400" />
                          <span>الطبيب: {b.itemName || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-row-reverse bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Calendar size={12} className="text-slate-400" />
                          <span>التاريخ: {b.bookingDate || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-row-reverse bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Clock size={12} className="text-slate-400" />
                          <span>الوقت: {b.bookingTime || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3 border-t border-slate-50 pt-4 md:pt-0 md:border-0 justify-end">
                    {s === 'PENDING' && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                          className="flex-1 sm:w-32 py-3 bg-sky-500 hover:bg-sky-650 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-sky-100"
                        >
                          <Check size={14} />
                          <span>تأكيد الموعد</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                          className="flex-1 sm:w-28 py-3 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-xs transition-all"
                        >
                          <span>إلغاء حجز</span>
                        </button>
                      </div>
                    )}

                    {s === 'CONFIRMED' && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'completed')}
                          className="flex-1 sm:w-32 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-100"
                        >
                          <CheckCircle2 size={14} />
                          <span>حضور المريض</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                          className="flex-1 sm:w-28 py-3 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-xl font-black text-xs transition-all"
                        >
                          <span>إلغاء حجز</span>
                        </button>
                      </div>
                    )}

                    {(s === 'COMPLETED' || s === 'CANCELLED' || s === 'EXPIRED') && (
                      <span className="text-xs font-bold text-slate-400">
                        تمت أرشفتها في {new Date(b.createdAt).toLocaleDateString(locale)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Secretary manual booking Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-row-reverse text-right">
              <div>
                <h3 className="text-xl font-black text-slate-900">إضافة موعد كشف جديد (يدوياً)</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">تعبئة نموذج الحجز لمريض حضر للعيادة أو هاتفياً</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-650 flex items-center justify-center transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleManualBookingSubmit} className="p-6 sm:p-8 space-y-5 text-right" dir="rtl">
              {modalErrorMsg && (
                <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl p-4 text-xs font-black">
                  ⚠️ {modalErrorMsg}
                </div>
              )}

              {modalSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-4 text-xs font-black flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  {modalSuccessMsg}
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">اسم المريض ثلاثي</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="مثال: أحمد عبد الله حسين"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">رقم هاتف المريض</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="مثال: 01100000000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="patient@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">اختر الطبيب المعالج</label>
                  <select
                    value={selectedDoctor?.id || ''}
                    onChange={(e) => {
                      const doc = doctorsList.find((d) => d.id === e.target.value);
                      setSelectedDoctor(doc || null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                  >
                    {doctorsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">تاريخ الحجز</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">اختر الموعد</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                    >
                      <option value="">اختر الوقت</option>
                      {slotsList.map((s) => (
                        <option key={s.time} value={s.time}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black"
                >
                  {isSubmitting ? 'جاري تسجيل الحجز...' : 'تأكيد وإضافة الموعد'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicBookingsPage;
