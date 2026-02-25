import React from 'react';
import PackOptionsSection from '../../AddProduct/PackOptionsSection';

type PackOptionItem = { id: string; qty: string; price: string };

type Props = {
  packOptionItems: PackOptionItem[];
  setPackOptionItems: React.Dispatch<React.SetStateAction<PackOptionItem[]>>;
  unit: string;
  parseNumberInput: (v: any) => number;
};

const GroceryRetailExtras: React.FC<Props> = ({ packOptionItems, setPackOptionItems, unit }) => {
  return <PackOptionsSection packOptionItems={packOptionItems} setPackOptionItems={setPackOptionItems} unit={unit} />;
};

export function buildGroceryRetailExtrasPayload(args: {
  packOptionItems: PackOptionItem[];
  parseNumberInput: (v: any) => number;
}) {
  const { packOptionItems, parseNumberInput } = args;
  const list = Array.isArray(packOptionItems) ? packOptionItems : [];
  const packOptions = list.map((p) => ({ ...p, price: parseNumberInput(p.price), qty: parseNumberInput(p.qty) }));
  return { payload: { packOptions } };
}

export default GroceryRetailExtras;
