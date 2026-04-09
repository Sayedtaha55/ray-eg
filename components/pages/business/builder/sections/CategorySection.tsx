import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const CategorySection: React.FC<Props> = ({ config, setConfig }) => (
  <div className="space-y-6">
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">شكل الأيقونة</label>
        <select
          value={String(config.categoryIconShape || 'circular')}
          onChange={(e) => setConfig({ ...config, categoryIconShape: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-black text-sm"
        >
          <option value="circular">دائري</option>
          <option value="square">مربع</option>
          <option value="large">كبير</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">حجم الأيقونة</label>
        <select
          value={String(config.categoryIconSize || 'medium')}
          onChange={(e) => setConfig({ ...config, categoryIconSize: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-black text-sm"
        >
          <option value="small">صغير</option>
          <option value="medium">متوسط</option>
          <option value="large">كبير</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-black text-sm">عرض المنتجات داخل الفئات فقط</span>
        <input
          type="checkbox"
          checked={Boolean(config.showProductsInCategories)}
          onChange={(e) => setConfig({ ...config, showProductsInCategories: e.target.checked })}
        />
      </div>
    </div>

    <div className="h-px bg-slate-100" />

    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">صورة الأيقونة (URL)</label>
        <input
          type="text"
          value={String(config.categoryIconImage || '')}
          onChange={(e) => setConfig({ ...config, categoryIconImage: e.target.value })}
          placeholder="https://example.com/image.png"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-black text-sm"
        />
      </div>
      <p className="text-[10px] text-slate-400 text-right">
        اتركها فارغة لاستخدام الأيقونة الافتراضية
      </p>
    </div>
  </div>
);

export default CategorySection;
