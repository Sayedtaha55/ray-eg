import React from 'react';
import { Truck, ShieldCheck, Package } from 'lucide-react';

interface ProductTabsProps {
  activeTab: 'details' | 'specs' | 'shipping';
  setActiveTab: (tab: 'details' | 'specs' | 'shipping') => void;
  productDescription: string;
  product: any;
  primaryColor: string;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ activeTab, setActiveTab, productDescription, product, primaryColor }) => {
  const fm = (product as any)?.furnitureMeta ?? (product as any)?.furniture_meta;
  const unit = typeof fm?.unit === 'string' ? String(fm.unit).trim() : '';
  const l = typeof fm?.lengthCm === 'number' ? fm.lengthCm : Number(fm?.lengthCm || NaN);
  const w = typeof fm?.widthCm === 'number' ? fm.widthCm : Number(fm?.widthCm || NaN);
  const h = typeof fm?.heightCm === 'number' ? fm.heightCm : Number(fm?.heightCm || NaN);
  const dims = [
    Number.isFinite(l) && l > 0 ? `الطول: ${Math.round(l * 100) / 100} سم` : '',
    Number.isFinite(w) && w > 0 ? `العرض: ${Math.round(w * 100) / 100} سم` : '',
    Number.isFinite(h) && h > 0 ? `الارتفاع: ${Math.round(h * 100) / 100} سم` : '',
  ].filter(Boolean);
  const hasFurniture = Boolean(unit || dims.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'details' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            التفاصيل
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'specs' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            المواصفات
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === 'shipping' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            الشحن
          </button>
        </div>
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'details' && (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <h3 className="font-black text-lg mb-4">وصف المنتج</h3>
            <p className="text-sm font-bold text-slate-600 leading-relaxed">
              {productDescription || 'لا يوجد تفاصيل إضافية بعد.'}
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <h3 className="font-black text-lg mb-4">المواصفات التقنية</h3>
            {hasFurniture ? (
              <div className="space-y-4">
                {unit ? (
                  <div className="flex items-center justify-between flex-row-reverse p-4 bg-slate-50 rounded-2xl">
                    <span className="font-black text-slate-900 text-sm">الوحدة</span>
                    <span className="font-bold text-slate-600 text-sm">{unit}</span>
                  </div>
                ) : null}
                {dims.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {dims.map((dim, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl text-center">
                        <span className="font-bold text-slate-600 text-sm">{dim}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-2xl">
                <p className="text-sm font-bold text-slate-400">سيتم إضافة المواصفات قريباً.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <h3 className="font-black text-lg mb-6">سياسة الشحن</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-row-reverse p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm">
                  <Truck size={20} />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-black text-sm text-slate-900">شحن سريع</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">توصيل خلال ٢-٤ أيام عمل</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-row-reverse p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-black text-sm text-slate-900">ضمان الجودة</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">فحص المنتج قبل الاستلام</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-row-reverse p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-sm">
                  <Package size={20} />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-black text-sm text-slate-900">تغليف آمن</p>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">وصول المنتج في أفضل حالة</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductTabs);
