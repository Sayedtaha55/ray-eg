'use client';

import React from 'react';
import AddProductModalShell from './AddProductModalShell';
import FashionExtras, { buildFashionExtrasPayload } from './activities/FashionExtras';
import { useT } from '@/i18n/useT';

type Props = { isOpen: boolean; onClose: () => void; shopId: string; shopCategory?: any };

const FashionAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const t = useT();
  const [selectedColors, setSelectedColors] = React.useState<Array<{ name: string; value: string }>>([]);
  const [customColor, setCustomColor] = React.useState('#000000');
  const [fashionSizeItems, setFashionSizeItems] = React.useState<Array<{ label: string; price: string }>>([]);
  const [customSize, setCustomSize] = React.useState('');

  return (
    <AddProductModalShell isOpen={isOpen} onClose={onClose} shopId={shopId} isRestaurant={false} isFashion={true} allowExtraImages={true} title={t('business.products.addFashionItem', 'إضافة قطعة ملابس')} shopCategory={shopCategory} fashionSizeItems={fashionSizeItems}
      renderExtras={() => <FashionExtras selectedColors={selectedColors} setSelectedColors={setSelectedColors} customColor={customColor} setCustomColor={setCustomColor} fashionSizeItems={fashionSizeItems} setFashionSizeItems={setFashionSizeItems} customSize={customSize} setCustomSize={setCustomSize} />}
      buildExtrasPayload={({ parseNumberInput, basePrice }) => buildFashionExtrasPayload({ selectedColors, fashionSizeItems, parseNumberInput, basePrice, t })}
    />
  );
};

export default FashionAddProductModal;
