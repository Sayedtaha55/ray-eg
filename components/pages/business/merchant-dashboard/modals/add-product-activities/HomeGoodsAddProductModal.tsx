import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';
import { useTranslation } from 'react-i18next';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const HomeGoodsAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const { t } = useTranslation();
  return (
    <AddProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      shopId={shopId}
      isRestaurant={false}
      isFashion={false}
      allowExtraImages={true}
      title={t('business.products.addHomeGoodsItem')}
      shopCategory={shopCategory}
    />
  );
};

export default HomeGoodsAddProductModal;
