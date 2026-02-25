import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';
import FurnitureExtras, { buildFurnitureExtrasPayload } from './activities/FurnitureExtras';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const FurnitureAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const [unit, setUnit] = React.useState('');
  const [furnitureUnit, setFurnitureUnit] = React.useState('');
  const [furnitureLengthCm, setFurnitureLengthCm] = React.useState('');
  const [furnitureWidthCm, setFurnitureWidthCm] = React.useState('');
  const [furnitureHeightCm, setFurnitureHeightCm] = React.useState('');

  return (
    <AddProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      shopId={shopId}
      isRestaurant={false}
      isFashion={false}
      allowExtraImages={true}
      title="إضافة صنف (أثاث)"
      renderExtras={({ parseNumberInput }) => (
        <FurnitureExtras
          furnitureUnit={furnitureUnit}
          setFurnitureUnit={setFurnitureUnit}
          furnitureLengthCm={furnitureLengthCm}
          setFurnitureLengthCm={setFurnitureLengthCm}
          furnitureWidthCm={furnitureWidthCm}
          setFurnitureWidthCm={setFurnitureWidthCm}
          furnitureHeightCm={furnitureHeightCm}
          setFurnitureHeightCm={setFurnitureHeightCm}
          unit={unit}
          parseNumberInput={parseNumberInput}
        />
      )}
      buildExtrasPayload={({ parseNumberInput, basePrice }) => {
        const { payload } = buildFurnitureExtrasPayload({
          furnitureUnit,
          unit,
          furnitureLengthCm,
          furnitureWidthCm,
          furnitureHeightCm,
          parseNumberInput,
        });
        return { payload, resolvedBasePrice: basePrice };
      }}
    />
  );
};

export default FurnitureAddProductModal;
