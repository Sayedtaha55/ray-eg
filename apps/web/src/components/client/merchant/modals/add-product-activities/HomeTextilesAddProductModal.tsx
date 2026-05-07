'use client';

import React from 'react';
import AddProductModalShell from './AddProductModalShell';
import HomeTextilesExtras, { buildHomeTextilesExtrasPayload } from './activities/HomeTextilesExtras';
import { useT } from '@/i18n/useT';

type Props = { isOpen: boolean; onClose: () => void; shopId: string; shopCategory?: any };

const HomeTextilesAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const t = useT();
  const [unit, setUnit] = React.useState('');

  return (
    <AddProductModalShell isOpen={isOpen} onClose={onClose} shopId={shopId} isRestaurant={false} isFashion={false} allowExtraImages={true} title={t('business.products.addHomeTextilesItem', 'إضافة منتج مفروشات')} shopCategory={shopCategory}
      renderExtras={() => <HomeTextilesExtras unit={unit} setUnit={setUnit} />}
      buildExtrasPayload={() => { const { payload } = buildHomeTextilesExtrasPayload({ unit }); return { payload, resolvedBasePrice: undefined }; }}
    />
  );
};

export default HomeTextilesAddProductModal;
