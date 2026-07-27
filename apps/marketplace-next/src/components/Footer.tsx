'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useApp } from './AppProvider';
import { siteConfig } from '@/lib/config';

export function Footer() {
  const { lang } = useApp();
  const ar = lang === 'ar';

  return (
    <footer className="bg-brand-black text-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-black rounded-2xl flex items-center justify-center">
                <Image src="/brand/logo.png" alt="MNMKNK" width={24} height={24} className="w-6 h-6 object-contain" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase text-gradient">MNMKNK</span>
            </div>
            <p className="text-white/60 text-sm font-bold leading-relaxed">
              {ar ? 'منصة تسويق ومبيعات للأنشطة التجارية في مصر' : 'Marketing and sales platform for businesses in Egypt'}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest text-brand-cyan mb-6">
              {ar ? 'استكشف' : 'Explore'}
            </h3>
            <nav className="flex flex-col gap-4 text-white/70 font-bold text-sm">
              <Link href="/offers/restaurants" className="hover:text-white transition-colors">{ar ? 'عروض المطاعم' : 'Restaurant Offers'}</Link>
              <Link href="/offers/fashion" className="hover:text-white transition-colors">{ar ? 'عروض الأزياء' : 'Fashion Offers'}</Link>
              <Link href="/offers/supermarket" className="hover:text-white transition-colors">{ar ? 'عروض السوبر ماركت' : 'Supermarket Offers'}</Link>
              <Link href="/about" className="hover:text-white transition-colors">{ar ? 'حول' : 'About'}</Link>
            </nav>
          </div>

          {/* Business */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest text-brand-purple mb-6">
              {ar ? 'للأعمال' : 'For Business'}
            </h3>
            <nav className="flex flex-col gap-4 text-white/70 font-bold text-sm">
              <a href={`${siteConfig.dashboardUrl}/#/business`} className="hover:text-white transition-colors">{ar ? 'انضم إلينا' : 'Join Us'}</a>
              <Link href="/courier" className="hover:text-white transition-colors">{ar ? 'كن كورير' : 'Be a Courier'}</Link>
              <Link href="/download-app" className="hover:text-white transition-colors">{ar ? 'تحميل التطبيق' : 'Download App'}</Link>
            </nav>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-black text-xs uppercase tracking-widest text-green-400 mb-6">
              {ar ? 'مساعدة' : 'Help'}
            </h3>
            <nav className="flex flex-col gap-4 text-white/70 font-bold text-sm">
              <Link href="/support" className="hover:text-white transition-colors">{ar ? 'مركز المساعدة' : 'Help Center'}</Link>
              <Link href="/customer-service" className="hover:text-white transition-colors">{ar ? 'خدمة العملاء' : 'Customer Service'}</Link>
              <Link href="/suggestions" className="hover:text-white transition-colors">{ar ? 'الاقتراحات' : 'Suggestions'}</Link>
              <Link href="/terms" className="hover:text-white transition-colors">{ar ? 'الشروط' : 'Terms'}</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">{ar ? 'الخصوصية' : 'Privacy'}</Link>
              <Link href="/contact" className="hover:text-white transition-colors">{ar ? 'تواصل معنا' : 'Contact'}</Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs font-bold">
            © {new Date().getFullYear()} MNMKNK. {ar ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
          <p className="text-white/40 text-xs font-bold">
            {ar ? 'صُنع بحب في مصر' : 'Made with love in Egypt'}
          </p>
        </div>
      </div>
    </footer>
  );
}
