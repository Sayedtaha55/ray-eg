
export enum Category {
  RETAIL = 'RETAIL',
  RESTAURANT = 'RESTAURANT',
  SERVICE = 'SERVICE',
  ELECTRONICS = 'ELECTRONICS',
  FASHION = 'FASHION',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  OTHER = 'OTHER',
}

export interface ShopDesign {
  primaryColor: string;
  secondaryColor?: string;
  layout: 'minimal' | 'modern' | 'bold';
  bannerUrl: string;
  bannerPosterUrl?: string;
  headerType: 'centered' | 'side';
  headerBackgroundColor?: string;
  headerBackgroundImageUrl?: string;
  headerTextColor?: string;
  headerTransparent?: boolean;
  headerOpacity?: number;
  pageBackgroundColor?: string;
  backgroundImageUrl?: string;
  productDisplay?: 'cards' | 'list' | 'minimal';
  backgroundColor?: string;
  productDisplayStyle?: 'grid' | 'list';
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerTransparent?: boolean;
  footerOpacity?: number;
  elementsVisibility?: Record<string, boolean>;
  productEditorVisibility?: Record<string, boolean>;
  customCss?: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  category: Category;
  governorate: string;
  city: string;
  logoUrl: string;
  rating: number;
  pageDesign: ShopDesign;
  followers: number; 
  visitors: number;
  status: 'approved' | 'pending' | 'rejected' | 'suspended';
  isActive?: boolean;
  // تفاصيل إضافية للتواصل والمواعيد
  phone?: string;
  openingHours?: string;
  addressDetailed?: string;
  displayAddress?: string;
  mapLabel?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationSource?: string;
  locationAccuracy?: number | null;
  locationUpdatedAt?: string;
  addons?: any;
}

export interface Offer {
  id: string;
  shopId: string;
  productId: string;
  shopName: string;
  shopLogo: string;
  title: string;
  description: string;
  discount: number;
  oldPrice: number;
  newPrice: number;
  variantPricing?: any;
  imageUrl: string;
  category: Category;
  expiresIn: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive?: boolean;
  description?: string | null;
  category?: string;
  unit?: string;
  packOptions?: any;
  trackStock?: boolean;
  images?: any;
  colors?: any;
  sizes?: any;
  addons?: any;
  menuVariants?: any;
}

export interface Reservation {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  itemPrice: number;
  shopId: string;
  shopName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: number;
}

export interface ShopGallery {
  id: string;
  shopId: string;
  imageUrl: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  thumbUrl?: string;
  mediumUrl?: string;
  caption?: string;
  createdAt: number;
}
