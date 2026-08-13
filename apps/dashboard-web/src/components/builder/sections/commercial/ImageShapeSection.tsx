'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Rows3, ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { UnifiedBuilderConfig } from '@/types/builder';

interface ImageShapeSectionProps {
  config: UnifiedBuilderConfig;
  onChange: (config: Partial<UnifiedBuilderConfig>) => void;
}

interface RowConfig {
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
}

export default function ImageShapeSection({ config, onChange }: ImageShapeSectionProps) {
  const rowsConfig: RowConfig[] = (config.rowsConfig || []) as RowConfig[];

  const addRow = () => {
    const newRow: RowConfig = {
      id: `row-${Date.now()}`,
      imageShape: 'square',
      displayMode: 'cards',
      itemsPerRow: 10,
      rowMode: 'carousel',
      layoutDirection: 'rtl',
      showArrows: true,
      productNames: [],
      sortMode: 'default',
      hideOutOfStock: false,
    };
    onChange({ rowsConfig: [...rowsConfig, newRow] });
  };

  const updateRow = (index: number, field: string, value: any) => {
    const newRows = [...rowsConfig];
    newRows[index] = { ...newRows[index], [field]: value };
    onChange({ rowsConfig: newRows });
  };

  const removeRow = (index: number) => {
    const newRows = rowsConfig.filter((_, i) => i !== index);
    onChange({ rowsConfig: newRows });
  };

  const moveRow = (index: number, direction: -1 | 1) => {
    const next = [...rowsConfig];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    onChange({ rowsConfig: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">تخصيص الصفوف</span>
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-1"
        >
          <Plus size={14} />
          صف جديد
        </button>
      </div>

      {rowsConfig.length === 0 && (
        <p className="text-slate-400 text-xs text-center py-8">لا توجد صفوف مخصصة. اضغط "صف جديد" للبدء.</p>
      )}

      <div className="space-y-3">
        {rowsConfig.map((row, index) => (
          <div key={row.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">صف {index + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveRow(index, -1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  <ArrowUp size={12} />
                </button>
                <button type="button" onClick={() => moveRow(index, 1)} className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  <ArrowDown size={12} />
                </button>
                <button type="button" onClick={() => removeRow(index)} className="text-red-500 font-bold text-xs hover:text-red-600 px-2 flex items-center gap-1">
                  <Trash2 size={12} />
                  حذف
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block text-right">عدد المنتجات في الصف</label>
              <input
                type="number"
                min={1}
                max={50}
                value={row.itemsPerRow}
                onChange={(e) => updateRow(index, 'itemsPerRow', Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="w-full p-2 rounded-xl border border-slate-200 font-bold text-sm text-center"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateRow(index, 'imageShape', 'square')}
                className={`p-2 rounded-xl border text-center ${
                  row.imageShape === 'square' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'
                }`}
              >
                <div className="aspect-square bg-slate-100 rounded-lg mb-1 flex items-center justify-center">
                  <span className="text-lg">⬜</span>
                </div>
                <p className="font-bold text-[10px]">مربع</p>
              </button>
              <button
                type="button"
                onClick={() => updateRow(index, 'imageShape', 'portrait')}
                className={`p-2 rounded-xl border text-center ${
                  row.imageShape === 'portrait' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'
                }`}
              >
                <div className="aspect-[2/3] bg-slate-100 rounded-lg mb-1 flex items-center justify-center">
                  <span className="text-lg">📏</span>
                </div>
                <p className="font-bold text-[10px]">طول</p>
              </button>
              <button
                type="button"
                onClick={() => updateRow(index, 'imageShape', 'landscape')}
                className={`p-2 rounded-xl border text-center ${
                  row.imageShape === 'landscape' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'
                }`}
              >
                <div className="aspect-[3/2] bg-slate-100 rounded-lg mb-1 flex items-center justify-center">
                  <span className="text-lg">↔️</span>
                </div>
                <p className="font-bold text-[10px]">عرض</p>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateRow(index, 'rowMode', 'carousel')}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${
                  String(row.rowMode || 'grid') === 'carousel' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'
                }`}
              >
                <Rows3 size={14} />
                سلايدر
              </button>
              <button
                type="button"
                onClick={() => updateRow(index, 'rowMode', 'grid')}
                className={`p-2 rounded-xl border text-xs font-bold ${
                  String(row.rowMode || 'grid') === 'grid' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'
                }`}
              >
                شبكة
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateRow(index, 'layoutDirection', 'rtl')}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${
                  String(row.layoutDirection || 'rtl') === 'rtl' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'
                }`}
              >
                <ChevronRight size={14} />
                يمين
              </button>
              <button
                type="button"
                onClick={() => updateRow(index, 'layoutDirection', 'ltr')}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${
                  String(row.layoutDirection || 'rtl') === 'ltr' ? 'border-[#00E5FF] bg-slate-50' : 'border-slate-100'
                }`}
              >
                <ChevronLeft size={14} />
                يسار
              </button>
            </div>

            <label className="flex items-center justify-between text-xs font-bold text-slate-700">
              أسهم التنقل
              <input
                type="checkbox"
                checked={row.showArrows !== false}
                onChange={(e) => updateRow(index, 'showArrows', e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block text-right">اختيار منتجات بالاسم (افصل بفاصلة)</label>
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
                className="w-full p-2 rounded-xl border border-slate-200 text-sm"
                placeholder="منتج 1، منتج 2، منتج 3"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block text-right">ترتيب</label>
              <select
                value={row.sortMode || 'default'}
                onChange={(e) => updateRow(index, 'sortMode', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-sm font-bold"
              >
                <option value="default">افتراضي</option>
                <option value="inStockFirst">المتوفر أولاً</option>
                <option value="topSelling">الأكثر مبيعاً</option>
              </select>
            </div>

            <label className="flex items-center justify-between text-xs font-bold text-slate-700">
              إخفاء غير المتوفر
              <input
                type="checkbox"
                checked={row.hideOutOfStock || false}
                onChange={(e) => updateRow(index, 'hideOutOfStock', e.target.checked)}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
