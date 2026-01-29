import { toBackendUrl } from './httpClient';

export function normalizeUserFromBackend(user: any) {
  return {
    ...user,
    role: String(user?.role || '').toLowerCase(),
  };
}

export function normalizeShopFromBackend(shop: any) {
  if (!shop) return shop;
  const logoUrl = shop.logoUrl ?? shop.logo_url;
  const bannerUrl = shop.bannerUrl ?? shop.banner_url;
  const paymentConfig =
    shop.paymentConfig ??
    shop.payment_config ??
    (shop.layoutConfig && typeof shop.layoutConfig === 'object' ? (shop.layoutConfig as any).paymentConfig : undefined);
  const displayAddress = shop.displayAddress ?? shop.display_address;
  const mapLabel = shop.mapLabel ?? shop.map_label;
  const locationSource = shop.locationSource ?? shop.location_source;
  const locationAccuracy = shop.locationAccuracy ?? shop.location_accuracy;
  const locationUpdatedAt = shop.locationUpdatedAt ?? shop.location_updated_at;
  const status = String(shop.status || '').toLowerCase();
  const rawPageDesign = shop.pageDesign || shop.page_design || shop.pageDesign || null;
  const normalizedPageDesign = (() => {
    if (!rawPageDesign || typeof rawPageDesign !== 'object') return rawPageDesign;
    const d: any = { ...(rawPageDesign as any) };
    if (typeof d.bannerUrl === 'string') d.bannerUrl = toBackendUrl(d.bannerUrl);
    if (typeof d.bannerPosterUrl === 'string') d.bannerPosterUrl = toBackendUrl(d.bannerPosterUrl);
    if (typeof d.backgroundImageUrl === 'string') d.backgroundImageUrl = toBackendUrl(d.backgroundImageUrl);
    if (typeof d.headerBackgroundImageUrl === 'string') d.headerBackgroundImageUrl = toBackendUrl(d.headerBackgroundImageUrl);
    return d;
  })();

  return {
    ...shop,
    status,
    logoUrl,
    bannerUrl,
    paymentConfig,
    displayAddress,
    mapLabel,
    locationSource,
    locationAccuracy,
    locationUpdatedAt,
    // legacy snake_case for current UI
    logo_url: shop.logo_url ?? logoUrl,
    banner_url: shop.banner_url ?? bannerUrl,
    display_address: shop.display_address ?? displayAddress,
    map_label: shop.map_label ?? mapLabel,
    location_source: shop.location_source ?? locationSource,
    location_accuracy: shop.location_accuracy ?? locationAccuracy,
    location_updated_at: shop.location_updated_at ?? locationUpdatedAt,
    pageDesign: normalizedPageDesign,
  };
}

export function normalizeProductFromBackend(product: any) {
  if (!product) return product;
  const imageUrl = product.imageUrl ?? product.image_url ?? product.image ?? '';
  const shopId = product.shopId ?? product.shop_id;
  return {
    ...product,
    imageUrl,
    image_url: product.image_url ?? imageUrl,
    shopId,
    shop_id: product.shop_id ?? shopId,
    stock: typeof product.stock === 'number' ? product.stock : Number(product.stock || 0),
    price: typeof product.price === 'number' ? product.price : Number(product.price || 0),
  };
}

export function normalizeOrderFromBackend(order: any) {
  if (!order) return order;
  const createdAt = order.createdAt ?? order.created_at;
  const shopId = order.shopId ?? order.shop_id;
  return {
    ...order,
    createdAt,
    created_at: order.created_at ?? createdAt,
    shopId,
    shop_id: order.shop_id ?? shopId,
    total: typeof order.total === 'number' ? order.total : Number(order.total || 0),
  };
}
