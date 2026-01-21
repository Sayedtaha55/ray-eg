import React from 'react';
import { ShopGallery } from '@/types';
import GalleryManager from '../../GalleryManager';

type Props = {
  images: ShopGallery[];
  onImagesChange: (images: ShopGallery[]) => void;
  shopId: string;
  primaryColor: string;
};

const GalleryTab: React.FC<Props> = ({ images, onImagesChange, shopId, primaryColor }) => {
  return <GalleryManager shopId={shopId} images={images} onImagesChange={onImagesChange} primaryColor={primaryColor} />;
};

export default GalleryTab;
