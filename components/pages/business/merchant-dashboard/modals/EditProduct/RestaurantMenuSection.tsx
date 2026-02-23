import React from 'react';
import { X } from 'lucide-react';

interface RestaurantMenuSectionProps {
  menuVariantItems: any[];
  setMenuVariantItems: (v: any) => void;
  parseNumberInput: (v: any) => number;
}

const RestaurantMenuSection: React.FC<RestaurantMenuSectionProps> = ({
  menuVariantItems,
  setMenuVariantItems,
  parseNumberInput
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الأنواع والمقاسات (اختياري)</label>
        <button
          type="button"
          onClick={() => {
            setMenuVariantItems((prev: any[]) => [
              ...prev,
              {
                id: `type_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                name: '',
                hasSmall: true,
                hasMedium: true,
                hasLarge: true,
                priceSmall: '',
                priceMedium: '',
                priceLarge: '',
              },
            ]);
          }}
          className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
        >
          + إضافة نوع
        </button>
      </div>

      {menuVariantItems.length > 0 && (
        <div className="space-y-4">
          {menuVariantItems.map((t, idx) => (
            <div key={t.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black">نوع #{idx + 1}</p>
                <button
                  type="button"
                  onClick={() => setMenuVariantItems((prev: any[]) => prev.filter((x) => x.id !== t.id))}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اسم النوع (مثلاً: دجاج، لحم)</label>
                <input
                  required
                  value={t.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMenuVariantItems((prev: any[]) => prev.map((x) => (x.id === t.id ? { ...x, name: v } : x)));
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">صغير</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuVariantItems((prev: any[]) =>
                          prev.map((x) =>
                            x.id === t.id
                              ? { ...x, hasSmall: !x.hasSmall, priceSmall: !x.hasSmall ? x.priceSmall : '' }
                              : x,
                          ),
                        );
                      }}
                      className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                    >
                      {t.hasSmall ? 'لا يوجد' : 'موجود'}
                    </button>
                  </div>
                  <input
                    type="number"
                    disabled={!t.hasSmall}
                    value={t.hasSmall ? t.priceSmall : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMenuVariantItems((prev: any[]) => prev.map((x) => (x.id === t.id ? { ...x, priceSmall: v } : x)));
                    }}
                    placeholder={t.hasSmall ? '0' : 'لا يوجد'}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">وسط</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuVariantItems((prev: any[]) =>
                          prev.map((x) =>
                            x.id === t.id
                              ? { ...x, hasMedium: !x.hasMedium, priceMedium: !x.hasMedium ? x.priceMedium : '' }
                              : x,
                          ),
                        );
                      }}
                      className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                    >
                      {t.hasMedium ? 'لا يوجد' : 'موجود'}
                    </button>
                  </div>
                  <input
                    type="number"
                    disabled={!t.hasMedium}
                    value={t.hasMedium ? t.priceMedium : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMenuVariantItems((prev: any[]) => prev.map((x) => (x.id === t.id ? { ...x, priceMedium: v } : x)));
                    }}
                    placeholder={t.hasMedium ? '0' : 'لا يوجد'}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">كبير</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuVariantItems((prev: any[]) =>
                          prev.map((x) =>
                            x.id === t.id
                              ? { ...x, hasLarge: !x.hasLarge, priceLarge: !x.hasLarge ? x.priceLarge : '' }
                              : x,
                          ),
                        );
                      }}
                      className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                    >
                      {t.hasLarge ? 'لا يوجد' : 'موجود'}
                    </button>
                  </div>
                  <input
                    type="number"
                    disabled={!t.hasLarge}
                    value={t.hasLarge ? t.priceLarge : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMenuVariantItems((prev: any[]) => prev.map((x) => (x.id === t.id ? { ...x, priceLarge: v } : x)));
                    }}
                    placeholder={t.hasLarge ? '0' : 'لا يوجد'}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuSection;
