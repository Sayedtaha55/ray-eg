import React from 'react';
import { Plus, Trash2, Loader2, X } from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';

interface AddonsSectionProps {
  addonItems: any[];
  setAddonItems: React.Dispatch<React.SetStateAction<any[]>>;
  addToast: (msg: string, type: 'success' | 'error') => void;
}

const AddonsSection: React.FC<AddonsSectionProps> = ({ addonItems, setAddonItems, addToast }) => {
  return (
    <div className="space-y-6 pt-6 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">إضافات خاصة بهذا الصنف</label>
        <button
          type="button"
          onClick={() => {
            setAddonItems((prev) => [
              ...prev,
              {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                name: '',
                imagePreview: null,
                imageUrl: null,
                imageUploadFile: null,
                hasSmall: true,
                hasMedium: false,
                hasLarge: false,
                priceSmall: '',
                priceMedium: '',
                priceLarge: '',
              },
            ]);
          }}
          className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
        >
          + إضافة
        </button>
      </div>

      <div className="space-y-4">
        {addonItems.map((a, idx) => (
          <div key={a.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black">إضافة #{idx + 1}</p>
              <button
                type="button"
                onClick={() => {
                  setAddonItems((prev) => prev.filter((x) => x.id !== a.id));
                }}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">اسم الإضافة</label>
                <input
                  value={a.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, name: v } : x)));
                  }}
                  placeholder="مثلاً: صوص إضافي"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">السعر الإضافي (ج.م)</label>
                <input
                  type="number"
                  value={a.priceSmall}
                  onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceSmall: e.target.value } : x)))}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddonsSection;
