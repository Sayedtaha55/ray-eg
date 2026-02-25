import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';
import FashionExtras, { buildFashionExtrasPayload } from './activities/FashionExtras';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const FashionAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const [selectedColors, setSelectedColors] = React.useState<Array<{ name: string; value: string }>>([]);
  const [customColor, setCustomColor] = React.useState('#000000');
  const [fashionSizeItems, setFashionSizeItems] = React.useState<Array<{ label: string; price: string }>>([]);
  const [customSize, setCustomSize] = React.useState('');

  return (
    <AddProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      shopId={shopId}
      isRestaurant={false}
      isFashion={true}
      allowExtraImages={true}
      title="إضافة صنف (ملابس)"
      fashionSizeItems={fashionSizeItems}
      renderExtras={() => (
        <FashionExtras
          selectedColors={selectedColors}
          setSelectedColors={setSelectedColors}
          customColor={customColor}
          setCustomColor={setCustomColor}
          fashionSizeItems={fashionSizeItems}
          setFashionSizeItems={setFashionSizeItems}
          customSize={customSize}
          setCustomSize={setCustomSize}
        />
      )}
      buildExtrasPayload={({ parseNumberInput, basePrice }) =>
        buildFashionExtrasPayload({
          selectedColors,
          fashionSizeItems,
          parseNumberInput,
          basePrice,
        })
      }
    />
  );
};

export default FashionAddProductModal;
