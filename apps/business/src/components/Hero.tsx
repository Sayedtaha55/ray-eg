'use client';

import Link from 'next/link';
import {
  ArrowLeft, Sparkles, Shield, Zap, Headphones,
} from 'lucide-react';

export default function Hero() {
  return (
    <section className="biz-hero relative overflow-hidden">
      {/* سحاب زي صفحة "جديد" */}
      <span className="biz-cloud biz-cloud-top" aria-hidden="true"><i /><i /><i /></span>
      <span className="biz-cloud biz-cloud-right" aria-hidden="true"><i /><i /><i /></span>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 md:gap-8 items-center">
          {/* Text content - right side (RTL) */}
          <div className="order-2 md:order-1 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-slate-800 font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-6 shadow-sm border border-slate-100">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00E5FF]" />
              نمو بلا حدود
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3 md:mb-5 leading-[1.1] text-slate-900">
              تجارتك على أرض الواقع..
              <br />
              <span className="bl-gradient-text">وإدارتها في إيدك.</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-lg md:text-xl max-w-xl md:mx-0 mx-auto mb-6 md:mb-8 leading-relaxed">
              من أول محل.. لأكبر منظومة. أدوات تساعدك تبيع، تدير، تتابع وتكبّر — كل ده في مكان واحد.
            </p>

            <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 mb-6">
              <Link
                href="/signup"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00E5FF] text-slate-900 px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                ابدأ تجارتك بشكل أذكى
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/features"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-800 px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base border border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                تعرّف على الحلول
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {[
                { icon: Shield, text: 'آمن وموثوق' },
                { icon: Zap, text: 'سريع وخفيف' },
                { icon: Headphones, text: 'دعم 24/7' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-100 text-slate-700 text-xs sm:text-sm font-medium shadow-sm"
                >
                  <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E5FF]" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Visual - left side */}
          <div className="order-1 md:order-2 relative">
            <div className="absolute -inset-4 bg-[#00E5FF]/10 rounded-[2rem] blur-2xl" aria-hidden />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/20 border border-white/60">
              <img
                src="/videos/business-hero-poster.png"
                alt="لوحة تحكم من مكانك بيزنس"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
