import React from 'react';
import { Link } from 'react-router-dom';

const SeoDirectoryPage: React.FC = () => {
  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16" dir="rtl">
      <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-5">من مكانك - الدليل الشامل في مصر</h1>
      <p className="text-slate-700 text-base md:text-lg leading-8 mb-8">
        لو بتدور على <strong>دليل المحلات</strong> أو <strong>دليل المطاعم</strong> أو <strong>دليل الأنشطة</strong>،
        منصة <strong>من مكانك</strong> بتجمع لك الأماكن القريبة منك مع العروض والتقييمات في صفحة واحدة.
      </p>

      <section className="grid md:grid-cols-3 gap-4 mb-10">
        <article className="rounded-2xl border border-slate-200 p-5 bg-white">
          <h2 className="font-black text-xl mb-2">دليل المحلات</h2>
          <p className="text-slate-600 text-sm leading-7">اكتشف المحلات القريبة منك حسب المكان والتصنيف والعروض المتاحة.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 p-5 bg-white">
          <h2 className="font-black text-xl mb-2">دليل المطاعم</h2>
          <p className="text-slate-600 text-sm leading-7">شوف أفضل المطاعم القريبة مع أحدث العروض والصور والمراجعات.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 p-5 bg-white">
          <h2 className="font-black text-xl mb-2">دليل الأنشطة</h2>
          <p className="text-slate-600 text-sm leading-7">أماكن وأنشطة متنوعة تقدر تلاقيها بسهولة من خلال خريطة من مكانك.</p>
        </article>
      </section>

      <section className="rounded-2xl bg-slate-900 text-white p-6 md:p-8 mb-10">
        <h2 className="text-2xl font-black mb-3">روابط سريعة</h2>
        <div className="flex flex-wrap gap-3 text-sm font-bold">
          <Link to="/" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">الصفحة الرئيسية</Link>
          <Link to="/map" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">الخريطة</Link>
          <Link to="/offers" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">العروض</Link>
          <Link to="/about" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">عن من مكانك</Link>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-black mb-4">أسئلة شائعة</h2>
        <div className="space-y-3">
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="font-black cursor-pointer">ما هو من مكانك؟</summary>
            <p className="text-slate-600 mt-2 text-sm leading-7">من مكانك منصة مصرية تساعدك تلاقي المحلات والمطاعم والأنشطة القريبة منك بشكل سريع وسهل.</p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="font-black cursor-pointer">هل من مكانك مناسب للبحث عن دليل المحلات والمطاعم؟</summary>
            <p className="text-slate-600 mt-2 text-sm leading-7">أيوة، لأن المنصة مركزة على دليل المحلات ودليل المطاعم مع خريطة وعروض وتقييمات.</p>
          </details>
        </div>
      </section>
    </main>
  );
};

export default SeoDirectoryPage;
