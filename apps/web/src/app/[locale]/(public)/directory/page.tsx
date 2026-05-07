'use client';

import Link from 'next/link';
import { Globe, ChevronRight, Store, MapPin } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';

const CATEGORIES = [
  { id: 'restaurant', name: 'Restaurants', nameAr: 'مطاعم', slug: 'restaurants', count: 120 },
  { id: 'grocery', name: 'Grocery & Supermarkets', nameAr: 'بقالة وسوبر ماركت', slug: 'grocery', count: 85 },
  { id: 'pharmacy', name: 'Pharmacies', nameAr: 'صيدليات', slug: 'pharmacy', count: 60 },
  { id: 'fashion', name: 'Fashion & Shoes', nameAr: 'ملابس وأحذية', slug: 'fashion', count: 95 },
  { id: 'electronics', name: 'Electronics', nameAr: 'إلكترونيات', slug: 'electronics', count: 45 },
  { id: 'home', name: 'Home & Furniture', nameAr: 'أثاث ومنزل', slug: 'home', count: 35 },
  { id: 'health', name: 'Health & Clinics', nameAr: 'صحة وعيادات', slug: 'health', count: 40 },
  { id: 'beauty', name: 'Beauty & Care', nameAr: 'تجميل وعناية', slug: 'beauty', count: 55 },
  { id: 'services', name: 'Services', nameAr: 'خدمات', slug: 'services', count: 70 },
];

const GOVERNORATES = [
  { name: 'Cairo', nameAr: 'القاهرة', slug: 'cairo' },
  { name: 'Giza', nameAr: 'الجيزة', slug: 'giza' },
  { name: 'Alexandria', nameAr: 'الإسكندرية', slug: 'alexandria' },
  { name: 'Qalyubia', nameAr: 'القليوبية', slug: 'qalyubia' },
  { name: 'Sharqia', nameAr: 'الشرقية', slug: 'sharqia' },
  { name: 'Dakahlia', nameAr: 'الدقهلية', slug: 'dakahlia' },
  { name: 'Gharbia', nameAr: 'الغربية', slug: 'gharbia' },
  { name: 'Monufia', nameAr: 'المنوفية', slug: 'monufia' },
];

export default function SeoDirectoryPage() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';
  const isAr = locale === 'ar';

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8" dir={dir}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF]" />
            <Globe className="relative z-10 text-white" size={28} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">{t('directory.title', 'Business Directory')}</h1>
          <p className="text-slate-400 font-bold text-sm mt-2">{t('directory.subtitle', 'Browse businesses by category and location')}</p>
        </div>

        {/* By Category */}
        <section className="mb-16">
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Store size={22} className="text-[#00E5FF]" />
            {t('directory.byCategory', 'By Category')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/offers/${cat.slug}`}
                className="group bg-white border border-slate-100 rounded-[2rem] p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all"
              >
                <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <p className="font-black text-sm group-hover:text-[#00E5FF] transition-colors">
                      {isAr ? cat.nameAr : cat.name}
                    </p>
                    <p className="text-slate-400 text-[10px] font-bold mt-1">
                      {cat.count} {t('directory.shops', 'shops')}
                    </p>
                  </div>
                  <ChevronRight size={16} className={`text-slate-200 group-hover:text-[#00E5FF] transition-colors ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* By Location */}
        <section className="mb-16">
          <h2 className={`text-2xl font-black mb-6 flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <MapPin size={22} className="text-[#BD00FF]" />
            {t('directory.byLocation', 'By Location')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GOVERNORATES.map((gov) => (
              <Link
                key={gov.slug}
                href={`/${locale}/map?governorate=${gov.slug}`}
                className="group bg-white border border-slate-100 rounded-[2rem] p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all"
              >
                <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <p className="font-black text-sm group-hover:text-[#BD00FF] transition-colors">
                      {isAr ? gov.nameAr : gov.name}
                    </p>
                  </div>
                  <ChevronRight size={16} className={`text-slate-200 group-hover:text-[#BD00FF] transition-colors ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SEO text */}
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)]">
          <h2 className="text-xl font-black mb-4">{t('directory.aboutTitle', 'About Ray Directory')}</h2>
          <p className="text-slate-500 font-bold text-sm leading-relaxed">
            {t('directory.aboutText', 'Ray is the leading local business directory in Egypt. Browse thousands of restaurants, pharmacies, supermarkets, fashion stores, and more — all in your area. Find the best offers, read reviews, and order products for delivery. Whether you\'re in Cairo, Alexandria, or any other governorate, Ray helps you discover and connect with local businesses near you.')}
          </p>
        </section>
      </div>
    </div>
  );
}
