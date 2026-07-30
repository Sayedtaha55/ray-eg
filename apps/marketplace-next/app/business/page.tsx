import { Metadata } from 'next';
import { Store, TrendingUp, Zap, ShieldCheck, Globe, Star, ArrowLeft, BarChart3, LayoutGrid, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'للأعمال - ابدأ نشاطك التجاري',
  description: 'انضم لآلاف التجار في مصر وابدأ رحلتك في عالم التجارة الرقمية مع من مكانك - حلول متكاملة للتسويق والبيع',
  alternates: { canonical: '/business' },
};

export default function BusinessPage() {
  const features = [
    { title: 'بناء موقعك الذكي', desc: 'أنشئ موقعاً إلكترونياً احترافياً لنشاطك في دقائق باستخدام الذكاء الاصطناعي.', icon: LayoutGrid },
    { title: 'لوحة تحكم متكاملة', desc: 'إدارة المنتجات، الطلبات، والعملاء من مكان واحد بكل سهولة.', icon: BarChart3 },
    { title: 'تسويق واستهداف', desc: 'صل لعملائك المستهدفين في منطقتك من خلال أدواتنا التسويقية المتطورة.', icon: TrendingUp },
    { title: 'دعم فني متخصص', desc: 'فريق عمل متواجد لمساعدتك في كل خطوة نحو النجاح الرقمي.', icon: ShieldCheck },
  ];

  return (
    <div className="bg-white dark:bg-brand-black min-h-screen text-right">
      {/* Hero Section */}
      <section className="relative py-24 md:py-40 overflow-hidden bg-brand-black text-white">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-cyan/30 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-purple/30 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 rounded-full font-black text-xs uppercase tracking-widest mb-10 shadow-2xl">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            فرصتك للنمو تبدأ هنا
          </div>
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-10 leading-tight">
            خذ عملك <br /> إلى <span className="text-gradient">المستوى التالي</span>
          </h1>
          <p className="text-white/60 font-bold text-xl md:text-3xl max-w-3xl mx-auto mb-16 leading-relaxed">
            المنصة الأولى في مصر التي تمنحك كافة الأدوات الرقمية لتنمية نشاطك التجاري والوصول لآلاف العملاء.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href={`${siteConfig.dashboardUrl}/#/signup`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-6 rounded-2xl bg-brand-gradient text-white font-black text-xl hover:shadow-glow-cyan transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-brand-cyan/20"
            >
              ابدأ الآن مجاناً
              <ArrowLeft className="w-6 h-6 rotate-180" />
            </a>
            <a
               href="/contact"
               className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-6 bg-white/10 border border-white/20 text-white font-black text-xl rounded-2xl hover:bg-white/20 transition-all"
            >
               تحدث مع مبيعاتنا
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/5">
         <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
               {[
                 { label: 'تاجر نشط', value: '1,200+', color: 'text-brand-cyan' },
                 { label: 'عميل مسجل', value: '45K+', color: 'text-brand-purple' },
                 { label: 'محافظة مصرية', value: '27', color: 'text-green-500' },
                 { label: 'طلب شهري', value: '150K+', color: 'text-amber-500' },
               ].map((stat, i) => (
                 <div key={i} className="text-center group">
                    <div className={`text-3xl md:text-6xl font-black mb-2 ${stat.color} tracking-tighter group-hover:scale-110 transition-transform`}>{stat.value}</div>
                    <div className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Why Us Section */}
      <section className="py-32">
         <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-24 items-center">
               <div className="lg:w-1/2 space-y-12">
                  <div className="space-y-6">
                     <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">حلول رقمية <br /> متكاملة <span className="text-brand-cyan">لكل تاجر</span></h2>
                     <p className="text-xl text-slate-500 font-bold leading-relaxed">
                        سواء كنت مطعماً، محل ملابس، أو مقدم خدمة فنية، "من مكانك" توفر لك البيئة المثالية للتحول الرقمي الكامل بأقل التكاليف.
                     </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     {features.map((f, i) => (
                        <div key={i} className="space-y-4">
                           <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-brand-cyan shadow-sm">
                              <f.icon className="w-7 h-7" />
                           </div>
                           <h3 className="text-2xl font-black">{f.title}</h3>
                           <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{f.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="lg:w-1/2 relative">
                  <div className="relative z-10 bg-slate-100 dark:bg-slate-900 p-2 rounded-[3.5rem] shadow-2xl border border-white/10 overflow-hidden">
                     <div className="aspect-video bg-brand-black flex items-center justify-center">
                        <Store className="w-24 h-24 text-brand-cyan opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent" />
                        <div className="absolute bottom-10 right-10 left-10 text-right">
                           <div className="flex items-center gap-2 mb-2 justify-end">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                           </div>
                           <h4 className="text-white text-2xl font-black">أكثر من مجرد منصة</h4>
                           <p className="text-white/60 font-bold">بوابتك للنمو في عالم التجارة الإلكترونية</p>
                        </div>
                     </div>
                  </div>
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />
               </div>
            </div>
         </div>
      </section>

      {/* Pricing/CTA Section */}
      <section className="py-32 bg-slate-50 dark:bg-slate-950/50">
         <div className="max-w-4xl mx-auto px-4 md:px-6 text-center space-y-12">
            <h2 className="text-4xl md:text-7xl font-black tracking-tight">ابدأ اليوم <span className="text-gradient">مجاناً</span></h2>
            <p className="text-xl text-slate-500 font-bold leading-relaxed">
               يمكنك إنشاء متجرك وإضافة منتجاتك والبدء في البيع مجاناً تماماً. لا توجد رسوم خفية أو عقود معقدة.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <a
                  href={`${siteConfig.dashboardUrl}/#/signup`}
                  className="w-full sm:w-auto px-16 py-6 bg-brand-gradient text-white rounded-3xl font-black text-2xl hover:shadow-glow-cyan transition-all"
               >
                  انضم لشركائنا الآن
               </a>
            </div>
            <p className="text-slate-400 font-bold">انضم لأكثر من 1,000 تاجر نجحوا معنا.</p>
         </div>
      </section>
      
      {/* Final Features */}
      <section className="py-24 border-t border-slate-100 dark:border-white/5">
         <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { title: 'وصول لا محدود', desc: 'عملاؤك في كل مكان سيجدون نشاطك التجاري بكل سهولة.', icon: Globe },
                 { title: 'أداء فائق السرعة', desc: 'موقعك ومنتجاتك ستظهر للعملاء بسرعة البرق.', icon: Zap },
                 { title: 'بيانات دقيقة', desc: 'تقارير يومية عن مبيعاتك وزيارات متجرك لاتخاذ قرارات ذكية.', icon: BarChart3 },
               ].map((item, i) => (
                 <div key={i} className="text-right space-y-4">
                    <div className="w-12 h-12 bg-brand-cyan/10 rounded-xl flex items-center justify-center text-brand-cyan">
                       <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black">{item.title}</h3>
                    <p className="text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
