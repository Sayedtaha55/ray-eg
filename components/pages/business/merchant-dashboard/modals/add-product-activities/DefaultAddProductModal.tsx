import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const DefaultAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  return (
    <AddProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      shopId={shopId}
      isRestaurant={false}
      isFashion={false}
      allowExtraImages={true}
      title="إضافة صنف (عام)"
    />
  );
};

export default DefaultAddProductModal;
