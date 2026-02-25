import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';
import RestaurantExtras, { buildRestaurantExtrasPayload } from './activities/RestaurantExtras';
import type { RestaurantMenuVariantItem } from '../AddProduct/RestaurantMenuSection';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const RestaurantAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const [menuVariantItems, setMenuVariantItems] = React.useState<
    RestaurantMenuVariantItem[]
  >([]);

  return (
    <AddProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      shopId={shopId}
      isRestaurant={true}
      isFashion={false}
      allowExtraImages={false}
      title="إضافة صنف (مطعم)"
      renderExtras={({ parseNumberInput }) => (
        <RestaurantExtras
          menuVariantItems={menuVariantItems}
          setMenuVariantItems={setMenuVariantItems}
          parseNumberInput={parseNumberInput}
        />
      )}
      buildExtrasPayload={({ parseNumberInput, basePrice }) => {
        const { payload } = buildRestaurantExtrasPayload({ menuVariantItems, parseNumberInput });
        return { payload, resolvedBasePrice: basePrice };
      }}
    />
  );
};

export default RestaurantAddProductModal;
