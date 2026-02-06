import { Category } from '@/types';

export type MerchantDashboardTabId =
  | 'overview'
  | 'products'
  | 'reservations'
  | 'sales'
  | 'promotions'
  | 'reports'
  | 'customers'
  | 'gallery'
  | 'pos'
  | 'builder'
  | 'settings';

export type MerchantDashboardTabDefinition = {
  id: MerchantDashboardTabId;
  label: string;
  icon?: string;
  visibleFor?: Category[];
  disabled?: boolean;
};

export type MerchantDashboardActivityConfig = {
  id: string;
  category: Category;
  tabs: MerchantDashboardTabDefinition[];
  defaultTab: MerchantDashboardTabId;
  features: {
    showReservations: boolean;
    showMenuBuilder: boolean;
    showFashionSizes: boolean;
    showPOS: boolean;
    showAnalytics: boolean;
  };
};
