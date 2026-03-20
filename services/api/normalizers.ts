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

  const rawLayoutConfig =
    (shop.layoutConfig && typeof shop.layoutConfig === 'object')
      ? shop.layoutConfig
      : (shop.layout_config && typeof shop.layout_config === 'object')
        ? shop.layout_config
        : null;

  const normalizedLayoutConfig = (() => {
    if (!rawLayoutConfig || typeof rawLayoutConfig !== 'object') return rawLayoutConfig;
    const c: any = { ...(rawLayoutConfig as any) };
    if (typeof c.enabledModules === 'undefined' && typeof c.enabled_modules !== 'undefined') {
      c.enabledModules = c.enabled_modules;
    }
    if (typeof c.enabled_modules === 'undefined' && typeof c.enabledModules !== 'undefined') {
      c.enabled_modules = c.enabledModules;
    }
    if (typeof c.dashboardMode === 'undefined' && typeof c.dashboard_mode !== 'undefined') {
      c.dashboardMode = c.dashboard_mode;
    }
    if (typeof c.dashboard_mode === 'undefined' && typeof c.dashboardMode !== 'undefined') {
      c.dashboard_mode = c.dashboardMode;
    }
    if (typeof c.customDomain === 'undefined' && typeof c.custom_domain !== 'undefined') {
      c.customDomain = c.custom_domain;
    }
    if (typeof c.custom_domain === 'undefined' && typeof c.customDomain !== 'undefined') {
      c.custom_domain = c.customDomain;
    }
    if (typeof c.whatsapp === 'undefined' && typeof c.whatsapp_number !== 'undefined') {
      c.whatsapp = c.whatsapp_number;
    }
    return c;
  })();

  const paymentConfig =
    shop.paymentConfig ??
    shop.payment_config ??
    (shop.layoutConfig && typeof shop.layoutConfig === 'object' ? (shop.layoutConfig as any).paymentConfig : undefined);
  const displayAddress = shop.displayAddress ?? shop.display_address;
  const mapLabel = shop.mapLabel ?? shop.map_label;
  const locationSource = shop.locationSource ?? shop.location_source;
  const locationAccuracy = shop.locationAccuracy ?? shop.location_accuracy;
  const locationUpdatedAt = shop.locationUpdatedAt ?? shop.location_updated_at;
  const publicDisabled = typeof shop.publicDisabled !== 'undefined'
    ? shop.publicDisabled
    : typeof shop.public_disabled !== 'undefined'
      ? shop.public_disabled
      : undefined;
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
    publicDisabled,
    addons,
    layoutConfig: normalizedLayoutConfig ?? shop.layoutConfig,
    layout_config: shop.layout_config ?? normalizedLayoutConfig,
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
    public_disabled: shop.public_disabled ?? publicDisabled,
    pageDesign: normalizedPageDesign,
  };
}

export function normalizeProductFromBackend(product: any) {
  if (!product) return product;
  const imageUrlRaw = product.imageUrl ?? product.image_url ?? product.image ?? '';
  const imageUrl = typeof imageUrlRaw === 'string' ? toBackendUrl(imageUrlRaw) : imageUrlRaw;
  const unit = typeof (product as any)?.unit === 'string' ? String((product as any).unit).trim() : undefined;
  const packOptions = (product as any)?.packOptions ?? (product as any)?.pack_options;
  const furnitureMeta = (product as any)?.furnitureMeta ?? (product as any)?.furniture_meta;
  const shopId = product.shopId ?? product.shop_id;
  const isActiveRaw = product.isActive ?? product.is_active;
  const isActive = typeof isActiveRaw === 'boolean' ? isActiveRaw : true;
  const trackStock = typeof product?.trackStock === 'boolean'
    ? product.trackStock
    : (typeof product?.track_stock === 'boolean' ? product.track_stock : undefined);

  const normalizeMenuVariants = (raw: any) => {
    if (typeof raw === 'undefined') return undefined;
    if (raw === null) return null;

    const normalizeSizeId = (id: any) => {
      const s = String(id || '').trim();
      return s;
    };

    const normalizeSizeLabel = (id: string, label: any) => {
      const l = String(label || '').trim();
      if (l) return l;
      const key = String(id || '').trim().toLowerCase();
      if (key === 'small') return 'صغير';
      if (key === 'medium') return 'وسط';
      if (key === 'large') return 'كبير';
      return id;
    };

    const normalizePrice = (p: any) => {
      const n = typeof p === 'number' ? p : Number(p);
      return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
    };

    const normalizeSizesArray = (sizes: any) => {
      if (Array.isArray(sizes)) {
        return sizes
          .map((s: any) => {
            if (!s || typeof s !== 'object') return null;
            const id = normalizeSizeId((s as any).id ?? (s as any).sizeId ?? (s as any).key);
            if (!id) return null;
            const price = normalizePrice((s as any).price);
            if (!Number.isFinite(price) || price <= 0) return null;
            const label = normalizeSizeLabel(id, (s as any).label ?? (s as any).name);
            return { id, label, price };
          })
          .filter(Boolean);
      }

      if (sizes && typeof sizes === 'object') {
        // Legacy shape: { small: 10, medium: 20, large: 30 } or { small: {price, label}, ... }
        const entries = Object.entries(sizes as any);
        return entries
          .map(([k, v]) => {
            const id = normalizeSizeId(k);
            if (!id) return null;
            const valueObj = v && typeof v === 'object' ? (v as any) : null;
            const price = normalizePrice(valueObj ? valueObj.price : v);
            if (!Number.isFinite(price) || price <= 0) return null;
            const label = normalizeSizeLabel(id, valueObj ? valueObj.label ?? valueObj.name : undefined);
            return { id, label, price };
          })
          .filter(Boolean);
      }

      return [];
    };

    const normalizeType = (t: any, fallbackId?: string) => {
      if (!t || typeof t !== 'object') return null;
      const id = String((t as any).id ?? (t as any).typeId ?? (t as any).variantId ?? fallbackId ?? '').trim();
      if (!id) return null;
      const name = String((t as any).name ?? (t as any).label ?? (t as any).title ?? '').trim() || id;
      const sizes = normalizeSizesArray((t as any).sizes ?? (t as any).options ?? (t as any).prices);
      return sizes.length > 0 ? { id, name, sizes } : null;
    };

    if (Array.isArray(raw)) {
      const mapped = raw
        .map((t: any) => normalizeType(t))
        .filter(Boolean) as any[];
      return mapped;
    }

    if (raw && typeof raw === 'object') {
      // Legacy map: { base: {...}, type_1: {...} } or { typeName: {sizes...} }
      const entries = Object.entries(raw as any);
      const mapped = entries
        .map(([k, v]) => {
          // If v is a primitive, treat it as price map not a type.
          if (!v) return null;
          if (typeof v !== 'object') return null;
          const next = normalizeType({ ...(v as any), id: (v as any).id ?? k, name: (v as any).name ?? k }, k);
          return next;
        })
        .filter(Boolean) as any[];

      return mapped;
    }

    return undefined;
  };

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

  const menuVariantsRaw = (product as any)?.menuVariants ?? (product as any)?.menu_variants;
  const menuVariants = normalizeMenuVariants(menuVariantsRaw);
  return {
    ...product,
    imageUrl,
    image_url: product.image_url ?? imageUrl,
    shopId,
    shop_id: product.shop_id ?? shopId,
    stock: typeof product.stock === 'number' ? product.stock : Number(product.stock || 0),
    price: typeof product.price === 'number' ? product.price : Number(product.price || 0),
    unit,
    packOptions,
    furnitureMeta,
    furniture_meta: (product as any)?.furniture_meta ?? furnitureMeta,
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
  const codCollectedAt = order.codCollectedAt ?? order.cod_collected_at;
  const handedToCourierAt = order.handedToCourierAt ?? order.handed_to_courier_at;
  const shopId = order.shopId ?? order.shop_id;
  const customerPhone = order.customerPhone ?? order.customer_phone;
  const deliveryAddressManual = order.deliveryAddressManual ?? order.delivery_address_manual;
  const deliveryLat = order.deliveryLat ?? order.delivery_lat;
  const deliveryLng = order.deliveryLng ?? order.delivery_lng;
  const deliveryNote = order.deliveryNote ?? order.delivery_note;
  const customerNote = order.customerNote ?? order.customer_note;
  return {
    ...order,
    createdAt,
    created_at: order.created_at ?? createdAt,
    codCollectedAt,
    cod_collected_at: order.cod_collected_at ?? codCollectedAt,
    handedToCourierAt,
    handed_to_courier_at: order.handed_to_courier_at ?? handedToCourierAt,
    shopId,
    shop_id: order.shop_id ?? shopId,
    customerPhone,
    customer_phone: order.customer_phone ?? customerPhone,
    deliveryAddressManual,
    delivery_address_manual: order.delivery_address_manual ?? deliveryAddressManual,
    deliveryLat,
    delivery_lat: order.delivery_lat ?? deliveryLat,
    deliveryLng,
    delivery_lng: order.delivery_lng ?? deliveryLng,
    deliveryNote,
    delivery_note: order.delivery_note ?? deliveryNote,
    customerNote,
    customer_note: order.customer_note ?? customerNote,
    total: typeof order.total === 'number' ? order.total : Number(order.total || 0),
  };
}
