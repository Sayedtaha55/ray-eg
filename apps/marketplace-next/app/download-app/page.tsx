import { Metadata } from 'next';
import { Download, Smartphone } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'تحميل التطبيق',
  description: 'حمّل تطبيق من مكانك للاستفادة من جميع المميزات على هاتفك',
  alternates: { canonical: '/download-app' },
  openGraph: { title: 'تحميل تطبيق من مكانك', description: 'حمّل تطبيق من مكانك للاستفادة من جميع المميزات على هاتفك', url: '/download-app', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'تحميل تطبيق من مكانك', description: 'حمّل تطبيق من مكانك للاستفادة من جميع المميزات على هاتفك' },
};

export default function DownloadAppPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20 text-center">
      <div className="w-20 h-20 bg-brand-purple/10 rounded-4xl flex items-center justify-center mx-auto mb-8">
        <Smartphone className="w-10 h-10 text-brand-purple" />
      </div>
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">حمّل تطبيق <span className="text-gradient">من مكانك</span></h1>
      <p className="text-slate-600 dark:text-slate-400 font-bold text-lg md:text-xl max-w-2xl mx-auto mb-10">
        حمّل التطبيق الآن واستمتع بتجربة أفضل على هاتفك
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <a
          href="https://github.com/Sayedtaha55/ray-eg/releases/latest"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-6 py-4 bg-brand-black text-white rounded-2xl cursor-pointer hover:shadow-lg transition-all"
        >
          <Download className="w-6 h-6" />
          <div className="text-right">
            <p className="text-xs text-white/60 font-bold">حمّل من</p>
            <p className="font-black">GitHub Releases</p>
          </div>
        </a>
        <a
          href={`${siteConfig.dashboardUrl}/#/business`}
          className="flex items-center gap-3 px-6 py-4 bg-brand-black text-white rounded-2xl cursor-pointer hover:shadow-lg transition-all"
        >
          <Smartphone className="w-6 h-6" />
          <div className="text-right">
            <p className="text-xs text-white/60 font-bold">استخدم</p>
            <p className="font-black">النسخة الإلكترونية</p>
          </div>
        </a>
      </div>
    </div>
  );
}
