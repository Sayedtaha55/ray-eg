import { notFound } from 'next/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { LocaleProvider } from '@/i18n/LocaleProvider';

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const dict = getDictionary(locale as Locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-alexandria antialiased">
        <LocaleProvider locale={locale as Locale} dict={dict}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
