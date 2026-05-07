'use client';

import React from 'react';
import RestaurantMenuSection, { type RestaurantMenuVariantItem } from '../../AddProduct/RestaurantMenuSection';

type Props = { menuVariantItems: RestaurantMenuVariantItem[]; setMenuVariantItems: React.Dispatch<React.SetStateAction<RestaurantMenuVariantItem[]>>; parseNumberInput: (v: any) => number; };

const RestaurantExtras: React.FC<Props> = ({ menuVariantItems, setMenuVariantItems, parseNumberInput }) => {
  return <RestaurantMenuSection menuVariantItems={menuVariantItems} setMenuVariantItems={setMenuVariantItems} parseNumberInput={parseNumberInput} />;
};

export function buildRestaurantExtrasPayload(args: { menuVariantItems: Props['menuVariantItems']; parseNumberInput: (v: any) => number; t: (key: string, fallback?: string) => string; }) {
  const { menuVariantItems, parseNumberInput, t } = args;
  const menuVariants = (() => { const list = Array.isArray(menuVariantItems) ? menuVariantItems : []; if (list.length === 0) return undefined; const mapped = list.map(variant => { const tid = String(variant?.id || '').trim(); const tname = String(variant?.name || '').trim(); if (!tid || !tname) return null; const sizes: Array<{ id: string; label: string; price: number }> = []; if (variant?.hasSmall) { const ps = parseNumberInput(variant.priceSmall); if (!Number.isFinite(ps) || ps <= 0) return null; sizes.push({ id: 'small', label: t('business.dashboard.products.sizeSmall', 'صغير'), price: ps }); } if (variant?.hasMedium) { const pm = parseNumberInput(variant.priceMedium); if (!Number.isFinite(pm) || pm <= 0) return null; sizes.push({ id: 'medium', label: t('business.dashboard.products.sizeMedium', 'وسط'), price: pm }); } if (variant?.hasLarge) { const pl = parseNumberInput(variant.priceLarge); if (!Number.isFinite(pl) || pl <= 0) return null; sizes.push({ id: 'large', label: t('business.dashboard.products.sizeLarge', 'كبير'), price: pl }); } if (sizes.length === 0) return null; return { id: tid, name: tname, sizes }; }).filter(Boolean); return mapped.length !== list.length ? '__INVALID__' : mapped; })();
  if (menuVariants === '__INVALID__') throw new Error(t('business.products.enterValidVariantSizePrice', 'أدخل أسعار أحجام صحيحة'));
  return { payload: { menuVariants } };
}

export default RestaurantExtras;
