import React, { useState } from 'react';
import {
  X,
  CloudUpload,
  CheckCircle2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Zap,
  FileCode2,
  Globe,
  RefreshCw,
  Copy,
  Check,
  Server,
  Layers,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';

export const PublishModal: React.FC = () => {
  const {
    isPublishModalOpen,
    setIsPublishModalOpen,
    currentTenant,
    website,
    publishingStatus,
    runPublishPipeline,
    liveWebsiteUrl,
    builderShopName,
  } = useBuilder();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'nextjs_export' | 'seo_sitemap'>('pipeline');
  const [copied, setCopied] = useState(false);

  if (!isPublishModalOpen) return null;

  const sampleNextJsCode = `// app/page.tsx - Generated Next.js 15 App Router Server Component
import { Metadata } from 'next';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import BentoFeatures from '@/components/BentoFeatures';
import ProductsGrid from '@/components/ProductsGrid';
import Testimonials from '@/components/Testimonials';
import CtaBanner from '@/components/CtaBanner';
import Footer from '@/components/Footer';

export const revalidate = 3600; // Incremental Static Regeneration (ISR)

export const metadata: Metadata = {
  title: '${website.pages[0]?.metadata.title || website.name}',
  description: '${website.pages[0]?.metadata.description || ''}',
  openGraph: {
    title: '${website.pages[0]?.metadata.ogTitle || website.name}',
    description: '${website.pages[0]?.metadata.ogDescription || ''}',
    url: 'https://${currentTenant.customDomain || 'almajd-motors.com'}',
    siteName: '${currentTenant.businessInfo.brandName}',
    images: [{ url: '${website.pages[0]?.metadata.ogImage || ''}', width: 1200, height: 630 }],
    locale: 'ar_SA',
    type: 'website',
  },
  alternates: {
    canonical: 'https://${currentTenant.customDomain || 'almajd-motors.com'}',
  },
};

export default async function HomePage() {
  // Server-rendered with pure semantic HTML & zero unnecessary client-side JavaScript
  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col antialiased">
      <Header />
      <Hero />
      <BentoFeatures />
      <ProductsGrid />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </main>
  );
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleNextJsCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">نشر الموقع إلى بيئة الإنتاج السحابية</h2>
              <p className="text-xs text-slate-500">
                المتجر: <span className="font-semibold text-slate-700">{builderShopName || currentTenant.name}</span> | النطاق:{' '}
                <span className="font-mono text-blue-600">{currentTenant.customDomain}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPublishModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/30 gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pipeline' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>مسار النشر السحابي (Publish Pipeline)</span>
          </button>
          <button
            onClick={() => setActiveTab('nextjs_export')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'nextjs_export' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>كود Next.js App Router المولد</span>
          </button>
          <button
            onClick={() => setActiveTab('seo_sitemap')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'seo_sitemap' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>ملفات Sitemap وSEO الإنتاج</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              {/* Pipeline Status Box */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">حالة خط النشر الآلي</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      publishingStatus.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : publishingStatus.status === 'idle'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-blue-100 text-blue-800 animate-pulse'
                    }`}
                  >
                    {publishingStatus.status === 'published'
                      ? 'تم النشر بنجاح على الإنتاج'
                      : publishingStatus.status === 'idle'
                      ? 'بانتظار بدء النشر'
                      : 'جاري المعالجة والبناء...'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(publishingStatus.currentStep / publishingStatus.totalSteps) * 100}%` }}
                  />
                </div>

                <p className="text-xs font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
                  {publishingStatus.status !== 'published' && publishingStatus.status !== 'idle' && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                  )}
                  {publishingStatus.status === 'published' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                  <span>{publishingStatus.stepMessage}</span>
                </p>
              </div>

              {/* Published Success Card */}
              {publishingStatus.status === 'published' && (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>الموقع متاح الآن عالمياً على شبكة الـCDN</span>
                    </div>
                    <a
                      href={publishingStatus.liveUrl || liveWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 hover:bg-emerald-100 transition-colors"
                    >
                      <span>فتح الموقع المباشر</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Core Web Vitals & Build Stats */}
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 text-center">
                      <span className="text-[10px] text-slate-500 block">Lighthouse Vitals</span>
                      <span className="text-lg font-bold text-emerald-600">98 / 100</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 text-center">
                      <span className="text-[10px] text-slate-500 block">حجم JS الأولي</span>
                      <span className="text-lg font-bold text-slate-900">28.4 KB</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 text-center">
                      <span className="text-[10px] text-slate-500 block">الصفحات المنشورة</span>
                      <span className="text-lg font-bold text-slate-900">{website.pages.length} صفحات</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 text-center">
                      <span className="text-[10px] text-slate-500 block">استراتيجية الريندر</span>
                      <span className="text-xs font-bold text-blue-600">Next.js ISR (1h)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  سيتم تحديث كاش الخوادم السحابية وإرسال طلبات الـRevalidation تلقائياً.
                </div>
                <button
                  id="execute_publish_btn"
                  onClick={runPublishPipeline}
                  disabled={publishingStatus.status !== 'idle' && publishingStatus.status !== 'published'}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      publishingStatus.status !== 'idle' && publishingStatus.status !== 'published' ? 'animate-spin' : ''
                    }`}
                  />
                  <span>
                    {publishingStatus.status === 'published' ? 'إعادة النشر وتحديث الكاش' : 'بدء النشر الفوري'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'nextjs_export' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Next.js App Router (React Server Component)</span>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md font-medium transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 max-h-[360px]">
                {sampleNextJsCode}
              </pre>
            </div>
          )}

          {activeTab === 'seo_sitemap' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Sitemap.xml يتم إنشاؤه تلقائياً:</span>
                <code className="block bg-white p-3 rounded border border-slate-200 font-mono text-[11px] text-slate-700">
                  {`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${currentTenant.customDomain || 'almajd-motors.com'}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://${currentTenant.customDomain || 'almajd-motors.com'}/fleet</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`}
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
