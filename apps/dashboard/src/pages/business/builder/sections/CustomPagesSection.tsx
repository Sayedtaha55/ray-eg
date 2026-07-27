import React from 'react';
import { FileText, Plus, Trash2, Layout, Home, Check } from 'lucide-react';
import { isShopBookingActivity } from '../../bookings/config';

interface CustomPage {
  id: string;
  title: string;
  content: string;
  showStandalone?: boolean;
  showInHeader?: boolean;
  showInHome?: boolean;
  showInFooter?: boolean;
}

const PRESET_PAGES: { id: string; title: string; content: string }[] = [
  {
    id: 'about-us',
    title: 'من نحن',
    content:
      'نحن مركز طبي متخصص نقدم خدمات رعاية صحية متميزة بفريق من الأطباء والاستشاريين ذوي الخبرة. هدفنا تقديم تجربة علاجية آمنة ومريحة لكل مريض.',
  },
  {
    id: 'privacy-policy',
    title: 'سياسة الخصوصية',
    content:
      'نحن نحترم خصوصيتك. يتم استخدام بياناتك الشخصية فقط لتحسين تجربة الحجز والتواصل، ولن نشاركها مع أي طرف ثالث دون إذنك.',
  },
  {
    id: 'terms',
    title: 'شروط الاستخدام',
    content:
      'يُرجى الالتزام بمواعيد الحجز. إذا كنت بحاجة لإلغاء أو إعادة جدولة موعدك، يُفضل إبلاغنا قبل الموعد بمدة كافية.',
  },
  {
    id: 'contact',
    title: 'تواصل معنا',
    content:
      'يمكنك التواصل معنا عبر الهاتف أو واتساب خلال ساعات العمل. فريقنا جاهز للإجابة على استفساراتك ومساعدتك في حجز موعدك.',
  },
  {
    id: 'faq',
    title: 'الأسئلة الشائعة',
    content:
      'كيف أحجز موعد؟ يمكنك الحجز مباشرة من الصفحة الرئيسية.\nهل يمكنني إلغاء الموعد؟ نعم، يمكنك الإلغاء أو إعادة الجدولة من خلال التواصل معنا.',
  },
  {
    id: 'complaints',
    title: 'شكاوي',
    content:
      'نحن نسعى دائماً لتقديم أفضل خدمة لعملائنا. إذا كان لديك أي شكوى أو ملاحظة، يرجى تعبئة النموذج أدناه أو التواصل معنا مباشرة وسنقوم بالرد عليك في أقرب وقت ممكن.',
  },
  {
    id: 'customer-service',
    title: 'خدمة العملاء',
    content:
      'فريق خدمة العملاء لدينا متاح لمساعدتك في أي وقت. يمكنك التواصل معنا عبر الهاتف أو واتساب أو البريد الإلكتروني. ساعات العمل: من 9 صباحاً حتى 9 مساءً يومياً.',
  },
];

const CustomPagesSection: React.FC<{ config: any; setConfig: (next: any) => void; shop?: any }> = ({
  config,
  setConfig,
  shop,
}) => {
  const pages: CustomPage[] = Array.isArray(config.customPages) ? config.customPages : [];

  const isClinic = isShopBookingActivity(shop);

  const updatePages = (next: CustomPage[]) => setConfig({ ...config, customPages: next });

  const addPreset = (preset: { id: string; title: string; content: string }) => {
    if (pages.some((p) => p.id === preset.id)) return;
    const next: CustomPage[] = [
      ...pages,
      {
        ...preset,
        showStandalone: true,
        showInHeader: preset.id === 'about-us' || preset.id === 'contact',
        showInHome: preset.id === 'about-us',
        showInFooter: preset.id === 'complaints' || preset.id === 'customer-service' || preset.id === 'privacy-policy' || preset.id === 'terms' || preset.id === 'faq',
      },
    ];
    updatePages(next);
  };

  const removePage = (idx: number) => {
    const next = pages.filter((_, i) => i !== idx);
    updatePages(next);
  };

  const updatePage = (idx: number, key: keyof CustomPage, value: any) => {
    const next = pages.map((p, i) => (i === idx ? { ...p, [key]: value } : p));
    updatePages(next);
  };

  const toggle = (idx: number, key: keyof CustomPage) => {
    updatePage(idx, key, !pages[idx][key]);
  };

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <p className="text-xs font-bold text-slate-500 leading-relaxed">
        أنشئ صفحات مخصصة (من نحن، سياسة الخصوصية، تواصل معنا...) وتحكم في ظهورها: صفحة مستقلة، رابط في
        الهيدر، أو قسم في الصفحة الرئيسية.
      </p>

      {/* Presets */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">صفحات جاهزة للحجوزات</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PRESET_PAGES.map((preset) => {
            const added = pages.some((p) => p.id === preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                disabled={added}
                onClick={() => addPreset(preset)}
                className={`flex items-center justify-between gap-2 p-3 rounded-xl border text-right transition-all ${
                  added
                    ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-cyan-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className={added ? 'text-slate-400' : 'text-cyan-500'} />
                  <span className="text-xs font-black">{preset.title}</span>
                </div>
                {added ? <Check size={14} /> : <Plus size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pages list */}
      {pages.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الصفحات المضافة</h3>
          {pages.map((p, idx) => (
            <div
              key={p.id || idx}
              className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <input
                  value={String(p.title || '')}
                  onChange={(e) => updatePage(idx, 'title', e.target.value)}
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                />
                <button
                  type="button"
                  onClick={() => removePage(idx)}
                  className="p-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  title="حذف الصفحة"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <textarea
                value={String(p.content || '')}
                onChange={(e) => updatePage(idx, 'content', e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 min-h-[100px] text-xs font-bold bg-white resize-y"
                placeholder="اكتب محتوى الصفحة..."
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggle(idx, 'showStandalone')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                    p.showStandalone
                      ? 'bg-violet-50 border-violet-200 text-violet-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <FileText size={12} />
                  صفحة مستقلة
                </button>
                <button
                  type="button"
                  onClick={() => toggle(idx, 'showInHeader')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                    p.showInHeader
                      ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Layout size={12} />
                  رابط في الهيدر
                </button>
                <button
                  type="button"
                  onClick={() => toggle(idx, 'showInFooter')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                    p.showInFooter
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Layout size={12} />
                  رابط في الفوتر
                </button>
                <button
                  type="button"
                  onClick={() => toggle(idx, 'showInHome')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all border ${
                    p.showInHome
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Home size={12} />
                  قسم في الرئيسية
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isClinic && pages.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold leading-relaxed">
          ابدأ بإضافة صفحة <strong>من نحن</strong> و<strong>تواصل معنا</strong> — هما الأكثر أهمية لصفحات الحجوزات.
        </div>
      )}
    </div>
  );
};

export default CustomPagesSection;
