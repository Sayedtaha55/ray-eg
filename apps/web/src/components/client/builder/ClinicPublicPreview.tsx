'use client';

import React, { useMemo, useState } from 'react';
import {
  Calendar, CheckCircle2, Clock, MapPin, Phone, Search, Shield, Star, Stethoscope, User2,
} from 'lucide-react';
import Image from 'next/image';
import { useT } from '@/i18n/useT';

type Props = {
  config: any;
  logoDataUrl?: string;
};

const ClinicPublicPreview: React.FC<Props> = ({ config, logoDataUrl }) => {
  const t = useT();
  const primary = String((config as any)?.primaryColor || '#00E5FF');
  const secondary = String((config as any)?.secondaryColor || '#BD00FF');
  const pageBg = String((config as any)?.pageBackgroundColor || '#FFFFFF');
  const [query, setQuery] = useState('');

  const specialties = useMemo(() => [
    { id: 'dentistry', name: t('business.builder.clinicPreview.specialties.dentistry', 'أسنان'), icon: <Stethoscope size={18} /> },
    { id: 'dermatology', name: t('business.builder.clinicPreview.specialties.dermatology', 'جلدية'), icon: <Shield size={18} /> },
    { id: 'pediatrics', name: t('business.builder.clinicPreview.specialties.pediatrics', 'أطفال'), icon: <User2 size={18} /> },
    { id: 'orthopedics', name: t('business.builder.clinicPreview.specialties.orthopedics', 'عظام'), icon: <CheckCircle2 size={18} /> },
  ], [t]);

  const doctors = useMemo(() => [
    { id: 'd1', name: t('business.builder.clinicPreview.doctors.d1.name', 'د. أحمد'), title: t('business.builder.clinicPreview.doctors.d1.title', 'استشاري أسنان'), rating: 4.9, reviews: 320, next: t('business.builder.clinicPreview.doctors.d1.next', '10:00 ص') },
    { id: 'd2', name: t('business.builder.clinicPreview.doctors.d2.name', 'د. سارة'), title: t('business.builder.clinicPreview.doctors.d2.title', 'أخصائية جلدية'), rating: 4.8, reviews: 210, next: t('business.builder.clinicPreview.doctors.d2.next', '11:30 ص') },
    { id: 'd3', name: t('business.builder.clinicPreview.doctors.d3.name', 'د. محمد'), title: t('business.builder.clinicPreview.doctors.d3.title', 'طبيب أطفال'), rating: 4.7, reviews: 185, next: t('business.builder.clinicPreview.doctors.d3.next', '1:00 م') },
  ], [t]);

  const slots = useMemo(() => [
    { time: '05:30', label: t('business.builder.clinicPreview.slots.s0530', '5:30 ص'), available: true },
    { time: '06:00', label: t('business.builder.clinicPreview.slots.s0600', '6:00 ص'), available: true },
    { time: '06:30', label: t('business.builder.clinicPreview.slots.s0630', '6:30 ص'), available: false },
    { time: '07:00', label: t('business.builder.clinicPreview.slots.s0700', '7:00 ص'), available: true },
    { time: '07:30', label: t('business.builder.clinicPreview.slots.s0730', '7:30 ص'), available: true },
    { time: '08:00', label: t('business.builder.clinicPreview.slots.s0800', '8:00 ص'), available: true },
  ], [t]);

  const testimonials = useMemo(() => [
    { id: 't1', name: t('business.builder.clinicPreview.testimonials.t1.name', 'عميل 1'), rating: 5, text: t('business.builder.clinicPreview.testimonials.t1.text', 'تجربة ممتازة') },
    { id: 't2', name: t('business.builder.clinicPreview.testimonials.t2.name', 'عميل 2'), rating: 5, text: t('business.builder.clinicPreview.testimonials.t2.text', 'خدمة رائعة') },
    { id: 't3', name: t('business.builder.clinicPreview.testimonials.t3.name', 'عميل 3'), rating: 4, text: t('business.builder.clinicPreview.testimonials.t3.text', 'جيدة جداً') },
  ], [t]);

  const filteredDoctors = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(d => String(d.name).toLowerCase().includes(q) || String(d.title).toLowerCase().includes(q));
  }, [doctors, query]);

  return (
    <div dir="rtl" className="min-h-screen" style={{ backgroundColor: pageBg }}>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden">
              {logoDataUrl ? <Image src={logoDataUrl} alt="logo" width={40} height={40} className="object-cover" /> : <Stethoscope className="text-white" size={18} />}
            </div>
            <div>
              <div className="text-sm md:text-base font-black text-slate-900">{t('business.builder.clinicPreview.header.title', 'العيادة')}</div>
              <div className="text-[11px] font-bold text-slate-400">{t('business.builder.clinicPreview.header.subtitle', 'رعاية صحية متكاملة')}</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button type="button" className="px-5 py-3 rounded-2xl font-black text-sm bg-slate-900 text-white hover:bg-black transition-all">{t('business.builder.clinicPreview.header.bookNow', 'احجز الآن')}</button>
            <button type="button" className="px-5 py-3 rounded-2xl font-black text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">{t('business.builder.clinicPreview.header.contactUs', 'تواصل معنا')}</button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-start">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-7 md:p-10">
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 text-xs font-black text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
              {t('business.builder.clinicPreview.hero.badge', 'عيادة متخصصة')}
            </div>
            <div className="mt-5 text-2xl md:text-4xl font-black leading-tight text-slate-900">
              {t('business.builder.clinicPreview.hero.title', 'رعايتك الصحية')}
              <span className="block" style={{ color: secondary }}>{t('business.builder.clinicPreview.hero.titleAccent', 'أولويتنا')}</span>
            </div>
            <div className="mt-4 text-sm md:text-base font-bold text-slate-500 leading-relaxed">{t('business.builder.clinicPreview.hero.description', 'نقدم خدمات طبية متكاملة')}</div>
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500"><CheckCircle2 size={16} style={{ color: primary }} />{t('business.builder.clinicPreview.hero.points.instantConfirmation', 'تأكيد فوري')}</div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-500"><Clock size={16} style={{ color: primary }} />{t('business.builder.clinicPreview.hero.points.preciseTimes', 'مواعيد دقيقة')}</div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-500"><Shield size={16} style={{ color: primary }} />{t('business.builder.clinicPreview.hero.points.secureData', 'بيانات آمنة')}</div>
            </div>
            <div className="mt-7 bg-slate-50 border border-slate-100 rounded-[2rem] p-4 md:p-5">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('business.builder.clinicPreview.search.placeholder', 'ابحث عن طبيب')} className="w-full pr-10 pl-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-sm outline-none focus:border-slate-900" />
                </div>
                <button type="button" className="px-5 py-3 rounded-2xl font-black text-sm text-slate-900" style={{ backgroundColor: primary }}>{t('business.builder.clinicPreview.search.button', 'بحث')}</button>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {specialties.map(s => (
                  <button key={s.id} type="button" className="flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                    <span className="text-xs font-black text-slate-700">{s.name}</span>
                    <span className="text-slate-500">{s.icon}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-7 md:p-10">
            <div className="flex items-start justify-between gap-3">
              <div><div className="text-sm font-black text-slate-900">{t('business.builder.clinicPreview.quickBooking.title', 'حجز سريع')}</div><div className="mt-1 text-xs font-bold text-slate-400">{t('business.builder.clinicPreview.quickBooking.subtitle', 'احجز موعدك الآن')}</div></div>
              <div className="flex items-center gap-2 text-xs font-black text-slate-500"><MapPin size={16} />{t('business.builder.clinicPreview.quickBooking.location', 'الموقع')}</div>
            </div>
            <div className="mt-5 rounded-[2rem] bg-slate-50 border border-slate-100 p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div><div className="text-sm font-black text-slate-900">{t('business.builder.clinicPreview.quickBooking.today', 'اليوم')}</div><div className="mt-1 text-xs font-bold text-slate-400">{t('business.builder.clinicPreview.quickBooking.nearest', 'أقرب موعد')}</div></div>
                <div className="flex items-center gap-2 text-xs font-black text-slate-500"><Calendar size={16} />{t('business.builder.clinicPreview.quickBooking.appointments', 'مواعيد')}</div>
              </div>
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map(s => (
                  <button key={s.time} type="button" disabled={!s.available} className={`px-4 py-3 rounded-2xl border text-xs font-black transition-all ${s.available ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-900' : 'bg-slate-100 border-slate-100 text-slate-400'}`}>{s.label}</button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <button type="button" className="px-5 py-3 rounded-2xl font-black text-sm text-slate-900" style={{ backgroundColor: primary }}>{t('business.builder.clinicPreview.quickBooking.confirmAppointment', 'تأكيد الموعد')}</button>
                <button type="button" className="px-5 py-3 rounded-2xl font-black text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">{t('business.builder.clinicPreview.quickBooking.chooseDoctor', 'اختر طبيب')}</button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-3xl border border-slate-100 p-5">
                <div className="flex items-center justify-between"><div className="text-xs font-black text-slate-400">{t('business.builder.clinicPreview.quickBooking.phoneLabel', 'الهاتف')}</div><Phone size={16} className="text-slate-400" /></div>
                <div className="mt-2 text-sm font-black text-slate-900">+20 10 0000 0000</div>
              </div>
              <div className="rounded-3xl border border-slate-100 p-5">
                <div className="flex items-center justify-between"><div className="text-xs font-black text-slate-400">{t('business.builder.clinicPreview.quickBooking.avgRatingLabel', 'التقييم')}</div><Star size={16} className="text-slate-400" /></div>
                <div className="mt-2 text-sm font-black text-slate-900">4.8 / 5</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 md:mt-12">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div><div className="text-lg md:text-xl font-black text-slate-900">{t('business.builder.clinicPreview.doctorsSection.title', 'الأطباء')}</div><div className="mt-1 text-sm font-bold text-slate-500">{t('business.builder.clinicPreview.doctorsSection.subtitle', 'فريقنا الطبي')}</div></div>
            <div className="text-xs font-black text-slate-400">{t('business.builder.clinicPreview.doctorsSection.results', '{{count}} نتيجة').replace('{{count}}', String(filteredDoctors.length))}</div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map(d => (
              <div key={d.id} className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-6">
                <div className="flex items-start justify-between gap-3">
                  <div><div className="text-sm font-black text-slate-900">{d.name}</div><div className="mt-1 text-xs font-bold text-slate-400">{d.title}</div></div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center"><User2 size={18} className="text-slate-500" /></div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-black"><Star size={16} style={{ color: primary }} /><span className="text-slate-900">{d.rating}</span><span className="text-slate-400">({d.reviews})</span></div>
                  <div className="text-xs font-black text-slate-500">{t('business.builder.clinicPreview.doctorsSection.next', 'التالي: {{time}}').replace('{{time}}', d.next)}</div>
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <button type="button" className="flex-1 px-5 py-3 rounded-2xl font-black text-sm text-slate-900" style={{ backgroundColor: primary }}>{t('business.builder.clinicPreview.doctorsSection.book', 'احجز')}</button>
                  <button type="button" className="px-5 py-3 rounded-2xl font-black text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all">{t('business.builder.clinicPreview.doctorsSection.profile', 'الملف')}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 md:mt-12 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-7 md:p-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div><div className="text-lg md:text-xl font-black text-slate-900">{t('business.builder.clinicPreview.testimonialsSection.title', 'آراء العملاء')}</div><div className="mt-1 text-sm font-bold text-slate-500">{t('business.builder.clinicPreview.testimonialsSection.subtitle', 'تقييمات حقيقية')}</div></div>
            <div className="flex items-center gap-2 text-sm font-black" style={{ color: primary }}><Star size={18} />4.8<span className="text-xs font-bold text-slate-400">(1,250)</span></div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map(tm => (
              <div key={tm.id} className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-900">{tm.name}</div>
                  <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < tm.rating ? 'text-slate-900' : 'text-slate-300'} style={i < tm.rating ? { color: primary } : undefined} />)}</div>
                </div>
                <div className="mt-3 text-sm font-bold text-slate-600 leading-relaxed">{tm.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 md:mt-12">
          <div className="rounded-[2.5rem] p-7 md:p-10 text-slate-900 border border-slate-100" style={{ background: `linear-gradient(135deg, ${primary}20, ${secondary}20)` }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div><div className="text-lg md:text-2xl font-black">{t('business.builder.clinicPreview.cta.title', 'احجز موعدك الآن')}</div><div className="mt-2 text-sm font-bold text-slate-600">{t('business.builder.clinicPreview.cta.subtitle', 'لا تتردد في التواصل')}</div></div>
              <div className="flex items-center gap-2 flex-wrap">
                <button type="button" className="px-6 py-3 rounded-2xl font-black text-sm bg-slate-900 text-white hover:bg-black transition-all">{t('business.builder.clinicPreview.cta.bookAppointment', 'حجز موعد')}</button>
                <button type="button" className="px-6 py-3 rounded-2xl font-black text-sm bg-white/70 border border-slate-100 text-slate-800 hover:bg-white transition-all">{t('business.builder.clinicPreview.cta.inquiry', 'استفسار')}</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs font-bold text-slate-500">{t('business.builder.clinicPreview.footer.copyright', '© 2024 العيادة')}</div>
          <div className="text-xs font-black text-slate-400">{t('business.builder.clinicPreview.footer.tags', 'عيادة • صحة • رعاية')}</div>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(ClinicPublicPreview);
