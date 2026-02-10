import { Shop, StoreSection } from '../types';
import { backendGet, backendPost, backendPatch } from '@/services/api/httpClient';
import { ApiService } from '@/services/api.service';

function isDataUrl(value: string) {
  return typeof value === 'string' && value.startsWith('data:');
}

function guessStockFromStatus(status: any) {
  const s = String(status || '').toUpperCase();
  if (s === 'OUT_OF_STOCK') return 0;
  if (s === 'LOW_STOCK') return 3;
  return 10;
}

async function dataUrlToFile(dataUrl: string, filename: string) {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const mime = String(blob.type || 'image/jpeg');
  const safeName = filename.replace(/[^a-z0-9._-]+/gi, '-');
  return new File([blob], safeName, { type: mime });
}

async function uploadSectionImageIfNeeded(shopId: string, section: StoreSection) {
  const img = String(section?.image || '').trim();
  if (!img) return '';
  if (!isDataUrl(img)) return img;

  const file = await dataUrlToFile(img, `section-${String(section?.id || Date.now())}.jpg`);
  const uploaded = await ApiService.uploadMedia({ file, purpose: 'shop-image-map', shopId });
  return uploaded?.url || '';
}

async function ensureMap(shopId: string, coverImageUrl: string) {
  const sid = String(shopId || '').trim();
  if (!sid) throw new Error('shopId مطلوب');
  const maps = await backendGet<any[]>(`/api/v1/shops/${encodeURIComponent(sid)}/image-maps/manage`);
  const active = Array.isArray(maps) ? maps.find((m: any) => m?.isActive) : null;
  if (active) return active;
  const existing = Array.isArray(maps) && maps.length ? maps[0] : null;
  if (existing) {
    try {
      await backendPatch<any>(`/api/v1/shops/${encodeURIComponent(sid)}/image-maps/${encodeURIComponent(String(existing.id))}/activate`, {});
    } catch {
    }
    return existing;
  }

  const created = await backendPost<any>(`/api/v1/shops/${encodeURIComponent(sid)}/image-maps`, {
    title: 'محرر المنتجات',
    imageUrl: coverImageUrl,
  });
  try {
    await backendPatch<any>(`/api/v1/shops/${encodeURIComponent(sid)}/image-maps/${encodeURIComponent(String(created.id))}/activate`, {});
  } catch {
  }
  return created;
}

export const db = {
  getCurrentShop: async (payload: { shopId: string }): Promise<Shop | null> => {
    const sid = String(payload?.shopId || '').trim();
    if (!sid) return null;

    const maps = await backendGet<any[]>(`/api/v1/shops/${encodeURIComponent(sid)}/image-maps/manage`);
    const map = Array.isArray(maps) ? maps.find((m: any) => m?.isActive) || maps[0] : null;
    if (!map) {
      return null;
    }

    const sections: StoreSection[] = (Array.isArray(map?.sections) ? map.sections : []).map((s: any, idx: number) => {
      const image = typeof s?.imageUrl === 'string' ? s.imageUrl : '';
      const rawId = String(s?.id || '').trim();
      const id = rawId || `sec_${idx + 1}`;
      return {
        id,
        name: String(s?.name || ''),
        image,
        products: [],
      };
    });

    const hotspots = Array.isArray(map?.hotspots) ? map.hotspots : [];
    const productsBySectionId = new Map<string, any[]>();
    for (const h of hotspots) {
      const secId = h?.sectionId || h?.section?.id;
      if (!secId) continue;
      const list = productsBySectionId.get(String(secId)) || [];
      const overrideRaw = (h as any)?.priceOverride ?? (h as any)?.price_override;
      const overrideNum = typeof overrideRaw === 'number' ? overrideRaw : overrideRaw == null ? NaN : Number(overrideRaw);
      const productPriceRaw = (h as any)?.product?.price;
      const productPriceNum = typeof productPriceRaw === 'number' ? productPriceRaw : productPriceRaw == null ? NaN : Number(productPriceRaw);

      const stockRaw = (h as any)?.product?.stock;
      const stockNum = typeof stockRaw === 'number' ? stockRaw : stockRaw == null ? NaN : Number(stockRaw);
      const stock = Number.isFinite(stockNum) ? Math.max(0, Math.floor(stockNum)) : 0;
      const stockStatus = stock <= 0 ? 'OUT_OF_STOCK' : stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';

      list.push({
        id: String(h?.id || ''),
        name: String(h?.label || h?.product?.name || 'منتج'),
        description: String(h?.product?.description || ''),
        price:
          Number.isFinite(overrideNum)
            ? overrideNum
            : Number.isFinite(productPriceNum)
              ? productPriceNum
              : 0,
        stock,
        category: String(h?.product?.category || 'عام'),
        unit: typeof h?.product?.unit === 'string' ? h.product.unit : undefined,
        packOptions: (h as any)?.product?.packOptions ?? (h as any)?.product?.pack_options,
        confidence: typeof h?.aiMeta?.confidence === 'number' ? h.aiMeta.confidence : 1,
        stockStatus,
        x: typeof h?.x === 'number' ? h.x : 0,
        y: typeof h?.y === 'number' ? h.y : 0,
        colors: Array.isArray(h?.product?.colors) ? h.product.colors : undefined,
        sizes: Array.isArray(h?.product?.sizes) ? h.product.sizes : undefined,
      });
      productsBySectionId.set(String(secId), list);
    }

    const mergedSections = sections.map((s) => ({
      ...s,
      products: productsBySectionId.get(String(s.id)) || [],
    }));

    const coverImage = typeof map?.imageUrl === 'string' ? map.imageUrl : mergedSections[0]?.image || '';

    return {
      id: sid,
      name: 'المخزون',
      type: 'عام',
      coverImage,
      sections: mergedSections,
    };
  },

  saveCurrentShop: async (payload: { shopId: string; shop: Shop }): Promise<void> => {
    const sid = String(payload?.shopId || '').trim();
    if (!sid) throw new Error('shopId مطلوب');
    const shop = payload?.shop;
    const sectionsIn = Array.isArray(shop?.sections) ? shop.sections : [];
    if (!sectionsIn.length) return;

    const uploadedSections = await Promise.all(
      sectionsIn.map(async (s) => {
        const imageUrl = await uploadSectionImageIfNeeded(sid, s);
        return {
          ...s,
          image: imageUrl,
        };
      }),
    );

    const coverImageUrl = String(shop?.coverImage || uploadedSections[0]?.image || '').trim();
    const map = await ensureMap(sid, coverImageUrl);

    const draftItems: any[] = [];
    uploadedSections.forEach((sec) => {
      const products = Array.isArray(sec?.products) ? sec.products : [];
      products.forEach((p: any) => {
        const name = String(p?.name || '').trim();
        const price = Number(p?.price);
        if (!name || !Number.isFinite(price)) return;
        draftItems.push({
          name,
          price,
          stock: typeof p?.stock === 'number' && Number.isFinite(p.stock) ? Math.floor(p.stock) : guessStockFromStatus(p?.stockStatus),
          category: typeof p?.category === 'string' && p.category.trim() ? p.category.trim() : '__IMAGE_MAP__',
          description: typeof p?.description === 'string' ? p.description : null,
          unit: typeof p?.unit === 'string' && p.unit.trim() ? p.unit.trim() : undefined,
          packOptions: typeof p?.packOptions === 'undefined' ? undefined : p.packOptions,
          colors: Array.isArray(p?.colors) ? p.colors : undefined,
          sizes: Array.isArray(p?.sizes) ? p.sizes : undefined,
        });
      });
    });

    const nameToProductId = new Map<string, string>();
    if (draftItems.length) {
      const res = await backendPost<any>(`/api/v1/products/manage/by-shop/${encodeURIComponent(sid)}/import-drafts`, {
        items: draftItems,
      });
      const created = Array.isArray(res?.created) ? res.created : [];
      const updated = Array.isArray(res?.updated) ? res.updated : [];
      for (const p of [...created, ...updated]) {
        const id = String(p?.id || '').trim();
        const name = String(p?.name || '').trim();
        if (id && name) nameToProductId.set(name, id);
      }
    }

    const sectionRows = uploadedSections.map((s, idx) => ({
      name: String(s?.name || '').trim() || `قسم ${idx + 1}`,
      sortOrder: idx,
      imageUrl: String(s?.image || '').trim() || null,
    }));

    const hotspots: any[] = [];
    uploadedSections.forEach((sec, sectionIndex) => {
      const products = Array.isArray(sec?.products) ? sec.products : [];
      products.forEach((p: any, idx: number) => {
        const priceNum = typeof p?.price === 'number' ? p.price : p?.price == null ? NaN : Number(p.price);
        const priceOverride = Number.isFinite(priceNum) ? priceNum : null;
        const nameKey = String(p?.name || '').trim();
        const mappedId = nameKey ? nameToProductId.get(nameKey) : undefined;
        const productId = mappedId || (p?.productId != null ? String(p.productId).trim() : p?.backendProductId != null ? String(p.backendProductId).trim() : null);
        hotspots.push({
          x: typeof p?.x === 'number' ? p.x : 0,
          y: typeof p?.y === 'number' ? p.y : 0,
          label: String(p?.name || '').trim() || 'منتج',
          sortOrder: idx,
          sectionIndex,
          productId: productId || null,
          priceOverride,
          aiMeta: {
            source: 'legacy-editor',
            confidence: typeof p?.confidence === 'number' ? p.confidence : undefined,
          },
        });
      });
    });

    await backendPatch<any>(
      `/api/v1/shops/${encodeURIComponent(sid)}/image-maps/${encodeURIComponent(String(map.id))}/layout`,
      {
        imageUrl: coverImageUrl,
        title: 'محرر المنتجات',
        sections: sectionRows,
        hotspots,
      },
    );

    
  },

  deleteCurrentShop: async (payload: { shopId: string }): Promise<void> => {
    const sid = String(payload?.shopId || '').trim();
    if (!sid) return;
    const maps = await backendGet<any[]>(`/api/v1/shops/${encodeURIComponent(sid)}/image-maps/manage`);
    const map = Array.isArray(maps) ? maps.find((m: any) => m?.isActive) || maps[0] : null;
    if (!map) return;
    await backendPatch<any>(
      `/api/v1/shops/${encodeURIComponent(sid)}/image-maps/${encodeURIComponent(String(map.id))}/layout`,
      {
        title: 'محرر المنتجات',
        sections: [],
        hotspots: [],
      },
    );
  },
};
