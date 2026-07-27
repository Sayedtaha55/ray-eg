import React, { useState } from 'react';
import { Rocket, Copy, Check, ExternalLink } from 'lucide-react';
import { ApiService } from '@/services/api.service';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
};

const LandingUrlSection: React.FC<Props> = ({ shop }) => {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const [firstProductId, setFirstProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const slug = String(shop?.slug || shop?.name || 'اسم-المتجر').trim();

  React.useEffect(() => {
    setOrigin(window.location.origin);
    const shopId = shop?.id;
    if (!shopId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const products = await ApiService.getProducts(String(shopId), { limit: 1 });
        if (!cancelled && Array.isArray(products) && products.length > 0) {
          setFirstProductId(String((products[0] as any)?.id || '').trim());
        }
      } catch {
        // keep without product
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [shop?.id]);

  const baseUrl = origin || 'https://mnmknk.com';
  const hashBaseUrl = `${baseUrl}/#`;
  const hasProduct = Boolean(firstProductId);
  const landingUrl = hasProduct
    ? `${hashBaseUrl}/shop/${slug}/landing/${firstProductId}`
    : `${hashBaseUrl}/shop/${slug}/landing/رقم-المنتج`;
  const previewUrl = hasProduct
    ? landingUrl
    : `${hashBaseUrl}/business/builder/preview?page=landing`;

  const handleCopy = async () => {
    if (!hasProduct) return;
    try {
      await navigator.clipboard.writeText(landingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
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

            <div className="space-y-2">
              <div
                className="w-full min-w-0 bg-white border border-slate-200 rounded-xl px-3 py-3 text-[11px] font-bold text-slate-700 overflow-x-auto whitespace-nowrap"
                dir="ltr"
                title={landingUrl}
              >
                <span className="text-slate-400">{baseUrl}/#</span>
                <span className="text-slate-700">/shop/{slug}/landing/</span>
                {hasProduct ? (
                  <span className="text-emerald-600 font-black">{firstProductId}</span>
                ) : (
                  <span className="text-rose-500 font-black">رقم-المنتج</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!hasProduct || loading}
                  className={`min-w-0 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] font-black transition-colors ${
                    hasProduct
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="truncate">{copied ? 'تم النسخ' : loading ? 'جاري التحميل...' : 'نسخ الرابط'}</span>
                </button>
                <a
                  href={hasProduct ? previewUrl : undefined}
                  target={hasProduct ? '_blank' : undefined}
                  rel={hasProduct ? 'noreferrer' : undefined}
                  aria-disabled={!hasProduct}
                  className={`min-w-0 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-[11px] font-black transition-colors ${
                    hasProduct
                      ? 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                      : 'bg-white border border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ExternalLink size={14} />
                  <span className="truncate">معاينة صفحة الهبوط</span>
                </a>
              </div>
            </div>

            <p className="text-[10px] font-bold text-slate-400 mt-2">
              {hasProduct ? (
                <>ده رابط صفحة الهبوط الحقيقي لأول منتج عندك. انسخه واعمله إعلان.</>
              ) : (
                <>لازم تضيف منتج أولاً عشان يظهر رابط صفحة الهبوط الحقيقي.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingUrlSection;
