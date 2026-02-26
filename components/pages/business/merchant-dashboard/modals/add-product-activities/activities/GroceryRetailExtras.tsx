import React from 'react';
import PackOptionsSection from '../../AddProduct/PackOptionsSection';

type PackOptionItem = { id: string; qty: string; price: string };

type Props = {
  packOptionItems: PackOptionItem[];
  setPackOptionItems: React.Dispatch<React.SetStateAction<PackOptionItem[]>>;
  unit: string;
  setUnit: (v: string) => void;
  parseNumberInput: (v: any) => number;
};

const GroceryRetailExtras: React.FC<Props> = ({ packOptionItems, setPackOptionItems, unit, setUnit }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest block pr-4">وحدة البيع (سوبر ماركت)</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none appearance-none"
        >
          <option value="">بدون</option>
          <option value="PIECE">قطعة</option>
          <option value="CARTON">كرتونة</option>
          <option value="BOX">علبة</option>
          <option value="BOTTLE">عبوة</option>
          <option value="PACK">باك</option>
          <option value="BAG">كيس</option>
          <option value="CAN">كانز</option>
          <option value="G">جرام</option>
          <option value="KG">كيلو</option>
          <option value="ML">مل</option>
          <option value="L">لتر</option>
        </select>
      </div>

      <PackOptionsSection packOptionItems={packOptionItems} setPackOptionItems={setPackOptionItems} unit={unit} />
    </div>
  );
};

export function buildGroceryRetailExtrasPayload(args: {
  packOptionItems: PackOptionItem[];
  unit: string;
  parseNumberInput: (v: any) => number;
}) {
  const { packOptionItems, parseNumberInput, unit } = args;
  const list = Array.isArray(packOptionItems) ? packOptionItems : [];
  const u = String(unit || '').trim();
  const packOptions = list.map((p) => ({
    ...p,
    price: parseNumberInput(p.price),
    qty: parseNumberInput(p.qty),
    unit: u ? u : null,
  }));
  return { payload: { packOptions } };
}

export default GroceryRetailExtras;
