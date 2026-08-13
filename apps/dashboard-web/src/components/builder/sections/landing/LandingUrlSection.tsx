'use client';

import React, { useState } from 'react';
import { Rocket, Copy, Check, ExternalLink } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface LandingUrlSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
  shopSlug?: string;
}

export default function LandingUrlSection({ config, onChange, shopSlug }: LandingUrlSectionProps) {
  const [copied, setCopied] = useState(false);

  const slug = shopSlug || 'اسم-المتجر';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mnmknk.com';
  const hashBaseUrl = `${baseUrl}/#`;
  const landingUrl = `${hashBaseUrl}/shop/${slug}/landing/رقم-المنتج`;
  const previewUrl = `${hashBaseUrl}/business/builder/preview?page=landing`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(landingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg">
          <Rocket size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm text-slate-900">رابط صفحة الهبوط</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">انسخ الرابط لمنتجاتك</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-gradient-to-l from-rose-50 to-amber-50 border border-rose-100">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white shrink-0">
            <Rocket size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 mb-2">رابط صفحة الهبوط لمنتجاتك</p>
            <p className="text-xs font-bold text-slate-500 mb-3 leading-relaxed">
              أي منتج عندك بياخد صفحة هبوط خاصة. خد الرابط ده وانسخه في مواقعك أو إعلاناتك.
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-rose-100">
              <code className="flex-1 text-[11px] font-bold text-slate-700 truncate" dir="ltr">
                {landingUrl}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-rose-600 hover:text-rose-700"
            >
              <ExternalLink size={14} />
              معاينة صفحة الهبوط
            </a>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
        <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
          ملاحظة: الرابط الفعلي لكل منتج هيكون برقم المنتج. مثال: /shop/{slug}/landing/123
        </p>
      </div>
    </div>
  );
}
