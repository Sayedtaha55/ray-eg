import Link from 'next/link';
import { isValidLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';

export default async function LocaleNotFound({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc: Locale = isValidLocale(locale) ? (locale as Locale) : 'ar';
  const dict = getDictionary(loc);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center"
      dir={loc === 'ar' ? 'rtl' : 'ltr'}
    >
      <h1 className="text-6xl font-black text-slate-200">404</h1>
      <p className="text-xl font-bold text-slate-700">{dict.common.notFound}</p>
      <Link
        href={`/${loc}`}
        className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all"
      >
        {dict.common.home}
      </Link>
    </div>
  );
}
