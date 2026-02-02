import { toBackendUrl } from './httpClient';

export function normalizeUserFromBackend(user: any) {
  return {
    ...user,
    role: String(user?.role || '').toLowerCase(),
  };
}

export function normalizeShopFromBackend(shop: any) {
  if (!shop) return shop;
  const logoUrlRaw = shop.logoUrl ?? shop.logo_url;
  const bannerUrlRaw = shop.bannerUrl ?? shop.banner_url;
  const logoUrl = typeof logoUrlRaw === 'string' ? toBackendUrl(logoUrlRaw) : logoUrlRaw;
  const bannerUrl = typeof bannerUrlRaw === 'string' ? toBackendUrl(bannerUrlRaw) : bannerUrlRaw;
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

  const addonsRaw = shop.addons;
  const addons = Array.isArray(addonsRaw)
    ? addonsRaw.map((g: any) => {
        const options = Array.isArray(g?.options)
          ? g.options.map((o: any) => {
              const img = o?.imageUrl ?? o?.image_url;
              const imageUrl2 = typeof img === 'string' ? toBackendUrl(img) : img;
              return {
                ...o,
                imageUrl: imageUrl2,
                image_url: o?.image_url ?? imageUrl2,
              };
            })
          : g?.options;
        return { ...g, options };
      })
    : addonsRaw;

  return {
    ...shop,
    status,
    logoUrl,
    bannerUrl,
    addons,
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
  const imageUrlRaw = product.imageUrl ?? product.image_url ?? product.image ?? '';
  const imageUrl = typeof imageUrlRaw === 'string' ? toBackendUrl(imageUrlRaw) : imageUrlRaw;
  const shopId = product.shopId ?? product.shop_id;
  const isActiveRaw = product.isActive ?? product.is_active;
  const isActive = typeof isActiveRaw === 'boolean' ? isActiveRaw : true;
  const trackStock = typeof product?.trackStock === 'boolean'
    ? product.trackStock
    : (typeof product?.track_stock === 'boolean' ? product.track_stock : undefined);

  const imagesRaw = product.images;
  const images = Array.isArray(imagesRaw)
    ? imagesRaw.map((u: any) => (typeof u === 'string' ? toBackendUrl(u) : u)).filter(Boolean)
    : imagesRaw;

  const addonsRaw = product.addons;
  const addons = Array.isArray(addonsRaw)
    ? addonsRaw.map((g: any) => {
        const options = Array.isArray(g?.options)
          ? g.options.map((o: any) => {
              const img = o?.imageUrl ?? o?.image_url;
              const imageUrl2 = typeof img === 'string' ? toBackendUrl(img) : img;
              return {
                ...o,
                imageUrl: imageUrl2,
                image_url: o?.image_url ?? imageUrl2,
              };
            })
          : g?.options;
        return { ...g, options };
      })
    : addonsRaw;

  const menuVariants = (product as any)?.menuVariants ?? (product as any)?.menu_variants;
  return {
    ...product,
    imageUrl,
    image_url: product.image_url ?? imageUrl,
    shopId,
    shop_id: product.shop_id ?? shopId,
    stock: typeof product.stock === 'number' ? product.stock : Number(product.stock || 0),
    price: typeof product.price === 'number' ? product.price : Number(product.price || 0),
    isActive,
    is_active: product.is_active ?? isActive,
    trackStock,
    track_stock: product.track_stock ?? trackStock,
    images,
    addons,
    menuVariants,
    menu_variants: (product as any)?.menu_variants ?? menuVariants,
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
