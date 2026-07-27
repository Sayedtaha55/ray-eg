import React from 'react';
import PackOptionsSection from '../../AddProduct/PackOptionsSection';
import { useTranslation } from 'react-i18next';

type PackOptionItem = { id: string; qty: string; price: string };

type Props = {
  packOptionItems: PackOptionItem[];
  setPackOptionItems: React.Dispatch<React.SetStateAction<PackOptionItem[]>>;
  unit: string;
  setUnit: (v: string) => void;
  parseNumberInput: (v: any) => number;
  packEnabled: boolean;
};

const GroceryRetailExtras: React.FC<Props> = ({ packOptionItems, setPackOptionItems, unit, setUnit, packEnabled }) => {
  const { t } = useTranslation();
  React.useEffect(() => {
    if (!packEnabled) return;
    if (Array.isArray(packOptionItems) && packOptionItems.length > 0) return;
    setPackOptionItems([{ id: `pack_${Date.now()}_${Math.random().toString(16).slice(2)}`, qty: '', price: '' }]);
  }, [packEnabled]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest block pr-4">{t('business.products.sellingUnitGrocery')}</label>
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 font-black text-right focus:bg-white focus:border-[#00E5FF]/20 transition-all outline-none appearance-none"
        >
          <option value="">{t('business.products.unitNone')}</option>
          <option value="PIECE">{t('business.products.unitPiece')}</option>
          <option value="CARTON">{t('business.products.unitCarton')}</option>
          <option value="BOX">{t('business.products.unitBox')}</option>
          <option value="BOTTLE">{t('business.products.unitBottle')}</option>
          <option value="PACK">{t('business.products.unitPack')}</option>
          <option value="BAG">{t('business.products.unitBag')}</option>
          <option value="CAN">{t('business.products.unitCan')}</option>
          <option value="G">{t('business.products.unitGram')}</option>
          <option value="KG">{t('business.products.unitKilo')}</option>
          <option value="ML">{t('business.products.unitMl')}</option>
          <option value="L">{t('business.products.unitLiter')}</option>
        </select>
      </div>

      {packEnabled ? (
        <PackOptionsSection packOptionItems={packOptionItems} setPackOptionItems={setPackOptionItems} unit={unit} />
      ) : null}
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
