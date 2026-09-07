import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { I18nProvider } from '@/lib/I18nProvider';

export const metadata: Metadata = {
  title: 'لوحة التحكم | نمّي أعمالك',
  description: 'منصة إدارة الأعمال المتكاملة',
  icons: {
    icon: [
      { url: '/brand/logo-business.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/logo-business.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/brand/logo-business.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="rtl" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preload" href="/fonts/fonts.css" as="style" />
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
