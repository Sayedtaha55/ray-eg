import React from 'react';
import {
  Menu,
  Instagram,
  Twitter,
  Facebook,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Star,
  Plus,
} from 'lucide-react';
import { SectionTemplate } from '../../data/sectionLibrary';

interface Props {
  template: SectionTemplate;
}

export const SectionWireframePreview: React.FC<Props> = ({ template }) => {
  const type = template.wireframeType || template.id;

  // 1. NAVBAR WIREFRAMES (Matching Image 3)
  if (template.category === 'navbar') {
    if (type === 'navbar-composition') {
      return (
        <div className="w-full bg-white border border-slate-300 rounded-lg p-2.5 flex items-center justify-between text-[10px] text-slate-700 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-slate-500">تواصل معنا</span>
            <span className="text-[9px] text-slate-500">من نحن</span>
            <span className="text-[9px] font-bold text-slate-800">الرئيسية</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Menu className="w-3.5 h-3.5 text-slate-700" />
            <span>الشعار</span>
          </div>
        </div>
      );
    }

    if (type === 'navbar-full-split') {
      return (
        <div className="w-full bg-white border border-slate-300 rounded-lg p-2.5 flex items-center justify-between text-[10px] text-slate-700 shadow-xs">
          <Menu className="w-4 h-4 text-slate-700" />
          <span className="font-bold text-slate-800">الشعار</span>
        </div>
      );
    }

    if (type === 'navbar-vertical') {
      return (
        <div className="w-full bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-between text-[10px] text-slate-700 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="bg-lime-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">احجز</span>
            <Menu className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <span className="font-bold text-slate-800">الشعار</span>
        </div>
      );
    }

    if (type === 'navbar-supported') {
      return (
        <div className="w-full bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-between text-[9px] text-slate-700 shadow-xs">
          <span className="bg-lime-600 text-white font-bold px-2 py-0.5 rounded">احجز تذكرة</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>تواصل معنا</span>
            <span>القائمة ▾</span>
            <span>من نحن</span>
            <span className="font-bold text-slate-800">الرئيسية</span>
          </div>
          <span className="font-bold text-slate-800">الشعار</span>
        </div>
      );
    }

    if (type === 'navbar-middle') {
      return (
        <div className="w-full bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-between text-[9px] text-slate-700 shadow-xs">
          <div className="flex items-center gap-1 text-slate-700">
            <Instagram className="w-2.5 h-2.5" />
            <Twitter className="w-2.5 h-2.5" />
            <Facebook className="w-2.5 h-2.5" />
          </div>
          <span className="font-bold text-slate-800 text-[10px]">الشعار</span>
          <div className="flex items-center gap-1 text-slate-600">
            <span>القائمة ▾</span>
            <span>من نحن</span>
            <span className="font-bold text-slate-800">الرئيسية</span>
          </div>
        </div>
      );
    }

    if (type === 'navbar-full') {
      return (
        <div className="w-full bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-between text-[9px] text-slate-700 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="bg-lime-600 text-white font-bold px-2 py-0.5 rounded">تواصل</span>
            <div className="flex items-center gap-0.5 text-slate-600">
              <Instagram className="w-2.5 h-2.5" />
              <Twitter className="w-2.5 h-2.5" />
              <Facebook className="w-2.5 h-2.5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>تواصل معنا</span>
            <span>القائمة ▾</span>
            <span>من نحن</span>
            <span>الرئيسية</span>
            <span className="font-bold text-slate-800">الشعار</span>
          </div>
        </div>
      );
    }

    // Default navbar (aligned)
    return (
      <div className="w-full bg-white border border-slate-300 rounded-lg p-2 flex items-center justify-between text-[9px] text-slate-700 shadow-xs">
        <span className="bg-lime-600 text-white font-bold px-2.5 py-0.5 rounded">اتصل</span>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span>تواصل معنا</span>
          <span>القائمة ▾</span>
          <span>من نحن</span>
          <span>الرئيسية</span>
          <span className="font-bold text-slate-800">الشعار</span>
        </div>
      </div>
    );
  }

  // 2. HERO WIREFRAMES (Matching Image 2)
  if (template.category === 'hero') {
    if (type === 'hero-slider') {
      return (
        <div className="relative w-full h-44 bg-zinc-600 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-4 text-white shadow-xs select-none">
          {/* Subtle background curved shapes */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-500/30 to-zinc-800/40 pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full bg-white/10 -top-6 left-1/3 blur-xs" />
          <div className="absolute w-40 h-40 rounded-full bg-black/10 -bottom-10 right-1/4" />

          {/* Side navigation arrows */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white/80">
            <ChevronLeft className="w-3.5 h-3.5" />
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white/80">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>

          {/* Headline */}
          <h4 className="text-sm font-bold text-white z-10 drop-shadow-xs">
            التميز يبدأ من التفاصيل الصغيرة
          </h4>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 z-10">
            <span className="bg-white text-zinc-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
              تواصل معنا
            </span>
            <span className="bg-zinc-700/80 border border-white/30 text-white text-[10px] font-medium px-3 py-1 rounded-full">
              اقرأ المزيد
            </span>
          </div>

          {/* Pagination dots */}
          <div className="absolute bottom-2.5 flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
          </div>
        </div>
      );
    }

    if (type === 'hero-coach') {
      return (
        <div className="relative w-full h-44 bg-zinc-600 rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-4 text-white shadow-xs select-none">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-600 to-zinc-800/70 pointer-events-none" />
          <div className="absolute w-20 h-20 rounded-full bg-white/10 top-2 left-1/4 blur-xs" />

          {/* Side navigation arrows */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/90">
            <ChevronLeft className="w-5 h-5" />
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/90">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* Headline */}
          <h4 className="text-xs font-bold text-white z-10">
            استشارات رياضية مع مدربين متخصصين
          </h4>
          <p className="text-[9px] text-zinc-300 mt-1 max-w-[200px] z-10 line-clamp-1">
            خطط تدريب وتغذية مدروسة تناسب مستوى لياقتك وأهدافك
          </p>

          {/* Action Button */}
          <div className="mt-2.5 z-10">
            <span className="bg-lime-600 text-white text-[10px] font-bold px-3 py-1 rounded-md shadow-xs">
              اطلب استشارة
            </span>
          </div>

          {/* Pagination dots */}
          <div className="absolute bottom-2.5 flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
          </div>
        </div>
      );
    }
  }

  // 3. FEATURES WIREFRAME
  if (template.category === 'features') {
    if (type === 'features-bento') {
      return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5 text-right">
          <div className="text-center font-bold text-[10px] text-slate-800">شبكة بينتو المميزات</div>
          <div className="grid grid-cols-3 gap-1">
            <div className="bg-sky-50 border border-sky-200 rounded p-1 text-[8px] text-sky-800 font-bold">🔍 فحص 250+</div>
            <div className="bg-pink-50 border border-pink-200 rounded p-1 text-[8px] text-pink-800 font-bold">💳 تمويل فوري</div>
            <div className="bg-emerald-50 border border-emerald-200 rounded p-1 text-[8px] text-emerald-800 font-bold">🚚 تسليم فوري</div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-800">أبرز المزايا التنافسية</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
            <div className="w-5 h-5 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px]">★</div>
            <span className="text-[9px] font-bold text-slate-700 block mt-1">سرعة وأمان</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
            <div className="w-5 h-5 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center text-[10px]">✓</div>
            <span className="text-[9px] font-bold text-slate-700 block mt-1">دقة عالية</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
            <div className="w-5 h-5 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px]">⚡</div>
            <span className="text-[9px] font-bold text-slate-700 block mt-1">دعم متواصل</span>
          </div>
        </div>
      </div>
    );
  }

  // 3.5 STATS WIREFRAME
  if (template.category === 'stats') {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1.5 text-center">
        <span className="text-[10px] font-bold text-slate-200 block">إحصائيات وأرقام الثقة</span>
        <div className="grid grid-cols-4 gap-1">
          <div className="bg-white/5 p-1 rounded border border-white/10">
            <span className="text-[11px] font-black text-sky-400 block">+1500</span>
            <span className="text-[7px] text-slate-400 block">سيارة</span>
          </div>
          <div className="bg-white/5 p-1 rounded border border-white/10">
            <span className="text-[11px] font-black text-emerald-400 block">99.6%</span>
            <span className="text-[7px] text-slate-400 block">رضا</span>
          </div>
          <div className="bg-white/5 p-1 rounded border border-white/10">
            <span className="text-[11px] font-black text-amber-400 block">+15</span>
            <span className="text-[7px] text-slate-400 block">عاماً</span>
          </div>
          <div className="bg-white/5 p-1 rounded border border-white/10">
            <span className="text-[11px] font-black text-purple-400 block">24/7</span>
            <span className="text-[7px] text-slate-400 block">دعم</span>
          </div>
        </div>
      </div>
    );
  }

  // 3.6 STEPS WIREFRAME
  if (template.category === 'steps') {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5 text-right">
        <span className="text-[10px] font-bold text-slate-800 block text-center">رحلة الحجز في 3 خطوات</span>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="bg-white p-1 rounded border border-slate-200">
            <span className="text-[10px] font-black text-blue-600 block">01</span>
            <span className="text-[8px] font-bold text-slate-700 block">اختر السيارة</span>
          </div>
          <div className="bg-white p-1 rounded border border-slate-200">
            <span className="text-[10px] font-black text-blue-600 block">02</span>
            <span className="text-[8px] font-bold text-slate-700 block">احجز المعاينة</span>
          </div>
          <div className="bg-white p-1 rounded border border-slate-200">
            <span className="text-[10px] font-black text-blue-600 block">03</span>
            <span className="text-[8px] font-bold text-slate-700 block">استلم مفتاحك</span>
          </div>
        </div>
      </div>
    );
  }

  // 3.7 LOGOS WIREFRAME
  if (template.category === 'logos') {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-xl p-2 space-y-1 text-center">
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">العلامات والشركاء المعتمدين</span>
        <div className="flex items-center justify-center gap-2 text-[8px] font-extrabold text-slate-600 flex-wrap">
          <span>MERCEDES</span>
          <span>•</span>
          <span>PORSCHE</span>
          <span>•</span>
          <span>BMW</span>
          <span>•</span>
          <span>RANGE ROVER</span>
        </div>
      </div>
    );
  }

  // 4. GALLERY WIREFRAME
  if (template.category === 'gallery') {
    if (type === 'gallery-fleet') {
      return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-800 block text-center">أسطول السيارات الفاخرة المتاح</span>
          <div className="grid grid-cols-3 gap-1 text-right">
            <div className="bg-white rounded border border-slate-200 p-1">
              <div className="h-7 bg-slate-200 rounded-xs mb-1" />
              <span className="text-[8px] font-bold text-slate-800 block truncate">Porsche 911</span>
              <span className="text-[8px] font-extrabold text-blue-600 block">950,000 ر.س</span>
            </div>
            <div className="bg-white rounded border border-slate-200 p-1">
              <div className="h-7 bg-slate-200 rounded-xs mb-1" />
              <span className="text-[8px] font-bold text-slate-800 block truncate">AMG GT</span>
              <span className="text-[8px] font-extrabold text-blue-600 block">870,000 ر.س</span>
            </div>
            <div className="bg-white rounded border border-slate-200 p-1">
              <div className="h-7 bg-slate-200 rounded-xs mb-1" />
              <span className="text-[8px] font-bold text-slate-800 block truncate">Range Rover</span>
              <span className="text-[8px] font-extrabold text-blue-600 block">460,000 ر.س</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-800 block text-center">معرض الأعمال والمشاريع</span>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="h-12 bg-slate-300 rounded-md" />
          <div className="h-12 bg-slate-400 rounded-md" />
          <div className="h-12 bg-slate-300 rounded-md" />
        </div>
      </div>
    );
  }

  // 5. PRICING WIREFRAME
  if (template.category === 'pricing') {
    if (type === 'pricing-luxury-vip') {
      return (
        <div className="w-full bg-slate-950 border border-amber-500/30 rounded-xl p-2.5 space-y-1.5 text-center text-white">
          <span className="text-[10px] font-bold text-amber-400 block">باقات العضوية الحصرية VIP</span>
          <div className="grid grid-cols-2 gap-1.5 text-right">
            <div className="bg-slate-900 border border-amber-500/20 rounded p-1.5">
              <span className="text-[8px] font-bold text-amber-400">نادي النخبة</span>
              <span className="text-[9px] font-black text-white block">2,500 ر.س / شهرياً</span>
            </div>
            <div className="bg-gradient-to-r from-amber-950 to-slate-900 border border-amber-400 rounded p-1.5">
              <span className="text-[8px] font-bold text-amber-300">عضوية الـ VIP</span>
              <span className="text-[9px] font-black text-amber-300 block">5,000 ر.س / شهرياً</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
        <span className="text-[10px] font-bold text-slate-800 block text-center">خطط وباقات الأسعار</span>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="bg-white p-1.5 rounded-lg border border-slate-200">
            <span className="text-[8px] font-bold text-slate-600 block">أساسية</span>
            <span className="text-[9px] font-extrabold text-slate-900 block mt-0.5">199 ر.س</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded-lg text-white shadow-xs">
            <span className="text-[8px] font-bold text-cyan-400 block">احترافية</span>
            <span className="text-[9px] font-extrabold text-white block mt-0.5">499 ر.س</span>
          </div>
          <div className="bg-white p-1.5 rounded-lg border border-slate-200">
            <span className="text-[8px] font-bold text-slate-600 block">شركات</span>
            <span className="text-[9px] font-extrabold text-slate-900 block mt-0.5">1499 ر.س</span>
          </div>
        </div>
      </div>
    );
  }

  // 6. TEAM WIREFRAME
  if (template.category === 'team') {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
        <span className="text-[10px] font-bold text-slate-800 block text-center">فريق العمل والخبراء</span>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-slate-300 border border-white shadow-xs" />
              <span className="text-[8px] font-bold text-slate-800 mt-1">عضو الفريق</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7. TABS WIREFRAME
  if (template.category === 'tabs') {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2">
        <div className="flex justify-center gap-1">
          <span className="bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded">التبويب الأول</span>
          <span className="bg-slate-200 text-slate-700 text-[8px] px-2 py-0.5 rounded">التبويب الثاني</span>
          <span className="bg-slate-200 text-slate-700 text-[8px] px-2 py-0.5 rounded">التبويب الثالث</span>
        </div>
        <div className="bg-white p-2 rounded-lg border border-slate-200 text-[9px] text-slate-500 text-center">
          محتوى تفاعلي يتبدل حسب التبويب النشط
        </div>
      </div>
    );
  }

  // 8. ACCORDION WIREFRAME
  if (template.category === 'accordion') {
    if (type === 'accordion-2-col') {
      return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1 text-right">
          <span className="text-[10px] font-bold text-slate-800 block text-center">الأسئلة الشائعة في عمودين</span>
          <div className="grid grid-cols-2 gap-1 text-[8px]">
            <div className="bg-white p-1 rounded border border-slate-200 font-bold text-slate-700">شروط الاستئجار ▾</div>
            <div className="bg-white p-1 rounded border border-slate-200 font-bold text-slate-700">تأمين المركبات ▸</div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
        <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex justify-between text-[9px] font-bold text-slate-800">
          <span>السؤال الأول وكيفية الاستخدام؟</span>
          <span>▾</span>
        </div>
        <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex justify-between text-[9px] font-bold text-slate-800">
          <span>طرق الدفع وخيارات التقسيط المتاحة؟</span>
          <span>▸</span>
        </div>
      </div>
    );
  }

  // 9. TESTIMONIALS WIREFRAME
  if (template.category === 'testimonials') {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5 text-center">
        <div className="flex justify-center text-amber-400 gap-0.5">
          <Star className="w-3 h-3 fill-amber-400" />
          <Star className="w-3 h-3 fill-amber-400" />
          <Star className="w-3 h-3 fill-amber-400" />
          <Star className="w-3 h-3 fill-amber-400" />
          <Star className="w-3 h-3 fill-amber-400" />
        </div>
        <p className="text-[9px] text-slate-600 italic">"خدمة استثنائية وسرعة فائقة في التنفيذ"</p>
        <span className="text-[8px] font-bold text-slate-900 block">عبدالله السالم - عميل موثق</span>
      </div>
    );
  }

  // 10. CONTACT WIREFRAME
  if (template.category === 'contact') {
    if (type === 'contact-booking') {
      return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1 text-right text-white">
          <span className="text-[10px] font-bold text-slate-200 block text-center">نموذج حجز تجربة قيادة</span>
          <div className="grid grid-cols-2 gap-1 text-[8px]">
            <div className="h-4 bg-white/10 rounded px-1 flex items-center text-slate-300">الاسم</div>
            <div className="h-4 bg-white/10 rounded px-1 flex items-center text-slate-300">الجوال</div>
          </div>
          <div className="h-4 bg-blue-600 rounded text-[8px] font-bold flex items-center justify-center text-white">
            تأكيد موعد التجربة
          </div>
        </div>
      );
    }

    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-800 block text-center">تواصل معنا واستفسر الآن</span>
        <div className="space-y-1">
          <div className="h-5 bg-white border border-slate-200 rounded px-1.5 text-[8px] text-slate-400 flex items-center">الاسم الكامل</div>
          <div className="h-5 bg-white border border-slate-200 rounded px-1.5 text-[8px] text-slate-400 flex items-center">رقم الجوال</div>
          <div className="h-5 bg-blue-600 rounded text-white text-[8px] font-bold flex items-center justify-center">إرسال الرسالة</div>
        </div>
      </div>
    );
  }

  // 11. CTA WIREFRAME
  if (template.category === 'cta') {
    if (type === 'cta-countdown') {
      return (
        <div className="w-full bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-2.5 text-center space-y-1">
          <span className="text-[9px] font-black text-amber-400 block">⚡ عرض موسمي محدود</span>
          <span className="text-[10px] font-bold block">خصم 20% على باقات الصيانة الشاملة</span>
          <div className="flex justify-center gap-1 text-[8px]">
            <span className="bg-white/10 px-1 py-0.5 rounded font-mono">03 أيام</span>
            <span className="bg-white/10 px-1 py-0.5 rounded font-mono">14 ساعة</span>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full bg-slate-900 text-white rounded-xl p-3 text-center space-y-1.5">
        <span className="text-[10px] font-bold block">جاهز لبدء مشروعك القادم معنا؟</span>
        <span className="inline-block bg-blue-500 text-white text-[8px] font-bold px-3 py-1 rounded-full">
          ابدأ مجاناً الآن
        </span>
      </div>
    );
  }

  // 12. CONTENT WIREFRAME
  if (template.category === 'content') {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center gap-2">
        <div className="flex-1 space-y-1">
          <div className="h-2.5 bg-slate-800 rounded w-3/4" />
          <div className="h-2 bg-slate-300 rounded w-full" />
          <div className="h-2 bg-slate-300 rounded w-2/3" />
        </div>
        <div className="w-12 h-10 bg-slate-300 rounded-md shrink-0" />
      </div>
    );
  }

  // 13. FOOTER WIREFRAMES
  if (template.category === 'footer') {
    if (type === 'footer-mega-corporate') {
      return (
        <div className="w-full bg-zinc-950 text-slate-400 rounded-xl p-2.5 space-y-2 text-right text-[8px] border border-zinc-800">
          {/* Newsletter Box */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 flex items-center justify-between">
            <span className="text-[7px] text-blue-400 font-bold bg-blue-950/80 px-1.5 py-0.5 rounded">اشتراك</span>
            <span className="text-[8px] text-white font-bold">📩 النشرة البريدية الحصرية</span>
          </div>
          {/* 4 Columns */}
          <div className="grid grid-cols-4 gap-1 text-[7px] border-b border-zinc-800 pb-1.5">
            <div className="space-y-0.5">
              <span className="text-white font-bold block">الفروع</span>
              <span className="text-zinc-500 block">الرياض - جدة</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-white font-bold block">الضمان</span>
              <span className="text-zinc-500 block">150+ نقطة</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-white font-bold block">روابط</span>
              <span className="text-zinc-500 block">الأسطول</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-white font-bold block">الشركة</span>
              <span className="text-zinc-500 block">س.ت 101089</span>
            </div>
          </div>
          <div className="text-center text-[7px] text-zinc-600">جميع الحقوق محفوظة © 2025 شركة المجد للسيارات</div>
        </div>
      );
    }

    if (type === 'footer-luxury-minimal') {
      return (
        <div className="w-full bg-black text-zinc-400 rounded-xl p-3 space-y-1.5 text-center text-[8px] border border-zinc-800">
          <span className="inline-block bg-amber-500/10 text-amber-400 text-[7px] font-extrabold px-2 py-0.5 rounded-full">
            👑 THE PINNACLE OF MOTORS
          </span>
          <span className="text-[10px] font-black text-white block">المجد للسيارات الفاخرة</span>
          <div className="text-[7px] text-zinc-300 py-1 border-t border-b border-zinc-900 flex justify-center gap-1.5">
            <span>الرئيسية</span>
            <span>•</span>
            <span>من نحن</span>
            <span>•</span>
            <span>الأسطول</span>
            <span>•</span>
            <span>تواصل معنا</span>
          </div>
          <span className="text-[7px] text-zinc-600 block">الرياض - المملكة العربية السعودية</span>
        </div>
      );
    }

    if (type === 'footer-ecommerce-badges') {
      return (
        <div className="w-full bg-slate-900 text-slate-300 rounded-xl p-2.5 space-y-1.5 text-right text-[8px] border border-slate-800">
          {/* Trust Row */}
          <div className="grid grid-cols-3 gap-1 bg-slate-800/80 rounded p-1 text-[7px] text-center text-white font-bold">
            <div>🔒 دفع آمن</div>
            <div>🚚 شحن VIP</div>
            <div>🛡️ فحص معتمد</div>
          </div>
          {/* Columns */}
          <div className="grid grid-cols-3 gap-1 text-[7px] py-1">
            <div>
              <span className="text-slate-400 block font-bold">الدعم</span>
              <span className="text-slate-500 block">واتساب 24/7</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">الخدمات</span>
              <span className="text-slate-500 block">الضمان والاسترجاع</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">المتجر</span>
              <span className="text-slate-500 block">أحدث الموديلات</span>
            </div>
          </div>
          {/* Payment Badges */}
          <div className="bg-slate-950/60 p-1 rounded text-center text-[7px] text-slate-400">
            💳 مدى | فيزا | Apple Pay | تمارا | تابي
          </div>
        </div>
      );
    }

    if (type === 'footer-light-modern-split') {
      return (
        <div className="w-full bg-white text-slate-700 rounded-xl p-2.5 space-y-1.5 text-right text-[8px] border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="bg-emerald-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded">واتساب 💬</span>
            <span className="font-extrabold text-[9px] text-slate-900">المجد للسيارات</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[7px]">
            <div>
              <span className="text-slate-900 font-bold block">أوقات العمل</span>
              <span className="text-slate-500 block">السبت - الخميس: 9 ص - 10 م</span>
            </div>
            <div>
              <span className="text-slate-900 font-bold block">روابط الموقع</span>
              <span className="text-slate-500 block">الرئيسية • الأسطول • من نحن</span>
            </div>
          </div>
          <div className="text-center text-[7px] text-slate-400 pt-0.5">جميع الحقوق محفوظة © 2025</div>
        </div>
      );
    }

    if (type === 'footer-directory-categories') {
      return (
        <div className="w-full bg-slate-950 text-slate-400 rounded-xl p-2.5 space-y-1.5 text-right text-[8px] border border-slate-800">
          <span className="text-[9px] font-bold text-white block text-center border-b border-slate-800 pb-1">
            دليل الأسطول والخدمات الشامل
          </span>
          <div className="grid grid-cols-4 gap-1 text-[7px]">
            <div>
              <span className="text-slate-300 font-bold block">الخدمات</span>
              <span className="text-slate-500 block">استيراد خاص</span>
            </div>
            <div>
              <span className="text-slate-300 font-bold block">عن المجد</span>
              <span className="text-slate-500 block">رؤيتنا 2030</span>
            </div>
            <div>
              <span className="text-slate-300 font-bold block">الفئات</span>
              <span className="text-slate-500 block">SUV & سيدان</span>
            </div>
            <div>
              <span className="text-slate-300 font-bold block">الماركات</span>
              <span className="text-slate-500 block">مرسيدس وبورش</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'footer-cta-social-bar') {
      return (
        <div className="w-full bg-slate-950 text-slate-300 rounded-xl p-2.5 space-y-1.5 text-center text-[8px] border border-slate-800">
          <div className="bg-indigo-950/80 border border-indigo-800 rounded p-1 flex justify-between items-center text-[7px] px-1.5">
            <span className="bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded">اتصل الآن</span>
            <span className="text-white font-bold">✨ تبحث عن سيارة نادرة بمواصفات خاصة؟</span>
          </div>
          <div className="bg-slate-900 py-1 rounded-full text-[7px] text-indigo-300 font-semibold">
            𝕏 تويتر • 📸 انستغرام • 💼 لينكد إن • ▶️ يوتيوب
          </div>
          <span className="text-[7px] text-slate-500 block">شركة المجد للسيارات الفاخرة © 2025</span>
        </div>
      );
    }

    return (
      <div className="w-full bg-slate-900 text-slate-400 rounded-xl p-2.5 space-y-1.5 text-center text-[8px]">
        <div className="flex justify-between border-b border-slate-800 pb-1">
          <span className="font-bold text-white">الشعار</span>
          <span>روابط سريعة • سياسة الخصوصية</span>
        </div>
        <span>جميع الحقوق محفوظة © 2025</span>
      </div>
    );
  }

  // 17. ABOUT US WIREFRAMES (قسم من نحن وقصة الشركة)
  if (template.category === 'about') {
    if (type === 'about-story-timeline') {
      return (
        <div className="w-full bg-white border border-slate-300 rounded-xl p-2.5 space-y-2 text-right text-[8px]">
          <div className="text-center space-y-0.5">
            <span className="text-[7px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">✨ مسيرة التميز</span>
            <span className="text-[9px] font-extrabold text-slate-800 block">عقد من الريادة والتميز</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[7px] text-center">
            <div className="bg-slate-50 border border-slate-200 rounded p-1">
              <span className="font-bold text-blue-600 block">2015</span>
              <span className="text-slate-600">التأسيس</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-1">
              <span className="font-bold text-blue-600 block">2021</span>
              <span className="text-slate-600">فحص 150+</span>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-1">
              <span className="font-bold text-blue-700 block">2025</span>
              <span className="text-blue-800">التوسع الكامل</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'about-split-ceo') {
      return (
        <div className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 space-y-1.5 text-right text-[8px]">
          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="space-y-1">
              <span className="text-[7px] font-bold text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded-full">🏛️ رسالة القيادة</span>
              <span className="text-[8px] font-bold text-white block">« شغف بالفخامة والثقة »</span>
              <span className="text-[7px] text-slate-400 block font-light">م. سلطان الهذلول</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded h-12 flex items-center justify-center text-[7px] text-slate-400">
              صورة الإدارة VIP
            </div>
          </div>
        </div>
      );
    }

    if (type === 'about-values-pillars') {
      return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5 text-right text-[8px]">
          <div className="text-center space-y-0.5">
            <span className="text-[7px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">🛡️ الركائز الثلاث</span>
            <span className="text-[9px] font-bold text-slate-800 block">قيم تحكم كل خطوة</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[7px] text-center">
            <div className="bg-white border border-slate-200 rounded p-1">
              <span className="block font-bold text-slate-800">🔍 الشفافية</span>
              <span className="text-slate-500 text-[6px]">فحص دقيق</span>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1">
              <span className="block font-bold text-slate-800">👑 ضيافة VIP</span>
              <span className="text-slate-500 text-[6px]">مستشار خاص</span>
            </div>
            <div className="bg-white border border-slate-200 rounded p-1">
              <span className="block font-bold text-slate-800">🏆 الضمان</span>
              <span className="text-slate-500 text-[6px]">شراكة ممتدة</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'about-branches-locations') {
      return (
        <div className="w-full bg-white border border-slate-300 rounded-xl p-2.5 space-y-1.5 text-right text-[8px]">
          <div className="text-center">
            <span className="text-[7px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">📍 صالات المملكة</span>
            <span className="text-[9px] font-bold text-slate-800 block">الرياض • جدة • الخبر</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[7px] text-center">
            <div className="bg-slate-50 border border-slate-200 rounded p-1">
              <span className="font-bold text-slate-800 block">الرياض (HQ)</span>
              <span className="text-slate-500 text-[6px]">الملك فهد</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-1">
              <span className="font-bold text-slate-800 block">جدة</span>
              <span className="text-slate-500 text-[6px]">الملك عبدالعزيز</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded p-1">
              <span className="font-bold text-slate-800 block">الخبر</span>
              <span className="text-slate-500 text-[6px]">الملك فيصل</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'about-certifications-awards') {
      return (
        <div className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 space-y-1.5 text-right text-[8px]">
          <div className="text-center">
            <span className="text-[7px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded-full">🏅 اعتمادات رسمية</span>
            <span className="text-[9px] font-bold text-white block">شهادات الأيزو والفحص الألماني</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[7px] text-center">
            <div className="bg-slate-800 border border-slate-700 rounded p-1">
              <span className="font-bold text-emerald-400 block">ISO 9001</span>
              <span className="text-slate-400 text-[6px]">إدارة الجودة</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded p-1">
              <span className="font-bold text-blue-400 block">TÜV Cert</span>
              <span className="text-slate-400 text-[6px]">فحص 150+</span>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded p-1">
              <span className="font-bold text-amber-400 block">VIP Award</span>
              <span className="text-slate-400 text-[6px]">أفضل معرض</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full bg-white border border-slate-300 rounded-xl p-2.5 space-y-1.5 text-right text-[8px]">
        <span className="text-[9px] font-bold text-slate-800 block">قسم من نحن والقصة</span>
        <span className="text-[7px] text-slate-500 block">نبذة تعريفية بالشركة والخدمات</span>
      </div>
    );
  }

  return null;
};
