import React from 'react';
import type { Category } from '@/types';
import AddProductModalShell from './AddProductModalShell';
import HomeTextilesExtras, { buildHomeTextilesExtrasPayload } from './activities/HomeTextilesExtras';
import { useTranslation } from 'react-i18next';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const HomeTextilesAddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const { t } = useTranslation();
  const [unit, setUnit] = React.useState('');

  return (
    <AddProductModalShell
      isOpen={isOpen}
      onClose={onClose}
      shopId={shopId}
      isRestaurant={false}
      isFashion={false}
      allowExtraImages={true}
      title={t('business.products.addHomeTextilesItem')}
      shopCategory={shopCategory}
      renderExtras={() => <HomeTextilesExtras unit={unit} setUnit={setUnit} />}
      buildExtrasPayload={() => {
        const { payload } = buildHomeTextilesExtrasPayload({ unit });
        return { payload, resolvedBasePrice: undefined };
      }}
    />
  );
};

export default HomeTextilesAddProductModal;
