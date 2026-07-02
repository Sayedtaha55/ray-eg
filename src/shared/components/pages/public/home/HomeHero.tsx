import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, MapPin, ArrowDown, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HomeHeroProps {
  prefersReducedMotion: boolean | null;
}

const HomeHero: React.FC<HomeHeroProps> = ({ prefersReducedMotion }) => {
  const { t } = useTranslation();

  return (
    <div className="relative mb-12 md:mb-24">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl ${prefersReducedMotion ? '' : 'animate-pulse'}`} />
        <div className={`absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-blue-500/15 via-indigo-500/10 to-transparent rounded-full blur-2xl ${prefersReducedMotion ? '' : 'animate-pulse'}`} style={{ animationDelay: '1s' }} />
      </div>

      <div className="flex flex-col items-center text-center px-4 md:px-8">

        {/* Main Title with Enhanced Typography */}
        <div className={`mb-6 md:mb-10 ${prefersReducedMotion ? '' : 'animate-[fadeIn_500ms_ease-out]'}`}>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-3 md:mb-4 leading-[0.9]">
            {t('home.hero.title')}
          </h1>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-[0.9]">
            {t('home.hero.subtitle')}
          </h2>
        </div>

        {/* Description with Better Typography */}
        <p className="text-slate-600 text-base md:text-xl lg:text-2xl font-bold max-w-3xl px-4 leading-relaxed mb-8 md:mb-12">
          {t('home.hero.description')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 md:mb-12">
          <Link
            to="/map"
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl md:rounded-3xl font-black text-sm md:text-base hover:from-slate-800 hover:to-slate-700 transition-all shadow-2xl border border-slate-700 hover:shadow-slate-900/50 hover:scale-105 ${prefersReducedMotion ? '' : 'transform'}`}
          >
            <MapPin className="w-5 h-5 md:w-6 md:h-6" />
            {t('home.hero.mapBtn')}
          </Link>
          <Link
            to="/offers"
            className={`inline-flex items-center justify-center gap-2 px-8 py-4 md:px-10 md:py-5 bg-white text-slate-900 rounded-2xl md:rounded-3xl font-black text-sm md:text-base hover:bg-slate-50 transition-all shadow-xl border-2 border-slate-200 hover:border-slate-300 hover:scale-105 ${prefersReducedMotion ? '' : 'transform'}`}
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            {t('home.hero.offersBtn', 'تصفح العروض')}
          </Link>
        </div>


        {/* Scroll Indicator */}
        {!prefersReducedMotion && (
          <div className="mt-12 md:mt-16 animate-bounce">
            <ArrowDown className="w-6 h-6 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(HomeHero);