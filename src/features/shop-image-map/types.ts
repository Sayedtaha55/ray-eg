export type ShopImageMapSection = {
  id: string;
  name: string;
  sortOrder?: number;
};

export type ShopImageMapHotspot = {
  id: string;
  x: number;
  y: number;
  width?: number | null;
  height?: number | null;
  label?: string | null;
  sortOrder?: number;
  priceOverride?: number | null;
  productId?: string | null;
  sectionId?: string | null;
  product?: any | null;
  section?: any | null;
};

export type ShopImageMap = {
  id: string;
  shopId: string;
  title?: string | null;
  imageUrl: string;
  width?: number | null;
  height?: number | null;
  isActive?: boolean;
  sections?: ShopImageMapSection[];
  hotspots?: ShopImageMapHotspot[];
};

export type ActiveShopImageMapResponse = {
  shop: any;
  map: ShopImageMap | null;
};
