import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Star,
  Stethoscope,
  User2,
  Search,
  MapPin,
  Phone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = {
  config: any;
  logoDataUrl?: string;
  primary: string;
  secondary: string;
  pageBg: string;
  specialties: any[];
  doctors: any[];
  slots: any[];
  testimonials: any[];
  query: string;
  setQuery: (val: string) => void;
  filteredDoctors: any[];
  shop?: any;
};

const ClinicTheme1: React.FC<Props> = ({
  config,
  logoDataUrl,
  primary,
  secondary,
  pageBg,
  specialties,
  doctors,
  slots,
  testimonials,
  query,
  setQuery,
  filteredDoctors,
  shop,
}) => {
  const { t } = useTranslation();

  // Booking states
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<any>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newBookingTicket, setNewBookingTicket] = useState<any>(null);

  // Fetch shop bookings to calculate dynamic queue
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const loadBookings = async () => {
    if (!shop?.id) return;
    setLoadingBookings(true);
    try {
      const list = await ApiService.getBookings(shop.id);
      setBookings(list || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [shop?.id]);

  const workStart = shop?.pageDesign?.bookingWorkStart || config?.bookingWorkStart || '16:00';
  const slotDuration = shop?.pageDesign?.bookingSlotDuration || config?.bookingSlotDuration || 30;

  // Filter bookings for the selected date and doctor/consultation
  const currentQueue = useMemo(() => {
    const docId = activeDoctor?.id || 'general';
    return bookings.filter((b: any) => {
      const isSameDoc = b.itemId === docId;
      const isSameDate = b.bookingDate === bookingDate;
      const isNotCancelled = b.status?.toLowerCase() !== 'cancelled' && b.status?.toLowerCase() !== 'rejected';
      return isSameDoc && isSameDate && isNotCancelled;
    });
  }, [bookings, activeDoctor, bookingDate]);

  const queueCount = currentQueue.length;
  const nextQueueNumber = queueCount + 1;

  // Calculate expected time based on queue length
  const estimatedTime = useMemo(() => {
    const [h, m] = workStart.split(':').map(Number);
    const totalMinutes = h * 60 + m + queueCount * slotDuration;
    const finalH = Math.floor(totalMinutes / 60) % 24;
    const finalM = totalMinutes % 60;
    return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
  }, [workStart, queueCount, slotDuration]);

  // Format time for Arabic display
  const formatArabicTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'مساءً' : 'صباحاً';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = String(m).padStart(2, '0');
    return `${displayH}:${displayM} ${period}`;
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Stethoscope':
        return <Stethoscope size={16} />;
      case 'Shield':
        return <Shield size={16} />;
      case 'User2':
        return <User2 size={16} />;
      case 'CheckCircle2':
        return <CheckCircle2 size={16} />;
      default:
        return <Stethoscope size={16} />;
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMsg('الرجاء إدخال اسم المريض');
      return;
    }
    if (!patientPhone.trim()) {
      setErrorMsg('الرجاء إدخال رقم الهاتف');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const targetShopId = shop?.id || '';
      if (!targetShopId) {
        setErrorMsg('لا يمكن إنشاء الحجز بدون ربطه بمتجر حقيقي.');
        return;
      }
      const payload = {
        itemId: activeDoctor?.id || 'general',
        itemName: activeDoctor?.name || 'استشارة عامة',
        itemImage: activeDoctor?.photoUrl || '',
        itemPrice: 300, // Standard fee
        shopId: targetShopId,
        customerName: patientName,
        customerPhone: patientPhone,
        customerEmail: patientEmail,
        bookingDate: bookingDate,
        bookingTime: estimatedTime,
        status: 'PENDING',
        metadata: {
          queueNumber: nextQueueNumber,
          peopleAhead: queueCount,
          estimatedTime: estimatedTime,
        },
      };

      await ApiService.addBooking(payload);
      
      setNewBookingTicket({
        customerName: patientName,
        doctorName: activeDoctor?.name || 'العيادة العامة',
        doctorTitle: activeDoctor?.title || 'استشارة عامة',
        bookingDate: bookingDate,
        queueNumber: nextQueueNumber,
        peopleAhead: queueCount,
        estimatedTime: estimatedTime,
      });

      setSuccessMsg('تم تسجيل حجزك في قائمة الانتظار بنجاح!');
      loadBookings();
    } catch (err: any) {
      setErrorMsg(err?.message || 'فشل الحجز، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="w-full flex flex-col font-sans relative" style={{ backgroundColor: pageBg }}>
      {/* 1. Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Stethoscope className="text-white" size={18} />
              )}
            </div>
            <div>
              <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {t('business.builder.clinicPreview.header.title')}
              </div>
              <div className="text-[11px] font-bold text-slate-400">
                {t('business.builder.clinicPreview.header.subtitle')}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveDoctor(doctors[0] || null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl font-black text-xs text-white hover:bg-black transition-all"
              style={{ backgroundColor: primary }}
            >
              {t('business.builder.clinicPreview.header.bookNow')}
            </button>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl font-black text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              {t('business.builder.clinicPreview.header.contactUs')}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Announcement Banner */}
      {Boolean(config.homeRightAdTitle || config.homeLeftAdTitle) && (
        <div className="bg-slate-900 text-white py-3 overflow-hidden text-xs font-black border-y border-slate-800">
          <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center gap-4 flex-wrap">
            {config.homeRightAdTitle && <span className="flex items-center gap-2">✨ {config.homeRightAdTitle}</span>}
            {config.homeLeftAdTitle && <span className="flex items-center gap-2">🔥 {config.homeLeftAdTitle}</span>}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* ================= LAYOUT 1: CLASSIC GRID (HERO & QUICK BOOKING SIDE-BY-SIDE) ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Left Column: Hero, Search & Specialties Shortcuts */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-[2rem] shadow-md p-6 sm:p-8 space-y-6">
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-1.5 text-xs font-black text-slate-650">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
              {t('business.builder.clinicPreview.hero.badge')}
            </div>

            <div className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-slate-900">
              {t('business.builder.clinicPreview.hero.title')}
              <span className="block mt-1" style={{ color: secondary }}>
                {t('business.builder.clinicPreview.hero.titleAccent')}
              </span>
            </div>
            
            <div className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
              {t('business.builder.clinicPreview.hero.description')}
            </div>

            <div className="flex items-center gap-3.5 flex-wrap pt-2">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                <CheckCircle2 size={16} style={{ color: primary }} />
                {t('business.builder.clinicPreview.hero.points.instantConfirmation')}
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                <Clock size={16} style={{ color: primary }} />
                {t('business.builder.clinicPreview.hero.points.preciseTimes')}
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                <Shield size={16} style={{ color: primary }} />
                {t('business.builder.clinicPreview.hero.points.secureData')}
              </div>
            </div>

            {/* In-Hero Doctor Search */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('business.builder.clinicPreview.search.placeholder')}
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs sm:text-sm outline-none focus:border-slate-900 transition-all text-right"
                  />
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-slate-900 active:scale-95 transition-all shadow"
                  style={{ backgroundColor: primary }}
                >
                  {t('business.builder.clinicPreview.search.button')}
                </button>
              </div>

              {/* Specialties Icons List */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {specialties.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-350 transition-all shadow-sm group active:scale-98"
                  >
                    <span className="text-[10px] font-black text-slate-700 group-hover:text-slate-900">{s.name}</span>
                    <span className="text-slate-500 group-hover:text-slate-950">
                      {s.iconName ? renderIcon(s.iconName) : s.icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Booking Form */}
          <div className="lg:col-span-5 bg-white border border-slate-100 rounded-[2rem] shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm sm:text-base font-black text-slate-900">
                  {t('business.builder.clinicPreview.quickBooking.title')}
                </div>
                <div className="mt-1 text-[11px] font-bold text-slate-400">
                  {t('business.builder.clinicPreview.quickBooking.subtitle')}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full shadow-inner border border-slate-100">
                <MapPin size={14} className="text-slate-400" />
                {t('business.builder.clinicPreview.quickBooking.location')}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 shadow-inner space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-200 pb-3">
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-900">
                    نظام الحجز الفوري وقائمة الانتظار
                  </div>
                  <div className="mt-0.5 text-[10px] font-bold text-slate-450">
                    احجز دورك الآن في قائمة الكشف اليومي
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-white border border-slate-150 px-2.5 py-1 rounded-lg">
                  <Clock size={12} className="text-slate-400" />
                  قائمة الانتظار
                </div>
              </div>

              {/* Waitlist Queue Stats card */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white border border-slate-150 rounded-xl p-3 shadow-sm text-right">
                  <span className="text-xs font-bold text-slate-500">حالة الانتظار الحالية:</span>
                  <span className="text-xs font-black text-slate-800">
                    {loadingBookings ? 'جاري التحميل...' : `${queueCount} مرضى في الانتظار`}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-white border border-slate-150 rounded-xl p-3 shadow-sm text-right">
                  <span className="text-xs font-bold text-slate-500">بدء استقبال المرضى:</span>
                  <span className="text-xs font-black text-slate-800">
                    {formatArabicTime(workStart)}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white border border-slate-150 rounded-xl p-3 shadow-sm text-right">
                  <span className="text-xs font-bold text-slate-500">دورك المتوقع عند الحجز:</span>
                  <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    رقم #{nextQueueNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white border border-slate-150 rounded-xl p-3 shadow-sm text-right">
                  <span className="text-xs font-bold text-slate-500">موعد الكشف المتوقع:</span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {formatArabicTime(estimatedTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDoctor(doctors[0] || null);
                    setIsModalOpen(true);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-black text-xs text-white shadow transition-all active:scale-95 text-center"
                  style={{ backgroundColor: primary }}
                >
                  احجز دورك في الانتظار
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDoctor(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl font-black text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                >
                  العيادة العامة
                </button>
              </div>
            </div>

            {/* Static stats / Quick contacts details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black text-slate-400">
                    {t('business.builder.clinicPreview.quickBooking.phoneLabel')}
                  </div>
                  <Phone size={14} className="text-slate-400" />
                </div>
                <div className="mt-1 text-xs font-black text-slate-900">+20 10 0000 0000</div>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black text-slate-400">
                    {t('business.builder.clinicPreview.quickBooking.avgRatingLabel')}
                  </div>
                  <Star size={14} className="text-slate-400 fill-amber-400 text-amber-400" />
                </div>
                <div className="mt-1 text-xs font-black text-slate-900">4.8 / 5.0</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. About us (من نحن) Section */}
        {(config.homeAboutTitle || config.homeIntroText) && (
          <section className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            {config.homeAboutImageUrl && (
              <div className="w-full h-60 sm:h-72 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/50 shadow-inner">
                <img src={config.homeAboutImageUrl} alt="About us" className="w-full h-full object-cover" />
              </div>
            )}
            <div className={config.homeAboutImageUrl ? '' : 'col-span-2'}>
              <span className="text-[10px] font-black tracking-widest block uppercase mb-1.5 text-slate-400">رسالتنا وقيمنا</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {config.homeAboutTitle || 'قيم العيادة ومركزنا الطبي'}
              </h2>
              <p className="mt-4 text-xs sm:text-sm font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">
                {config.homeIntroText || 'نحن نلتزم بتقديم أفضل الخدمات الطبية المتميزة بأعلى مستويات الجودة والاحترافية ورعاية لا تضاهى لمرضانا.'}
              </p>
            </div>
          </section>
        )}

        {/* 4. Doctors Grid Section */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3 flex-wrap border-r-4 pr-3 border-slate-900">
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">
                {t('business.builder.clinicPreview.doctorsSection.title')}
              </div>
              <div className="mt-0.5 text-xs font-bold text-slate-500">
                {t('business.builder.clinicPreview.doctorsSection.subtitle')}
              </div>
            </div>
            <div className="text-xs font-black text-slate-400">العدد: {filteredDoctors.length} أطباء</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((d) => (
              <div
                key={d.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between group active:scale-99"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm sm:text-base font-black text-slate-900 group-hover:text-slate-950">
                        {d.name}
                      </div>
                      <div className="mt-0.5 text-xs font-bold text-slate-400">{d.title}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-450 overflow-hidden">
                      {d.photoUrl ? (
                        <img src={d.photoUrl} alt={d.name} className="w-full h-full object-cover" />
                      ) : (
                        <User2 size={18} />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-xs font-black">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span className="text-slate-800">{d.rating}</span>
                      <span className="text-slate-400 font-bold">({d.reviews})</span>
                    </div>
                    <div className="text-[11px] font-black text-slate-550 bg-slate-50 px-2 py-0.5 rounded">
                      {t('business.builder.clinicPreview.doctorsSection.next', { time: d.next })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoctor(d);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl font-black text-xs text-slate-900 text-center shadow transition-all active:scale-95"
                    style={{ backgroundColor: primary }}
                  >
                    {t('business.builder.clinicPreview.doctorsSection.book')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoctor(d);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl font-black text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    الملف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Testimonials Section */}
        <section className="bg-white border border-slate-100 rounded-[2rem] shadow-md p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4 flex-wrap border-b border-slate-150 pb-4 mb-6">
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900">
                {t('business.builder.clinicPreview.testimonialsSection.title')}
              </div>
              <div className="mt-0.5 text-xs font-bold text-slate-500">
                {t('business.builder.clinicPreview.testimonialsSection.subtitle')}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-700 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              4.8
              <span className="text-[11px] text-slate-400 font-bold">(1,250)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs sm:text-sm font-black text-slate-900">{test.name}</div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < test.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-xs sm:text-sm font-bold text-slate-600 leading-relaxed italic">
                  "{test.text}"
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CTA section */}
        <section>
          <div
            className="rounded-[2rem] p-6 sm:p-8 md:p-10 text-slate-900 border border-slate-100 shadow"
            style={{
              background: `linear-gradient(135deg, ${primary}12, ${secondary}12)`,
              borderColor: `${primary}20`,
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-base sm:text-xl font-black">
                  {t('business.builder.clinicPreview.cta.title')}
                </div>
                <div className="mt-2 text-xs sm:text-sm font-bold text-slate-600">
                  {t('business.builder.clinicPreview.cta.subtitle')}
                </div>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDoctor(doctors[0] || null);
                    setIsModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white shadow hover:bg-black transition-all transform active:scale-95"
                  style={{ backgroundColor: primary }}
                >
                  {t('business.builder.clinicPreview.cta.bookAppointment')}
                </button>
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                  {t('business.builder.clinicPreview.cta.inquiry')}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs font-bold text-slate-500">
            {t('business.builder.clinicPreview.footer.copyright')}
          </div>
          <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            {t('business.builder.clinicPreview.footer.tags')}
          </div>
        </div>
      </footer>

      {/* Modern interactive Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-row-reverse text-right">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {newBookingTicket ? 'تذكرة الحجز المعتمدة' : 'تأكيد حجز الموعد وقائمة الانتظار'}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  {newBookingTicket ? 'تم تسجيل دورك بنجاح في قائمة الانتظار' : 'الرجاء إدخال بيانات المريض لإتمام عملية الحجز'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewBookingTicket(null);
                }}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {newBookingTicket ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 relative overflow-hidden text-center space-y-4" dir="rtl">
                  <div className="absolute top-1/2 right-0 w-8 h-8 bg-white rounded-full translate-x-4 -translate-y-4 border border-slate-200" />
                  <div className="absolute top-1/2 left-0 w-8 h-8 bg-white rounded-full -translate-x-4 -translate-y-4 border border-slate-200" />
                  
                  <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                    <CheckCircle2 size={32} />
                  </div>
                  
                  <h4 className="text-base font-black text-slate-800">تفاصيل دور الانتظار الخاص بك</h4>
                  
                  <div className="border-t border-b border-dashed border-slate-200 py-4 my-2 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>اسم المريض:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.customerName}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>العيادة / الطبيب:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.doctorName}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>تاريخ الحجز:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.bookingDate}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>المرضى أمامك:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.peopleAhead} مرضى</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>الوقت المقدر للكشف:</span>
                      <span className="text-slate-900 font-black">{formatArabicTime(newBookingTicket.estimatedTime)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white rounded-xl py-4 px-6 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400">رقم دورك في قائمة الانتظار</div>
                    <div className="text-3xl font-black tracking-widest">{newBookingTicket.queueNumber}#</div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setNewBookingTicket(null);
                      setPatientName('');
                      setPatientPhone('');
                      setPatientEmail('');
                    }}
                    className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-black text-xs transition-all shadow-sm"
                  >
                    إغلاق وتأكيد
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-5 text-right" dir="rtl">
                  {errorMsg && (
                    <div className="bg-red-50 text-red-650 border border-red-100 rounded-2xl p-4 text-xs font-black">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {/* Selected Doctor Info */}
                  {activeDoctor && (
                    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row-reverse">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center">
                        {activeDoctor.photoUrl ? (
                          <img src={activeDoctor.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User2 className="text-slate-300" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-400">الطبيب المختص</div>
                        <div className="text-sm font-black text-slate-950 mt-0.5">{activeDoctor.name}</div>
                        <div className="text-[10px] font-bold text-slate-400">{activeDoctor.title}</div>
                      </div>
                    </div>
                  )}

                  {/* Input Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-1.5">اسم المريض ثلاثي</label>
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="مثال: محمد أحمد علي"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-1.5">رقم الهاتف النشط</label>
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="مثال: 01000000000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-1.5">البريد الإلكتروني (اختياري)</label>
                      <input
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-left"
                      />
                    </div>

                    {/* Date selection and dynamic queue stats card */}
                    <div className="space-y-3">
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
                      
                      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                        <div className="text-[11px] font-black text-slate-500 flex justify-between">
                          <span>المرضى بقائمة الانتظار في هذا اليوم:</span>
                          <span className="text-slate-900">{queueCount} مرضى</span>
                        </div>
                        <div className="text-[11px] font-black text-slate-500 flex justify-between">
                          <span>دورك المتوقع عند التأكيد:</span>
                          <span className="text-slate-900 font-bold">رقم #{nextQueueNumber}</span>
                        </div>
                        <div className="text-[11px] font-black text-slate-500 flex justify-between">
                          <span>موعد الكشف التقريبي:</span>
                          <span className="text-emerald-700 font-black">{formatArabicTime(estimatedTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-100 flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                      style={{ backgroundColor: primary }}
                    >
                      {isSubmitting ? 'جاري تسجيل الحجز...' : 'تأكيد وحجز الدور بالانتظار'}
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ClinicTheme1);
