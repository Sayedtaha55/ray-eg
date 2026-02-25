import React from 'react';
import RestaurantMenuSection, { type RestaurantMenuVariantItem } from '../../AddProduct/RestaurantMenuSection';

type Props = {
  menuVariantItems: RestaurantMenuVariantItem[];
  setMenuVariantItems: React.Dispatch<React.SetStateAction<RestaurantMenuVariantItem[]>>;
  parseNumberInput: (v: any) => number;
};

const RestaurantExtras: React.FC<Props> = ({ menuVariantItems, setMenuVariantItems, parseNumberInput }) => {
  return (
    <RestaurantMenuSection
      menuVariantItems={menuVariantItems}
      setMenuVariantItems={setMenuVariantItems}
      parseNumberInput={parseNumberInput}
    />
  );
};

export function buildRestaurantExtrasPayload(args: {
  menuVariantItems: Props['menuVariantItems'];
  parseNumberInput: (v: any) => number;
}) {
  const { menuVariantItems, parseNumberInput } = args;

  const menuVariants = (() => {
    const list = Array.isArray(menuVariantItems) ? menuVariantItems : [];
    if (list.length === 0) return undefined;
    const mapped = list
      .map((t) => {
        const tid = String(t?.id || '').trim();
        const tname = String(t?.name || '').trim();
        if (!tid || !tname) return null;
        const sizes: Array<{ id: string; label: string; price: number }> = [];

        if (t?.hasSmall) {
          const ps = parseNumberInput(t.priceSmall);
          if (!Number.isFinite(ps) || ps <= 0) return null;
          sizes.push({ id: 'small', label: 'صغير', price: ps });
        }
        if (t?.hasMedium) {
          const pm = parseNumberInput(t.priceMedium);
          if (!Number.isFinite(pm) || pm <= 0) return null;
          sizes.push({ id: 'medium', label: 'وسط', price: pm });
        }
        if (t?.hasLarge) {
          const pl = parseNumberInput(t.priceLarge);
          if (!Number.isFinite(pl) || pl <= 0) return null;
          sizes.push({ id: 'large', label: 'كبير', price: pl });
        }

        if (sizes.length === 0) return null;
        return { id: tid, name: tname, sizes };
      })
      .filter(Boolean);

    return mapped.length !== list.length ? '__INVALID__' : mapped;
  })();

  if (menuVariants === '__INVALID__') {
    throw new Error('يرجى إدخال النوع والسعر للمقاسات المتاحة');
  }

  return { payload: { menuVariants } };
}

export default RestaurantExtras;
