import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type RestaurantMenuVariantItem = {
  id: string;
  name: string;
  hasSmall: boolean;
  hasMedium: boolean;
  hasLarge: boolean;
  priceSmall: string;
  priceMedium: string;
  priceLarge: string;
};

export interface RestaurantMenuSectionProps {
  menuVariantItems: RestaurantMenuVariantItem[];
  setMenuVariantItems: React.Dispatch<React.SetStateAction<RestaurantMenuVariantItem[]>>;
  parseNumberInput: (v: any) => number;
}

const RestaurantMenuSection: React.FC<RestaurantMenuSectionProps> = ({
  menuVariantItems,
  setMenuVariantItems,
  parseNumberInput
}) => {
  const { t } = useTranslation();
  const handleAddItem = useCallback(() => {
    const newItem = {
      id: `type_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: '',
      hasSmall: true,
      hasMedium: true,
      hasLarge: true,
      priceSmall: '',
      priceMedium: '',
      priceLarge: '',
    };
    setMenuVariantItems(prev => [...prev, newItem]);
  }, [setMenuVariantItems]);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.typesAndSizesOptional')}</label>
        <button
          type="button"
          onClick={handleAddItem}
          className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
        >
          + {t('business.products.addType')}
        </button>
      </div>

      {menuVariantItems.length > 0 && (
        <div className="space-y-4">
          {menuVariantItems.map((item, idx) => (
            <div key={item.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black">{t('business.products.typeNum', { num: idx + 1 })}</p>
                <button
                  type="button"
                  onClick={() => setMenuVariantItems((prev: any[]) => prev.filter((x) => x.id !== item.id))}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.products.typeNameLabel')}</label>
                <input
                  required
                  value={item.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setMenuVariantItems((prev: any[]) => prev.map((x) => (x.id === item.id ? { ...x, name: v } : x)));
                  }}
                  placeholder={t('business.products.typeNamePlaceholder')}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.dashboard.products.sizeSmall')}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuVariantItems((prev: any[]) =>
                          prev.map((x) =>
                            x.id === item.id
                              ? { ...x, hasSmall: !x.hasSmall, priceSmall: !x.hasSmall ? x.priceSmall : '' }
                              : x,
                          ),
                        );
                      }}
                      className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                    >
                      {item.hasSmall ? t('business.products.none') : t('business.products.available')}
                    </button>
                  </div>
                  <input
                    type="number"
                    disabled={!item.hasSmall}
                    value={item.hasSmall ? item.priceSmall : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMenuVariantItems((prev: any[]) => prev.map((x) => (x.id === item.id ? { ...x, priceSmall: v } : x)));
                    }}
                    placeholder={item.hasSmall ? '0' : t('business.products.none')}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.dashboard.products.sizeMedium')}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuVariantItems((prev: any[]) =>
                          prev.map((x) =>
                            x.id === item.id
                              ? { ...x, hasMedium: !x.hasMedium, priceMedium: !x.hasMedium ? x.priceMedium : '' }
                              : x,
                          ),
                        );
                      }}
                      className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                    >
                      {item.hasMedium ? t('business.products.none') : t('business.products.available')}
                    </button>
                  </div>
                  <input
                    type="number"
                    disabled={!item.hasMedium}
                    value={item.hasMedium ? item.priceMedium : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMenuVariantItems((prev: any[]) => prev.map((x) => (x.id === item.id ? { ...x, priceMedium: v } : x)));
                    }}
                    placeholder={item.hasMedium ? '0' : t('business.products.none')}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('business.dashboard.products.sizeLarge')}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuVariantItems((prev: any[]) =>
                          prev.map((x) =>
                            x.id === item.id
                              ? { ...x, hasLarge: !x.hasLarge, priceLarge: !x.hasLarge ? x.priceLarge : '' }
                              : x,
                          ),
                        );
                      }}
                      className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                    >
                      {item.hasLarge ? t('business.products.none') : t('business.products.available')}
                    </button>
                  </div>
                  <input
                    type="number"
                    disabled={!item.hasLarge}
                    value={item.hasLarge ? item.priceLarge : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMenuVariantItems((prev: any[]) => prev.map((x) => (x.id === item.id ? { ...x, priceLarge: v } : x)));
                    }}
                    placeholder={item.hasLarge ? '0' : t('business.products.none')}
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
