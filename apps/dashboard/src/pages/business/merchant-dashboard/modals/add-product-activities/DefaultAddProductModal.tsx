import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';
import FurnitureExtras, { buildFurnitureExtrasPayload } from './activities/FurnitureExtras';
import { useTranslation } from 'react-i18next';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const DefaultAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const { t } = useTranslation();
  const devActivityId = (() => {
    try {
      return String(localStorage.getItem('ray_dev_activity_id') || '').trim();
    } catch {
      return '';
    }
  })();

  const shouldShowFurniture = devActivityId === 'furniture';

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
      title={shouldShowFurniture ? t('business.products.addFurnitureItem') : t('business.products.addDefaultItem')}
      shopCategory={shopCategory}
      renderExtras={
        shouldShowFurniture
          ? ({ parseNumberInput }) => (
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
            )
          : undefined
      }
      buildExtrasPayload={
        shouldShowFurniture
          ? ({ parseNumberInput, basePrice }) => {
              const { payload } = buildFurnitureExtrasPayload({
                furnitureUnit,
                unit,
                furnitureLengthCm,
                furnitureWidthCm,
                furnitureHeightCm,
                parseNumberInput,
              });
              return { payload, resolvedBasePrice: basePrice };
            }
          : undefined
      }
    />
  );
};

export default DefaultAddProductModal;
