import React from 'react';
import { Category } from '@/types';

import DefaultAddProductModal from './DefaultAddProductModal';
import FashionAddProductModal from './FashionAddProductModal';
import FurnitureAddProductModal from './FurnitureAddProductModal';
import GroceryRetailAddProductModal from './GroceryRetailAddProductModal';
import RestaurantAddProductModal from './RestaurantAddProductModal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const AddProductModalRouter: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const shopCategoryUpper = (() => {
    const raw: any = shopCategory;
    if (typeof raw === 'string') return raw.trim().toUpperCase();
    if (raw && typeof raw === 'object') {
      const v = raw.name ?? raw.slug ?? raw.id ?? raw.value;
      return String(v || '').trim().toUpperCase();
    }
    return String(raw || '').trim().toUpperCase();
  })();
  const devActivityId = (() => {
    try {
      return String(localStorage.getItem('ray_dev_activity_id') || '').trim();
    } catch {
      return '';
    }
  })();

  if (shopCategoryUpper === 'RESTAURANT') {
    return <RestaurantAddProductModal isOpen={isOpen} onClose={onClose} shopId={shopId} shopCategory={shopCategory} />;
  }

  if (shopCategoryUpper === 'FASHION') {
    return <FashionAddProductModal isOpen={isOpen} onClose={onClose} shopId={shopId} shopCategory={shopCategory} />;
  }

  if (shopCategoryUpper === 'FOOD' || shopCategoryUpper === 'RETAIL') {
    return <GroceryRetailAddProductModal isOpen={isOpen} onClose={onClose} shopId={shopId} shopCategory={shopCategory} />;
  }

  if (shopCategoryUpper === 'FURNITURE' || (shopCategoryUpper === 'FURNITURE' && devActivityId === 'furniture')) {
    return <FurnitureAddProductModal isOpen={isOpen} onClose={onClose} shopId={shopId} shopCategory={shopCategory} />;
  }

  return <DefaultAddProductModal isOpen={isOpen} onClose={onClose} shopId={shopId} shopCategory={shopCategory} />;
};

export default AddProductModalRouter;
