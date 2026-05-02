import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const SeoDirectoryPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16" dir="rtl">
      <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-5">{t('seo.title')}</h1>
      <p className="text-slate-700 text-base md:text-lg leading-8 mb-8">
        {t('seo.intro')}
      </p>

      <section className="grid md:grid-cols-3 gap-4 mb-10">
        <article className="rounded-2xl border border-slate-200 p-5 bg-white">
          <h2 className="font-black text-xl mb-2">{t('seo.shopsGuide')}</h2>
          <p className="text-slate-600 text-sm leading-7">{t('seo.shopsGuideDesc')}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 p-5 bg-white">
          <h2 className="font-black text-xl mb-2">{t('seo.restaurantsGuide')}</h2>
          <p className="text-slate-600 text-sm leading-7">{t('seo.restaurantsGuideDesc')}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 p-5 bg-white">
          <h2 className="font-black text-xl mb-2">{t('seo.activitiesGuide')}</h2>
          <p className="text-slate-600 text-sm leading-7">{t('seo.activitiesGuideDesc')}</p>
        </article>
      </section>

      <section className="rounded-2xl bg-slate-900 text-white p-6 md:p-8 mb-10">
        <h2 className="text-2xl font-black mb-3">{t('seo.quickLinks')}</h2>
        <div className="flex flex-wrap gap-3 text-sm font-bold">
          <Link to="/" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">{t('seo.homeLink')}</Link>
          <Link to="/map" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">{t('seo.mapLink')}</Link>
          <Link to="/offers" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">{t('seo.offersLink')}</Link>
          <Link to="/about" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition">{t('seo.aboutLink')}</Link>
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-black mb-4">{t('seo.faqTitle')}</h2>
        <div className="space-y-3">
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="font-black cursor-pointer">{t('seo.faq1Q')}</summary>
            <p className="text-slate-600 mt-2 text-sm leading-7">{t('seo.faq1A')}</p>
          </details>
          <details className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="font-black cursor-pointer">{t('seo.faq2Q')}</summary>
            <p className="text-slate-600 mt-2 text-sm leading-7">{t('seo.faq2A')}</p>
          </details>
        </div>
      </section>
    </main>
  );
};

export default SeoDirectoryPage;
