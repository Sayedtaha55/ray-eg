import React, { lazy } from 'react';
import type { MerchantDashboardTabId } from '../../pages/business/merchant-dashboard/dashboardTabs';
import type { TabRenderer } from './salesTabs';

const ProductsTab = lazy(() => import('../../modules/inventory/pages/ProductsTab'));
const CategoriesPage = lazy(() => import('../../modules/inventory/pages/categories/CategoriesPage'));
const VariantsPage = lazy(() => import('../../modules/inventory/pages/variants/VariantsPage'));
const WarehousesPage = lazy(() => import('../../modules/inventory/pages/warehouses/WarehousesPage'));
const StocktakePage = lazy(() => import('../../modules/inventory/pages/stocktake/StocktakePage'));
const SuppliersPage = lazy(() => import('../../modules/inventory/pages/suppliers/SuppliersPage'));
const PurchaseOrdersPage = lazy(() => import('../../modules/inventory/pages/purchaseOrders/PurchaseOrdersPage'));
const TransfersPage = lazy(() => import('../../modules/inventory/pages/transfers/TransfersPage'));
const BarcodePage = lazy(() => import('../../modules/inventory/pages/barcode/BarcodePage'));
const QrCodePage = lazy(() => import('../../modules/inventory/pages/qrCode/QrCodePage'));
const StockTrackingPage = lazy(() => import('../../modules/inventory/pages/stockTracking/StockTrackingPage'));
const LowStockAlertsPage = lazy(() => import('../../modules/inventory/pages/lowStockAlerts/LowStockAlertsPage'));

export const inventoryTabRenderers: Partial<Record<MerchantDashboardTabId, TabRenderer>> = {
  products: ({ shop, shopId, sales }) => (
    <ProductsTab
      products={sales}
      onAdd={() => {}}
      onDelete={() => {}}
      onUpdate={() => {}}
      shopId={shopId}
      shopCategory={shop?.category}
      shop={shop}
    />
  ),
  categories: ({ shopId, shop }) => <CategoriesPage shopId={shopId} shop={shop} />,
  variants: ({ shopId, shop }) => <VariantsPage shopId={shopId} shop={shop} />,
  warehouses: ({ shopId, shop }) => <WarehousesPage shopId={shopId} shop={shop} />,
  stocktake: ({ shopId, shop }) => <StocktakePage shopId={shopId} shop={shop} />,
  suppliers: ({ shopId, shop }) => <SuppliersPage shopId={shopId} shop={shop} />,
  purchaseOrders: ({ shopId, shop }) => <PurchaseOrdersPage shopId={shopId} shop={shop} />,
  transfers: ({ shopId, shop }) => <TransfersPage shopId={shopId} shop={shop} />,
  barcode: ({ shopId, shop }) => <BarcodePage shopId={shopId} shop={shop} />,
  qrCode: ({ shopId, shop }) => <QrCodePage shopId={shopId} shop={shop} />,
  stockTracking: ({ shopId, shop }) => <StockTrackingPage shopId={shopId} shop={shop} />,
  lowStockAlerts: ({ shopId, shop }) => <LowStockAlertsPage shopId={shopId} shop={shop} />,
};
