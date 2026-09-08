'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  TrendingUp, ArrowLeft, Zap, ShoppingCart, BarChart3, Palette,
  Globe, Shield, Star, Store, Smartphone, CreditCard, Truck, Users,
  Sparkles, Package, Rocket, Target, Award, Layers, Code2, Headphones,
  Image as ImageIcon, Eye,
} from 'lucide-react';
import { RevealSection } from '@/lib/hooks';

const industryThemes = [
  { label: 'مطاعم', url: 'restaurant.myshop.com', desc: 'قوائم رقمية تفاعلية، حجز طاولات، وتوصيل مباشر للعملاء.', primary: '#EA580C', accent: '#F97316' },
  { label: 'تجزئة', url: 'retail.myshop.com', desc: 'عرض منتجاتك بشبكة أنيقة، فلاتر سريعة، ودفع إلكتروني مدمج.', primary: '#0369A1', accent: '#0EA5E9' },
  { label: 'صالونات', url: 'salon.myshop.com', desc: 'حجز مواعيد أسهل، قائمة خدمات واضحة، وتذكيرات لعملائك.', primary: '#BE185D', accent: '#EC4899' },
  { label: 'عيادات', url: 'clinic.myshop.com', desc: 'إدارة مواعيد المرضى، تذكيرات تلقائية، وبيانات آمنة.', primary: '#0F766E', accent: '#14B8A6' },
  { label: 'سيارات', url: 'cars.myshop.com', desc: 'عرض سياراتك بشكل احترافي، حجز اختبار قيادة، وطلب صيانة.', primary: '#4338CA', accent: '#6366F1' },
  { label: 'عقارات', url: 'realestate.myshop.com', desc: 'نشر إعلانات، تصفّح العقارات، وتواصل مباشر مع المهتمين.', primary: '#047857', accent: '#10B981' },
  { label: 'خدمات', url: 'services.myshop.com', desc: 'حجز مواعيد، استقبال طلبات، وعرض لخدماتك بوضوح.', primary: '#0E7490', accent: '#22D3EE' },
  { label: 'تعليم', url: 'study.myshop.com', desc: 'مناهج منظمة، حجز حصص، وتواصل مع الطلاب وأولياء الأمور.', primary: '#7C3AED', accent: '#A78BFA' },
  { label: 'رياضة', url: 'sport.myshop.com', desc: 'اشتراكات، حجز مدرب، ومتابعة تقدم الأعضاء.', primary: '#CA8A04', accent: '#FACC15' },
  { label: 'فعاليات', url: 'events.myshop.com', desc: 'حجز تذاكر، برنامج الفعالية، وإدارة الحضور من مكان واحد.', primary: '#C026D3', accent: '#E879F9' },
  { label: 'جملة', url: 'wholesale.myshop.com', desc: 'كروت أسعار بالجملة، قنوات بيع متعددة، وتتبع المخزون.', primary: '#1D4ED8', accent: '#3B82F6' },
  { label: 'شركات', url: 'company.myshop.com', desc: 'موقع مؤسسي يعرض خدماتك وأعمالك ويسهّل تواصل عملائك.', primary: '#0F172A', accent: '#475569' },
];

const features = [
  { icon: ShoppingCart, title: 'متجر إلكتروني احترافي', desc: 'أنشئ متجراً يعكس هوية علامتك التجارية بألوان وتصميمات مخصصة — بدون خبرة تقنية.', color: 'from-cyan-500 to-blue-500', span: 'md:col-span-2' },
  { icon: BarChart3, title: 'تحليلات وتقارير ذكية', desc: 'تتبع مبيعاتك وأداء منتجاتك وسلوك عملائك بتحليلات واضحة وسهلة الفهم.', color: 'from-violet-500 to-purple-500', span: '' },
  { icon: Palette, title: 'مصمم صفحات مرن', desc: 'اسحب وأفلت لبناء واجهة متجرك بلمسات احترافية — بدون كتابة سطر كود.', color: 'from-pink-500 to-rose-500', span: '' },
  { icon: Globe, title: 'بيع على كل القنوات', desc: 'اعرض منتجاتك على متجرك الإلكتروني، نقطة البيع، ووسائل التواصل — كله متزامن.', color: 'from-emerald-500 to-teal-500', span: 'md:col-span-2' },
];

const steps = [
  { icon: Store, title: 'سجّل متجرك', desc: 'أنشئ حسابك في أقل من دقيقة واختر نوع نشاطك التجاري.', num: '01' },
  { icon: Palette, title: 'صمم واجهتك', desc: 'استخدم مصمم الصفحات لإنشاء متجر يعكس هويتك بألوان وصور مخصصة.', num: '02' },
  { icon: Rocket, title: 'ابدأ البيع', desc: 'أضف منتجاتك، فعّل طرق الدفع، وابدأ استقبال الطلبات فوراً.', num: '03' },
];

export function ThemeShowcase() {
  const [active, setActive] = useState(0);
  const t = industryThemes[active];

  return (
    <section id="themes" className="relative bg-white py-20 md:py-32 overflow-hidden">
      {/* خلفية توهّجية تتفاعل مع لون النشاط المختار */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-80 blur-[130px] opacity-30 transition-colors duration-700"
        style={{ backgroundColor: t.accent }}
      />
      <div
        className="pointer-events-none absolute -right-20 top-10 w-72 h-72 rounded-full blur-[120px] opacity-20 transition-colors duration-700"
        style={{ backgroundColor: t.primary }}
      />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6">
        <RevealSection className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-bold uppercase tracking-widest mb-5">
            <Eye className="w-3.5 h-3.5" />
            ابدأ من قطاعك
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            واجهة <span className="text-cyan-600">على مقاس نشاطك</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            مش قالب واحد للجميع — اختار قطاعك وشاهد واجهتك بتتبدل خطوة بخطوة، بتصميم نضيف بيشتغل بسرعة على كل الأجهزة.
          </p>
        </RevealSection>

        {/* مربعات الأنشطة */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {industryThemes.map((it, i) => (
            <button
              key={it.label}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-2xl px-3 py-4 text-sm font-bold border transition-all duration-300 ${
                active === i
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.03]'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:-translate-y-0.5'
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>

        {/* المعاينة التفاعلية */}
        <div
          key={t.label}
          className="animate-fade-up grid lg:grid-cols-2 gap-6 md:gap-8 items-center rounded-3xl border border-slate-200 bg-white p-5 md:p-8 shadow-xl shadow-slate-200/60"
        >
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xl shadow-slate-900/10">
            <div className="h-9 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 px-3">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 h-5 flex-1 max-w-[220px] rounded-md bg-white border border-slate-200 text-[10px] text-slate-400 flex items-center px-2 truncate">
                {t.url}
              </span>
            </div>
            <div className="p-4 sm:p-5 bg-white">
              <div className="flex items-center justify-between pb-4">
                <div className="w-6 h-6 rounded-lg" style={{ background: t.primary }} />
                <div className="flex gap-2">
                  <div className="h-1.5 w-10 rounded-full" style={{ background: t.accent }} />
                  <div className="h-1.5 w-10 rounded-full bg-slate-300" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="col-span-2 space-y-2.5">
                  <div className="h-3.5 w-full rounded" style={{ background: t.primary }} />
                  <div className="h-2.5 w-2/3 rounded" style={{ background: t.accent }} />
                  <div className="h-7 w-24 rounded-lg" style={{ background: t.primary }} />
                </div>
                <div
                  className="rounded-xl flex flex-col items-center justify-center gap-1 text-white text-xs font-black"
                  style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.primary})` }}
                >
                  {t.label}
                </div>
              </div>
            </div>
          </div>

          <div>
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black mb-4"
              style={{ background: t.accent + '14', color: t.primary }}
            >
              {t.label}
            </span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
              {t.label} بتصميم يفهم نشاطك
            </h3>
            <p className="text-slate-500 text-lg leading-relaxed mb-7">{t.desc}</p>
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-white font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: t.primary }}
            >
              ابدأ متجرك
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="relative bg-white py-20 md:py-32 overflow-hidden z-20">
      <div className="hidden md:block absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative">
        <RevealSection className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            من نحن
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            نحن هنا لمساعدة التجار على النجاح في العالم الرقمي
          </h2>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {[
            { icon: Target, title: 'مهمتنا', desc: 'مهمتنا هي تمكين كل تاجر من بناء متجر إلكتروني احترافي وإدارة أعماله بكفاءة', color: 'from-cyan-500 to-blue-500' },
            { icon: Award, title: 'رؤيتنا', desc: 'رؤيتنا هي أن نكون المنصة الرائدة في المنطقة لحلول التجارة الإلكترونية', color: 'from-violet-500 to-purple-500' },
            { icon: Users, title: 'مجتمعنا', desc: 'نبني مجتمعاً من التجار الناجحين وندعمهم في كل خطوة', color: 'from-pink-500 to-rose-500' },
          ].map((item, i) => (
            <RevealSection key={i} delay={i * 120}>
              <div className="group relative overflow-hidden rounded-3xl bg-slate-50 border border-slate-200 p-6 md:p-8 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1">
                <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
                <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${item.color} mb-5 shadow-lg`}>
                  <item.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <RevealSection>
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 p-8 md:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-200/40 rounded-full blur-3xl" />
              <div className="relative">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">قصتنا</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-6">
                  بدأنا برؤية بسيطة: جعل التجارة الإلكترونية متاحة للجميع. اليوم، نساعد آلاف التجار على تحقيق أحلامهم.
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <div className="text-slate-900 font-bold text-sm">تأسست 2024</div>
                    <div className="text-slate-400 text-xs">القاهرة، مصر</div>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
          <RevealSection delay={200}>
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">لماذا تختارنا؟</h3>
              {[
                { icon: Shield, label: 'أمان عالمي مع تشفير متقدم وحماية لبياناتك', color: 'text-blue-600' },
                { icon: Zap, label: 'سرعة فائقة وأداء محسن لتجربة مستخدم سلسة', color: 'text-amber-600' },
                { icon: Globe, label: 'دعم متعدد اللغات مع واجهة عربية بالكامل', color: 'text-emerald-600' },
                { icon: Headphones, label: 'دعم فني متاح 24/7 لمساعدتك في أي وقت', color: 'text-rose-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:border-slate-300 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">{item.label}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative z-20 bg-white py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <RevealSection className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-6">
            <Zap className="w-4 h-4" />
            كل ما يحتاجه متجرك في مكان واحد
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            كل ما يحتاجه متجرك في مكان واحد
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            أدوات قوية وسهلة الاستخدام لإدارة وتنمية أعمالك بكفاءة عالية
          </p>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, i) => (
            <RevealSection
              key={i}
              delay={i * 80}
              className={`group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-300 ${feature.span}`}
            >
              <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
              <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-5 shadow-lg`}>
                <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">{feature.desc}</p>
            </RevealSection>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-6">
          {[
            { icon: Smartphone, label: 'متجرك على الموبايل' },
            { icon: CreditCard, label: 'دفع آمن' },
            { icon: Truck, label: 'إدارة الشحن' },
            { icon: Users, label: 'إدارة العملاء' },
          ].map((item, i) => (
            <RevealSection
              key={i}
              delay={i * 60}
              className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <item.icon className="w-5 h-5 text-cyan-600 flex-shrink-0" />
              <span className="text-slate-700 text-sm font-medium">{item.label}</span>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <div className="relative z-20 bg-white">
      <section className="relative sticky top-0 min-h-[70vh] md:min-h-screen flex items-center py-12 md:py-32 overflow-hidden">
        <div className="hidden md:block absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 relative w-full">
          <RevealSection className="text-center mb-12 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              ثلاث خطوات فقط
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
              ثلاث خطوات فقط
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              من الفكرة إلى البيع في دقائق
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
            {steps.map((step, i) => (
              <RevealSection key={i} delay={i * 120} className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white border border-slate-200 mb-6 mx-auto transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-slate-200/50 hover:border-cyan-300">
                  <step.icon className="w-7 h-7 md:w-8 md:h-8 text-cyan-600" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
