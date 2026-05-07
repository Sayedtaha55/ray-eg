'use client';

import React from 'react';
import AddProductModalShell from './AddProductModalShell';
import { useT } from '@/i18n/useT';

type Props = { isOpen: boolean; onClose: () => void; shopId: string; shopCategory?: any };

const HomeGoodsAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const t = useT();
  return <AddProductModalShell isOpen={isOpen} onClose={onClose} shopId={shopId} isRestaurant={false} isFashion={false} allowExtraImages={true} title={t('business.products.addHomeGoodsItem', 'إضافة منتج منزلي')} shopCategory={shopCategory} />;
};

export default HomeGoodsAddProductModal;
