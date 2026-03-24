import React from 'react';
import { Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeHeroProps {
  prefersReducedMotion: boolean | null;
}

const HomeHero: React.FC<HomeHeroProps> = ({ prefersReducedMotion }) => {
  return (
    <div className="flex flex-col items-center text-center mb-8 md:mb-20">
      <div
        className={`inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-black text-white rounded-full font-black text-[9px] md:text-[10px] md:text-xs uppercase tracking-[0.2em] mb-6 md:mb-10 shadow-2xl ${
          prefersReducedMotion ? '' : 'animate-[fadeInScale_360ms_ease-out]'
        }`}
      >
        <Sparkles className="w-3 h-3 text-[#00E5FF] fill-current" />
        عروض حصرية
      </div>
      <h1 className="text-2xl md:text-4xl lg:text-8xl font-black tracking-tighter mb-4 md:mb-8 leading-[0.85]">
        من مكانك
        <br />
        <span className="text-cyan-700">دليل المحلات والمطاعم.</span>
      </h1>
      <p className="text-slate-600 text-sm md:text-lg md:text-2xl font-bold max-w-2xl px-4 leading-relaxed mb-8 md:mb-12">
        منصة من مكانك لاكتشاف أفضل المحلات والمطاعم القريبة منك مع العروض والتقييمات.
      </p>

      <Link
        to="/map"
        className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:bg-black transition-all shadow-xl"
      >
        الخريطة <MapPin className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default React.memo(HomeHero);
