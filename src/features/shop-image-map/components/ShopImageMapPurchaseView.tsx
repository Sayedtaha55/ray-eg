import React, { useEffect, useMemo, useState, memo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { getActiveShopImageMap } from '../api';
import { resolveBackendMediaUrl } from '../utils';
import { CustomerView } from '../../product-editor/legacy/components/CustomerView';

// Sub-components
import { LoadingState, ErrorState } from './ShopImageMapPurchaseView/States';
import PurchaseHeader from './ShopImageMapPurchaseView/PurchaseHeader';

const { useParams, useNavigate } = ReactRouterDOM as any;

const ShopImageMapPurchaseView: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const withCacheBust = (url: string, v: string) => {
    const raw = String(url || '').trim();
    const ver = String(v || '').trim();
    if (!raw || !ver) return raw;
    const lower = raw.toLowerCase();
    if (lower.startsWith('data:') || lower.startsWith('blob:')) return raw;
    return raw.includes('?') ? `${raw}&v=${encodeURIComponent(ver)}` : `${raw}?v=${encodeURIComponent(ver)}`;
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const map = data?.map;
  const shop = data?.shop;

  const handleBack = () => navigate(`/shop/${slug}`);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!slug) throw new Error('Missing slug');
        const res = await getActiveShopImageMap(String(slug));
        setData(res);
      } catch (e: any) {
        setError(e?.message ? String(e.message) : 'حدث خطأ أثناء تحميل المعاينة');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const sections = useMemo(() => {
    if (!map) return [];

    const rawSections = Array.isArray((map as any)?.sections) ? (map as any).sections : [];
    const rawHotspots = Array.isArray((map as any)?.hotspots) ? (map as any).hotspots : [];
    const version = String((map as any)?.updatedAt || (map as any)?.updated_at || (map as any)?.id || '').trim();
    const mapImageRaw = resolveBackendMediaUrl(String((map as any)?.imageUrl || (map as any)?.image_url || '').trim());
    const fallbackImage = mapImageRaw ? withCacheBust(mapImageRaw, version) : '';

    const sectionsFromMap = rawSections
      .map((s: any) => {
        const secImageRaw = resolveBackendMediaUrl(String(s?.imageUrl || s?.image_url || '').trim());
        const img = secImageRaw ? withCacheBust(secImageRaw, version) : '';
        return {
          id: String(s?.id || ''),
          name: String(s?.name || ''),
          image: img,
        };
      })
      .filter((s: any) => Boolean(s.id) && Boolean(s.name));

    const sectionById = new Map<string, any>();
    for (const s of sectionsFromMap) sectionById.set(String(s.id), s);

    for (const h of rawHotspots) {
      const sec = h?.section;
      const secId = String(h?.sectionId || h?.section_id || sec?.id || '').trim();
      const secName = String(sec?.name || '').trim();
      if (secId && !sectionById.has(secId)) {
        sectionById.set(secId, {
          id: secId,
          name: secName || 'قسم',
          image: (() => {
            const secImageRaw = resolveBackendMediaUrl(String(sec?.imageUrl || sec?.image_url || '').trim());
            return secImageRaw ? withCacheBust(secImageRaw, version) : '';
          })(),
        });
      }
    }

    const productsBySectionId = new Map<string, any[]>();
    const unsectioned: any[] = [];

    for (const h of rawHotspots) {
      const sectionId = String(h?.sectionId || h?.section_id || h?.section?.id || '').trim();

      const itemData = (h as any)?.itemData;
      const base = itemData && typeof itemData === 'object' ? itemData : h?.product;
      if (!base) continue;

      const productId = String((base as any)?.id || (h as any)?.productId || (h as any)?.product_id || (h as any)?.id || '').trim();
      if (!productId) continue;

      const priceOverrideRaw = h?.priceOverride ?? h?.price_override;
      const nOverride = typeof priceOverrideRaw === 'number' ? priceOverrideRaw : priceOverrideRaw == null ? NaN : Number(priceOverrideRaw);
      const resolvedPrice = Number.isFinite(nOverride) ? nOverride : Number((base as any)?.price || 0);

      const stockRaw = (base as any)?.stock;
      const stockNum = typeof stockRaw === 'number' ? stockRaw : stockRaw == null ? NaN : Number(stockRaw);
      const stock = Number.isFinite(stockNum) ? Math.max(0, Math.floor(stockNum)) : 0;
      const stockStatus = stock <= 0 ? 'OUT_OF_STOCK' : stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';

      const node = {
        id: productId,
        name: String(h?.label || (base as any)?.name || 'منتج'),
        description: String((base as any)?.description || ''),
        price: resolvedPrice,
        category: String((base as any)?.category || 'عام'),
        confidence: typeof h?.aiMeta?.confidence === 'number' ? h.aiMeta.confidence : 1,
        stock,
        stockStatus,
        x: typeof h?.x === 'number' ? h.x : Number(h?.x || 0),
        y: typeof h?.y === 'number' ? h.y : Number(h?.y || 0),
        unit: typeof (base as any)?.unit === 'string' ? (base as any).unit : undefined,
        packOptions: typeof (base as any)?.packOptions === 'undefined' ? undefined : (base as any).packOptions,
        colors: Array.isArray((base as any)?.colors) ? (base as any).colors : undefined,
        sizes: Array.isArray((base as any)?.sizes) ? (base as any).sizes : undefined,
        itemData: itemData && typeof itemData === 'object' ? itemData : undefined,
      };

      if (!sectionId) {
        unsectioned.push(node);
        continue;
      }

      const next = productsBySectionId.get(sectionId) || [];
      next.push(node);
      productsBySectionId.set(sectionId, next);
    }

    const sectionList = Array.from(sectionById.values());
    sectionList.sort((a: any, b: any) => {
      const ao = Number((rawSections.find((s: any) => String(s?.id || '') === String(a?.id || '')) as any)?.sortOrder);
      const bo = Number((rawSections.find((s: any) => String(s?.id || '') === String(b?.id || '')) as any)?.sortOrder);
      if (Number.isFinite(ao) && Number.isFinite(bo)) return ao - bo;
      return String(a?.name || '').localeCompare(String(b?.name || ''), 'ar');
    });

    if (!sectionList.length && fallbackImage) {
      sectionList.push({
        id: 'default',
        name: 'المعرض',
        image: fallbackImage,
      });
    }

    const merged = sectionList.map((s: any) => ({
      ...s,
      products: productsBySectionId.get(String(s.id)) || [],
    }));

    if (unsectioned.length) {
      merged[0] = {
        ...merged[0],
        products: [...(merged[0]?.products || []), ...unsectioned],
      };
    }

    return merged;
  }, [map, shop?.id, shop?.name]);

  const hasAnyImage = useMemo(() => {
    try {
      const mapImg = String((map as any)?.imageUrl || (map as any)?.image_url || '').trim();
      if (mapImg) return true;
      const rawSections = Array.isArray((map as any)?.sections) ? (map as any).sections : [];
      return rawSections.some((s: any) => String(s?.imageUrl || s?.image_url || '').trim());
    } catch {
      return false;
    }
  }, [map]);

  const legacyShop = useMemo(() => {
    const sid = String(shop?.id || '').trim();
    return {
      id: sid || String(slug || '').trim() || 'shop',
      name: String(shop?.name || 'المتجر'),
      type: 'عام',
      coverImage: String((map as any)?.imageUrl || (map as any)?.image_url || ''),
      sections: (sections as any[]).map((s: any) => ({
        id: String(s?.id || ''),
        name: String(s?.name || ''),
        image: String(s?.image || ''),
        products: Array.isArray(s?.products)
          ? s.products.map((p: any) => ({
              ...p,
            }))
          : [],
      })),
    };
  }, [map, sections, shop?.id, shop?.name, slug]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onBack={handleBack} />;
  if (!map || sections.length === 0 || !hasAnyImage) {
    return <ErrorState message="لا توجد معاينة بالصورة لهذا المتجر حالياً" onBack={handleBack} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <PurchaseHeader shopName={shop?.name} onBack={handleBack} />
      <CustomerView 
        shop={legacyShop as any} 
        shopCategory={String(shop?.category || '')} 
        onExit={handleBack} 
        imageMapVisibility={data?.map?.imageMapVisibility || data?.shop?.pageDesign?.imageMapVisibility}
      />
    </div>
  );
};

export default memo(ShopImageMapPurchaseView);
