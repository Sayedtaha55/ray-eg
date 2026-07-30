'use client';

import Link from 'next/link';
import {
  TrendingUp, ArrowLeft, Zap, ShoppingCart, BarChart3, Palette,
  Globe, Shield, Star, Store, Smartphone, CreditCard, Truck, Users,
  Sparkles, Package, Rocket, Target, Award, Layers, Code2, Headphones,
  Image as ImageIcon, Eye, LayoutDashboard,
} from 'lucide-react';
import { RevealSection } from '@/lib/hooks';

const marqueeItems = [
  'أفضل الثيمات المطورة في العالم',
  'تصميم عالمي المستوى',
  'أداء فائق السرعة',
  'دعم على مدار الساعة',
  'أمان من الطراز الأول',
];

const themeShowcase = [
  { image: '/images/themes/theme-retail.jpg', tag: 'الأكثر طلباً', title: 'ثيم "متجر التجزئة"', desc: 'مثالي لعرض المنتجات بشبكة أنيقة وفلاتر سريعة' },
  { image: '/images/themes/theme-restaurant.jpg', tag: 'جديد', title: 'ثيم "المطاعم والكافيهات"', desc: 'قوائم طعام تفاعلية وحجز طاولات مدمج' },
  { image: '/images/themes/theme-services.jpg', tag: 'مميز', title: 'ثيم "الخدمات الاحترافية"', desc: 'صفحات حجز مواعيد وعرض أعمال أنيق' },
  { image: '/images/themes/theme-fashion.jpg', tag: 'الأكثر تقييماً', title: 'ثيم "الأزياء والموضة"', desc: 'تجربة تسوق بصرية غنية بالحركة والتفاصيل' },
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

const dashboardPages = [
  { icon: ShoppingCart, title: 'إدارة الطلبات', desc: 'تابع كل الطلبات من مكان واحد — من استلام الطلب حتى التوصيل. فلترة سريعة، بحث فوري، وتحديث الحالة بنقرة واحدة.', image: '/images/dashboard/orders.jpg', color: 'from-cyan-500 to-blue-500', bg: 'bg-slate-50' },
  { icon: BarChart3, title: 'تحليلات ومبيعات', desc: 'رؤية كاملة لمبيعاتك وأدائك — رسوم بيانية تفاعلية، تقارير يومية وشهرية، ومقارنة بين الفترات لاتخاذ قرارات أفضل.', image: '/images/dashboard/analytics.jpg', color: 'from-violet-500 to-purple-500', bg: 'bg-white' },
  { icon: Package, title: 'إدارة المنتجات', desc: 'أضف وعدّل منتجاتك بسهولة — صور، أسعار، مخزون، تصنيفات، وخصومات. كل شيء في واجهة واحدة بسيطة.', image: '/images/dashboard/products.jpg', color: 'from-amber-500 to-orange-500', bg: 'bg-slate-50' },
  { icon: Users, title: 'إدارة العملاء', desc: 'تعرف على عملائك أكثر — سجل المشتريات، نقاط الولاء، وتواصل مباشر. احتفظ بعملائك وسعّم علاقاتك معهم.', image: '/images/dashboard/customers.jpg', color: 'from-emerald-500 to-green-500', bg: 'bg-white' },
  { icon: Palette, title: 'مصمم الصفحات', desc: 'صمم متجرك بنفسك بدون برمجة — اسحب وأفلت العناصر، غيّر الألوان والخطوط، واختر الثيم اللي يناسب هويتك.', image: '/images/dashboard/design.jpg', color: 'from-pink-500 to-rose-500', bg: 'bg-slate-50' },
];

export function TrustMarquee() {
  return (
    <section className="relative bg-white border-y border-slate-100 py-5 md:py-6 overflow-hidden">
      <div className="bl-marquee-track">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-6 md:px-8 shrink-0">
            <span className="text-slate-600 font-bold text-sm md:text-base whitespace-nowrap">{item}</span>
            <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ThemeShowcase() {
  return (
    <section id="themes" className="relative bg-white py-20 md:py-32 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <RevealSection className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-bold uppercase tracking-widest mb-5">
            <Eye className="w-3.5 h-3.5" />
            شاهد الفرق بنفسك
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            نصمم <span className="text-cyan-600">أفضل الثيمات المطورة في العالم</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            كل ثيم مبني بمعايير تصميم عالمية، ومُختبر على أعلى أداء وسرعة تحميل
          </p>
        </RevealSection>

        <div className="flex overflow-x-auto gap-5 md:gap-6 pb-4 snap-x snap-mandatory scrollbar-hide">
          {themeShowcase.map((theme, i) => (
            <RevealSection
              key={i}
              delay={i * 90}
              className="group relative rounded-3xl border border-slate-200 bg-white overflow-hidden flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[400px] snap-start shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] bl-img-zoom bg-slate-100">
                <img
                  src={theme.image}
                  alt={theme.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <ImageIcon className="w-10 h-10 text-slate-300" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-cyan-500 text-white text-xs font-black">
                  {theme.tag}
                </span>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm">
                    <Eye className="w-4 h-4" />
                    معاينة الثيم
                  </span>
                </div>
              </div>
              <div className="p-5 md:p-6">
                <h3 className="text-slate-900 font-bold text-lg mb-1.5">{theme.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{theme.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>

        <RevealSection className="text-center mt-10 md:mt-12">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all duration-300 cursor-pointer"
          >
            استعراض جميع الثيمات
            <ArrowLeft className="w-4 h-4" />
          </a>
        </RevealSection>
      </div>
    </section>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="relative bg-slate-900 py-20 md:py-32 overflow-hidden z-20">
      <div className="hidden md:block absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-[100px]" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 relative">
        <RevealSection className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            من نحن
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
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
              <div className="group relative overflow-hidden rounded-3xl bg-slate-800/50 border border-white/10 p-6 md:p-8 transition-all duration-300 hover:border-white/20 hover:-translate-y-1">
                <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />
                <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${item.color} mb-5 shadow-lg`}>
                  <item.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm md:text-base leading-relaxed">{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <RevealSection>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-800/50 p-8 md:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4">قصتنا</h3>
                <p className="text-white/50 text-base leading-relaxed mb-6">
                  بدأنا برؤية بسيطة: جعل التجارة الإلكترونية متاحة للجميع. اليوم، نساعد آلاف التجار على تحقيق أحلامهم.
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">تأسست 2024</div>
                    <div className="text-white/40 text-xs">القاهرة، مصر</div>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
          <RevealSection delay={200}>
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-black text-white mb-4">لماذا تختارنا؟</h3>
              {[
                { icon: Shield, label: 'أمان عالمي مع تشفير متقدم وحماية لبياناتك', color: 'text-blue-400' },
                { icon: Zap, label: 'سرعة فائقة وأداء محسن لتجربة مستخدم سلسة', color: 'text-amber-400' },
                { icon: Globe, label: 'دعم متعدد اللغات مع واجهة عربية بالكامل', color: 'text-emerald-400' },
                { icon: Headphones, label: 'دعم فني متاح 24/7 لمساعدتك في أي وقت', color: 'text-rose-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <p className="text-white/70 text-sm md:text-base leading-relaxed">{item.label}</p>
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
    <section id="features" className="relative z-20 bg-gradient-to-b from-white to-slate-50 py-20 md:py-32">
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

export function DashboardPreview() {
  return (
    <div className="relative z-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 pt-12 md:pt-24 pb-6 md:pb-8 text-center">
        <RevealSection>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold mb-4">
            <LayoutDashboard className="w-4 h-4" />
            لوحة تحكم قوية وبسيطة
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
            لوحة تحكم قوية وبسيطة
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            كل ما تحتاج لمعرفته عن متجرك في شاشة واحدة — مبيعات، طلبات، عملاء، وأكثر.
          </p>
        </RevealSection>
      </div>

      {dashboardPages.map((page, i) => (
        <section
          key={i}
          className={`relative ${page.bg} sticky top-0 min-h-[70vh] md:min-h-screen flex items-center py-10 md:py-24 overflow-hidden`}
          style={{ zIndex: 30 + i }}
        >
          <div className={`hidden md:block absolute top-1/2 ${i % 2 === 0 ? 'left-0' : 'right-0'} w-[40vw] h-[40vw] rounded-full bg-gradient-to-br ${page.color} opacity-[0.04] blur-[100px]`} />
          <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-6 relative w-full">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-16 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <RevealSection className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className={`inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${page.color} mb-4 md:mb-6 shadow-lg`}>
                  <page.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-3 md:mb-4">
                  {page.title}
                </h3>
                <p className="text-slate-500 text-sm md:text-lg leading-relaxed max-w-lg">
                  {page.desc}
                </p>
              </RevealSection>
              <RevealSection delay={150} className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <div className="relative rounded-xl md:rounded-2xl overflow-hidden border border-slate-200 shadow-xl md:shadow-2xl bg-slate-100 aspect-[16/10]">
                  <img
                    src={page.image}
                    alt={page.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="text-center">
                      <page.icon className="w-10 h-10 md:w-12 md:h-12 text-slate-300 mx-auto mb-2 md:mb-3" />
                      <p className="text-slate-400 text-xs md:text-sm font-medium">{page.title}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
