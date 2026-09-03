import React, { useState } from 'react';
import {
  Globe,
  Search,
  Share2,
  Code2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Facebook,
  Twitter,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';

export const SeoPanel: React.FC = () => {
  const { activePage, updatePageMetadata, currentTenant } = useBuilder();
  const [previewMode, setPreviewMode] = useState<'google' | 'social'>('google');
  const [isGenerating, setIsGenerating] = useState(false);

  const meta = activePage.metadata;

  // Calculate SEO Health Score
  const hasGoodTitle = meta.title && meta.title.length >= 20 && meta.title.length <= 65;
  const hasGoodDesc = meta.description && meta.description.length >= 50 && meta.description.length <= 160;
  const hasOgImage = !!meta.ogImage;
  const hasStructuredData = !!meta.structuredDataJson;

  let seoScore = 40;
  if (hasGoodTitle) seoScore += 20;
  if (hasGoodDesc) seoScore += 20;
  if (hasOgImage) seoScore += 10;
  if (hasStructuredData) seoScore += 10;

  const handleAiAutoGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generatedTitle = `${activePage.name} | ${currentTenant.businessInfo.brandName} - أرقى الخدمات والسيارات في المملكة`;
      const generatedDesc = `اكتشف أفضل العروض والخدمات الحصرية من ${currentTenant.businessInfo.brandName}. ضمان عالي وخدمة عملاء على مدار الساعة في ${currentTenant.businessInfo.address}.`;
      const generatedSchema = JSON.stringify(
        {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: currentTenant.businessInfo.brandName,
          image: meta.ogImage || currentTenant.businessInfo.logoUrl,
          telephone: currentTenant.businessInfo.phone,
          address: {
            '@type': 'PostalAddress',
            streetAddress: currentTenant.businessInfo.address,
            addressCountry: 'SA',
          },
          url: `https://${currentTenant.customDomain || 'almajd-motors.com'}`,
        },
        null,
        2
      );

      updatePageMetadata(activePage.id, {
        title: generatedTitle,
        description: generatedDesc,
        ogTitle: generatedTitle,
        ogDescription: generatedDesc,
        structuredDataJson: generatedSchema,
      });

      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="p-3 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800">تهيئة محركات البحث (SEO & Metadata)</span>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
          Next.js App Router
        </span>
      </div>

      {/* SEO Score Badge & Quick AI Optimizer Button */}
      <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-400/40 flex items-center justify-center font-bold text-sm text-indigo-300 bg-indigo-900/50">
            {seoScore}%
          </div>
          <div>
            <span className="text-xs font-bold block">مؤشر جودة الـ SEO</span>
            <span className="text-[10px] text-slate-300">
              {seoScore >= 80 ? 'ممتاز ومتوافق تماماً' : 'يحتاج بعض التحسينات'}
            </span>
          </div>
        </div>

        <button
          onClick={handleAiAutoGenerate}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'جاري التوليد...' : 'توليد ذكي تلقائي'}</span>
        </button>
      </div>

      {/* Preview Switcher (Google vs Social Card) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            معاينة النتيجة الحية
          </span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
            <button
              onClick={() => setPreviewMode('google')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                previewMode === 'google' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              بحث Google
            </button>
            <button
              onClick={() => setPreviewMode('social')}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                previewMode === 'social' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              مشاركة التواصل (OG)
            </button>
          </div>
        </div>

        {previewMode === 'google' ? (
          /* Google Search Result Live Preview Card */
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
            <div className="text-xs text-emerald-800 font-mono flex items-center gap-1">
              <span>https://{currentTenant.customDomain || 'almajd-motors.com'}</span>
              <span>&gt; {activePage.slug}</span>
            </div>
            <h4 className="text-sm font-bold text-blue-800 hover:underline cursor-pointer line-clamp-1">
              {meta.title || activePage.name}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {meta.description || 'لم يتم إضافة وصف بعد. أضف وصفاً جذاباً لزيادة نسبة النقر إلى الظهور (CTR).'}
            </p>
          </div>
        ) : (
          /* Social Share Card Preview (WhatsApp, Twitter, LinkedIn) */
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {meta.ogImage ? (
              <div className="h-28 w-full overflow-hidden bg-slate-100">
                <img src={meta.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-24 w-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                لا توجد صورة Open Graph محددة
              </div>
            )}
            <div className="p-3 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                {currentTenant.customDomain || 'almajd-motors.com'}
              </span>
              <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{meta.title || activePage.name}</h5>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {meta.description || 'وصف المشاركة على وسائل التواصل الاجتماعي'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Inputs Form */}
      <div className="space-y-3 pt-1">
        {/* Meta Title */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">عنوان الصفحة (Meta Title)</label>
            <span
              className={`text-[10px] ${
                meta.title && meta.title.length > 60 ? 'text-amber-500 font-bold' : 'text-slate-400'
              }`}
            >
              {meta.title?.length || 0} / 60 حرف
            </span>
          </div>
          <input
            type="text"
            value={meta.title || ''}
            onChange={(e) => updatePageMetadata(activePage.id, { title: e.target.value })}
            placeholder="عنوان الصفحة لمحركات البحث"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-hidden focus:border-blue-500 font-medium"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">الوصف التعريفي (Meta Description)</label>
            <span
              className={`text-[10px] ${
                meta.description && meta.description.length > 160 ? 'text-amber-500 font-bold' : 'text-slate-400'
              }`}
            >
              {meta.description?.length || 0} / 160 حرف
            </span>
          </div>
          <textarea
            rows={3}
            value={meta.description || ''}
            onChange={(e) => updatePageMetadata(activePage.id, { description: e.target.value })}
            placeholder="وصف جذاب ودقيق يظهر في نتائج البحث..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-hidden focus:border-blue-500 resize-none leading-relaxed"
          />
        </div>

        {/* OG Image */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">صورة المشاركة (Open Graph Image)</label>
          <input
            type="text"
            value={meta.ogImage || ''}
            onChange={(e) => updatePageMetadata(activePage.id, { ogImage: e.target.value })}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-[11px] outline-hidden focus:border-blue-500"
          />
        </div>

        {/* JSON-LD Structured Data Schema */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">البيانات المنظمة (JSON-LD Schema)</label>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
              Rich Snippets
            </span>
          </div>
          <textarea
            rows={4}
            value={meta.structuredDataJson || ''}
            onChange={(e) => updatePageMetadata(activePage.id, { structuredDataJson: e.target.value })}
            placeholder='{ "@context": "https://schema.org", "@type": "LocalBusiness" }'
            className="w-full bg-slate-900 text-cyan-300 font-mono text-[11px] p-2.5 rounded-lg border border-slate-800 outline-hidden resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};

