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
  Mail,
  ChevronDown,
  CheckCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import CustomPagesWidget from './CustomPagesWidget';
import ReviewsSection from './ReviewsSection';

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

const hexToRgb = (hex: string): string => {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m || m.length < 3) return '255,255,255';
  return `${parseInt(m[0], 16)},${parseInt(m[1], 16)},${parseInt(m[2], 16)}`;
};

const ClinicTheme2: React.FC<Props> = ({
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

  const elementsVisibility = (config?.elementsVisibility || {}) as Record<string, any>;
  const isVisible = (key: string, fallback: boolean = true) => {
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
    if (elementsVisibility[key] === undefined || elementsVisibility[key] === null) return fallback;
    return Boolean(elementsVisibility[key]);
  };

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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const faqItems = [
    { q: 'هل الحجز عبر المنصة مجاني بالكامل؟', a: 'نعم، حجز المواعيد عبر منصتنا مجاني 100%. الرسوم المدفوعة هي قيمة كشف الطبيب التي تدفعها في العيادة.' },
    { q: 'كيف يمكنني تعديل أو إلغاء موعدي؟', a: 'يمكنك بسهولة تعديل أو إلغاء الموعد عبر بوابة المريض، وذلك قبل 24 ساعة على الأقل من الموعد المقرر.' },
    { q: 'هل تقبل العيادات بطاقات التأمين الطبي؟', a: 'نعم، يمكنك إضافة رقم تأمينك أثناء تعبئة البيانات لتسهيل الإجراءات.' },
    { q: 'ماذا يحدث إذا تأخرت عن موعدي؟', a: 'نوصي بالوصول قبل الموعد بـ 15 دقيقة. إذا تأخرت، ستبذل العيادة جهدها لجدولتك في أقرب نافذة متاحة.' },
  ];

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

  // Filter bookings for selected date and doctor
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
        return <Stethoscope size={20} />;
      case 'Shield':
        return <Shield size={20} />;
      case 'User2':
        return <User2 size={20} />;
      case 'CheckCircle2':
        return <CheckCircle2 size={20} />;
      default:
        return <Stethoscope size={20} />;
    }
  };

  const btnBg = config.buttonBackgroundColor || primary;
  const btnText = config.buttonTextColor || '#fff';
  const btnHover = config.buttonHoverColor || btnBg;
  const btnRadius = config.buttonBorderRadius || '12px';
  const btnGradient = `linear-gradient(135deg, ${btnBg}, ${config.buttonSecondaryColor || secondary})`;

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
    <div dir="rtl" className="w-full flex flex-col font-sans relative overflow-hidden" style={{ backgroundColor: pageBg }}>
      <style>{`.clinic-btn:hover{background:${btnHover}!important}`}</style>
      {/* Visual background decorations for Luxury theme */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-rose-400/5 to-purple-400/10 blur-[100px] pointer-events-none" />

      {/* 1. Header (Glassmorphism Navbar) */}
      {isVisible('header', true) && (
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl shadow-sm transition-all"
        style={{
          backgroundColor: config.headerTransparent ? `rgba(${hexToRgb(String(config.headerBackgroundColor || '#FFFFFF'))}, ${(config.headerOpacity ?? 70) / 100})` : (config.headerBackgroundColor || '#FFFFFF'),
          borderColor: `${primary}20`,
          color: config.headerTextColor || '#0F172A',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[1.2rem] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-rose-500 p-0.5 shadow-md shadow-fuchsia-100">
              <div className="w-full h-full rounded-[1.1rem] bg-white flex items-center justify-center overflow-hidden">
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <Stethoscope className="text-fuchsia-500" size={20} />
                )}
              </div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black leading-tight" style={{ color: config.headerTextColor || '#0F172A' }}>
                {t('business.builder.clinicPreview.header.title')}
              </div>
              <div className="text-[11px] font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                {t('business.builder.clinicPreview.header.subtitle')}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5">
            <nav className="hidden lg:flex items-center gap-5 text-xs font-bold" style={{ color: config.headerTextColor || '#0F172A' }}>
              <a href="#home" className="hover:opacity-100 transition opacity-70">الرئيسية</a>
              {isVisible('clinicSpecialties', true) && specialties.length > 0 && (
                <a href="#specialties" className="hover:opacity-100 transition opacity-70">التخصصات</a>
              )}
              {isVisible('clinicDoctors', true) && (
                <a href="#doctors" className="hover:opacity-100 transition opacity-70">الأطباء</a>
              )}
              {isVisible('clinicAboutUs', true) && (config.homeAboutTitle || config.homeIntroText) && (
                <a href="#about" className="hover:opacity-100 transition opacity-70">من نحن</a>
              )}
              {isVisible('clinicFaq', true) && (
                <a href="#faqs" className="hover:opacity-100 transition opacity-70">الأسئلة الشائعة</a>
              )}
              {isVisible('clinicContact', true) && (
                <a href="#contact" className="hover:opacity-100 transition opacity-70">اتصل بنا</a>
              )}
            </nav>
            <CustomPagesWidget
              config={config}
              primaryColor={primary}
              showHome={false}
              showModal={true}
              enableHashRouting={true}
              className="hidden md:flex"
            />
            <button
              type="button"
              onClick={() => {
                setActiveDoctor(doctors[0] || null);
                setIsModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl font-black text-xs text-white shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 clinic-btn"
              style={{ background: btnGradient, color: btnText, borderRadius: btnRadius }}
            >
              {t('business.builder.clinicPreview.header.bookNow')}
            </button>
          </div>
        </div>
      </header>
      )}

      {/* 2. Announcement Banner (Gradient announcements) */}
      {Boolean(config.homeRightAdTitle || config.homeLeftAdTitle) && (
        <div className="bg-gradient-to-r from-purple-600 to-rose-600 text-white py-3 overflow-hidden text-xs font-black">
          <div className="max-w-[1200px] mx-auto px-4 flex justify-between items-center gap-4 flex-wrap">
            {config.homeRightAdTitle && (
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                ✨ {config.homeRightAdTitle}
              </span>
            )}
            {config.homeLeftAdTitle && (
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                🔥 {config.homeLeftAdTitle}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12 relative z-10">
        {/* 3. Hero & Luxury Search */}
        {isVisible('clinicHero', true) && (
        <section id="home" className="relative overflow-hidden rounded-[2.5rem] border border-rose-100 p-6 sm:p-10 md:p-14 text-slate-900 bg-white/70 backdrop-blur-xl shadow-xl shadow-rose-100/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-300/10 via-fuchsia-300/10 to-rose-300/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-300/10 via-purple-300/15 to-violet-300/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl text-right space-y-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-rose-500/10 border border-purple-200/50 rounded-full px-4.5 py-1.5 text-xs font-black text-purple-700 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              {config.clinicHeroBadge || t('business.builder.clinicPreview.hero.badge')}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-rose-955">
              {config.clinicHeroTitle || t('business.builder.clinicPreview.hero.title')}
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-l from-purple-600 via-fuchsia-600 to-rose-600">
                {t('business.builder.clinicPreview.hero.titleAccent')}
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base font-bold text-slate-650 leading-relaxed max-w-xl">
              {config.clinicHeroDesc || t('business.builder.clinicPreview.hero.description')}
            </p>

            <div className="pt-2 flex items-center gap-3.5 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 bg-purple-50/50 border border-purple-100/50 px-3 py-1.5 rounded-xl">
                <CheckCircle2 size={16} className="text-fuchsia-600" />
                {t('business.builder.clinicPreview.hero.points.instantConfirmation')}
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 bg-purple-50/50 border border-purple-100/50 px-3 py-1.5 rounded-xl">
                <Clock size={16} className="text-fuchsia-600" />
                {t('business.builder.clinicPreview.hero.points.preciseTimes')}
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-700 bg-purple-50/50 border border-purple-100/50 px-3 py-1.5 rounded-xl">
                <Shield size={16} className="text-fuchsia-600" />
                {t('business.builder.clinicPreview.hero.points.secureData')}
              </div>
            </div>

            {/* Interactive Luxury Search */}
            <div className="pt-4 max-w-xl">
              <div className="bg-gradient-to-r from-purple-500/5 to-rose-500/5 border border-purple-100/80 p-2 rounded-2xl flex items-center gap-2 shadow-sm hover:shadow transition-shadow">
                <div className="relative flex-1">
                  <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('business.builder.clinicPreview.search.placeholder')}
                    className="w-full pr-10 pl-3 py-2.5 rounded-xl border border-rose-100/50 bg-white font-bold text-xs sm:text-sm outline-none focus:border-purple-400 transition-all text-right shadow-inner text-slate-800"
                  />
                </div>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white transition-all hover:scale-105 active:scale-95 shadow-md clinic-btn"
                  style={{ background: btnGradient, color: btnText, borderRadius: btnRadius }}
                >
                  {t('business.builder.clinicPreview.search.button')}
                </button>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* 4. About Us (من نحن) Section */}
        {isVisible('clinicAboutUs', true) && (config.homeAboutTitle || config.homeIntroText) && (
          <section id="about" className="bg-white/60 backdrop-blur-xl border border-rose-100/60 rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-rose-100/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {config.homeAboutImageUrl && (
              <div className="md:col-span-5 w-full h-64 sm:h-80 rounded-[1.8rem] overflow-hidden bg-slate-50 border border-rose-100/50 shadow-inner relative group">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img src={config.homeAboutImageUrl} alt="About us" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className={config.homeAboutImageUrl ? 'md:col-span-7' : 'md:col-span-12'}>
              <span className="text-[10px] font-black tracking-widest block uppercase mb-1.5 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md inline-block">قصتنا ورسالتنا</span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                {config.homeAboutTitle || 'قيم العيادة ومركزنا الطبي'}
              </h2>
              <p className="mt-4 text-xs sm:text-sm md:text-base font-bold text-slate-650 leading-relaxed whitespace-pre-wrap">
                {config.homeIntroText || 'نحن نلتزم بتقديم أفضل الخدمات الطبية المتميزة بأعلى مستويات الجودة والاحترافية ورعاية لا تضاهى لمرضانا.'}
              </p>
              
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-rose-100/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">أعلى درجات التعقيم والسلامة</h4>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400">بيئة علاجية متكاملة وآمنة تماماً</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-650 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-slate-900">متابعة ورعاية مستمرة</h4>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400">فريق متكامل لمتابعة المريض بعد العلاج</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. Specialties (خدماتنا) Section */}
        {isVisible('clinicSpecialties', true) && (
        <section id="specialties" className="bg-white/70 backdrop-blur-xl border border-rose-100/50 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-rose-100/10">
          <div className="flex items-center gap-3 border-r-4 pr-3.5 mb-8" style={{ borderColor: primary }}>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">العيادات والخدمات المتكاملة</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">عيادات تخصصية متكاملة بأحدث الأجهزة لخدمتكم ورعايتكم</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {specialties.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveDoctor(doctors[0] || null);
                  setIsModalOpen(true);
                }}
                className="flex flex-col items-center justify-center text-center p-6 rounded-[1.8rem] bg-white border border-rose-100 hover:border-purple-200/80 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 active:translate-y-0 group"
              >
                <span className="text-purple-600 bg-purple-50 p-4.5 rounded-[1.2rem] border border-purple-100/50 shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  {s.iconName ? renderIcon(s.iconName) : s.icon}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-800 mt-4 group-hover:text-purple-905 transition-colors">{s.name}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 leading-none">احجز موعد الآن</span>
              </button>
            ))}
          </div>
        </section>
        )}

        {/* 6. Doctors (الأطباء) Grid */}
        {isVisible('clinicDoctors', true) && (
        <section id="doctors" className="bg-white/80 backdrop-blur-xl border border-rose-100 rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-xl shadow-rose-100/15">
          <div className="flex items-end justify-between gap-4 flex-wrap border-b border-rose-100/80 pb-5 mb-8">
            <div>
              <div className="text-base sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-rose-955">
                {t('business.builder.clinicPreview.doctorsSection.title')}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-bold text-slate-400">
                {t('business.builder.clinicPreview.doctorsSection.subtitle')}
              </div>
            </div>
            <div className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-rose-600 bg-purple-50/50 px-4.5 py-1.5 rounded-full border border-purple-100 shadow-sm">
              الأطباء المتاحين للحجز اليوم: {filteredDoctors.length}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((d) => (
              <div
                key={d.id}
                className="bg-white border border-rose-100 rounded-[2rem] p-6 sm:p-7 flex flex-col justify-between hover:shadow-xl hover:shadow-purple-100/40 hover:border-purple-200/50 transition-all duration-500 relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm sm:text-base font-black text-slate-900 group-hover:text-purple-955 transition-colors">
                        {d.name}
                      </div>
                      <div className="mt-1 text-xs font-bold text-slate-400">{d.title}</div>
                    </div>
                    <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-tr from-purple-50 to-rose-50 border border-rose-100/50 flex items-center justify-center text-slate-450 group-hover:from-purple-500 group-hover:to-rose-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-inner overflow-hidden">
                      {d.photoUrl ? (
                        <img src={d.photoUrl} alt={d.name} className="w-full h-full object-cover" />
                      ) : (
                        <User2 size={22} />
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 pt-3.5 border-t border-rose-100/50">
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <Star size={15} className="fill-amber-400 text-amber-400" />
                      <span className="text-slate-800">{d.rating}</span>
                      <span className="text-slate-455 font-bold">({d.reviews} مريض)</span>
                    </div>
                    <div className="text-[11px] font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100/40 shadow-sm">
                      {t('business.builder.clinicPreview.doctorsSection.next', { time: d.next })}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoctor(d);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 px-5 py-3 rounded-xl font-black text-xs text-white text-center shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 animate-pulse-subtle clinic-btn"
                    style={{ background: btnGradient, color: btnText, borderRadius: btnRadius }}
                  >
                    {t('business.builder.clinicPreview.doctorsSection.book')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoctor(d);
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-3 rounded-xl font-black text-xs bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-white hover:border-purple-200 transition-all shadow-inner hover:shadow-sm"
                  >
                    عرض الملف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* 7. Quick Booking (الحجز) Section */}
        {isVisible('clinicBookingWizard', true) && (
        <section className="bg-white/70 backdrop-blur-xl border border-rose-100 rounded-[2.5rem] shadow-xl shadow-rose-100/10 p-6 sm:p-10">
          <div className="border-r-4 pr-3.5 mb-8 border-purple-400" style={{ borderColor: secondary }}>
            <h3 className="text-base sm:text-xl font-black text-slate-900">
              نظام الحجز وقائمة الانتظار
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1">
              سجل اسمك في قائمة كشف العيادة للحصول على دور فوري اليوم
            </p>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-r from-purple-500/5 to-rose-500/5 border border-purple-100/40 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-rose-100/80 pb-4 mb-6">
              <div>
                <h4 className="text-sm sm:text-base font-black text-purple-955 text-right">قائمة الانتظار الفورية لكشف اليوم</h4>
                <p className="text-[11px] font-bold text-slate-400 mt-1 text-right">احجز دورك الآن وسيتم توجيهك للطبيب المختص تباعاً</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-650 bg-white border border-rose-100 px-4 py-1.5 rounded-full shadow-sm">
                <Clock size={14} className="text-fuchsia-600" />
                قائمة الانتظار الحالية
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 border border-rose-100 p-4 rounded-2xl text-right shadow-sm">
                <span className="block text-[10px] font-bold text-slate-500">الحالات بالانتظار:</span>
                <span className="block mt-1 text-sm font-black text-slate-800">
                  {loadingBookings ? 'جاري التحميل...' : `${queueCount} مرضى`}
                </span>
              </div>
              <div className="bg-white/80 border border-rose-100 p-4 rounded-2xl text-right shadow-sm">
                <span className="block text-[10px] font-bold text-slate-500">ساعة بدء الاستقبال:</span>
                <span className="block mt-1 text-sm font-black text-slate-800">
                  {formatArabicTime(workStart)}
                </span>
              </div>
              <div className="bg-white/80 border border-rose-100 p-4 rounded-2xl text-right shadow-sm">
                <span className="block text-[10px] font-bold text-slate-500">دورك المتوقع عند الحجز:</span>
                <span className="block mt-1 text-sm font-black text-purple-750">
                  رقم #{nextQueueNumber}
                </span>
              </div>
              <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100 p-4 rounded-2xl text-right shadow-sm">
                <span className="block text-[10px] font-bold text-emerald-600">الموعد المتوقع للكشف:</span>
                <span className="block mt-1 text-sm font-black text-emerald-700">
                  {formatArabicTime(estimatedTime)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 flex-wrap border-t border-rose-100/50 pt-6">
              <button
                type="button"
                onClick={() => {
                  setActiveDoctor(doctors[0] || null);
                  setIsModalOpen(true);
                }}
                className="px-7 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 clinic-btn"
                style={{ background: btnGradient, color: btnText, borderRadius: btnRadius }}
              >
                انضم إلى قائمة الانتظار الآن
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDoctor(null);
                  setIsModalOpen(true);
                }}
                className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-white border border-rose-100 text-slate-700 hover:bg-slate-50 transition-all"
              >
                استشارة عامة
              </button>
            </div>
          </div>
        </section>
        )}

        {/* 8. Reviews Section — Customer-submitted */}
        {isVisible('clinicReviews', true) && (
        <ReviewsSection shop={shop} primary={primary} title={t('business.builder.clinicPreview.testimonialsSection.title')} subtitle={t('business.builder.clinicPreview.testimonialsSection.subtitle')} badge="آراء العملاء" />
        )}

        {/* 9. Custom Pages Sections */}
        {isVisible('clinicCustomPages', true) && (
        <CustomPagesWidget
          config={config}
          primaryColor={primary}
          showHeader={false}
          showModal={false}
          enableHashRouting={false}
        />
        )}

        {/* 10. CTA Section */}
        {isVisible('clinicWhyChooseUs', true) && (
        <section>
          <div
            className="rounded-[2.5rem] p-6 sm:p-12 text-slate-900 border shadow-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${primary}1A, ${secondary}1A)`,
              borderColor: `${primary}30`,
            }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-355/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
              <div>
                <div className="text-lg sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-rose-950">
                  {t('business.builder.clinicPreview.cta.title')}
                </div>
                <div className="mt-3 text-xs sm:text-sm md:text-base font-bold text-slate-650 leading-relaxed max-w-xl">
                  {t('business.builder.clinicPreview.cta.subtitle')}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActiveDoctor(doctors[0] || null);
                    setIsModalOpen(true);
                  }}
                  className="px-7 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: btnGradient, color: btnText, borderRadius: btnRadius }}
                >
                  {t('business.builder.clinicPreview.cta.bookAppointment')}
                </button>
                <button
                  type="button"
                  className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-white border border-rose-100 text-slate-700 hover:bg-slate-50 hover:border-rose-200 transition-all shadow-sm"
                >
                  {t('business.builder.clinicPreview.cta.inquiry')}
                </button>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* 11. FAQ Section */}
        {isVisible('clinicFaq', true) && (
        <section id="faqs" className="bg-white/70 backdrop-blur-xl border border-rose-100/60 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-rose-100/10 space-y-4">
          <div className="flex items-center gap-3 border-r-4 pr-3.5 mb-6" style={{ borderColor: primary }}>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900">الأسئلة الشائعة</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">إجابات للأسئلة الأكثر شيوعاً</p>
            </div>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div key={idx} className="bg-slate-50/80 rounded-2xl border border-rose-100/40 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-right font-bold text-slate-900 text-sm flex justify-between items-center gap-4 transition hover:bg-rose-50/30"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ${activeFaq === idx ? 'max-h-40 border-t border-rose-100/40 p-4' : 'max-h-0 overflow-hidden'}`}>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* 12. Contact Section */}
        {isVisible('clinicContact', true) && (
        <section id="contact" className="bg-white/70 backdrop-blur-xl border border-rose-100/60 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-rose-100/10 space-y-4">
          <div className="flex items-center gap-3 border-r-4 pr-3.5 mb-6" style={{ borderColor: primary }}>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900">اتصل بنا</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">نحن هنا لمساعدتك دائماً</p>
            </div>
          </div>
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-rose-100/50 shadow-sm">
                <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${primary}20`, color: primary }}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-0.5">العنوان</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">{shop?.city || shop?.governorate || 'جمهورية مصر العربية'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-rose-100/50 shadow-sm">
                <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${primary}20`, color: primary }}>
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-0.5">الهاتف</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold" dir="ltr">{shop?.phone || '+20 10 0000 0000'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-rose-100/50 shadow-sm">
                <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${primary}20`, color: primary }}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-0.5">البريد الإلكتروني</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">support@clinic.com</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-white p-6 rounded-[1.5rem] shadow-md border border-rose-100/50">
                {contactSubmitted ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900">تم إرسال رسالتك بنجاح!</h4>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); if (contactName && contactEmail && contactMessage) { setContactSubmitted(true); setTimeout(() => { setContactSubmitted(false); setContactName(''); setContactEmail(''); setContactSubject(''); setContactMessage(''); }, 5000); } }} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-500">الاسم</label>
                        <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs focus:bg-white focus:outline-none font-semibold" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-500">البريد الإلكتروني</label>
                        <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs focus:bg-white focus:outline-none font-semibold text-left" dir="ltr" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500">الموضوع</label>
                      <input type="text" required value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs focus:bg-white focus:outline-none font-semibold" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500">نص الرسالة</label>
                      <textarea rows={4} required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs focus:bg-white focus:outline-none font-semibold" />
                    </div>
                    <button type="submit" className="w-full py-3.5 rounded-xl text-xs font-bold transition text-white clinic-btn" style={{ backgroundColor: btnBg, color: btnText, borderRadius: btnRadius }}>
                      إرسال الاستفسار
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
        )}
      </main>

      {/* 10. Footer */}
      {isVisible('footer', true) && (
      <footer
        className="py-16 px-4 sm:px-6 lg:px-8 border-t mt-auto relative z-10"
        style={{
          backgroundColor: config.footerTransparent ? 'transparent' : (config.footerBackgroundColor || '#0F172A'),
          color: config.footerTextColor || '#94A3B8',
          borderColor: `${config.footerTextColor || '#94A3B8'}20`,
        }}
      >
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg text-white" style={{ backgroundColor: primary }}>
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="logo" className="w-5 h-5 object-cover" />
                ) : (
                  <Stethoscope className="w-5 h-5" />
                )}
              </div>
              <span className="text-xl font-black text-white">{shop?.name || 'العيادة'}</span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm" style={{ opacity: 0.7 }}>
              {config.homeIntroText ||
                'منصة طبية متكاملة لتسهيل عملية حجز المواعيد بمظهر عصري وأداء فائق السرعة.'}
            </p>
          </div>
          {isVisible('footerQuickLinks', true) && (
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-black text-white">روابط سريعة</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-white transition">الرئيسية</a></li>
              <li><a href="#about" className="hover:text-white transition">من نحن</a></li>
              <li><a href="#specialties" className="hover:text-white transition">التخصصات</a></li>
              <li><a href="#doctors" className="hover:text-white transition">الأطباء</a></li>
              <li><a href="#reviews" className="hover:text-white transition">آراء المرضى</a></li>
            </ul>
          </div>
          )}
          {isVisible('footerContact', true) && (
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-black text-white">اتصل بنا</h4>
            <div className="space-y-2 text-xs">
              <p className="leading-relaxed">
                {shop?.city || shop?.governorate || 'جمهورية مصر العربية'}
              </p>
              <p dir="ltr" className="text-left md:text-right">
                {shop?.phone || '+20 10 0000 0000'}
              </p>
            </div>
          </div>
          )}
          <div className="md:col-span-12 pt-8 border-t text-center text-xs font-semibold" style={{ borderColor: `${config.footerTextColor || '#94A3B8'}20`, opacity: 0.5 }}>
            <p>
              جميع الحقوق محفوظة © {new Date().getFullYear()} {shop?.name || 'العيادة'}. صمم باحترافية.
            </p>
          </div>
        </div>
      </footer>
      )}

      {/* Luxury Interactive Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
            {/* Ambient glows inside modal */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-300/10 to-rose-300/10 rounded-full blur-xl pointer-events-none" />
            
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 border-b border-rose-100/50 flex justify-between items-center bg-gradient-to-r from-purple-50/50 to-rose-50/30 flex-row-reverse text-right z-10">
              <div>
                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-rose-955">
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
                className="w-10 h-10 rounded-full bg-white border border-rose-100 text-purple-400 hover:text-purple-650 flex items-center justify-center transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 relative z-10">
              {newBookingTicket ? (
                <div className="border-2 border-dashed border-rose-100 rounded-2xl p-6 bg-gradient-to-r from-purple-50/20 to-rose-50/20 relative overflow-hidden text-center space-y-4" dir="rtl">
                  <div className="absolute top-1/2 right-0 w-8 h-8 bg-white rounded-full translate-x-4 -translate-y-4 border border-rose-100" />
                  <div className="absolute top-1/2 left-0 w-8 h-8 bg-white rounded-full -translate-x-4 -translate-y-4 border border-rose-100" />
                  
                  <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-rose-500 text-white rounded-full shadow-md shadow-purple-100">
                    <CheckCircle2 size={32} />
                  </div>
                  
                  <h4 className="text-base font-black text-slate-800">تفاصيل دور الانتظار الخاص بك</h4>
                  
                  <div className="border-t border-b border-dashed border-rose-200 py-4 my-2 space-y-3">
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

                  <div className="bg-gradient-to-r from-purple-900 via-fuchsia-900 to-rose-900 text-white rounded-xl py-4 px-6 space-y-1 shadow-lg shadow-purple-900/10">
                    <div className="text-[10px] font-bold text-purple-200">رقم دورك في قائمة الانتظار</div>
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
                    className="w-full py-3.5 rounded-xl bg-white border border-rose-200 text-purple-700 hover:bg-slate-50 font-black text-xs transition-all shadow-sm"
                  >
                    إغلاق وتأكيد
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-5 text-right relative z-10" dir="rtl">
                  {errorMsg && (
                    <div className="bg-rose-50 text-rose-650 border border-rose-100 rounded-2xl p-4 text-xs font-black">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {/* Selected Doctor Info */}
                  {activeDoctor && (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50/30 to-rose-50/30 border border-rose-100/60 rounded-2xl p-4 flex-row-reverse shadow-inner">
                      <div className="w-12 h-12 rounded-[1rem] bg-white border border-rose-100 overflow-hidden shadow-sm flex items-center justify-center">
                        {activeDoctor.photoUrl ? (
                          <img src={activeDoctor.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User2 className="text-slate-355" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-400">الطبيب المختص</div>
                        <div className="text-sm font-black text-purple-955 mt-0.5">{activeDoctor.name}</div>
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
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-slate-50/30 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-400 transition-all text-right shadow-inner text-slate-800"
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
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-slate-50/30 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-400 transition-all text-right shadow-inner text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 mb-1.5">البريد الإلكتروني (اختياري)</label>
                      <input
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-slate-50/30 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-400 transition-all text-left shadow-inner text-slate-800"
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
                          className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-slate-50/30 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-400 transition-all text-right shadow-inner text-slate-800"
                        />
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-500/5 to-rose-500/5 border border-rose-100/50 rounded-2xl p-4 space-y-2">
                        <div className="text-[11px] font-black text-slate-500 flex justify-between">
                          <span>المرضى بقائمة الانتظار في هذا اليوم:</span>
                          <span className="text-slate-955">{queueCount} مرضى</span>
                        </div>
                        <div className="text-[11px] font-black text-slate-500 flex justify-between">
                          <span>دورك المتوقع عند التأكيد:</span>
                          <span className="text-purple-700 font-bold">رقم #{nextQueueNumber}</span>
                        </div>
                        <div className="text-[11px] font-black text-slate-500 flex justify-between">
                          <span>موعد الكشف التقريبي:</span>
                          <span className="text-emerald-700 font-black">{formatArabicTime(estimatedTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-rose-100/50 flex-row-reverse relative z-10">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 clinic-btn"
                      style={{ background: btnGradient, color: btnText, borderRadius: btnRadius }}
                    >
                      {isSubmitting ? 'جاري تسجيل الحجز...' : 'تأكيد وحجز الدور بالانتظار'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-white border border-rose-100 text-slate-700 hover:bg-slate-50 transition-all"
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

export default React.memo(ClinicTheme2);
