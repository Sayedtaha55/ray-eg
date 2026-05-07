'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Rows3, ArrowDown, ArrowUp, Sparkles } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = { config: any; setConfig: React.Dispatch<React.SetStateAction<any>> };

const ImageShapeSection: React.FC<Props> = ({ config, setConfig }) => {
  const t = useT();
  const aspectRatio = String(config.imageAspectRatio || 'square');
  const imageFitMode = String((config as any).imageFitMode || 'adaptive');
  const rowsConfig = (config.rowsConfig || []) as Array<{
    id: string; imageShape: 'square' | 'portrait' | 'landscape'; displayMode: 'cards' | 'list' | 'minimal'; itemsPerRow: number;
    rowMode?: 'grid' | 'carousel'; layoutDirection?: 'rtl' | 'ltr'; showArrows?: boolean; productNames?: string[];
    scheduleStartAt?: string; scheduleEndAt?: string; sortMode?: 'default' | 'inStockFirst' | 'topSelling'; hideOutOfStock?: boolean;
  }>;

  const applyTemplate = (templateId: 'starter' | 'catalog' | 'featured') => {
    const templates: Record<string, any[]> = {
      starter: [{ id: 'row-1', imageShape: 'square', displayMode: 'cards', itemsPerRow: 10, rowMode: 'carousel', layoutDirection: 'rtl', showArrows: true }, { id: 'row-2', imageShape: 'square', displayMode: 'cards', itemsPerRow: 6, rowMode: 'grid', layoutDirection: 'rtl', showArrows: false }, { id: 'row-3', imageShape: 'portrait', displayMode: 'cards', itemsPerRow: 4, rowMode: 'grid', layoutDirection: 'rtl', showArrows: false }],
      catalog: [{ id: 'row-1', imageShape: 'landscape', displayMode: 'cards', itemsPerRow: 8, rowMode: 'carousel', layoutDirection: 'rtl', showArrows: true }, { id: 'row-2', imageShape: 'square', displayMode: 'list', itemsPerRow: 5, rowMode: 'grid', layoutDirection: 'rtl', showArrows: false }],
      featured: [{ id: 'row-1', imageShape: 'portrait', displayMode: 'cards', itemsPerRow: 4, rowMode: 'carousel', layoutDirection: 'rtl', showArrows: true }, { id: 'row-2', imageShape: 'square', displayMode: 'minimal', itemsPerRow: 6, rowMode: 'grid', layoutDirection: 'rtl', showArrows: false }],
    };
    const selected = templates[templateId] || templates.starter;
    setConfig({ ...config, rowsConfig: selected.map((r, i) => ({ ...r, id: `${templateId}-row-${i + 1}` })) });
  };

  const addRow = () => { setConfig({ ...config, rowsConfig: [...rowsConfig, { id: `row-${rowsConfig.length + 1}`, imageShape: 'square', displayMode: 'cards', itemsPerRow: 4, rowMode: 'carousel', layoutDirection: 'rtl', showArrows: true, productNames: [], sortMode: 'default', hideOutOfStock: false }] }); };
  const updateRow = (index: number, field: string, value: any) => { const newRows = [...rowsConfig]; newRows[index] = { ...newRows[index], [field]: value }; setConfig({ ...config, rowsConfig: newRows }); };
  const removeRow = (index: number) => { setConfig({ ...config, rowsConfig: rowsConfig.filter((_, i) => i !== index) }); };
  const moveRow = (index: number, direction: -1 | 1) => { const next = [...rowsConfig]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; setConfig({ ...config, rowsConfig: next }); };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.imageShape.defaultImageShape', 'شكل الصورة الافتراضي')}</label>
        <div className="grid grid-cols-3 gap-3">
          {[{ key: 'square', emoji: '⬜' }, { key: 'portrait', emoji: '📏' }, { key: 'landscape', emoji: '↔️' }].map(s => (
            <button key={s.key} type="button" onClick={() => setConfig({ ...config, imageAspectRatio: s.key })} className={`p-4 rounded-2xl border transition-all ${aspectRatio === s.key ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className={`${s.key === 'square' ? 'aspect-square' : s.key === 'portrait' ? 'aspect-[2/3]' : 'aspect-[3/2]'} bg-slate-100 rounded-xl mb-2 flex items-center justify-center`}><span className="text-2xl">{s.emoji}</span></div>
              <p className="font-black text-xs text-center">{t(`business.builder.imageShape.${s.key}`, s.key)}</p>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[{ key: 'adaptive' }, { key: 'cover' }, { key: 'contain' }].map(m => (
            <button key={m.key} type="button" onClick={() => setConfig({ ...config, imageFitMode: m.key })} className={`p-2 rounded-xl border text-xs font-black ${imageFitMode === m.key ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}>{t(`business.builder.imageShape.fit${m.key.charAt(0).toUpperCase() + m.key.slice(1)}`, m.key)}</button>
          ))}
        </div>
      </div>
      <div className="h-px bg-slate-100" />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.imageShape.customizeRows', 'تخصيص الصفوف')}</label>
          <button type="button" onClick={addRow} className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-all">{t('business.builder.imageShape.addRow', 'إضافة صف')}</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => applyTemplate('starter')} className="p-2 rounded-xl border border-slate-100 text-xs font-black bg-white">{t('business.builder.imageShape.templateStarter', 'مبتدئ')}</button>
          <button type="button" onClick={() => applyTemplate('catalog')} className="p-2 rounded-xl border border-slate-100 text-xs font-black bg-white">{t('business.builder.imageShape.templateCatalog', 'كتالوج')}</button>
          <button type="button" onClick={() => applyTemplate('featured')} className="p-2 rounded-xl border border-slate-100 text-xs font-black bg-white"><Sparkles size={12} className="inline ml-1" />{t('business.builder.imageShape.templateFeatured', 'مميز')}</button>
        </div>
        {rowsConfig.length === 0 && <p className="text-slate-400 text-xs text-center py-4">{t('business.builder.imageShape.noCustomRows', 'لا توجد صفوف مخصصة')}</p>}
        <div className="space-y-4">
          {rowsConfig.map((row, index) => (
            <div key={row.id} className="p-4 rounded-2xl border border-slate-100 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900">{t('business.builder.imageShape.rowNumber', 'صف {{num}}').replace('{{num}}', String(index + 1))}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveRow(index, -1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-600"><ArrowUp size={12} /></button>
                  <button type="button" onClick={() => moveRow(index, 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-600"><ArrowDown size={12} /></button>
                  <button type="button" onClick={() => removeRow(index)} className="text-red-500 font-black text-xs hover:text-red-600 px-2">{t('business.builder.imageShape.deleteRow', 'حذف')}</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ key: 'square', emoji: '⬜' }, { key: 'portrait', emoji: '📏' }, { key: 'landscape', emoji: '↔️' }].map(s => (
                  <button key={s.key} type="button" onClick={() => updateRow(index, 'imageShape', s.key)} className={`p-2 rounded-xl border text-center ${row.imageShape === s.key ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}>
                    <div className={`${s.key === 'square' ? 'aspect-square' : s.key === 'portrait' ? 'aspect-[2/3]' : 'aspect-[3/2]'} bg-slate-100 rounded-lg mb-1 flex items-center justify-center`}><span className="text-lg">{s.emoji}</span></div>
                    <p className="font-black text-[10px]">{t(`business.builder.imageShape.${s.key}`, s.key)}</p>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.itemsCount', 'عدد العناصر')}</label><select value={row.itemsPerRow} onChange={e => updateRow(index, 'itemsPerRow', Number(e.target.value))} className="w-full p-2 rounded-xl border border-slate-200 font-black text-sm">{[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.displayMode', 'وضع العرض')}</label><select value={row.displayMode} onChange={e => updateRow(index, 'displayMode', e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 font-black text-sm"><option value="cards">{t('business.builder.imageShape.modeCards', 'بطاقات')}</option><option value="list">{t('business.builder.imageShape.modeList', 'قائمة')}</option><option value="minimal">{t('business.builder.imageShape.modeMinimal', 'مبسط')}</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => updateRow(index, 'rowMode', 'carousel')} className={`p-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 ${String(row.rowMode || 'grid') === 'carousel' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}><Rows3 size={14} />{t('business.builder.imageShape.carousel', 'كاروسيل')}</button>
                <button type="button" onClick={() => updateRow(index, 'rowMode', 'grid')} className={`p-2 rounded-xl border text-xs font-black ${String(row.rowMode || 'grid') === 'grid' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}>{t('business.builder.imageShape.grid', 'شبكة')}</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => updateRow(index, 'layoutDirection', 'rtl')} className={`p-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 ${String(row.layoutDirection || 'rtl') === 'rtl' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}><ChevronRight size={14} />{t('business.builder.imageShape.right', 'يمين')}</button>
                <button type="button" onClick={() => updateRow(index, 'layoutDirection', 'ltr')} className={`p-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 ${String(row.layoutDirection || 'rtl') === 'ltr' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}><ChevronLeft size={14} />{t('business.builder.imageShape.left', 'يسار')}</button>
              </div>
              <label className="flex items-center justify-between text-xs font-black text-slate-700">{t('business.builder.imageShape.controlArrows', 'أسهم التحكم')}<input type="checkbox" checked={row.showArrows !== false} onChange={e => updateRow(index, 'showArrows', e.target.checked)} className="w-4 h-4 accent-cyan-500" /></label>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.selectProductsByNames', 'اختر منتجات بالاسم')}</label><input type="text" value={Array.isArray(row.productNames) ? row.productNames.join('، ') : ''} onChange={e => updateRow(index, 'productNames', String(e.target.value || '').split(/[،,]/g).map(x => x.trim()).filter(Boolean))} className="w-full p-2 rounded-xl border border-slate-200 font-bold text-xs" placeholder={t('business.builder.imageShape.productNamesPlaceholder', 'أسماء المنتجات مفصولة بفاصلة')} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.fromTime', 'من')}</label><input type="datetime-local" value={String(row.scheduleStartAt || '')} onChange={e => updateRow(index, 'scheduleStartAt', e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 font-bold text-xs" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.toTime', 'إلى')}</label><input type="datetime-local" value={String(row.scheduleEndAt || '')} onChange={e => updateRow(index, 'scheduleEndAt', e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 font-bold text-xs" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={String(row.sortMode || 'default')} onChange={e => updateRow(index, 'sortMode', e.target.value)} className="w-full p-2 rounded-xl border border-slate-200 font-black text-xs"><option value="default">{t('business.builder.imageShape.sortDefault', 'افتراضي')}</option><option value="inStockFirst">{t('business.builder.imageShape.sortInStockFirst', 'المتوفر أولاً')}</option><option value="topSelling">{t('business.builder.imageShape.sortTopSelling', 'الأكثر مبيعاً')}</option></select>
                <label className="flex items-center justify-between px-2 rounded-xl border border-slate-200 text-xs font-black text-slate-700">{t('business.builder.imageShape.hideOutOfStock', 'إخفاء نفذ')}<input type="checkbox" checked={Boolean(row.hideOutOfStock)} onChange={e => updateRow(index, 'hideOutOfStock', e.target.checked)} className="w-4 h-4 accent-cyan-500" /></label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageShapeSection;
