import React, { memo, useMemo, useState } from 'react';
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
  const [productQuery, setProductQuery] = useState('');

  const filteredProductOptions = useMemo(() => {
    const list = Array.isArray(productOptions) ? productOptions : [];
    const q = String(productQuery || '').trim().toLowerCase();
    if (!q) return list.slice(0, 250);
    const out: any[] = [];
    for (const p of list) {
      const name = String(p?.name || '').toLowerCase();
      const id = String(p?.id || '').toLowerCase();
      if (name.includes(q) || id.includes(q)) out.push(p);
      if (out.length >= 250) break;
    }
    return out;
  }, [productOptions, productQuery]);

  return (
    <div className="border-t lg:border-t-0 lg:border-l border-slate-100 p-4 overflow-y-auto bg-white">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs font-black text-slate-500">الصورة</div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm transition-all active:scale-95 shadow-lg"
            type="button"
          >
            رفع/تغيير صورة الخريطة
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-black text-slate-500">اختيار خريطة</div>
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
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold outline-none focus:border-[#00E5FF]"
          >
            <option value="">بدون</option>
            {maps.map((m: any) => (
              <option key={m.id} value={String(m.id)}>
                {String(m.title || m.imageUrl || m.image_url || '').slice(0, 40)}{m.isActive ? ' (Active)' : ''}
              </option>
            ))}
          </select>
        </div>

        {selected ? (
          <div className="space-y-3 p-4 rounded-3xl bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
            <div className="font-black text-sm text-slate-900">تعديل النقطة</div>

            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-500">الاسم الظاهر</div>
              <input
                value={selected.label || ''}
                onChange={(e) => updateSelected({ label: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold outline-none focus:border-[#00E5FF] bg-white"
              />
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-500">ربط بمنتج من المخزون</div>
              <input
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold outline-none focus:border-[#00E5FF] bg-white mb-2"
                placeholder="بحث بالاسم"
              />
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
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold outline-none focus:border-[#00E5FF] bg-white"
              >
                <option value="">بدون</option>
                {filteredProductOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {selectedProduct ? (
              <div className="space-y-3 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="font-black text-[10px] text-[#00E5FF] uppercase tracking-widest">تعديل بيانات المنتج الأصلية</div>

                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-500">اسم المنتج</div>
                  <input
                    value={productEditName}
                    onChange={(e) => setProductEditName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-500">السعر</div>
                    <input
                      type="number"
                      value={productEditPrice}
                      onChange={(e) => setProductEditPrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold outline-none focus:border-[#00E5FF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-500">المخزون</div>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={productEditStock}
                      onChange={(e) => setProductEditStock(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold outline-none focus:border-[#00E5FF]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => saveLinkedProduct().catch(() => {})}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 text-white font-black text-xs transition-all active:scale-95 disabled:opacity-50"
                  disabled={productSaving}
                >
                  {productSaving ? <Loader2 size={14} className="animate-spin inline ml-2" /> : null}
                  حفظ في المخزون
                </button>
              </div>
            ) : null}

            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-500">سعر خاص لهذه النقطة (اختياري)</div>
              <input
                type="number"
                value={typeof selected.priceOverride === 'number' ? String(selected.priceOverride) : ''}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  updateSelected({ priceOverride: Number.isFinite(n) ? n : null });
                }}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-bold outline-none focus:border-[#00E5FF] bg-white"
                placeholder="اتركه فاضي لاستخدام سعر المنتج"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setHotspots((prev) => prev.filter((h) => h.id !== selected.id));
                  setSelectedId('');
                }}
                className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-black border border-red-100 text-xs transition-all active:scale-95"
              >
                حذف النقطة
              </button>
              <button
                type="button"
                onClick={() => setSelectedId('')}
                className="px-4 py-3 rounded-2xl bg-white text-slate-700 font-black border border-slate-200 text-xs transition-all active:scale-95"
              >
                إلغاء التحديد
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-slate-500 font-bold text-sm text-center">
            اختر نقطة من الصورة لتعديلها أو اضغط "إضافة نقطة".
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Sidebar);
 