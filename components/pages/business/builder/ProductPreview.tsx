import React from 'react';

interface ProductPreviewProps {
  config: any;
  shop: any;
  logoDataUrl: string;
}

const ProductPreview: React.FC<ProductPreviewProps> = ({ config }) => {
  const isVisible = (key: string, fallback: boolean = true) => {
    const visibility = config.elementsVisibility || {};
    return visibility[key] !== undefined ? visibility[key] : fallback;
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      {isVisible('productTabs', true) && (
        <div className="flex items-center justify-end">
          <div className="inline-flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
            <button type="button" className="px-4 py-2 rounded-xl text-xs font-black text-white bg-slate-900 transition-all active:scale-[0.98]">التفاصيل</button>
            <button type="button" className="px-4 py-2 rounded-xl text-xs font-black text-slate-500 transition-all hover:bg-slate-50 active:scale-[0.98]">المواصفات</button>
            <button type="button" className="px-4 py-2 rounded-xl text-xs font-black text-slate-500 transition-all hover:bg-slate-50 active:scale-[0.98]">الشحن</button>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-10">
        <div className="w-full md:w-[420px]">
          <div className="aspect-square rounded-[2rem] bg-slate-100 border border-slate-200 shadow-sm" />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.primaryColor }} />
              <span className="text-xs font-black text-slate-600">متوفر</span>
            </div>
            <span className="text-xs font-black text-slate-400">SKU: 0001</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 text-right">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black" style={{ color: config.primaryColor }}>اسم المنتج</h1>
            <p className="text-sm md:text-base font-bold text-slate-500">وصف مختصر للمنتج هنا، وبعد كدا هنضيف تفاصيل أكتر.</p>
          </div>
          {(config?.productEditorVisibility?.productCardPrice !== false) && (
            <div className="flex items-center justify-between flex-row-reverse">
              <span className="text-xl md:text-2xl font-black text-slate-900">EGP 249</span>
              <span className="text-xs font-black text-slate-400 line-through">EGP 299</span>
            </div>
          )}
          {(config?.productEditorVisibility?.productCardStock !== false) && (
            <div className="flex items-center justify-between flex-row-reverse">
              <span className="text-xs font-black text-slate-600">المخزون: 222</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(config?.productEditorVisibility?.productCardAddToCart !== false) && (
              <button
                type="button"
                className={`${config.buttonPadding || 'px-6 py-3'} ${config.buttonShape || 'rounded-2xl'} text-white font-black text-sm shadow-xl transition-all hover:opacity-90 active:scale-[0.98]`}
                style={{ backgroundColor: config.primaryColor }}
              >
                إضافة للسلة
              </button>
            )}
            {(config?.productEditorVisibility?.productCardReserve !== false) && (
              <button
                type="button"
                className={`${config.buttonPadding || 'px-6 py-3'} ${config.buttonShape || 'rounded-2xl'} text-white font-black text-sm shadow-xl transition-all hover:opacity-90 active:scale-[0.98]`}
                style={{ backgroundColor: config.secondaryColor || config.primaryColor }}
              >
                حجز
              </button>
            )}
            {isVisible('productShareButton', true) && (
              <button
                type="button"
                className="px-6 py-3 rounded-2xl font-black text-sm border border-slate-200 bg-white text-slate-900 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
              >
                مشاركة
              </button>
            )}
          </div>

          {isVisible('productQuickSpecs', true) && (
            <div className="border border-slate-100 rounded-[1.5rem] bg-white p-5 space-y-3">
              <h3 className="font-black text-sm text-slate-900">مواصفات سريعة</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-row-reverse text-sm">
                  <span className="font-black text-slate-500">الخامة</span>
                  <span className="font-bold text-slate-900">قطن</span>
                </div>
                <div className="flex items-center justify-between flex-row-reverse text-sm">
                  <span className="font-black text-slate-500">اللون</span>
                  <span className="font-bold text-slate-900">أسود</span>
                </div>
                <div className="flex items-center justify-between flex-row-reverse text-sm">
                  <span className="font-black text-slate-500">المقاس</span>
                  <span className="font-bold text-slate-900">M</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductPreview);
