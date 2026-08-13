'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, ArrowLeft, Check, Info, Sparkles, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';

export default function ImportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const { shop } = useShop();

  const handleImport = async () => {
    if (!url || !name) return;
    
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      
      // TODO: Replace with actual API call
      // const website = await apiRequest(`/websites/import/shop/${sid}`, {
      //   method: 'POST',
      //   body: JSON.stringify({ url, name })
      // });
      // router.push(`/dashboard/website/edit/${website.id}`);
      
      // Fallback
      router.push('/dashboard/commercial/builder');
    } catch {
      router.push('/dashboard/commercial/builder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all mb-6"
      >
        <ArrowLeft size={16} />
        العودة
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Globe size={24} className="text-[#00E5FF]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">ربط موقع موجود</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">اربط موقعك الحالي بالمنصة</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-6 max-w-2xl">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-slate-600">
            أدخل رابط موقعك الحالي وسيتم استيراد المحتوى والإعدادات تلقائياً
          </p>
        </div>

        <div>
          <label className="text-sm font-black mb-2 block text-slate-900">رابط الموقع</label>
          <div className="relative">
            <ExternalLink size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              dir="ltr"
              className="w-full pr-12 pl-4 py-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-200 focus:border-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-black mb-2 block text-slate-900">اسم الموقع</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="موقعي"
            className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-200 focus:border-slate-400 focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black text-slate-900">ما الذي سيتم استيراده؟</h3>
          {['الصفحات والمحتوى', 'الصور والوسائط', 'إعدادات SEO', 'القائمة والروابط'].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <Check size={16} className="text-green-600" />
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={handleImport}
          disabled={loading || !url || !name}
          className="w-full py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'جاري الاستيراد...' : 'استيراد الموقع'}
        </button>
      </div>
    </div>
  );
}