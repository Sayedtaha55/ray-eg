import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Globe, FileEdit, Eye, MoreVertical, Calendar } from 'lucide-react';
import { getWebsites } from '@/lib/platform/services';
import { siteConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'منشئ المواقع',
  description: 'أنشئ وأدر مواقعك من مكان واحد',
  alternates: { canonical: '/builder' },
};

export default async function BuilderDashboard() {
  let websites: any[] = [];
  try {
    websites = await getWebsites('current');
  } catch {
    websites = [];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-black py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">منشئ المواقع</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">أنشئ وأدر مواقعك من مكان واحد</p>
          </div>
          <Link
            href="/builder/templates"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-gradient text-white font-black text-sm hover:shadow-glow-cyan transition-all"
          >
            <Plus className="w-5 h-5" />
            موقع جديد
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/builder/templates" className="group p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-brand-cyan/20 hover:shadow-brand transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-brand-cyan" />
            </div>
            <h3 className="font-black mb-1">إنشاء من قالب</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">ابدأ من قالب جاهز</p>
          </Link>
          <Link href="/builder/blank" className="group p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-brand-purple/20 hover:shadow-brand transition-all">
            <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileEdit className="w-6 h-6 text-brand-purple" />
            </div>
            <h3 className="font-black mb-1">موقع من الصفر</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">ابدأ بصفحة بيضاء</p>
          </Link>
          <Link href="/builder/import" className="group p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-brand-cyan/20 hover:shadow-brand transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="font-black mb-1">ربط موقع موجود</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">اربط موقعك الحالي</p>
          </Link>
        </div>

        {/* Websites List */}
        <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black">مواقعي</h2>
          </div>
          {websites.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {websites.map((site) => (
                <div key={site.id} className="flex items-center gap-4 p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black truncate">{site.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        site.status === 'published' ? 'bg-green-500/10 text-green-500' :
                        site.status === 'draft' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-slate-500/10 text-slate-500'
                      }`}>
                        {site.status === 'published' ? 'منشور' : site.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                      </span>
                      {site.domain && (
                        <span className="text-xs text-slate-400 font-bold" dir="ltr">{site.domain}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/builder/edit/${site.id}`} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-brand-cyan/10 transition-all" title="تحرير">
                      <FileEdit className="w-4 h-4" />
                    </Link>
                    <Link href={`${siteConfig.url}/shop/${site.slug}`} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-brand-purple/10 transition-all" title="معاينة">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Globe className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="font-black text-lg mb-2">لا توجد مواقع بعد</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-6">ابدأ بإنشاء موقعك الأول</p>
              <Link href="/builder/templates" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-gradient text-white font-black text-sm hover:shadow-glow-cyan transition-all">
                <Plus className="w-5 h-5" />
                اختر قالباً
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
