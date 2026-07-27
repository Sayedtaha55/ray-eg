import React from 'react';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  shop?: any;
};

const LandingFaqSection: React.FC<Props> = ({ config, setConfig }) => {
  const landing = (config?.landingPage || {}) as Record<string, any>;

  const update = (key: string, value: any) => {
    setConfig({ ...config, landingPage: { ...landing, [key]: value } });
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-l from-rose-50 to-amber-50 rounded-2xl border border-rose-100">
        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg">
          <MessageCircle size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-sm text-slate-900">الأسئلة الشائعة</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">إدارة أسئلة وأجوبة العملاء</p>
        </div>
      </div>

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
    </div>
  );
};

export default LandingFaqSection;
