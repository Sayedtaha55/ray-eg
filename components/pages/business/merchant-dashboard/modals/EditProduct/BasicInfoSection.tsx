import React from 'react';

interface BasicInfoSectionProps {
  name: string;
  setName: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  stock: string;
  setStock: (v: string) => void;
  cat: string;
  setCat: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  isRestaurant: boolean;
  isFashion: boolean;
  fashionSizeItems: any[];
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name, setName,
  price, setPrice,
  stock, setStock,
  cat, setCat,
  description, setDescription,
  isRestaurant,
  isFashion,
  fashionSizeItems
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اسم الصنف</label>
        <input
          required
          placeholder={isRestaurant ? 'مثلاً: بيتزا مارجريتا' : 'مثلاً: قميص أبيض قطن'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
        />
      </div>

      <div className={`grid grid-cols-1 ${isRestaurant ? '' : 'md:grid-cols-2'} gap-6`}>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">السعر (ج.م)</label>
          <input
            required={!isFashion || fashionSizeItems.length === 0}
            type="number"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
          />
        </div>
        {!isRestaurant && (
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الكمية المتوفرة</label>
            <input
              required
              type="number"
              placeholder="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">القسم</label>
        <input
          placeholder={isRestaurant ? 'مثلاً: وجبات - مشروبات - إضافات' : 'مثلاً: ملابس صيفية'}
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الوصف</label>
        <textarea
          placeholder={isRestaurant ? 'مثلاً: مكونات الوجبة...' : 'مثلاً: خامات المنتج، طريقة الاستخدام...'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-bold text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all min-h-[140px]"
        />
      </div>
    </div>
  );
};

export default BasicInfoSection;
