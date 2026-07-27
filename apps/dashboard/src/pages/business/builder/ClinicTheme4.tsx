import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Star,
  Heart,
  Stethoscope,
  User2,
  Search,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  CheckCircle,
  Award,
  ShieldCheck,
  ArrowLeft,
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
  if (!m || m.length < 3) return '15,23,42';
  return `${parseInt(m[0], 16)},${parseInt(m[1], 16)},${parseInt(m[2], 16)}`;
};

const ClinicTheme4: React.FC<Props> = ({
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

  const estimatedTime = useMemo(() => {
    const [h, m] = workStart.split(':').map(Number);
    const totalMinutes = h * 60 + m + queueCount * slotDuration;
    const finalH = Math.floor(totalMinutes / 60) % 24;
    const finalM = totalMinutes % 60;
    return `${String(finalH).padStart(2, '0')}:${String(finalM).padStart(2, '0')}`;
  }, [workStart, queueCount, slotDuration]);

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
      case 'Clock':
        return <Clock size={20} />;
      case 'Star':
        return <Star size={20} />;
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
  const pStyle = () => ({ backgroundColor: btnBg, color: btnText, borderRadius: btnRadius });
  const headerBg = config.headerTransparent
    ? `rgba(${hexToRgb(String(config.headerBackgroundColor || '#0F172A'))}, ${(config.headerOpacity ?? 80) / 100})`
    : (config.headerBackgroundColor || '#0F172A');
  const headerText = config.headerTextColor || '#0F172A';

  const handleBooking = async () => {
    if (!patientName || !patientPhone) {
      setErrorMsg('الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await ApiService.addBooking({
        shopId: shop?.id,
        itemId: activeDoctor?.id || 'general',
        customerName: patientName,
        customerPhone: patientPhone,
        customerEmail: patientEmail,
        bookingDate,
        slotTime: selectedSlot || slots[0]?.time || '16:00',
      });
      setNewBookingTicket({
        customerName: patientName,
        doctorName: activeDoctor?.name || 'العيادة',
        bookingDate,
        peopleAhead: queueCount,
        queueNumber: nextQueueNumber,
        estimatedTime: formatArabicTime(estimatedTime),
      });
      setSuccessMsg('تم الحجز بنجاح!');
      loadBookings();
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء الحجز');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="w-full flex flex-col font-sans relative" style={{ backgroundColor: pageBg }}>
      <style>{`.clinic-btn:hover{background-color:${btnHover}!important}`}</style>
      {/* Header */}
      {isVisible('header', true) && (
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl shadow-sm"
        style={{ backgroundColor: headerBg, borderColor: `${primary}20`, color: headerText }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: primary }}>
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Stethoscope size={20} />
              )}
            </div>
            <div>
              <span className="text-base font-black block leading-tight" style={{ color: config.headerTextColor || '#0F172A' }}>{shop?.name || 'العيادة'}</span>
              <span className="text-[10px] font-bold opacity-60" style={{ color: config.headerTextColor || '#0F172A' }}>حجوزات إلكترونية</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold" style={{ color: config.headerTextColor || '#0F172A' }}>
            <a href="#home" className="hover:opacity-100 transition" style={{ opacity: 0.7 }}>الرئيسية</a>
            {isVisible('clinicSpecialties', true) && specialties.length > 0 && (
              <a href="#specialties" className="hover:opacity-100 transition" style={{ opacity: 0.7 }}>التخصصات</a>
            )}
            {isVisible('clinicDoctors', true) && (
              <a href="#doctors" className="hover:opacity-100 transition" style={{ opacity: 0.7 }}>الأطباء</a>
            )}
            {isVisible('clinicAboutUs', true) && (config.homeAboutTitle || config.homeIntroText) && (
              <a href="#about" className="hover:opacity-100 transition" style={{ opacity: 0.7 }}>من نحن</a>
            )}
            {isVisible('clinicFaq', true) && (
              <a href="#faqs" className="hover:opacity-100 transition" style={{ opacity: 0.7 }}>الأسئلة الشائعة</a>
            )}
            {isVisible('clinicContact', true) && (
              <a href="#contact" className="hover:opacity-100 transition" style={{ opacity: 0.7 }}>اتصل بنا</a>
            )}
          </nav>
          <button
            onClick={() => { setActiveDoctor(doctors[0] || null); setIsModalOpen(true); }}
            className="px-4 py-2.5 rounded-xl text-xs font-black text-white shadow-md hover:shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: btnBg, color: btnText, borderRadius: btnRadius }}
          >
            احجز الآن
          </button>
        </div>
      </header>
      )}

      {/* Main */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Hero */}
        {isVisible('clinicHero', true) && (
        <section id="home" className="relative overflow-hidden rounded-3xl border shadow-xl" style={{ borderColor: `${primary}20`, background: `linear-gradient(135deg, ${primary}08, ${secondary}12)` }}>
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${primary}10` }} />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${secondary}10` }} />
          <div className="relative p-6 sm:p-10 md:p-14 grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5 text-center lg:text-right">
              <span className="inline-block text-xs font-bold px-4 py-2 rounded-full" style={{ backgroundColor: `${primary}15`, color: primary }}>
                {config.homeHeroBadge || 'عيادة متكاملة بخدمة احترافية'}
              </span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight" style={{ color: headerText }}>
                {config.homeHeroTitle || shop?.name || 'العيادة'}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto lg:mx-0">
                {config.homeIntroText || 'احجز موعدك بسهولة مع نخبة من الأطباء في مختلف التخصصات. خدمة سريعة وموثوقة.'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => { setActiveDoctor(doctors[0] || null); setIsModalOpen(true); }}
                  className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-lg transition-all active:scale-95 clinic-btn"
                  style={pStyle()}
                >
                  {t('business.builder.clinicPreview.cta.bookAppointment')}
                </button>
                <a
                  href="#doctors"
                  className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm border transition-all hover:shadow-md"
                  style={{ borderColor: `${primary}40`, color: headerText }}
                >
                  تعرف على أطبائنا
                </a>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="w-72 h-72 rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="logo" className="w-32 h-32 object-cover rounded-2xl" />
                ) : (
                  <Stethoscope className="w-32 h-32 text-white/90" />
                )}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* About Us */}
        {isVisible('clinicAboutUs', true) && (config.homeAboutTitle || config.homeIntroText) && (
        <section id="about" className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {config.homeAboutImageUrl && (
            <div className="w-full h-60 sm:h-72 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
              <img src={config.homeAboutImageUrl} alt="about" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-4">
            <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${primary}15`, color: primary }}>
              من نحن
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{config.homeAboutTitle || 'رعاية طبية تثق بها'}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{config.homeIntroText || 'نقدم خدمات طبية متميزة بفريق من الأطباء المتخصصين.'}</p>
          </div>
        </section>
        )}

        {/* Specialties */}
        {isVisible('clinicSpecialties', true) && (
        <section id="specialties" className="space-y-4">
          <div className="flex items-end justify-between gap-3 flex-wrap border-r-4 pr-3" style={{ borderColor: primary }}>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900">تخصصاتنا الطبية</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">رعاية شاملة عبر مجموعة واسعة من التخصصات</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialties.map((s) => (
              <div key={s.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-lg transition-all group">
                <div className="p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${primary}20`, color: primary }}>
                  {s.iconName ? renderIcon(s.iconName) : (s.icon as React.ReactNode) || <Stethoscope className="w-5 h-5" />}
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-1">{s.name}</h4>
                {s.description && <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>}
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Doctors */}
        {isVisible('clinicDoctors', true) && (
        <section id="doctors" className="space-y-4">
          <div className="flex items-end justify-between gap-3 flex-wrap border-r-4 pr-3" style={{ borderColor: primary }}>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900">أطباؤنا</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">نخبة من الاستشاريين والأخصائيين</p>
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن طبيب..."
                className="pr-9 pl-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/20 w-48"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.length > 0 ? filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-md" style={{ backgroundColor: primary }}>
                    {doc.name?.charAt(0) || <User2 size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{doc.name}</h4>
                    <p className="text-xs text-slate-400 font-bold">{doc.title}</p>
                  </div>
                </div>
                {doc.bio && <p className="text-xs text-slate-500 leading-relaxed mb-4">{doc.bio}</p>}
                <button
                  onClick={() => { setActiveDoctor(doc); setIsModalOpen(true); }}
                  className="w-full py-2.5 rounded-xl text-xs font-black text-white transition active:scale-95 clinic-btn"
                  style={pStyle()}
                >
                  احجز مع {doc.name}
                </button>
              </div>
            )) : (
              <div className="col-span-full text-center py-10 text-sm text-slate-400 font-bold">لا يوجد أطباء مطابقون للبحث</div>
            )}
          </div>
        </section>
        )}

        {/* Why Choose Us */}
        {isVisible('clinicWhyChooseUs', true) && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3 flex-wrap border-r-4 pr-3" style={{ borderColor: primary }}>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900">{config.clinicWhyTitle || 'لماذا تختار عيادتنا؟'}</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">{config.clinicWhyDesc || 'نضع راحتك وصحتك في المقام الأول'}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(() => {
              const iconMap: Record<string, any> = { Clock, Award, ShieldCheck, Phone, Star, Heart, CheckCircle2, Stethoscope, Calendar, User2 };
              const defaultCards = [
                { icon: 'Clock', title: 'حجوزات فورية ذكية', desc: 'تأكيد فوري ومباشر دون انتظار.' },
                { icon: 'Award', title: 'نخبة الكفاءات الطبية', desc: 'أطباء معتمدون ذوو خبرة واسعة.' },
                { icon: 'ShieldCheck', title: 'حماية تامة للبيانات', desc: 'بياناتك مشفرة وآمنة.' },
                { icon: 'Phone', title: 'تذكير تلقائي بالموعد', desc: 'رسائل تذكيرية لعدم فوات موعد.' },
              ];
              const cards = Array.isArray(config.clinicFeatureCards) && config.clinicFeatureCards.length > 0 ? config.clinicFeatureCards : defaultCards;
              return cards.map((card: any, i: number) => {
                const Icon = iconMap[card.icon] || Clock;
                return (
                  <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
                    <div className="p-2.5 rounded-xl w-fit" style={{ backgroundColor: `${primary}20`, color: primary }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900">{card.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                  </div>
                );
              });
            })()}
          </div>
        </section>
        )}

        {/* Booking Wizard / CTA */}
        {isVisible('clinicBookingWizard', true) && (
        <section className="rounded-3xl p-6 sm:p-10 text-center shadow-xl border" style={{ background: `linear-gradient(135deg, ${primary}0D, ${secondary}0D)`, borderColor: `${primary}20` }}>
          <div className="space-y-4 max-w-lg mx-auto">
            <span className="inline-block text-xs font-bold px-4 py-2 rounded-full" style={{ backgroundColor: `${primary}15`, color: primary }}>
              احجز موعدك
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">هل أنت مستعد لحجز موعدك؟</h3>
            <p className="text-sm text-slate-500 leading-relaxed">اختر الطبيب والوقت المناسب لك واحجز في دقائق معدودة.</p>
            <button
              onClick={() => { setActiveDoctor(doctors[0] || null); setIsModalOpen(true); }}
              className="px-8 py-4 rounded-xl font-black text-sm text-white shadow-lg transition-all active:scale-95 clinic-btn"
              style={pStyle()}
            >
              {t('business.builder.clinicPreview.cta.bookAppointment')}
            </button>
          </div>
        </section>
        )}

        {/* Reviews */}
        {isVisible('clinicReviews', true) && (
        <ReviewsSection shop={shop} primary={primary} title={t('business.builder.clinicPreview.testimonialsSection.title')} subtitle={t('business.builder.clinicPreview.testimonialsSection.subtitle')} badge="آراء العملاء" />
        )}

        {/* FAQ */}
        {isVisible('clinicFaq', true) && (
        <section id="faqs" className="space-y-4">
          <div className="flex items-end justify-between gap-3 flex-wrap border-r-4 pr-3" style={{ borderColor: primary }}>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900">الأسئلة الشائعة</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">إجابات للأسئلة الأكثر شيوعاً</p>
            </div>
          </div>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-right font-bold text-slate-900 text-sm flex justify-between items-center gap-4 transition hover:bg-slate-50"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ${activeFaq === idx ? 'max-h-40 border-t border-slate-100 p-4' : 'max-h-0 overflow-hidden'}`}>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Contact */}
        {isVisible('clinicContact', true) && (
        <section id="contact" className="space-y-4">
          <div className="flex items-end justify-between gap-3 flex-wrap border-r-4 pr-3" style={{ borderColor: primary }}>
            <div>
              <h3 className="text-base sm:text-xl font-black text-slate-900">اتصل بنا</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">نحن هنا لمساعدتك دائماً</p>
            </div>
          </div>
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${primary}20`, color: primary }}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-0.5">العنوان</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">{shop?.city || shop?.governorate || 'جمهورية مصر العربية'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${primary}20`, color: primary }}>
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-0.5">الهاتف</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold" dir="ltr">{shop?.phone || '+20 10 0000 0000'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
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
              <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
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
                    <button type="submit" className="w-full py-3.5 rounded-xl text-xs font-bold transition text-white" style={{ backgroundColor: btnBg, color: btnText, borderRadius: btnRadius }}>
                      إرسال الاستفسار
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Custom Pages */}
        {isVisible('clinicCustomPages', true) && (
        <CustomPagesWidget
          config={config}
          primaryColor={primary}
          showHeader={false}
          showModal={false}
          enableHashRouting={false}
        />
        )}
      </main>

      {/* Footer */}
      {isVisible('footer', true) && (
      <footer
        className="py-16 px-4 sm:px-6 lg:px-8 border-t"
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
              {config.homeIntroText || 'منصة طبية متكاملة لتسهيل عملية حجز المواعيد بمظهر عصري وأداء فائق السرعة.'}
            </p>
          </div>
          {isVisible('footerQuickLinks', true) && (
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-sm font-black text-white">روابط سريعة</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#home" className="hover:text-white transition">الرئيسية</a></li>
              <li><a href="#about" className="hover:text-white transition">من نحن</a></li>
              <li><a href="#doctors" className="hover:text-white transition">الأطباء</a></li>
              <li><a href="#reviews" className="hover:text-white transition">آراء المرضى</a></li>
              <li><a href="#faqs" className="hover:text-white transition">الأسئلة الشائعة</a></li>
            </ul>
          </div>
          )}
          {isVisible('footerContact', true) && (
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-black text-white">اتصل بنا</h4>
            <div className="space-y-2 text-xs">
              <p className="leading-relaxed">{shop?.city || shop?.governorate || 'جمهورية مصر العربية'}</p>
              <p dir="ltr" className="text-left md:text-right">{shop?.phone || '+20 10 0000 0000'}</p>
            </div>
          </div>
          )}
          <div className="md:col-span-12 pt-8 border-t text-center text-xs font-semibold" style={{ borderColor: `${config.footerTextColor || '#94A3B8'}20`, opacity: 0.5 }}>
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {shop?.name || 'العيادة'}. صمم باحترافية.</p>
          </div>
        </div>
      </footer>
      )}

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-row-reverse text-right">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {newBookingTicket ? 'تذكرة الحجز المعتمدة' : 'تأكيد حجز الموعد'}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">
                  {newBookingTicket ? 'تم تسجيل حجزك بنجاح' : 'الرجاء إدخال بيانات المريض لإتمام الحجز'}
                </p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setNewBookingTicket(null); }}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {newBookingTicket ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 relative overflow-hidden text-center space-y-4" dir="rtl">
                  <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-base font-black text-slate-800">تفاصيل الحجز</h4>
                  <div className="border-t border-b border-dashed border-slate-200 py-4 my-2 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>اسم المريض:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.customerName}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>الطبيب:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.doctorName}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>تاريخ الحجز:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.bookingDate}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>رقم الدور:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.queueNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>المرضى أمامك:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.peopleAhead} مرضى</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 text-right">
                      <span>الوقت المقدر:</span>
                      <span className="text-slate-900 font-black">{newBookingTicket.estimatedTime}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setIsModalOpen(false); setNewBookingTicket(null); }}
                    className="w-full py-3 rounded-xl text-xs font-black text-white clinic-btn"
                    style={pStyle()}
                  >
                    تم
                  </button>
                </div>
              ) : (
                <div className="space-y-4" dir="rtl">
                  {activeDoctor && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ backgroundColor: primary }}>
                        {activeDoctor.name?.charAt(0) || <User2 size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{activeDoctor.name}</p>
                        <p className="text-xs text-slate-400 font-bold">{activeDoctor.title}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500">التاريخ</label>
                    <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:bg-white focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500">الموعد</label>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedSlot(slot.time)}
                          disabled={!slot.available}
                          className={`py-2.5 rounded-xl text-xs font-bold transition ${selectedSlot === slot.time ? 'text-white shadow-md' : slot.available ? 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                          style={selectedSlot === slot.time ? pStyle() : {}}
                        >
                          {slot.label || slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500">الاسم الكامل</label>
                    <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:bg-white focus:outline-none" placeholder="ادخل اسمك" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500">رقم الهاتف</label>
                    <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:bg-white focus:outline-none text-left" dir="ltr" placeholder="01xxxxxxxxx" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-500">البريد الإلكتروني (اختياري)</label>
                    <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:bg-white focus:outline-none text-left" dir="ltr" placeholder="email@example.com" />
                  </div>
                  {errorMsg && <p className="text-xs font-bold text-red-500 text-center">{errorMsg}</p>}
                  <button
                    onClick={handleBooking}
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl text-xs font-black text-white shadow-lg transition active:scale-95 disabled:opacity-50 clinic-btn"
                    style={pStyle()}
                  >
                    {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ClinicTheme4);
