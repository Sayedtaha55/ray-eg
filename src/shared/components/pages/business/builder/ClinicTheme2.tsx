import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Star,
  Stethoscope,
  User2,
  Search,
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
        bookingTime: selectedSlot || '10:00',
        status: 'PENDING',
      };

      await ApiService.addBooking(payload);
      setSuccessMsg('تم تأكيد طلب الحجز بنجاح! سيتم التواصل معك قريباً.');
      
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg('');
        setPatientName('');
        setPatientPhone('');
        setPatientEmail('');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'فشل الحجز، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir="rtl" className="w-full flex flex-col font-sans relative overflow-hidden" style={{ backgroundColor: pageBg }}>
      {/* Visual background decorations for Luxury theme */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[45%] aspect-square rounded-full bg-gradient-to-tr from-rose-400/5 to-purple-400/10 blur-[100px] pointer-events-none" />

      {/* 1. Header (Glassmorphism Navbar) */}
      <header className="sticky top-0 z-40 border-b border-rose-100/50 bg-white/70 backdrop-blur-xl shadow-sm transition-all">
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
              <div className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                {t('business.builder.clinicPreview.header.title')}
              </div>
              <div className="text-[11px] font-bold text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                {t('business.builder.clinicPreview.header.subtitle')}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActiveDoctor(doctors[0] || null);
                setIsModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl font-black text-xs text-white shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              {t('business.builder.clinicPreview.header.bookNow')}
            </button>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl font-black text-xs bg-white/80 border border-rose-100 text-slate-700 hover:bg-slate-50 hover:border-rose-200 transition-all"
            >
              {t('business.builder.clinicPreview.header.contactUs')}
            </button>
          </div>
        </div>
      </header>

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
        <section className="relative overflow-hidden rounded-[2.5rem] border border-rose-100 p-6 sm:p-10 md:p-14 text-slate-900 bg-white/70 backdrop-blur-xl shadow-xl shadow-rose-100/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-300/10 via-fuchsia-300/10 to-rose-300/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-300/10 via-purple-300/15 to-violet-300/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl text-right space-y-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-rose-500/10 border border-purple-200/50 rounded-full px-4.5 py-1.5 text-xs font-black text-purple-700 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              {t('business.builder.clinicPreview.hero.badge')}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-950 via-fuchsia-950 to-rose-950">
              {t('business.builder.clinicPreview.hero.title')}
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-l from-purple-600 via-fuchsia-600 to-rose-600">
                {t('business.builder.clinicPreview.hero.titleAccent')}
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base font-bold text-slate-600 leading-relaxed max-w-xl">
              {t('business.builder.clinicPreview.hero.description')}
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
                  className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white transition-all hover:scale-105 active:scale-95 shadow-md"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  {t('business.builder.clinicPreview.search.button')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. About Us (من نحن) Section */}
        {(config.homeAboutTitle || config.homeIntroText) && (
          <section className="bg-white/60 backdrop-blur-xl border border-rose-100/60 rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-rose-100/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
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
              <p className="mt-4 text-xs sm:text-sm md:text-base font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
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
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600 mt-0.5">
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
        <section className="bg-white/70 backdrop-blur-xl border border-rose-100/50 rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-rose-100/10">
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
                <span className="text-xs sm:text-sm font-black text-slate-800 mt-4 group-hover:text-purple-900 transition-colors">{s.name}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 leading-none">احجز موعد الآن</span>
              </button>
            ))}
          </div>
        </section>

        {/* 6. Doctors (الأطباء) Grid */}
        <section className="bg-white/80 backdrop-blur-xl border border-rose-100 rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-xl shadow-rose-100/15">
          <div className="flex items-end justify-between gap-4 flex-wrap border-b border-rose-100/80 pb-5 mb-8">
            <div>
              <div className="text-base sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-rose-950">
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
                      <div className="text-sm sm:text-base font-black text-slate-900 group-hover:text-purple-950 transition-colors">
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
                    className="flex-1 px-5 py-3 rounded-xl font-black text-xs text-white text-center shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 animate-pulse-subtle"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
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

        {/* 7. Quick Booking (الحجز) Section */}
        <section className="bg-white/70 backdrop-blur-xl border border-rose-100 rounded-[2.5rem] shadow-xl shadow-rose-100/10 p-6 sm:p-10">
          <div className="border-r-4 pr-3.5 mb-8 border-purple-400" style={{ borderColor: secondary }}>
            <h3 className="text-base sm:text-xl font-black text-slate-900">
              {t('business.builder.clinicPreview.quickBooking.title')}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1">
              {t('business.builder.clinicPreview.quickBooking.subtitle')}
            </p>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-r from-purple-500/5 to-rose-500/5 border border-purple-100/40 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-rose-100/80 pb-4 mb-6">
              <div>
                <div className="text-xs sm:text-sm font-black text-slate-900">
                  {t('business.builder.clinicPreview.quickBooking.today')}
                </div>
                <div className="mt-1.5 text-[11px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                  {t('business.builder.clinicPreview.quickBooking.nearest')}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-600 bg-white border border-rose-100 px-4 py-1.5 rounded-full shadow-sm">
                <Calendar size={14} className="text-fuchsia-600" />
                {t('business.builder.clinicPreview.quickBooking.appointments')}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {slots.map((s) => (
                <button
                  key={s.time + '_' + s.label}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setSelectedSlot(s.time)}
                  className={`px-4 py-3.5 rounded-[1.2rem] border text-xs font-black transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 ${
                    selectedSlot === s.time
                      ? 'text-white border-transparent shadow-lg shadow-fuchsia-500/20'
                      : s.available
                        ? 'bg-white border-rose-100 text-slate-800 hover:border-purple-400 hover:shadow-md shadow-sm'
                        : 'bg-slate-100/50 border-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                  style={selectedSlot === s.time ? { background: `linear-gradient(135deg, ${primary}, ${secondary})` } : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-end gap-3 flex-wrap border-t border-rose-100/50 pt-6">
              <button
                type="button"
                onClick={() => {
                  setActiveDoctor(doctors[0] || null);
                  setIsModalOpen(true);
                }}
                className="px-7 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              >
                تأكيد حجز الموعد الفوري
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveDoctor(null);
                  setIsModalOpen(true);
                }}
                className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-white border border-rose-100 text-slate-700 hover:bg-slate-50 transition-all"
              >
                تغيير الطبيب والتخصص
              </button>
            </div>
          </div>
        </section>

        {/* 8. Testimonials Section */}
        <section className="bg-white/80 backdrop-blur-xl border border-rose-100/80 rounded-[2.5rem] shadow-xl shadow-rose-100/10 p-6 sm:p-10">
          <div className="flex items-end justify-between gap-4 flex-wrap border-b border-rose-100/80 pb-5 mb-8">
            <div>
              <div className="text-base sm:text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-rose-950">
                {t('business.builder.clinicPreview.testimonialsSection.title')}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-bold text-slate-400">
                {t('business.builder.clinicPreview.testimonialsSection.subtitle')}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-rose-700 bg-purple-50/50 px-4.5 py-1.5 rounded-full border border-purple-150">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              4.8 / 5
              <span className="text-[11px] text-slate-400 font-bold">(1,250 مريض)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="rounded-[1.8rem] border border-rose-100 bg-white p-6 hover:shadow-lg hover:border-purple-200/50 transition-all duration-300 relative"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div className="text-xs sm:text-sm font-black text-slate-900">{test.name}</div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < test.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed italic">
                  "{test.text}"
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 9. CTA Section */}
        <section>
          <div
            className="rounded-[2.5rem] p-6 sm:p-12 text-slate-900 border shadow-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${primary}1A, ${secondary}1A)`,
              borderColor: `${primary}30`,
            }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-300/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
              <div>
                <div className="text-lg sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-rose-950">
                  {t('business.builder.clinicPreview.cta.title')}
                </div>
                <div className="mt-3 text-xs sm:text-sm md:text-base font-bold text-slate-600 leading-relaxed max-w-xl">
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
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
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
      </main>

      {/* 10. Footer */}
      <footer className="border-t border-rose-100 bg-white/60 backdrop-blur-xl mt-auto relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-bold text-slate-400">
            {t('business.builder.clinicPreview.footer.copyright')}
          </div>
          <div className="text-[10px] font-black text-purple-700 bg-purple-50/50 px-4.5 py-1.5 rounded-full border border-purple-100 shadow-sm">
            {t('business.builder.clinicPreview.footer.tags')}
          </div>
        </div>
      </footer>

      {/* Luxury Interactive Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
            {/* Ambient glows inside modal */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-300/10 to-rose-300/10 rounded-full blur-xl pointer-events-none" />
            
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 border-b border-rose-100/50 flex justify-between items-center bg-gradient-to-r from-purple-50/50 to-rose-50/30 flex-row-reverse text-right z-10">
              <div>
                <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-950 to-rose-955">تأكيد حجز الموعد</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">الرجاء إدخال بيانات المريض لإتمام عملية الحجز</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-rose-100 text-purple-400 hover:text-purple-650 flex items-center justify-center transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleBookingSubmit} className="p-6 sm:p-8 space-y-5 text-right relative z-10" dir="rtl">
              {errorMsg && (
                <div className="bg-rose-50 text-rose-650 border border-rose-100 rounded-2xl p-4 text-xs font-black">
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl p-4 text-xs font-black flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  {successMsg}
                </div>
              )}

              {/* Selected Doctor Info */}
              {activeDoctor && (
                <div className="flex items-center gap-4 bg-gradient-to-r from-purple-50/30 to-rose-50/30 border border-rose-100/60 rounded-2xl p-4 flex-row-reverse shadow-inner">
                  <div className="w-12 h-12 rounded-[1rem] bg-white border border-rose-100 overflow-hidden shadow-sm flex items-center justify-center">
                    {activeDoctor.photoUrl ? (
                      <img src={activeDoctor.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User2 className="text-slate-350" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-400">الطبيب المختص</div>
                    <div className="text-sm font-black text-purple-950 mt-0.5">{activeDoctor.name}</div>
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

                {/* Date & Time selection */}
                <div className="grid grid-cols-2 gap-3">
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
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">الوقت المحدد</label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-slate-50/30 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-purple-400 transition-all text-right shadow-inner text-slate-800"
                    >
                      <option value="">اختر وقت الحجز</option>
                      {slots.map((s) => (
                        <option key={s.time} value={s.time} disabled={!s.available}>
                          {s.label} {!s.available ? '(غير متاح)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-rose-100/50 flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  {isSubmitting ? 'جاري تأكيد الحجز...' : 'تأكيد الحجز الفوري'}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ClinicTheme2);
