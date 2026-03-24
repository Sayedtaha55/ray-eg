import React, { useMemo } from 'react';
import { Utensils, ShoppingBag, ShoppingCart, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type Props = {
  currentCategoryIndex: number;
  setCurrentCategoryIndex: (idx: number) => void;
  nextCategory: () => void;
  prevCategory: () => void;
};

const DevCategoryCarousel: React.FC<Props> = ({
  currentCategoryIndex,
  setCurrentCategoryIndex,
  nextCategory,
  prevCategory,
}) => {
  const categories = useMemo(
    () => [
      {
        id: 'restaurants',
        name: 'عروض المطاعم',
        desc: 'أفضل عروض المطاعم والمطابخ',
        icon: Utensils,
        cardClass: 'bg-orange-700',
        gradientClass: 'from-orange-600 to-orange-800',
      },
      {
        id: 'fashion',
        name: 'عروض الأزياء',
        desc: 'ملابس وأحذية بأسعار مميزة',
        icon: ShoppingBag,
        cardClass: 'bg-purple-700',
        gradientClass: 'from-purple-600 to-purple-800',
      },
      {
        id: 'supermarket',
        name: 'عروض السوبر ماركت',
        desc: 'منتجات بقالة ومواد غذائية',
        icon: ShoppingCart,
        cardClass: 'bg-green-700',
        gradientClass: 'from-green-600 to-green-800',
      },
    ],
    [],
  );

  const safeIndex = ((currentCategoryIndex % categories.length) + categories.length) % categories.length;
  const current = categories[safeIndex];

  return (
    <section className="mb-16 md:mb-24">
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <h2 className="text-xl md:text-3xl lg:text-5xl font-black tracking-tighter mb-4">استكشف العروض حسب الفئة</h2>
        <p className="text-slate-600 text-sm md:text-lg font-bold max-w-2xl">اختر الفئة اللي تهمك وشوف أحدث العروض المتخصصة</p>
      </div>
      <div className="relative max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevCategory}
            className="hidden sm:flex w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-600 hover:text-slate-900 shadow-md"
            aria-label="السابق"
            type="button"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-md min-w-0">
            <Link
              to={`/offers/${current.id}`}
              className={`group relative ${current.cardClass} text-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 text-center transition-all hover:scale-105 hover:shadow-2xl overflow-hidden block min-w-0`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${current.gradientClass} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative z-10">
                {React.createElement(current.icon, {
                  className: 'w-16 h-16 md:w-20 md:h-20 mx-auto mb-4',
                })}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 break-words">{current.name}</h3>
                <p className="text-sm sm:text-base md:text-lg opacity-90 break-words">{current.desc}</p>
              </div>
            </Link>
          </div>

          <button
            onClick={nextCategory}
            className="hidden sm:flex w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-600 hover:text-slate-900 shadow-md"
            aria-label="التالي"
            type="button"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-6 sm:hidden">
          <button
            onClick={prevCategory}
            className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-700 hover:text-slate-900 shadow-md"
            aria-label="السابق"
            type="button"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={nextCategory}
            className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 transition-all items-center justify-center text-slate-700 hover:text-slate-900 shadow-md"
            aria-label="التالي"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-1 mt-6">
          {categories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCategoryIndex(index)}
              className={`h-11 min-w-11 px-2 flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] ${
                index === safeIndex ? 'bg-slate-900/10' : 'bg-transparent hover:bg-slate-100'
              }`}
              aria-label={`الفئة ${index + 1}`}
              aria-current={index === safeIndex ? 'true' : undefined}
              type="button"
            >
              <span
                className={`block h-3 rounded-full transition-all ${
                  index === safeIndex ? 'bg-slate-900 w-8' : 'bg-slate-400 w-3'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(DevCategoryCarousel);
