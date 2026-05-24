import React from 'react';

const HomeExperienceSection: React.FC<{ config: any; setConfig: (next: any) => void }> = ({ config, setConfig }) => {
  const mode = String(config.homeLayoutMode || 'banner_ads_story');
  const setVal = (key: string, value: any) => setConfig({ ...config, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">نوع الصفحة الرئيسية</label>
        <div className="mt-2 grid grid-cols-1 gap-2">
          <button type="button" onClick={() => setVal('homeLayoutMode', 'banner_products')} className={`p-3 rounded-xl border text-right font-black text-xs ${mode === 'banner_products' ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-white'}`}>بانر + منتجات مباشرة</button>
          <button type="button" onClick={() => setVal('homeLayoutMode', 'banner_ads_story')} className={`p-3 rounded-xl border text-right font-black text-xs ${mode === 'banner_ads_story' ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-white'}`}>بانر + إعلانات + تعريفات + فوتر</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">نص تعريف المكان</label>
          <textarea value={String(config.homeIntroText || '')} onChange={(e) => setVal('homeIntroText', e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold min-h-[96px]" placeholder="اكتب تعريف النشاط" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">ملاحظات إضافية</label>
          <textarea value={String(config.homeStoryText || '')} onChange={(e) => setVal('homeStoryText', e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold min-h-[96px]" placeholder="رسالة جانبية أو قصة العلامة" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">عنوان إعلان يمين</label>
          <input value={String(config.homeRightAdTitle || '')} onChange={(e) => setVal('homeRightAdTitle', e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold" placeholder="مثال: خصم 20%" />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">عنوان إعلان يسار</label>
          <input value={String(config.homeLeftAdTitle || '')} onChange={(e) => setVal('homeLeftAdTitle', e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold" placeholder="مثال: شحن مجاني" />
        </div>
      </div>
    </div>
  );
};

export default HomeExperienceSection;
