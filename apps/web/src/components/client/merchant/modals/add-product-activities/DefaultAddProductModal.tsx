'use client';

import React from 'react';
import AddProductModalShell from './AddProductModalShell';
import FurnitureExtras, { buildFurnitureExtrasPayload } from './activities/FurnitureExtras';
import { useT } from '@/i18n/useT';

type Props = { isOpen: boolean; onClose: () => void; shopId: string; shopCategory?: any };

const DefaultAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const t = useT();
  const devActivityId = (() => { try { return String(localStorage.getItem('ray_dev_activity_id') || '').trim(); } catch { return ''; } })();
  const shouldShowFurniture = devActivityId === 'furniture';
  const [unit, setUnit] = React.useState('');
  const [furnitureUnit, setFurnitureUnit] = React.useState('');
  const [furnitureLengthCm, setFurnitureLengthCm] = React.useState('');
  const [furnitureWidthCm, setFurnitureWidthCm] = React.useState('');
  const [furnitureHeightCm, setFurnitureHeightCm] = React.useState('');

  return (
    <AddProductModalShell isOpen={isOpen} onClose={onClose} shopId={shopId} isRestaurant={false} isFashion={false} allowExtraImages={true} title={shouldShowFurniture ? t('business.products.addFurnitureItem', 'إضافة قطعة أثاث') : t('business.products.addDefaultItem', 'إضافة منتج')} shopCategory={shopCategory}
      renderExtras={shouldShowFurniture ? ({ parseNumberInput }) => <FurnitureExtras furnitureUnit={furnitureUnit} setFurnitureUnit={setFurnitureUnit} furnitureLengthCm={furnitureLengthCm} setFurnitureLengthCm={setFurnitureLengthCm} furnitureWidthCm={furnitureWidthCm} setFurnitureWidthCm={setFurnitureWidthCm} furnitureHeightCm={furnitureHeightCm} setFurnitureHeightCm={setFurnitureHeightCm} unit={unit} parseNumberInput={parseNumberInput} /> : undefined}
      buildExtrasPayload={shouldShowFurniture ? ({ parseNumberInput, basePrice }) => { const { payload } = buildFurnitureExtrasPayload({ furnitureUnit, unit, furnitureLengthCm, furnitureWidthCm, furnitureHeightCm, parseNumberInput }); return { payload, resolvedBasePrice: basePrice }; } : undefined}
    />
  );
};

export default DefaultAddProductModal;
