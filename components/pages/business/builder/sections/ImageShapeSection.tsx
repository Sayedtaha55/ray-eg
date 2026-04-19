import React from 'react';
import { ChevronLeft, ChevronRight, Rows3, ArrowDown, ArrowUp, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const ImageShapeSection: React.FC<Props> = ({ config, setConfig }) => {
  const { t } = useTranslation();
  const aspectRatio = String(config.imageAspectRatio || 'square');
  const imageFitMode = String((config as any).imageFitMode || 'adaptive');
  const rowsConfig = (config.rowsConfig || []) as Array<{
    id: string;
    imageShape: 'square' | 'portrait' | 'landscape';
    displayMode: 'cards' | 'list' | 'minimal';
    itemsPerRow: number;
    rowMode?: 'grid' | 'carousel';
    layoutDirection?: 'rtl' | 'ltr';
    showArrows?: boolean;
    productNames?: string[];
    scheduleStartAt?: string;
    scheduleEndAt?: string;
    sortMode?: 'default' | 'inStockFirst' | 'topSelling';
    hideOutOfStock?: boolean;
  }>;

  const applyTemplate = (templateId: 'starter' | 'catalog' | 'featured') => {
    const templates: Record<string, any[]> = {
      starter: [
        { id: 'row-1', imageShape: 'square', displayMode: 'cards', itemsPerRow: 10, rowMode: 'carousel', layoutDirection: 'rtl', showArrows: true },
        { id: 'row-2', imageShape: 'square', displayMode: 'cards', itemsPerRow: 6, rowMode: 'grid', layoutDirection: 'rtl', showArrows: false },
        { id: 'row-3', imageShape: 'portrait', displayMode: 'cards', itemsPerRow: 4, rowMode: 'grid', layoutDirection: 'rtl', showArrows: false },
      ],
      catalog: [
        { id: 'row-1', imageShape: 'landscape', displayMode: 'cards', itemsPerRow: 8, rowMode: 'carousel', layoutDirection: 'rtl', showArrows: true },
        { id: 'row-2', imageShape: 'square', displayMode: 'list', itemsPerRow: 5, rowMode: 'grid', layoutDirection: 'rtl', showArrows: false },
      ],
      featured: [
        { id: 'row-1', imageShape: 'portrait', displayMode: 'cards', itemsPerRow: 4, rowMode: 'carousel', layoutDirection: 'rtl', showArrows: true },
        { id: 'row-2', imageShape: 'square', displayMode: 'minimal', itemsPerRow: 6, rowMode: 'grid', layoutDirection: 'rtl', showArrows: false },
      ],
    };
    const selected = templates[templateId] || templates.starter;
    setConfig({ ...config, rowsConfig: selected.map((r, i) => ({ ...r, id: `${templateId}-row-${i + 1}` })) });
  };

  const addRow = () => {
    const newRows = [
      ...rowsConfig,
      {
        id: `row-${rowsConfig.length + 1}`,
        imageShape: 'square',
        displayMode: 'cards',
        itemsPerRow: 4,
        rowMode: 'carousel',
        layoutDirection: 'rtl',
        showArrows: true,
        productNames: [],
        sortMode: 'default',
        hideOutOfStock: false,
      },
    ];
    setConfig({ ...config, rowsConfig: newRows });
  };

  const updateRow = (index: number, field: string, value: any) => {
    const newRows = [...rowsConfig];
    newRows[index] = { ...newRows[index], [field]: value };
    setConfig({ ...config, rowsConfig: newRows });
  };

  const removeRow = (index: number) => {
    const newRows = rowsConfig.filter((_, i) => i !== index);
    setConfig({ ...config, rowsConfig: newRows });
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    const next = [...rowsConfig];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setConfig({ ...config, rowsConfig: next });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.imageShape.defaultImageShape')}</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setConfig({ ...config, imageAspectRatio: 'square' })}
            className={`p-4 rounded-2xl border transition-all ${aspectRatio === 'square' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <div className="aspect-square bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
              <span className="text-2xl">⬜</span>
            </div>
            <p className="font-black text-xs text-center">{t('business.builder.imageShape.square')}</p>
          </button>
          <button
            type="button"
            onClick={() => setConfig({ ...config, imageAspectRatio: 'portrait' })}
            className={`p-4 rounded-2xl border transition-all ${aspectRatio === 'portrait' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <div className="aspect-[2/3] bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
              <span className="text-2xl">📏</span>
            </div>
            <p className="font-black text-xs text-center">{t('business.builder.imageShape.portrait')}</p>
          </button>
          <button
            type="button"
            onClick={() => setConfig({ ...config, imageAspectRatio: 'landscape' })}
            className={`p-4 rounded-2xl border transition-all ${aspectRatio === 'landscape' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
          >
            <div className="aspect-[3/2] bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
              <span className="text-2xl">↔️</span>
            </div>
            <p className="font-black text-xs text-center">{t('business.builder.imageShape.landscape')}</p>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2">
          {[
            { key: 'adaptive', label: t('business.builder.imageShape.fitAdaptive') },
            { key: 'cover', label: t('business.builder.imageShape.fitCover') },
            { key: 'contain', label: t('business.builder.imageShape.fitContain') },
          ].map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setConfig({ ...config, imageFitMode: m.key })}
              className={`p-2 rounded-xl border text-xs font-black ${imageFitMode === m.key ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">{t('business.builder.imageShape.customizeRows')}</label>
          <button
            type="button"
            onClick={addRow}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-black text-xs hover:bg-slate-800 transition-all"
          >
            {t('business.builder.imageShape.addRow')}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => applyTemplate('starter')} className="p-2 rounded-xl border border-slate-100 text-xs font-black bg-white">
            {t('business.builder.imageShape.templateStarter')}
          </button>
          <button type="button" onClick={() => applyTemplate('catalog')} className="p-2 rounded-xl border border-slate-100 text-xs font-black bg-white">
            {t('business.builder.imageShape.templateCatalog')}
          </button>
          <button type="button" onClick={() => applyTemplate('featured')} className="p-2 rounded-xl border border-slate-100 text-xs font-black bg-white">
            <Sparkles size={12} className="inline ml-1" />
            {t('business.builder.imageShape.templateFeatured')}
          </button>
        </div>

        {rowsConfig.length === 0 && (
          <p className="text-slate-400 text-xs text-center py-4">{t('business.builder.imageShape.noCustomRows')}</p>
        )}

        <div className="space-y-4">
          {rowsConfig.map((row, index) => (
            <div key={row.id} className="p-4 rounded-2xl border border-slate-100 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-slate-900">{t('business.builder.imageShape.rowNumber', { num: index + 1 })}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveRow(index, -1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-600"><ArrowUp size={12} /></button>
                  <button type="button" onClick={() => moveRow(index, 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-600"><ArrowDown size={12} /></button>
                  <button type="button" onClick={() => removeRow(index)} className="text-red-500 font-black text-xs hover:text-red-600 px-2">{t('business.builder.imageShape.deleteRow')}</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => updateRow(index, 'imageShape', 'square')} className={`p-2 rounded-xl border text-center ${row.imageShape === 'square' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}>
                  <div className="aspect-square bg-slate-100 rounded-lg mb-1 flex items-center justify-center"><span className="text-lg">⬜</span></div>
                  <p className="font-black text-[10px]">{t('business.builder.imageShape.square')}</p>
                </button>
                <button type="button" onClick={() => updateRow(index, 'imageShape', 'portrait')} className={`p-2 rounded-xl border text-center ${row.imageShape === 'portrait' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}>
                  <div className="aspect-[2/3] bg-slate-100 rounded-lg mb-1 flex items-center justify-center"><span className="text-lg">📏</span></div>
                  <p className="font-black text-[10px]">{t('business.builder.imageShape.portrait')}</p>
                </button>
                <button type="button" onClick={() => updateRow(index, 'imageShape', 'landscape')} className={`p-2 rounded-xl border text-center ${row.imageShape === 'landscape' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}>
                  <div className="aspect-[3/2] bg-slate-100 rounded-lg mb-1 flex items-center justify-center"><span className="text-lg">↔️</span></div>
                  <p className="font-black text-[10px]">{t('business.builder.imageShape.landscape')}</p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.itemsCount')}</label>
                  <select
                    value={row.itemsPerRow}
                    onChange={(e) => updateRow(index, 'itemsPerRow', Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 font-black text-sm"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.displayMode')}</label>
                  <select
                    value={row.displayMode}
                    onChange={(e) => updateRow(index, 'displayMode', e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-black text-sm"
                  >
                    <option value="cards">{t('business.builder.imageShape.modeCards')}</option>
                    <option value="list">{t('business.builder.imageShape.modeList')}</option>
                    <option value="minimal">{t('business.builder.imageShape.modeMinimal')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateRow(index, 'rowMode', 'carousel')}
                  className={`p-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 ${String(row.rowMode || 'grid') === 'carousel' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}
                >
                  <Rows3 size={14} /> {t('business.builder.imageShape.carousel')}
                </button>
                <button
                  type="button"
                  onClick={() => updateRow(index, 'rowMode', 'grid')}
                  className={`p-2 rounded-xl border text-xs font-black ${String(row.rowMode || 'grid') === 'grid' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}
                >
                  {t('business.builder.imageShape.grid')}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateRow(index, 'layoutDirection', 'rtl')}
                  className={`p-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 ${String(row.layoutDirection || 'rtl') === 'rtl' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}
                >
                  <ChevronRight size={14} /> {t('business.builder.imageShape.right')}
                </button>
                <button
                  type="button"
                  onClick={() => updateRow(index, 'layoutDirection', 'ltr')}
                  className={`p-2 rounded-xl border text-xs font-black flex items-center justify-center gap-1 ${String(row.layoutDirection || 'rtl') === 'ltr' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'}`}
                >
                  <ChevronLeft size={14} /> {t('business.builder.imageShape.left')}
                </button>
              </div>

              <label className="flex items-center justify-between text-xs font-black text-slate-700">
                {t('business.builder.imageShape.controlArrows')}
                <input
                  type="checkbox"
                  checked={row.showArrows !== false}
                  onChange={(e) => updateRow(index, 'showArrows', e.target.checked)}
                  className="w-4 h-4 accent-cyan-500"
                />
              </label>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.selectProductsByNames')}</label>
                <input
                  type="text"
                  value={Array.isArray(row.productNames) ? row.productNames.join('، ') : ''}
                  onChange={(e) => {
                    const names = String(e.target.value || '')
                      .split(/[،,]/g)
                      .map((x) => x.trim())
                      .filter(Boolean);
                    updateRow(index, 'productNames', names);
                  }}
                  className="w-full p-2 rounded-xl border border-slate-200 font-bold text-xs"
                  placeholder={t('business.builder.imageShape.productNamesPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.fromTime')}</label>
                  <input
                    type="datetime-local"
                    value={String(row.scheduleStartAt || '')}
                    onChange={(e) => updateRow(index, 'scheduleStartAt', e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-bold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase block text-right">{t('business.builder.imageShape.toTime')}</label>
                  <input
                    type="datetime-local"
                    value={String(row.scheduleEndAt || '')}
                    onChange={(e) => updateRow(index, 'scheduleEndAt', e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 font-bold text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={String(row.sortMode || 'default')}
                  onChange={(e) => updateRow(index, 'sortMode', e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 font-black text-xs"
                >
                  <option value="default">{t('business.builder.imageShape.sortDefault')}</option>
                  <option value="inStockFirst">{t('business.builder.imageShape.sortInStockFirst')}</option>
                  <option value="topSelling">{t('business.builder.imageShape.sortTopSelling')}</option>
                </select>
                <label className="flex items-center justify-between px-2 rounded-xl border border-slate-200 text-xs font-black text-slate-700">
                  {t('business.builder.imageShape.hideOutOfStock')}
                  <input
                    type="checkbox"
                    checked={Boolean(row.hideOutOfStock)}
                    onChange={(e) => updateRow(index, 'hideOutOfStock', e.target.checked)}
                    className="w-4 h-4 accent-cyan-500"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageShapeSection;
