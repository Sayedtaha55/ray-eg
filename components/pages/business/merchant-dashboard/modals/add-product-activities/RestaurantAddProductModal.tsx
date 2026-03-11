import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';
import RestaurantExtras, { buildRestaurantExtrasPayload } from './activities/RestaurantExtras';
import type { RestaurantMenuVariantItem } from '../AddProduct/RestaurantMenuSection';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const RestaurantAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const [menuVariantItems, setMenuVariantItems] = React.useState<RestaurantMenuVariantItem[]>([]);
  const [restaurantBaseSizesEnabled, setRestaurantBaseSizesEnabled] = React.useState(false);
  const [restaurantPriceSmall, setRestaurantPriceSmall] = React.useState('');
  const [restaurantPriceMedium, setRestaurantPriceMedium] = React.useState('');
  const [restaurantPriceLarge, setRestaurantPriceLarge] = React.useState('');
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageUploadFile, setImageUploadFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setMenuVariantItems([]);
    setRestaurantBaseSizesEnabled(false);
    setRestaurantPriceSmall('');
    setRestaurantPriceMedium('');
    setRestaurantPriceLarge('');
    setImagePreview(null);
    setImageUploadFile(null);
    onClose();
  };

  return (
    <AddProductModalShell
      isOpen={isOpen}
      onClose={handleClose}
      shopId={shopId}
      isRestaurant={true}
      isFashion={false}
      allowExtraImages={false}
      title="إضافة صنف (مطعم)"
      shopCategory={shopCategory}
      renderExtras={({ parseNumberInput }) => (
        <RestaurantExtras
          menuVariantItems={menuVariantItems}
          setMenuVariantItems={setMenuVariantItems}
          parseNumberInput={parseNumberInput}
        />
      )}
      buildExtrasPayload={({ parseNumberInput, basePrice }) => {
        const { payload } = buildRestaurantExtrasPayload({ menuVariantItems, parseNumberInput });
        return { payload, resolvedBasePrice: basePrice };
      }}
      restaurantBaseSizesEnabled={restaurantBaseSizesEnabled}
      setRestaurantBaseSizesEnabled={setRestaurantBaseSizesEnabled}
      restaurantPriceSmall={restaurantPriceSmall}
      setRestaurantPriceSmall={setRestaurantPriceSmall}
      restaurantPriceMedium={restaurantPriceMedium}
      setRestaurantPriceMedium={setRestaurantPriceMedium}
      restaurantPriceLarge={restaurantPriceLarge}
      setRestaurantPriceLarge={setRestaurantPriceLarge}
    />
  );
};

export default RestaurantAddProductModal;
