import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';
import GroceryRetailExtras, { buildGroceryRetailExtrasPayload } from './activities/GroceryRetailExtras';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const GroceryRetailAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const [packOptionItems, setPackOptionItems] = React.useState<Array<{ id: string; qty: string; price: string }>>([]);
  const [unit, setUnit] = React.useState('');

  return (
    <AddProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      shopId={shopId}
      isRestaurant={false}
      isFashion={false}
      allowExtraImages={true}
      title="إضافة صنف (سوبرماركت/تجزئة)"
      renderExtras={({ parseNumberInput }) => (
        <GroceryRetailExtras
          packOptionItems={packOptionItems}
          setPackOptionItems={setPackOptionItems}
          unit={unit}
          parseNumberInput={parseNumberInput}
        />
      )}
      buildExtrasPayload={({ parseNumberInput, basePrice }) => {
        const { payload } = buildGroceryRetailExtrasPayload({ packOptionItems, parseNumberInput });
        return {
          payload: {
            ...(payload || {}),
            unit: unit ? String(unit).trim() : null,
          },
          resolvedBasePrice: basePrice,
        };
      }}
    />
  );
};

export default GroceryRetailAddProductModal;
