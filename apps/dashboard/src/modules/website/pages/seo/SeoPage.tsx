import React, { useState } from 'react';
import { Search as SearchIcon, TrendingUp, Globe, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

const SeoPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [seoData] = useState({
    metaTitle: isArabic ? 'متجري - أفضل المنتجات' : 'My Store - Best Products',
    metaDescription: isArabic ? 'تسوق أفضل المنتجات بأفضل الأسعار' : 'Shop the best products at the best prices',
    keywords: ['shop', 'products', 'online store', isArabic ? 'متجر' : 'store', isArabic ? 'منتجات' : 'products'],
    score: 78,
    issues: [
      { type: 'warning', text: isArabic ? 'صفحة بدون وصف meta' : 'Page missing meta description', count: 2 },
      { type: 'error', text: isArabic ? 'صور بدون نص بديل' : 'Images missing alt text', count: 5 },
      { type: 'success', text: isArabic ? 'سرعة التحمول جيدة' : 'Good page load speed', count: 1 },
    ],
    analytics: {
      organicTraffic: 3200,
      keywordsRanked: 45,
      backlinks: 120,
      domainAuthority: 32,
    },
  });

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'تحسين محركات البحث' : 'SEO'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تحسين ظهور الموقع في البحث' : 'Optimize search engine visibility'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'زيارات عضوية' : 'Organic Traffic', value: seoData.analytics.organicTraffic.toLocaleString(), color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'كلمات مرتبة' : 'Keywords Ranked', value: seoData.analytics.keywordsRanked, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'روابط خلفية' : 'Backlinks', value: seoData.analytics.backlinks, color: 'bg-purple-50 text-purple-600' },
          { label: isArabic ? 'سلطة النطاق' : 'Domain Authority', value: seoData.analytics.domainAuthority, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><TrendingUp size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-3 flex items-center gap-2"><SearchIcon size={16} /> {isArabic ? 'إعدادات Meta' : 'Meta Settings'}</h4>
          <div className="space-y-3">
            <div><label className="text-xs font-bold text-slate-400">{isArabic ? 'عنوان Meta' : 'Meta Title'}</label><input defaultValue={seoData.metaTitle} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" /></div>
            <div><label className="text-xs font-bold text-slate-400">{isArabic ? 'وصف Meta' : 'Meta Description'}</label><textarea defaultValue={seoData.metaDescription} rows={2} className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm" /></div>
            <div><label className="text-xs font-bold text-slate-400">{isArabic ? 'الكلمات المفتاحية' : 'Keywords'}</label><div className="flex flex-wrap gap-1 mt-1">{seoData.keywords.map((k, i) => <span key={i} className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">{k}</span>)}</div></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-3 flex items-center gap-2"><AlertCircle size={16} /> {isArabic ? 'مشاكل SEO' : 'SEO Issues'}</h4>
          <div className="space-y-2">
            {seoData.issues.map((issue, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  {issue.type === 'error' ? <AlertCircle size={16} className="text-red-500" /> : issue.type === 'warning' ? <AlertCircle size={16} className="text-amber-500" /> : <CheckCircle2 size={16} className="text-green-500" />}
                  <span className="text-sm">{issue.text}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${issue.type === 'error' ? 'bg-red-100 text-red-600' : issue.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{issue.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-black">{isArabic ? 'نتيجة SEO' : 'SEO Score'}</h4>
          <span className="text-3xl font-black text-green-600">{seoData.score}<span className="text-lg">/100</span></span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${seoData.score}%` }} /></div>
      </div>
    </div>
  );
};

export default SeoPage;
