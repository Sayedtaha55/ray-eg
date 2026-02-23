import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface SidebarProps {
  selected: any;
  selectedProduct: any;
  productEditName: string;
  setProductEditName: (v: string) => void;
  productEditPrice: string;
  setProductEditPrice: (v: string) => void;
  productEditStock: string;
  setProductEditStock: (v: string) => void;
  productSaving: boolean;
  saveLinkedProduct: () => Promise<void>;
  updateSelected: (patch: any) => void;
  productOptions: any[];
  hotspots: any[];
  setHotspots: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedId: (id: string) => void;
  activeMap: any;
  maps: any[];
  setActiveMap: (m: any) => void;
  normalizeHotspotsFromMap: (m: any) => any[];
  setAddingMode: (v: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const Sidebar: React.FC<SidebarProps> = ({
  selected,
  selectedProduct,
  productEditName,
  setProductEditName,
  productEditPrice,
  setProductEditPrice,
  productEditStock,
  setProductEditStock,
  productSaving,
  saveLinkedProduct,
  updateSelected,
  productOptions,
  hotspots,
  setHotspots,
  setSelectedId,
  activeMap,
  maps,
  setActiveMap,
  normalizeHotspotsFromMap,
  setAddingMode,
  fileInputRef
}) => {
  return (
    <div className="border-t lg:border-t-0 lg:border-l border-slate-100 p-3 sm:p-4 overflow-y-auto bg-white scrollbar-hide">
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-2 lg:block lg:space-y-2">
          <div className="space-y-1 sm:space-y-2">
            <div className="text-[10px] sm:text-xs font-black text-slate-500">الصورة</div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-900 text-white font-black text-[10px] sm:text-sm transition-all active:scale-95 shadow-md sm:shadow-lg"
              type="button"
            >
              تغيير الصورة
            </button>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <div className="text-[10px] sm:text-xs font-black text-slate-500">الخريطة</div>
            <select
              value={String(activeMap?.id || '')}
              onChange={(e) => {
                const id = String(e.target.value || '');
                const m = maps.find((x: any) => String(x?.id) === id) || null;
                setActiveMap(m);
                setHotspots(normalizeHotspotsFromMap(m));
                setSelectedId('');
                setAddingMode(false);
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 font-bold text-[10px] sm:text-sm outline-none focus:border-[#00E5FF] bg-slate-50"
            >
              <option value="">بدون</option>
              {maps.map((m: any) => (
                <option key={m.id} value={String(m.id)}>
                  {String(m.title || m.imageUrl || m.image_url || '').slice(0, 20)}{m.isActive ? ' (Active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selected ? (
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <div className="font-black text-[11px] sm:text-sm text-slate-900">تعديل النقطة</div>
              <div className="text-[9px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">
                X: {Math.round(selected.x)}% Y: {Math.round(selected.y)}%
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[9px] sm:text-[10px] font-black text-slate-500">الاسم الظاهر</div>
              <input
                value={selected.label || ''}
                onChange={(e) => updateSelected({ label: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 font-bold text-[10px] sm:text-sm outline-none focus:border-[#00E5FF] bg-white"
                placeholder="مثال: كنبة مودرن"
              />
            </div>

            <div className="space-y-1">
              <div className="text-[9px] sm:text-[10px] font-black text-slate-500">المنتج المرتبط</div>
              <select
                value={selected.productId || ''}
                onChange={(e) => {
                  const nextId = String(e.target.value || '').trim() || null;
                  const nextProduct = nextId
                    ? (productOptions).find((p: any) => String(p?.id || '') === nextId) || null
                    : null;
                  updateSelected({
                    productId: nextId,
                    ...(nextProduct && !selected.label ? { label: String(nextProduct?.name || '') } : {}),
                  });
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 font-bold text-[10px] sm:text-sm outline-none focus:border-[#00E5FF] bg-white"
              >
                <option value="">بدون</option>
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {selectedProduct ? (
              <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="font-black text-[9px] text-[#00E5FF] uppercase tracking-wider">تعديل بيانات المخزون</div>

                <div className="space-y-1">
                  <div className="text-[9px] font-black text-slate-500">الاسم</div>
                  <input
                    value={productEditName}
                    onChange={(e) => setProductEditName(e.target.value)}
                    className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 font-bold text-[10px] sm:text-sm outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-slate-500">السعر</div>
                    <input
                      type="number"
                      value={productEditPrice}
                      onChange={(e) => setProductEditPrice(e.target.value)}
                      className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 font-bold text-[10px] sm:text-sm outline-none focus:border-[#00E5FF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-slate-500">الكمية</div>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={productEditStock}
                      onChange={(e) => setProductEditStock(e.target.value)}
                      className="w-full px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 font-bold text-[10px] sm:text-sm outline-none focus:border-[#00E5FF]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => saveLinkedProduct().catch(() => {})}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-xl bg-slate-900 text-white font-black text-[10px] sm:text-xs transition-all active:scale-95 disabled:opacity-50"
                  disabled={productSaving}
                >
                  {productSaving ? <Loader2 size={12} className="animate-spin inline ml-1" /> : null}
                  حفظ التعديلات
                </button>
              </div>
            ) : null}

            <div className="space-y-1">
              <div className="text-[9px] sm:text-[10px] font-black text-slate-500">سعر خاص (اختياري)</div>
              <input
                type="number"
                value={typeof selected.priceOverride === 'number' ? String(selected.priceOverride) : ''}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  updateSelected({ priceOverride: Number.isFinite(n) ? n : null });
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 font-bold text-[10px] sm:text-sm outline-none focus:border-[#00E5FF] bg-white"
                placeholder="سعر المنتج الأصلي"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setHotspots((prev) => prev.filter((h) => h.id !== selected.id));
                  setSelectedId('');
                }}
                className="px-3 py-2 sm:py-2.5 rounded-xl bg-red-50 text-red-600 font-black border border-red-100 text-[10px] sm:text-xs transition-all active:scale-95"
              >
                حذف النقطة
              </button>
              <button
                type="button"
                onClick={() => setSelectedId('')}
                className="px-3 py-2 sm:py-2.5 rounded-xl bg-white text-slate-700 font-black border border-slate-200 text-[10px] sm:text-xs transition-all active:scale-95"
              >
                إغلاق
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100 text-slate-500 font-bold text-[10px] sm:text-sm text-center">
            اختر نقطة من الصورة أو أضف واحدة جديدة.
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Sidebar);
