'use client';

import React from 'react';
import AddProductModalShell from './AddProductModalShell';
import RestaurantExtras, { buildRestaurantExtrasPayload } from './activities/RestaurantExtras';
import type { RestaurantMenuVariantItem } from '../AddProduct/RestaurantMenuSection';
import { useT } from '@/i18n/useT';

type Props = { isOpen: boolean; onClose: () => void; shopId: string; shopCategory?: any };

const RestaurantAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const t = useT();
  const [menuVariantItems, setMenuVariantItems] = React.useState<RestaurantMenuVariantItem[]>([]);
  const [restaurantBaseSizesEnabled, setRestaurantBaseSizesEnabled] = React.useState(false);
  const [restaurantPriceSmall, setRestaurantPriceSmall] = React.useState('');
  const [restaurantPriceMedium, setRestaurantPriceMedium] = React.useState('');
  const [restaurantPriceLarge, setRestaurantPriceLarge] = React.useState('');

  const handleClose = () => { setMenuVariantItems([]); setRestaurantBaseSizesEnabled(false); setRestaurantPriceSmall(''); setRestaurantPriceMedium(''); setRestaurantPriceLarge(''); onClose(); };

  return (
    <AddProductModalShell isOpen={isOpen} onClose={handleClose} shopId={shopId} isRestaurant={true} isFashion={false} allowExtraImages={false} title={t('business.products.addRestaurantItem', 'إضافة طبق')} shopCategory={shopCategory}
      renderExtras={({ parseNumberInput }) => <RestaurantExtras menuVariantItems={menuVariantItems} setMenuVariantItems={setMenuVariantItems} parseNumberInput={parseNumberInput} />}
      buildExtrasPayload={({ parseNumberInput, basePrice }) => { const { payload } = buildRestaurantExtrasPayload({ menuVariantItems, parseNumberInput, t }); return { payload, resolvedBasePrice: basePrice }; }}
      restaurantBaseSizesEnabled={restaurantBaseSizesEnabled} setRestaurantBaseSizesEnabled={setRestaurantBaseSizesEnabled} restaurantPriceSmall={restaurantPriceSmall} setRestaurantPriceSmall={setRestaurantPriceSmall} restaurantPriceMedium={restaurantPriceMedium} setRestaurantPriceMedium={setRestaurantPriceMedium} restaurantPriceLarge={restaurantPriceLarge} setRestaurantPriceLarge={setRestaurantPriceLarge}
    />
  );
};

export default RestaurantAddProductModal;
