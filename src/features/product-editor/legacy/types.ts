export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface SizeVariant {
  label: string;
  price: number;
  customValue?: number; // For numeric sizes like shoe sizes (36, 37, 42...) or pants
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock?: number;
  category: string;
  unit?: string;
  packOptions?: any;
  confidence: number;
  stockStatus: StockStatus;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  // Fashion-specific fields
  colors?: string[];
  sizes?: SizeVariant[];
}

export interface CartItem extends Product {
  quantity: number;
}

// New Interface for a specific area in the shop (e.g., "Medicine Aisle", "Cosmetics Shelf")
export interface StoreSection {
  id: string;
  name: string; // Name of this specific section
  image: string; // The image for this section
  products: Product[];
}

export interface Shop {
  id: string;
  name: string;
  type: string;
  coverImage: string; // Main image for dashboard thumbnail
  sections: StoreSection[]; // Array of multiple images/areas
}

export enum AppState {
  MALL_VIEW = 'MALL_VIEW',
  SCANNING = 'SCANNING',
  ANALYZING = 'ANALYZING',
  EDITOR_VIEW = 'EDITOR_VIEW',
  STORE_VIEW = 'STORE_VIEW',
}

export interface AnalysisResult {
  products: Product[];
  summary: string;
}
