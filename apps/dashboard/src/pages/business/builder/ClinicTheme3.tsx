import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Check,
  Award,
  ShieldCheck,
  Sparkles,
  Printer,
  ArrowLeft,
  Filter,
  AlertCircle,
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

const ClinicTheme3: React.FC<Props> = ({
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

  const wizardRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const [wizardStep, setWizardStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<any>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [dynamicDoctors, setDynamicDoctors] = useState<any[]>([]);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const elementsVisibility = (config?.elementsVisibility || {}) as Record<string, any>;
  const isVisible = (key: string, fallback: boolean = true) => {
    if (!elementsVisibility || typeof elementsVisibility !== 'object') return fallback;
    if (elementsVisibility[key] === undefined || elementsVisibility[key] === null) return fallback;
    return Boolean(elementsVisibility[key]);
  };

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

  useEffect(() => {
    if (doctors.length === 0 && shop?.pageDesign?.clinicDoctorsList) {
      const shopDoctors = Array.isArray(shop.pageDesign.clinicDoctorsList) ? shop.pageDesign.clinicDoctorsList : [];
      if (shopDoctors.length > 0) setDynamicDoctors(shopDoctors);
    }
  }, [shop?.pageDesign?.clinicDoctorsList, doctors.length]);

  const allDoctors = doctors.length > 0 ? doctors : dynamicDoctors;

  const workStart = shop?.pageDesign?.bookingWorkStart || config?.bookingWorkStart || '16:00';
  const slotDuration = shop?.pageDesign?.bookingSlotDuration || config?.bookingSlotDuration || 30;

  const currentQueue = useMemo(() => {
    const docId = selectedDoctor?.id || 'general';
    return bookings.filter((b: any) => {
      const isSameDoc = b.itemId === docId;
      const isSameDate = b.bookingDate === selectedDate;
      const isNotCancelled =
        b.status?.toLowerCase() !== 'cancelled' && b.status?.toLowerCase() !== 'rejected';
      return isSameDoc && isSameDate && isNotCancelled;
    });
  }, [bookings, selectedDoctor, selectedDate]);

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

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      setFormError('يرجى ملء جميع الحقول المطلوبة للمتابعة.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      const targetShopId = shop?.id || '';
      if (!targetShopId) {
        setFormError('لا يمكن إنشاء الحجز بدون ربطه بمتجر حقيقي.');
        return;
      }
      const payload = {
        itemId: selectedDoctor?.id || 'general',
        itemName: selectedDoctor?.name || 'استشارة عامة',
        itemImage: selectedDoctor?.photoUrl || '',
        itemPrice: 300,
        shopId: targetShopId,
        customerName: patientName,
        customerPhone: patientPhone,
        customerEmail: patientEmail,
        bookingDate: selectedDate,
        bookingTime: selectedSlot || estimatedTime,
        status: 'PENDING',
        metadata: {
          queueNumber: nextQueueNumber,
          peopleAhead: queueCount,
          estimatedTime: estimatedTime,
        },
      };
      await ApiService.addBooking(payload);
      setConfirmedTicket({
        customerName: patientName,
        doctorName: selectedDoctor?.name || 'العيادة العامة',
        doctorTitle: selectedDoctor?.title || 'استشارة عامة',
        bookingDate: selectedDate,
        bookingTime: selectedSlot || estimatedTime,
        queueNumber: nextQueueNumber,
        peopleAhead: queueCount,
        estimatedTime: estimatedTime,
      });
      setWizardStep(5);
      loadBookings();
    } catch (err: any) {
      setFormError(err?.message || 'فشل الحجز، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setSelectedSpecialty('');
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedSlot('');
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setFormError('');
    setConfirmedTicket(null);
  };

  const wizardDoctors = useMemo(() => {
    if (!selectedSpecialty) return allDoctors;
    const filtered = allDoctors.filter(
      (d: any) =>
        d.specialty === selectedSpecialty ||
        d.specialtyId === selectedSpecialty ||
        d.specialtyName === selectedSpecialty,
    );
    return filtered.length > 0 ? filtered : allDoctors;
  }, [allDoctors, selectedSpecialty]);

  const faqItems = [
    {
      q: 'هل الحجز عبر المنصة مجاني بالكامل؟',
      a: 'نعم، حجز المواعيد عبر منصتنا مجاني 100%. الرسوم المدفوعة هي قيمة كشف الطبيب التي تدفعها في العيادة.',
    },
    {
      q: 'كيف يمكنني تعديل أو إلغاء موعدي؟',
      a: 'يمكنك بسهولة تعديل أو إلغاء الموعد عبر بوابة المريض، وذلك قبل 24 ساعة على الأقل من الموعد المقرر.',
    },
    {
      q: 'هل تقبل العيادات بطاقات التأمين الطبي؟',
      a: 'نعم، يمكنك إضافة رقم تأمينك أثناء تعبئة البيانات لتسهيل الإجراءات.',
    },
    {
      q: 'ماذا يحدث إذا تأخرت عن موعدي؟',
      a: 'نوصي بالوصول قبل الموعد بـ 15 دقيقة. إذا تأخرت، ستبذل العيادة جهدها لجدولتك في أقرب نافذة متاحة.',
    },
  ];

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
  const pStyle = (extra?: string) => ({
    backgroundColor: btnBg,
    color: extra || btnText,
    borderRadius: btnRadius,
  });

  return (
    <div
      dir="rtl"
      className="w-full flex flex-col font-sans relative"
      style={{ backgroundColor: pageBg }}
    >
      <style>{`.clinic-btn:hover{background-color:${btnHover}!important}`}</style>
      {/* Header */}
      {isVisible('header', true) && (
      <nav
        className="backdrop-blur-md sticky top-0 z-30 border-b transition-all"
        style={{
          backgroundColor: config.headerTransparent ? `rgba(${hexToRgb(String(config.headerBackgroundColor || '#FFFFFF'))}, ${(config.headerOpacity ?? 95) / 100})` : (config.headerBackgroundColor || '#FFFFFF'),
          borderColor: `${primary}20`,
          color: config.headerTextColor || '#0F172A',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${primary}20`, color: primary }}
              >
                {logoDataUrl ? (
                  <img src={logoDataUrl} alt="logo" className="w-7 h-7 object-cover" />
                ) : (
                  <Stethoscope className="w-7 h-7" />
                )}
              </div>
              <div>
                <span className="text-2xl font-black block tracking-tight" style={{ color: config.headerTextColor || '#0F172A' }}>
                  {shop?.name || t('business.builder.clinicPreview.header.title')}
                </span>
                <span className="text-[10px] font-medium block opacity-60" style={{ color: config.headerTextColor || '#0F172A' }}>
                  {t('business.builder.clinicPreview.header.subtitle')}
                </span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-8 text-sm font-semibold" style={{ color: config.headerTextColor || '#0F172A' }}>
              <a href="#home" className="hover:opacity-100 transition opacity-70">
                الرئيسية
              </a>
              {isVisible('clinicSpecialties', true) && (
                <a href="#specialties" className="hover:opacity-100 transition opacity-70">
                  التخصصات
                </a>
              )}
              {isVisible('clinicDoctors', true) && (
                <a href="#doctors" className="hover:opacity-100 transition opacity-70">
                  الأطباء
                </a>
              )}
              {isVisible('clinicAboutUs', true) && (config.homeAboutTitle || config.homeIntroText) && (
                <a href="#about" className="hover:opacity-100 transition opacity-70">
                  من نحن
                </a>
              )}
              {isVisible('clinicFaq', true) && (
                <a href="#faqs" className="hover:opacity-100 transition opacity-70">
                  الأسئلة الشائعة
                </a>
              )}
              {isVisible('clinicContact', true) && (
                <a href="#contact" className="hover:opacity-100 transition opacity-70">
                  اتصل بنا
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  resetWizard();
                  wizardRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2 px-5 text-sm font-bold rounded-xl transition text-white clinic-btn"
                style={pStyle()}
              >
                {t('business.builder.clinicPreview.header.bookNow')}
              </button>
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Hero */}
      {isVisible('clinicHero', true) && (
      <section
        id="home"
        className="relative pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-60"
            style={{ background: `radial-gradient(circle, ${primary}15, transparent)` }}
          />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-slate-100 blur-2xl opacity-40" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                <Sparkles className="w-4 h-4" />
                <span>{config.clinicHeroBadge || 'شريكك الموثوق لرعاية صحية متكاملة'}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight sm:leading-snug">
                {config.clinicHeroTitle || 'احجز موعدك الطبي بلمسة زر وبكل سهولة'}
              </h1>
              <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-2xl">
                {config.clinicHeroDesc || 'منصتنا تتيح لك الوصول إلى نخبة من الأطباء والاستشاريين في جميع التخصصات الطبية، مع حجز فوري ومؤكد لراحتك وسلامتك.'}
              </p>

              {/* Search */}
              <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-100 grid sm:grid-cols-12 gap-2 max-w-3xl">
                <div className="sm:col-span-5 relative flex items-center">
                  <Search className="absolute right-4 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="ابحث عن طبيب أو تخصص..."
                    className="w-full py-3.5 pr-11 pl-4 text-sm bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-xl focus:outline-none transition text-right"
                  />
                </div>
                <div className="sm:col-span-4 relative flex items-center">
                  <Filter className="absolute right-4 text-slate-400 w-4 h-4" />
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full py-3.5 pr-10 pl-4 text-xs bg-slate-50 border border-slate-100 focus:border-slate-300 focus:bg-white rounded-xl focus:outline-none appearance-none cursor-pointer font-semibold text-slate-600 text-right"
                  >
                    <option value="">كل التخصصات</option>
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-4 text-slate-400 w-4 h-4 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedSpecialty) {
                      setWizardStep(2);
                      wizardRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="sm:col-span-3 py-3.5 px-4 font-bold text-sm rounded-xl transition text-white clinic-btn"
                  style={pStyle()}
                >
                  بحث سريع
                </button>
              </div>

            </div>

            {/* Hero Right */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -right-6 -bottom-6 w-72 h-72 rounded-full border-4 border-dashed border-slate-200 pointer-events-none" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                  {config.homeAboutImageUrl ? (
                    <img
                      src={config.homeAboutImageUrl}
                      alt="Clinic"
                      className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-[450px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <Stethoscope className="w-24 h-24 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/60 max-w-xs flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-lg"
                      style={{ backgroundColor: `${primary}20`, color: primary }}
                    >
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">
                        المعايير المعتمدة
                      </span>
                      <span className="text-sm font-bold text-slate-800 block">
                        رعاية معتمدة عالمياً
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Booking Wizard */}
      {isVisible('clinicBookingWizard', true) && (
      <section
        ref={wizardRef}
        id="booking-wizard"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-b border-slate-100"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-10">
            <span
              className="inline-block text-xs font-bold px-3.5 py-1.5 rounded-full"
              style={{ backgroundColor: `${primary}15`, color: primary }}
            >
              احجز الآن
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              احجز موعدك الآن في دقائق
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              اختر التخصص، الطبيب المناسب، والوقت المفضل لتأكيد حجزك فورياً.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Step indicators */}
            <div className="bg-slate-50 border-b border-slate-100 px-4 sm:px-6 py-4 grid grid-cols-5 text-center text-xs font-bold text-slate-400">
              {[
                { step: 1, label: '1. التخصص' },
                { step: 2, label: '2. الطبيب' },
                { step: 3, label: '3. التاريخ والوقت' },
                { step: 4, label: '4. بيانات المريض' },
                { step: 5, label: '5. تأكيد الموعد' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => wizardStep > s.step && s.step < 5 && setWizardStep(s.step)}
                  disabled={wizardStep === 5}
                  className={`py-2 px-1 border-b-2 transition ${
                    wizardStep === s.step
                      ? 'border-current'
                      : wizardStep > s.step
                        ? 'text-slate-800 border-slate-300'
                        : 'border-transparent'
                  }`}
                  style={wizardStep === s.step ? { color: primary, borderColor: primary } : {}}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8 min-h-[350px]">
              {/* Step 1: Specialty */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
                    الرجاء اختيار القسم الطبي للبدء:
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {specialties.map((s) => {
                      const isSelected = selectedSpecialty === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            setSelectedSpecialty(s.id);
                            if (selectedDoctor && selectedDoctor.specialty !== s.id) {
                              setSelectedDoctor(null);
                            }
                          }}
                          className={`p-5 rounded-2xl text-right border transition-all flex items-start gap-4 ${
                            isSelected
                              ? 'bg-slate-50 ring-2'
                              : 'border-slate-150 hover:border-slate-300 bg-white'
                          }`}
                          style={
                            isSelected
                              ? { borderColor: primary, boxShadow: `0 0 0 2px ${primary}20` }
                              : {}
                          }
                        >
                          <div
                            className="p-3 rounded-xl transition"
                            style={
                              isSelected
                                ? { backgroundColor: primary, color: 'white' }
                                : { backgroundColor: '#f1f5f9', color: '#64748b' }
                            }
                          >
                            {s.iconName
                              ? renderIcon(s.iconName)
                              : (s.icon as React.ReactNode) || <Stethoscope size={20} />}
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 block">{s.name}</span>
                            {s.description && (
                              <span className="text-xs text-slate-400 block line-clamp-2 leading-relaxed">
                                {s.description}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="py-3 px-8 text-sm font-bold rounded-xl transition text-white clinic-btn"
                      style={pStyle()}
                    >
                      التالي
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Doctor */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
                    اختر الطبيب المناسب لرعايتك:
                    <span className="text-xs font-bold text-slate-400 mr-2">({wizardDoctors.length} طبيب متاح)</span>
                  </h3>
                  <div className="space-y-4">
                    {wizardDoctors.map((doc) => {
                      const isSelected = selectedDoctor?.id === doc.id;
                      return (
                        <div
                          key={doc.id}
                          className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-slate-50 ring-2'
                              : 'border-slate-150 hover:border-slate-300 bg-white'
                          }`}
                          style={
                            isSelected
                              ? { borderColor: primary, boxShadow: `0 0 0 2px ${primary}20` }
                              : {}
                          }
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-150 shadow-inner bg-slate-50 flex items-center justify-center">
                              {doc.photoUrl ? (
                                <img
                                  src={doc.photoUrl}
                                  alt={doc.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User2 className="text-slate-300" size={28} />
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 block text-base">
                                  {doc.name}
                                </span>
                                {doc.rating && (
                                  <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                    {doc.rating}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-slate-400 block">
                                {doc.title}
                              </span>
                              {doc.bio && (
                                <span className="text-[11px] text-slate-500 block leading-relaxed line-clamp-2 max-w-xl">
                                  {doc.bio}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-end gap-2 shrink-0">
                            <button
                              onClick={() => setSelectedDoctor(doc)}
                              className={`py-2 px-5 rounded-lg text-xs font-bold transition ${
                                isSelected
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isSelected ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> تم الاختيار
                                </span>
                              ) : (
                                'اختر هذا'
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="py-3 px-6 text-sm font-bold border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                    >
                      السابق
                    </button>
                    <button
                      onClick={() => setWizardStep(3)}
                      disabled={!selectedDoctor}
                      className="py-3 px-8 text-sm font-bold rounded-xl transition text-white disabled:bg-slate-100 disabled:text-slate-400 clinic-btn"
                      style={!selectedDoctor ? {} : pStyle()}
                    >
                      التالي
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Date & Time */}
              {wizardStep === 3 && selectedDoctor && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
                    اختر التاريخ والوقت المتاحين:
                  </h3>
                  <div className="grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">
                        اختر تاريخ الزيارة
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedSlot('');
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none font-bold"
                      />
                      {selectedDate && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-slate-100 text-[11px] text-slate-500 space-y-1">
                          <div className="flex justify-between">
                            <span>المرضى في الانتظار:</span>
                            <span className="font-bold text-slate-700">
                              {loadingBookings ? '...' : queueCount} مرضى
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>دورك المتوقع:</span>
                            <span className="font-bold" style={{ color: primary }}>
                              #{nextQueueNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>موعد الكشف المتوقع:</span>
                            <span className="font-bold text-emerald-700">
                              {formatArabicTime(estimatedTime)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-7 space-y-4">
                      {selectedDate ? (
                        <>
                          <div>
                            <span className="text-xs font-black text-slate-400 block mb-2 uppercase tracking-wider">
                              الفترة الصباحية
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {slots
                                .filter(
                                  (s: any) =>
                                    String(s.time || s.label || '').includes('AM') ||
                                    Number(String(s.time || '00').split(':')[0]) < 12,
                                )
                                .map((slot: any, idx: number) => {
                                  const slotLabel = slot.label || slot.time || String(slot);
                                  const isSelected = selectedSlot === slotLabel;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => setSelectedSlot(slotLabel)}
                                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                                        isSelected
                                          ? 'text-white border-transparent shadow-lg'
                                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                      }`}
                                      style={isSelected ? pStyle() : {}}
                                    >
                                      {slotLabel}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                          <div className="pt-2">
                            <span className="text-xs font-black text-slate-400 block mb-2 uppercase tracking-wider">
                              الفترة المسائية
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {slots
                                .filter(
                                  (s: any) =>
                                    String(s.time || s.label || '').includes('PM') ||
                                    Number(String(s.time || '00').split(':')[0]) >= 12,
                                )
                                .map((slot: any, idx: number) => {
                                  const slotLabel = slot.label || slot.time || String(slot);
                                  const isSelected = selectedSlot === slotLabel;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => setSelectedSlot(slotLabel)}
                                      className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                                        isSelected
                                          ? 'text-white border-transparent shadow-lg'
                                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                      }`}
                                      style={isSelected ? pStyle() : {}}
                                    >
                                      {slotLabel}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 border-2 border-dashed border-slate-150 rounded-2xl bg-slate-50">
                          <Calendar className="w-10 h-10 text-slate-300 mb-2" />
                          <span className="text-xs font-bold text-slate-500">
                            الرجاء تحديد تاريخ الموعد أولاً لعرض التوقيتات المتاحة
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="py-3 px-6 text-sm font-bold border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                    >
                      السابق
                    </button>
                    <button
                      onClick={() => setWizardStep(4)}
                      disabled={!selectedDate}
                      className="py-3 px-8 text-sm font-bold rounded-xl transition text-white disabled:bg-slate-100 disabled:text-slate-400 clinic-btn"
                      style={!selectedDate ? {} : pStyle()}
                    >
                      التالي
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Patient Details */}
              {wizardStep === 4 && selectedDoctor && (
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primary }} />
                    يرجى ملء بيانات المريض لتأكيد الحجز المبدئي:
                  </h3>
                  {formError && (
                    <div className="p-4 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl border border-rose-100 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formError}</span>
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500">
                        الاسم الكامل للمريض *
                      </label>
                      <div className="relative flex items-center">
                        <User2 className="absolute right-3.5 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="مثال: محمد أحمد علي"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-4 text-sm focus:bg-white focus:outline-none font-semibold text-right"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500">رقم الهاتف *</label>
                      <div className="relative flex items-center">
                        <Phone className="absolute right-3.5 text-slate-400 w-4 h-4" />
                        <input
                          type="tel"
                          required
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="01000000000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-10 pl-4 text-sm focus:bg-white focus:outline-none font-semibold text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-slate-500">
                        البريد الإلكتروني (اختياري)
                      </label>
                      <input
                        type="email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="example@mail.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:bg-white focus:outline-none font-semibold text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  {/* Queue summary */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2">
                    <div className="text-[11px] font-black text-slate-500 flex justify-between">
                      <span>المرضى بقائمة الانتظار:</span>
                      <span className="text-slate-900">{queueCount} مرضى</span>
                    </div>
                    <div className="text-[11px] font-black text-slate-500 flex justify-between">
                      <span>دورك المتوقع:</span>
                      <span className="font-bold" style={{ color: primary }}>
                        #{nextQueueNumber}
                      </span>
                    </div>
                    <div className="text-[11px] font-black text-slate-500 flex justify-between">
                      <span>موعد الكشف التقريبي:</span>
                      <span className="text-emerald-700 font-black">
                        {formatArabicTime(estimatedTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="py-3 px-6 text-sm font-bold border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
                    >
                      السابق
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-3 px-8 text-sm font-bold rounded-xl transition text-white clinic-btn"
                      style={pStyle()}
                    >
                      {isSubmitting ? 'جاري التأكيد...' : 'تأكيد وإصدار التذكرة'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 5: Ticket */}
              {wizardStep === 5 && confirmedTicket && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 text-emerald-600 mb-1">
                      <CheckCircle className="w-10 h-10 animate-bounce" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">تم تأكيد موعدك بنجاح!</h3>
                    <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                      تم حجز المقعد وإصدار تذكرة الموعد الرسمية. يرجى إبرازها عند شباك الاستقبال
                      بالعيادة.
                    </p>
                  </div>
                  <div ref={ticketRef} className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden relative p-6 sm:p-8 space-y-6">
                    <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-white border-r border-slate-200 transform -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border-l border-slate-200 transform -translate-y-1/2" />
                    <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <span className="text-xs text-slate-400 font-bold block">رقم التذكرة:</span>
                        <span className="text-lg font-black block text-slate-800">
                          SHF-{confirmedTicket.queueNumber}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="text-xs text-slate-400 font-bold block">
                          تاريخ الإصدار
                        </span>
                        <span className="text-xs text-slate-500 font-semibold block">
                          {new Date().toLocaleString('ar-EG')}
                        </span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                          اسم المريض:
                        </span>
                        <span className="font-bold text-slate-800">
                          {confirmedTicket.customerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                          الطبيب المعالج:
                        </span>
                        <span className="font-black" style={{ color: primary }}>
                          {confirmedTicket.doctorName}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                          التاريخ والوقت:
                        </span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {confirmedTicket.bookingDate} - {confirmedTicket.bookingTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-semibold block mb-0.5">
                          حالة الحجز:
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          مؤكد فورياً
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-900 text-white rounded-xl py-4 px-6 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400">
                        رقم دورك في قائمة الانتظار
                      </div>
                      <div className="text-3xl font-black tracking-widest">
                        {confirmedTicket.queueNumber}#
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-between gap-3 pt-2">
                    <button
                      onClick={() => {
                        if (!ticketRef.current) return;
                        const ticket = ticketRef.current;
                        const win = window.open('', '_blank', 'width=800,height=600');
                        if (!win) return;
                        win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>تذكرة الحجز</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;padding:24px;background:#fff;display:flex;justify-content:center}</style></head><body>${ticket.outerHTML}</body></html>`);
                        win.document.close();
                        win.focus();
                        setTimeout(() => { win.print(); win.close(); }, 300);
                      }}
                      className="py-3 px-6 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 transition flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      طباعة التذكرة
                    </button>
                    <button
                      onClick={resetWizard}
                      className="py-3 px-8 text-sm font-bold rounded-xl transition text-white clinic-btn"
                      style={pStyle()}
                    >
                      حجز موعد آخر
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Specialties */}
      {isVisible('clinicSpecialties', true) && (
      <section id="specialties" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <span
              className="inline-block text-xs font-bold px-3.5 py-1.5 rounded-full"
              style={{ backgroundColor: `${primary}15`, color: primary }}
            >
              التخصصات
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              تخصصاتنا الطبية المتميزة
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              نقدم رعاية طبية شاملة ومخصصة عبر مجموعة واسعة من الأقسام المجهزة بأحدث التقنيات.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((s) => (
              <div
                key={s.id}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all group"
              >
                <div
                  className="p-3.5 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${primary}20`, color: primary }}
                >
                  {s.iconName
                    ? renderIcon(s.iconName)
                    : (s.icon as React.ReactNode) || <Stethoscope className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.name}</h3>
                {s.description && (
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{s.description}</p>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200/60 text-xs">
                  <button
                    onClick={() => {
                      setSelectedSpecialty(s.id);
                      setWizardStep(2);
                      wizardRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="font-bold transition flex items-center gap-1"
                    style={{ color: primary }}
                  >
                    <span>عرض الأطباء</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Doctors */}
      {isVisible('clinicDoctors', true) && (
      <section
        id="doctors"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-b border-slate-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-10">
            <span
              className="inline-block text-xs font-bold px-3.5 py-1.5 rounded-full"
              style={{ backgroundColor: `${primary}15`, color: primary }}
            >
              الأطباء
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              نخبة أطبائنا واستشاريينا
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              فريق طبي متكامل من ذوي الخبرة الطويلة لضمان سلامتك ورعايتك.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredDoctors.length > 0 ? filteredDoctors : allDoctors).map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
              >
                <div className="relative">
                  {doc.photoUrl ? (
                    <img
                      src={doc.photoUrl}
                      alt={doc.name}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-slate-100 flex items-center justify-center">
                      <User2 className="w-16 h-16 text-slate-300" />
                    </div>
                  )}
                  {doc.rating && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1 text-slate-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>
                        {doc.rating} ({doc.reviews || 0})
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900">{doc.name}</h3>
                    <p className="text-xs text-slate-400 font-bold">{doc.title}</p>
                  </div>
                  {doc.bio && (
                    <p className="text-xs text-slate-500 leading-relaxed flex-grow">{doc.bio}</p>
                  )}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-semibold">
                    {doc.next && (
                      <span className="text-slate-400">
                        أقرب موعد: <strong className="text-slate-900">{doc.next}</strong>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setSelectedSpecialty(doc.specialty || doc.specialtyId || '');
                      setWizardStep(3);
                      wizardRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 text-white clinic-btn"
                    style={pStyle()}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>حجز موعد</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Why Choose Us */}
      {isVisible('clinicWhyChooseUs', true) && (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <span
              className="inline-block text-xs font-bold px-3.5 py-1.5 rounded-full"
              style={{ backgroundColor: `${primary}15`, color: primary }}
            >
              {config.clinicWhyBadge || 'لماذا نحن؟'}
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {config.clinicWhyTitle || 'لماذا تختار منصتنا للحجوزات؟'}
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              {config.clinicWhyDesc || 'نضع راحتك وصحتك في المقام الأول من خلال تقديم خدمات ذكية وسريعة.'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(() => {
              const iconMap: Record<string, any> = { Clock, Award, ShieldCheck, Phone, Star, Heart, CheckCircle2, Stethoscope, Calendar, User2 };
              const defaultCards = [
                { icon: 'Clock', title: 'حجوزات فورية ذكية', desc: 'تأكيد فوري ومباشر دون الحاجة لانتظار مكالمات التأكيد.' },
                { icon: 'Award', title: 'نخبة الكفاءات الطبية', desc: 'أطباء معتمدون واستشاريون ذوو سمعة مرموقة وخبرة واسعة.' },
                { icon: 'ShieldCheck', title: 'حماية تامة للبيانات', desc: 'بياناتك الصحية والشخصية مشفرة بالكامل وآمنة.' },
                { icon: 'Phone', title: 'تذكير تلقائي بالموعد', desc: 'رسائل تذكيرية وتنبيهات مباشرة لضمان عدم فوات أي موعد.' },
              ];
              const cards = Array.isArray(config.clinicFeatureCards) && config.clinicFeatureCards.length > 0
                ? config.clinicFeatureCards
                : defaultCards;
              return cards.map((card: any, i: number) => {
                const Icon = iconMap[card.icon] || Clock;
                return (
                  <div
                    key={i}
                    className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4"
                  >
                    <div
                      className="p-3 rounded-xl w-fit"
                      style={{ backgroundColor: `${primary}20`, color: primary }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </section>
      )}

      {/* About Us */}
      {isVisible('clinicAboutUs', true) && (config.homeAboutTitle || config.homeIntroText) && (
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {config.homeAboutImageUrl && (
              <div className="lg:col-span-5">
                <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                  <img src={config.homeAboutImageUrl} alt={config.homeAboutTitle || 'من نحن'} className="w-full h-80 object-cover" />
                </div>
              </div>
            )}
            <div className={config.homeAboutImageUrl ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12 space-y-4'}>
              <span
                className="inline-block text-xs font-bold px-3.5 py-1.5 rounded-full"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                {config.homeAboutTitle || 'من نحن'}
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {config.homeAboutTitle || 'من نحن'}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {config.homeIntroText || 'نحن نلتزم بتقديم أفضل الخدمات الطبية المتميزة بأعلى مستويات الجودة والاحترافية ورعاية لا تضاهى لمرضانا.'}
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Reviews — Customer-submitted */}
      {isVisible('clinicReviews', true) && (
      <ReviewsSection shop={shop} primary={primary} title="ماذا يقول مرضانا؟" badge="آراء العملاء" />
      )}

      {/* FAQ */}
      {isVisible('clinicFaq', true) && (
      <section id="faqs" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <span
              className="inline-block text-xs font-bold px-3.5 py-1.5 rounded-full"
              style={{ backgroundColor: `${primary}15`, color: primary }}
            >
              الأسئلة الشائعة
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              الأسئلة الشائعة حول الحجوزات
            </h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-right font-bold text-slate-900 text-sm flex justify-between items-center gap-4 transition hover:bg-slate-100/50"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ${
                    activeFaq === idx
                      ? 'max-h-40 border-t border-slate-200/60 p-5'
                      : 'max-h-0 overflow-hidden'
                  }`}
                >
                  <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Contact */}
      {isVisible('clinicContact', true) && (
      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span
                  className="inline-block text-xs font-bold px-3.5 py-1.5 rounded-full"
                  style={{ backgroundColor: `${primary}15`, color: primary }}
                >
                  اتصل بنا
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  نحن هنا لمساعدتك دائماً
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  هل لديك استفسار أو تواجه مشكلة في الحجز؟ تواصل معنا مباشرة.
                </p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-150 shadow-sm">
                  <div
                    className="p-3 rounded-xl shrink-0"
                    style={{ backgroundColor: `${primary}20`, color: primary }}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-0.5">العنوان</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {config.homeAboutTitle || 'جمهورية مصر العربية'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-150 shadow-sm">
                  <div
                    className="p-3 rounded-xl shrink-0"
                    style={{ backgroundColor: `${primary}20`, color: primary }}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-0.5">الهاتف</span>
                    <p
                      className="text-xs text-slate-700 leading-relaxed font-semibold"
                      dir="ltr"
                    >
                      {shop?.phone || '+20 10 0000 0000'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-150 shadow-sm">
                  <div
                    className="p-3 rounded-xl shrink-0"
                    style={{ backgroundColor: `${primary}20`, color: primary }}
                  >
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block mb-0.5">
                      البريد الإلكتروني
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      support@clinic.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-100">
                {contactSubmitted ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">
                      تم إرسال رسالتك بنجاح! شكراً للتواصل معنا.
                    </h3>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (contactName && contactEmail && contactMessage) {
                        setContactSubmitted(true);
                        setTimeout(() => {
                          setContactSubmitted(false);
                          setContactName('');
                          setContactEmail('');
                          setContactSubject('');
                          setContactMessage('');
                        }, 5000);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-500">الاسم</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs focus:bg-white focus:outline-none font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-500">
                          البريد الإلكتروني
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs focus:bg-white focus:outline-none font-semibold text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500">الموضوع</label>
                      <input
                        type="text"
                        required
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs focus:bg-white focus:outline-none font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-500">نص الرسالة</label>
                      <textarea
                        rows={4}
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs focus:bg-white focus:outline-none font-semibold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-xs font-bold transition text-white clinic-btn"
                      style={pStyle()}
                    >
                      إرسال الاستفسار
                    </button>
                  </form>
                )}
              </div>
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
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10">
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
              <li>
                <a href="#home" className="hover:text-white transition">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-white transition">
                  التخصصات
                </a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-white transition">
                  الأطباء
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:text-white transition">
                  الأسئلة الشائعة
                </a>
              </li>
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
    </div>
  );
};

export default React.memo(ClinicTheme3);
