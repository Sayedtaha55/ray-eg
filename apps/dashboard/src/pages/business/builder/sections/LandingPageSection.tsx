import React, { useState } from 'react';
import {
  Rocket, Image as ImageIcon, Type, Palette, ToggleLeft, ToggleRight,
  Star, Truck, ShieldCheck, Package, Zap, Flame, Gift, Clock,
  MessageCircle, ChevronDown, Eye, Plus, Trash2, Copy, Check,
  ExternalLink,
} from 'lucide-react';
import { ApiService } from '@/services/api.service';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
};

const FEATURE_ICONS: { icon: any; label: string; key: string }[] = [
  { icon: Zap, label: 'جودة عالية', key: 'quality' },
  { icon: Flame, label: 'الأكثر مبيعاً', key: 'bestseller' },
  { icon: Gift, label: 'عرض خاص', key: 'offer' },
  { icon: Truck, label: 'توصيل سريع', key: 'delivery' },
  { icon: ShieldCheck, label: 'ضمان الجودة', key: 'warranty' },
  { icon: Package, label: 'تغليف آمن', key: 'packaging' },
  { icon: Clock, label: 'توصيل خلال 24 ساعة', key: 'fast24' },
  { icon: Star, label: 'تقييم عالي', key: 'rating' },
];

const TRUST_BADGES: { icon: any; label: string; key: string }[] = [
  { icon: Truck, label: 'توصيل سريع', key: 'truck' },
  { icon: ShieldCheck, label: 'ضمان الجودة', key: 'shield' },
  { icon: Package, label: 'تغليف آمن', key: 'package' },
];

const CTA_STYLES = [
  { id: 'solid', label: 'صلب' },
  { id: 'gradient', label: 'تدرج' },
  { id: 'outline', label: 'حدود' },
];

const LandingPageSection: React.FC<Props> = ({ config, setConfig, shop }) => {
  const landing = (config?.landingPage || {}) as Record<string, any>;
  const [openSection, setOpenSection] = useState<string>('theme');

  const update = (key: string, value: any) => {
    setConfig({ ...config, landingPage: { ...landing, [key]: value } });
  };

  const toggleSection = (id: string) => {
    update('sections', {
      ...(landing.sections || {}),
      [id]: !(landing.sections || {})[id],
    });
  };

  const sections = landing.sections || {
    hero: true,
    features: true,
    description: true,
    gallery: true,
    faq: true,
    reviews: true,
    specs: true,
    cta: true,
    stickyBar: true,
  };

  const selectedFeatures: string[] = landing.selectedFeatures || ['quality', 'bestseller', 'offer'];
  const selectedBadges: string[] = landing.selectedBadges || ['truck', 'shield', 'package'];

  const toggleFeature = (key: string) => {
    const next = selectedFeatures.includes(key)
      ? selectedFeatures.filter((k) => k !== key)
      : [...selectedFeatures, key];
    update('selectedFeatures', next);
  };

  const toggleBadge = (key: string) => {
    const next = selectedBadges.includes(key)
      ? selectedBadges.filter((k) => k !== key)
      : [...selectedBadges, key];
    update('selectedBadges', next);
  };

  const faqItems: { q: string; a: string }[] = landing.faqItems || [
    { q: 'هل التوصيل متاح؟', a: 'نعم، نوصل لجميع المناطق. وقت التوصيل من 1-3 أيام.' },
    { q: 'هل يمكنني الإرجاع؟', a: 'نعم، يمكنك إرجاع المنتج خلال 14 يوم.' },
    { q: 'كيف أتواصل؟', a: 'يمكنك مراسلتنا عبر واتساب.' },
  ];

  const updateFaqItem = (idx: number, field: 'q' | 'a', value: string) => {
    const next = [...faqItems];
    next[idx] = { ...next[idx], [field]: value };
    update('faqItems', next);
  };

  const addFaqItem = () => {
    update('faqItems', [...faqItems, { q: 'سؤال جديد', a: 'الإجابة هنا' }]);
  };

  const removeFaqItem = (idx: number) => {
    update('faqItems', faqItems.filter((_, i) => i !== idx));
  };

  const accordionItems = [
    { id: 'theme', label: 'تصميم صفحة الهبوط', icon: Rocket },
    { id: 'hero', label: 'القسم الرئيسي (Hero)', icon: ImageIcon },
    { id: 'features', label: 'المميزات', icon: Zap },
    { id: 'sections', label: 'الأقسام الظاهرة', icon: ToggleLeft },
    { id: 'faq', label: 'الأسئلة الشائعة', icon: MessageCircle },
    { id: 'style', label: 'الألوان والتصميم', icon: Palette },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg">
          <Rocket size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm text-slate-900">صفحة الهبوط</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">تصميم احترافي للمنتج - زي المواقع الكبيرة</p>
        </div>
      </div>

      {/* Accordion sections */}
      {accordionItems.map((item) => {
        const isOpen = openSection === item.id;
        const Icon = item.icon;
        return (
          <div key={item.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? '' : item.id)}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} className="text-slate-600" />
                <span className="font-black text-sm text-slate-900">{item.label}</span>
              </div>
              <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-4">
                {item.id === 'theme' && (
                  <>
                    <p className="text-xs font-bold text-slate-500 mb-2">اختر تخطيط صفحة الهبوط فقط. هذا الإعداد مستقل عن ثيمات المتجر وألوانه:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => update('landingTheme', 'classic')}
                        className={`p-3 rounded-2xl border-2 text-right transition-all space-y-2 ${String(landing.landingTheme || 'classic') === 'classic' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className="w-full h-16 rounded-xl bg-white border border-slate-200 flex items-center gap-1 p-1.5">
                          <div className="w-1/2 h-full rounded-lg bg-slate-300" />
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 w-4/5 rounded bg-slate-300" />
                            <div className="h-1.5 w-3/5 rounded bg-slate-200" />
                            <div className="h-2.5 w-2/3 rounded bg-slate-400 mt-1.5" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">كلاسيك</p>
                          <p className="text-[10px] font-bold text-slate-500">صورة على الجنب + تفاصيل بجانبها</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => update('landingTheme', 'banner')}
                        className={`p-3 rounded-2xl border-2 text-right transition-all space-y-2 ${String(landing.landingTheme || 'classic') === 'banner' ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <div className="w-full h-16 rounded-xl bg-white border border-slate-200 flex flex-col p-1.5 gap-1">
                          <div className="w-full h-8 rounded-lg bg-slate-300" />
                          <div className="flex-1 flex flex-col items-center justify-center gap-1">
                            <div className="h-1.5 w-3/5 rounded bg-slate-300" />
                            <div className="h-2.5 w-2/5 rounded bg-slate-400" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">بانر كامل</p>
                          <p className="text-[10px] font-bold text-slate-500">صورة بعرض الصفحة بالكامل زي بانر</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}

                {item.id === 'hero' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">عنوان CTA الرئيسي</label>
                      <input
                        type="text"
                        value={String(landing.ctaText || 'أضف للسلة')}
                        onChange={(e) => update('ctaText', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-right"
                        placeholder="أضف للسلة"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">نص زر الاحتياطي</label>
                      <input
                        type="text"
                        value={String(landing.reserveText || 'احجز الآن')}
                        onChange={(e) => update('reserveText', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-right"
                        placeholder="احجز الآن"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">نص CTA النهائي</label>
                      <input
                        type="text"
                        value={String(landing.finalCtaText || 'احصل عليه الآن')}
                        onChange={(e) => update('finalCtaText', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-right"
                        placeholder="احصل عليه الآن"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">شكل زر CTA</label>
                      <div className="grid grid-cols-3 gap-2">
                        {CTA_STYLES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => update('ctaStyle', s.id)}
                            className={`px-3 py-2 rounded-xl border-2 text-xs font-black transition-all ${String(landing.ctaStyle || 'solid') === s.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                      <span className="text-xs font-black text-slate-700">إظهار عداد الكمية</span>
                      {landing.showQuantity !== false ? (
                        <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showQuantity', false)} />
                      ) : (
                        <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showQuantity', true)} />
                      )}
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                      <span className="text-xs font-black text-slate-700">إظهار شارة الخصم</span>
                      {landing.showDiscountBadge !== false ? (
                        <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showDiscountBadge', false)} />
                      ) : (
                        <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showDiscountBadge', true)} />
                      )}
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                      <span className="text-xs font-black text-slate-700">إظهار النجوم (تقييم)</span>
                      {landing.showRating !== false ? (
                        <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showRating', false)} />
                      ) : (
                        <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showRating', true)} />
                      )}
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                      <span className="text-xs font-black text-slate-700">إظهار زر المفضلة</span>
                      {landing.showFavorite !== false ? (
                        <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showFavorite', false)} />
                      ) : (
                        <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showFavorite', true)} />
                      )}
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                      <span className="text-xs font-black text-slate-700">إظهار زر المشاركة</span>
                      {landing.showShare !== false ? (
                        <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showShare', false)} />
                      ) : (
                        <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showShare', true)} />
                      )}
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                      <span className="text-xs font-black text-slate-700">إظهار زر واتساب</span>
                      {landing.showWhatsapp !== false ? (
                        <ToggleRight size={24} className="text-emerald-500" onClick={() => update('showWhatsapp', false)} />
                      ) : (
                        <ToggleLeft size={24} className="text-slate-300" onClick={() => update('showWhatsapp', true)} />
                      )}
                    </label>
                  </>
                )}

                {item.id === 'features' && (
                  <>
                    <p className="text-xs font-bold text-slate-500 mb-2">اختر المميزات اللي تظهر في صفحة الهبوط:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {FEATURE_ICONS.map((f) => {
                        const isSelected = selectedFeatures.includes(f.key);
                        const Icon = f.icon;
                        return (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => toggleFeature(f.key)}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 text-right transition-all ${isSelected ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-slate-200'}`}
                          >
                            <Icon size={18} className={isSelected ? 'text-rose-500' : 'text-slate-400'} />
                            <span className={`text-xs font-black ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{f.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="h-px bg-slate-100 my-3" />
                    <p className="text-xs font-bold text-slate-500 mb-2">اختر شارات الثقة (تحت الزر):</p>
                    <div className="grid grid-cols-3 gap-2">
                      {TRUST_BADGES.map((b) => {
                        const isSelected = selectedBadges.includes(b.key);
                        const Icon = b.icon;
                        return (
                          <button
                            key={b.key}
                            type="button"
                            onClick={() => toggleBadge(b.key)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                          >
                            <Icon size={18} className={isSelected ? 'text-emerald-500' : 'text-slate-400'} />
                            <span className={`text-[10px] font-black ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{b.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {item.id === 'sections' && (
                  <div className="space-y-2">
                    {[
                      { id: 'hero', label: 'القسم الرئيسي (صورة + سعر + زر)' },
                      { id: 'features', label: 'قسم المميزات (3 كروت)' },
                      { id: 'description', label: 'وصف المنتج الكامل' },
                      { id: 'gallery', label: 'معرض الصور' },
                      { id: 'specs', label: 'المواصفات التقنية' },
                      { id: 'reviews', label: 'آراء العملاء' },
                      { id: 'faq', label: 'الأسئلة الشائعة' },
                      { id: 'cta', label: 'CTA النهائي (الأسفل)' },
                      { id: 'stickyBar', label: 'الشريط الثابت (موبايل)' },
                    ].map((s) => (
                      <label key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 cursor-pointer">
                        <span className="text-xs font-black text-slate-700">{s.label}</span>
                        {sections[s.id] !== false ? (
                          <ToggleRight size={24} className="text-emerald-500" onClick={() => toggleSection(s.id)} />
                        ) : (
                          <ToggleLeft size={24} className="text-slate-300" onClick={() => toggleSection(s.id)} />
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {item.id === 'faq' && (
                  <div className="space-y-3">
                    {faqItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.q}
                            onChange={(e) => updateFaqItem(idx, 'q', e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-black text-right"
                            placeholder="السؤال"
                          />
                          <button
                            type="button"
                            onClick={() => removeFaqItem(idx)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea
                          value={item.a}
                          onChange={(e) => updateFaqItem(idx, 'a', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-right resize-none"
                          rows={2}
                          placeholder="الإجابة"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFaqItem}
                      className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-xs font-black text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> إضافة سؤال جديد
                    </button>
                  </div>
                )}

                {item.id === 'style' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون CTA</label>
                        <input
                          type="color"
                          value={String(landing.ctaColor || '#00E5FF')}
                          onChange={(e) => update('ctaColor', e.target.value)}
                          className="w-full h-10 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون النص</label>
                        <input
                          type="color"
                          value={String(landing.ctaTextColor || '#FFFFFF')}
                          onChange={(e) => update('ctaTextColor', e.target.value)}
                          className="w-full h-10 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون خلفية القسم النهائي</label>
                      <input
                        type="color"
                        value={String(landing.finalCtaBg || '#0F172A')}
                        onChange={(e) => update('finalCtaBg', e.target.value)}
                        className="w-full h-10 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">شكل الصورة</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'rounded', label: 'دائري' },
                          { id: 'sharp', label: 'حاد' },
                          { id: 'circle', label: 'بيضاوي' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => update('imageShape', s.id)}
                            className={`px-3 py-2 rounded-xl border-2 text-xs font-black transition-all ${String(landing.imageShape || 'rounded') === s.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Landing page URL */}
      <LandingPageUrlBox shop={shop} />
    </div>
  );
};

const LandingPageUrlBox: React.FC<{ shop?: any }> = ({ shop }) => {
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
  );
};

export default LandingPageSection;
