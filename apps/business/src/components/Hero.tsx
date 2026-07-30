'use client';

import Link from 'next/link';
import {
  ArrowLeft, Sparkles, Shield, Zap, Headphones,
  Smartphone, ChevronDown,
} from 'lucide-react';
import { useScrollProgress } from '@/lib/hooks';

export default function Hero() {
  const { ref, progress } = useScrollProgress();

  return (
    <section ref={ref} className="relative bg-slate-950" style={{ height: '150vh' }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden flex items-center justify-center">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          poster="/videos/business-hero-poster.webp"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/business-hero.mp4" type="video/mp4" />
          <source src="/videos/business-hero.webm" type="video/webm" />
        </video>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-slate-950/70 transition-opacity duration-300"
          style={{ opacity: Math.max(0, 1 - progress * 1.5) }}
        />

        {/* Text content */}
        <div
          className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-5 md:px-6 text-center"
          style={{
            transform: `translateY(-${progress * 30}vh)`,
            opacity: Math.max(0, 1 - progress * 2.5),
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white/10 backdrop-blur-sm rounded-full text-white font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-8 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#00E5FF]" />
            نمو بلا حدود
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-3 md:mb-6 leading-[1.05] text-white">
            دير ونمي اعمالك
            <br />
            <span className="bl-gradient-text">من مكانك</span>
          </h1>

          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-2 md:mb-4">
            انطلق بعملك <span className="text-[#00E5FF]">من مكانك إلى العالمية</span>
          </h2>

          <p className="text-white/70 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed">
            أدوات تحليلات وتسويق ودفع متكاملة، تكبر معك خطوة بخطوة
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto mb-8">
            <Link
              href="/signup"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00E5FF] text-slate-900 px-6 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              ابدأ مجاناً الآن
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base hover:bg-white/15 transition-all duration-300 cursor-pointer"
            >
              شاهد كيف يعمل
            </a>
            <Link
              href="/download-app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-[#00E5FF]/30 text-[#00E5FF] px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base hover:bg-[#00E5FF]/10 transition-all duration-300 cursor-pointer"
            >
              <Smartphone className="w-5 h-5" />
              تحميل تطبيق الديسكتوب
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Shield, text: 'آمن وموثوق' },
              { icon: Zap, text: 'سريع وخفيف' },
              { icon: Headphones, text: 'دعم 24/7' },
            ].map((item, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium"
              >
                <item.icon className="w-4 h-4 text-[#00E5FF]" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {progress < 0.1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block z-10">
            <ChevronDown className="w-6 h-6 text-white/40 bl-anim-bounce" />
          </div>
        )}
      </div>
    </section>
  );
}
