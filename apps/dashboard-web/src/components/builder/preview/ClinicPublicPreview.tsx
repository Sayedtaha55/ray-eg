'use client';

import React, { useState, useMemo } from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import {
  getUnifiedColors,
  getColorWithDarkMode,
} from '@/lib/builder/colorSystem';
import {
  Calendar, Clock, CheckCircle2, Star, Stethoscope, User2, Search,
  MapPin, Phone, Mail, ChevronDown, ShieldCheck, Heart, ArrowRight,
} from 'lucide-react';

interface ClinicPublicPreviewProps {
  config: UnifiedBuilderConfig;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  shop?: {
    name?: string;
    logoUrl?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

export default function ClinicPublicPreview({ config, previewMode, shop = {} }: ClinicPublicPreviewProps) {
  const colors = getUnifiedColors(config);
  
  const primary = config.primaryColor || colors.primary;
  const secondary = config.secondaryColor || colors.secondary;
  const pageBg = config.pageBackgroundColor || colors.background;
  
  const [query, setQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const specialties = [
    { id: 's1', name: 'طب عام', icon: Stethoscope },
    { id: 's2', name: 'قلب وأوعية', icon: Heart },
    { id: 's3', name: 'جلدية', icon: ShieldCheck },
    { id: 's4', name: 'أطفال', icon: User2 },
  ];

  const doctors = [
    { id: 'd1', name: 'د. أحمد محمد', title: 'استشاري القلب', rating: 4.8, reviews: 124, image: '' },
    { id: 'd2', name: 'د. سارة أحمد', title: 'أخصائية الجلدية', rating: 4.9, reviews: 89, image: '' },
    { id: 'd3', name: 'د. محمد علي', title: 'طبيب أطفال', rating: 4.7, reviews: 156, image: '' },
    { id: 'd4', name: 'د. فاطمة خالد', title: 'طبيبة عامة', rating: 4.6, reviews: 203, image: '' },
  ];

  const slots = [
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: false },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
  ];

  const testimonials = [
    { id: 't1', name: 'محمد أحمد', rating: 5, text: 'خدمة ممتازة وأطباء محترفون. أنصح الجميع بالحجز هنا.' },
    { id: 't2', name: 'سارة محمد', rating: 5, text: 'تجربة رائعة، الحجز سريع والمواعيد دقيقة.' },
    { id: 't3', name: 'خالد علي', rating: 4, text: 'عيادة نظيفة ومنظمة، الأطباء متعاونون جداً.' },
  ];

  const faqItems = [
    { q: 'هل الحجز عبر المنصة مجاني بالكامل؟', a: 'نعم، حجز المواعيد عبر منصتنا مجاني 100%. الرسوم المدفوعة هي قيمة كشف الطبيب التي تدفعها في العيادة.' },
    { q: 'كيف يمكنني تعديل أو إلغاء موعدي؟', a: 'يمكنك بسهولة تعديل أو إلغاء الموعد عبر بوابة المريض، وذلك قبل 24 ساعة على الأقل من الموعد المقرر.' },
    { q: 'هل تقبل العيادات بطاقات التأمين الطبي؟', a: 'نعم، يمكنك إضافة رقم تأمينك أثناء تعبئة البيانات لتسهيل الإجراءات.' },
  ];

  const filteredDoctors = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) => 
      d.name.toLowerCase().includes(q) || d.title.toLowerCase().includes(q)
    );
  }, [doctors, query]);

  const containerStyle = {
    width: previewMode === 'desktop' ? '100%' : 
           previewMode === 'tablet' ? '768px' : '375px',
    height: '100%',
    backgroundColor: pageBg,
    fontFamily: config.typography?.fontFamily?.body || 'Inter',
    direction: 'rtl' as const,
    overflowY: 'auto' as const,
  };

  return (
    <div style={containerStyle} className="transition-all duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-100 shadow-sm">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {shop.logoUrl && (
                <img src={shop.logoUrl} alt={shop.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-200" />
              )}
              <div>
                <h1 className="font-black text-lg md:text-xl">{shop.name || 'مركز الطبي'}</h1>
                <p className="text-xs text-slate-500 font-bold">خدمة طبية متميزة</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: primary }}>
              <Calendar size={16} className="inline ml-2" />
              احجز موعد
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 py-12 md:py-20">
        <div className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900">
              رعاية صحية <span style={{ color: primary }}>متميزة</span>
            </h2>
            <p className="text-slate-600 font-bold text-lg max-w-2xl mx-auto">
              فريق من الأطباء والاستشاريين ذوي الخبرة لتقديم أفضل خدمات الرعاية الصحية لك ولعائلتك
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button className="px-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: primary }}>
                احجز موعد الآن
              </button>
              <button className="px-6 py-3 rounded-xl font-bold border-2" style={{ borderColor: primary, color: primary }}>
                تعرف على الأطباء
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-black text-center mb-8">التخصصات الطبية</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specialties.map((spec) => {
              const Icon = spec.icon;
              return (
                <div key={spec.id} className="p-6 rounded-2xl bg-white border border-slate-100 text-center hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto rounded-2xl mb-4 flex items-center justify-center" style={{ backgroundColor: `${primary}20` }}>
                    <Icon size={32} style={{ color: primary }} />
                  </div>
                  <p className="font-bold text-sm">{spec.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doctors */}
      <div className="px-4 md:px-8 py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-black text-center mb-8">فريق الأطباء</h3>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن طبيب..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="aspect-square rounded-2xl bg-slate-100 mb-4 flex items-center justify-center">
                  {doctor.image ? (
                    <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <User2 size={48} className="text-slate-300" />
                  )}
                </div>
                <h4 className="font-bold text-lg mb-1">{doctor.name}</h4>
                <p className="text-slate-500 text-sm mb-3">{doctor.title}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">{doctor.rating}</span>
                  <span className="text-slate-400 text-xs">({doctor.reviews} تقييم)</span>
                </div>
                <button className="w-full py-2 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: primary }}>
                  احجز موعد
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Slots */}
      <div className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-black text-center mb-8">المواعيد المتاحة</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {slots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedSlot(slot.time)}
                className={`p-4 rounded-xl font-bold text-center transition-all ${
                  !slot.available
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : selectedSlot === slot.time
                    ? 'text-white'
                    : 'bg-white border-2 border-slate-200 hover:border-cyan-300'
                }`}
                style={
                  slot.available && selectedSlot === slot.time
                    ? { backgroundColor: primary }
                    : {}
                }
              >
                <div className="text-lg">{slot.time}</div>
                {!slot.available && <div className="text-xs">محجوز</div>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-4 md:px-8 py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-black text-center mb-8">آراء المرضى</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={star <= testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 font-bold mb-4">{testimonial.text}</p>
                <p className="font-black">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-black text-center mb-8">الأسئلة الشائعة</h3>
          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-right font-bold"
                >
                  {item.q}
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-4 text-slate-600 font-bold">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 md:px-8 py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-black text-center mb-8">تواصل معنا</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <Phone size={24} style={{ color: primary }} />
              <div>
                <p className="font-bold text-sm">{shop.phone || '01xxxxxxxx'}</p>
                <p className="text-xs text-slate-500">الهاتف</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <Mail size={24} style={{ color: primary }} />
              <div>
                <p className="font-bold text-sm">{shop.email || 'info@clinic.com'}</p>
                <p className="text-xs text-slate-500">البريد</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
              <MapPin size={24} style={{ color: primary }} />
              <div>
                <p className="font-bold text-sm">{shop.address || 'القاهرة، مصر'}</p>
                <p className="text-xs text-slate-500">العنوان</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-slate-200">
        <p className="text-sm text-slate-500 font-bold">
          © {new Date().getFullYear()} {shop.name}. جميع الحقوق محفوظة
        </p>
      </footer>

      {/* Bottom Padding */}
      <div className="h-20" />
    </div>
  );
}