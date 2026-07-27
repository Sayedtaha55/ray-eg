import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';
import GroceryRetailExtras, { buildGroceryRetailExtrasPayload } from './activities/GroceryRetailExtras';
import { useTranslation } from 'react-i18next';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const GroceryRetailAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const { t } = useTranslation();
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
      title={t('business.products.addGroceryItem')}
      shopCategory={shopCategory}
      renderExtras={({ parseNumberInput, groceryPackEnabled }) => (
        <GroceryRetailExtras
          packOptionItems={packOptionItems}
          setPackOptionItems={setPackOptionItems}
          unit={unit}
          setUnit={setUnit}
          parseNumberInput={parseNumberInput}
          packEnabled={Boolean(groceryPackEnabled)}
        />
      )}
      buildExtrasPayload={({ parseNumberInput, basePrice }) => {
        const { payload } = buildGroceryRetailExtrasPayload({ packOptionItems, unit, parseNumberInput });
        const packList = Array.isArray((payload as any)?.packOptions) ? ((payload as any).packOptions as any[]) : [];
        const firstPack = packList.length > 0 ? packList[0] : null;
        const firstPackPrice = firstPack ? parseNumberInput((firstPack as any)?.price) : NaN;
        return {
          payload: {
            ...(payload || {}),
            unit: unit ? String(unit).trim() : null,
          },
          resolvedBasePrice: Number.isFinite(firstPackPrice) && firstPackPrice > 0 ? firstPackPrice : basePrice,
        };
      }}
    />
  );
};

export default GroceryRetailAddProductModal;
