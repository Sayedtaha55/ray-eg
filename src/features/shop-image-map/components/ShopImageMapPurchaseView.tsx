import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getActiveShopImageMap } from '../api';
import { resolveBackendMediaUrl } from '../utils';
import { CustomerView } from '../../product-editor/legacy/components/CustomerView';

const { useParams, useNavigate } = ReactRouterDOM as any;

const ShopImageMapPurchaseView: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const map = data?.map;
  const shop = data?.shop;

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
    const fallbackImage = resolveBackendMediaUrl(String((map as any)?.imageUrl || (map as any)?.image_url || '').trim());

    const sectionsFromMap = rawSections
      .map((s: any) => {
        const img = resolveBackendMediaUrl(String(s?.imageUrl || s?.image_url || '').trim()) || fallbackImage;
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
          image: resolveBackendMediaUrl(String(sec?.imageUrl || sec?.image_url || '').trim()) || fallbackImage,
        });
      }
    }

    const productsBySectionId = new Map<string, any[]>();
    const unsectioned: any[] = [];

    for (const h of rawHotspots) {
      const sectionId = String(h?.sectionId || h?.section_id || h?.section?.id || '').trim();

      const p = h?.product;
      const productId = String(p?.id || h?.productId || h?.product_id || '').trim();
      if (!productId) continue;

      const priceOverrideRaw = h?.priceOverride ?? h?.price_override;
      const nOverride = typeof priceOverrideRaw === 'number' ? priceOverrideRaw : priceOverrideRaw == null ? NaN : Number(priceOverrideRaw);
      const resolvedPrice = Number.isFinite(nOverride) ? nOverride : Number(p?.price || 0);

      const stockRaw = (p as any)?.stock;
      const stockNum = typeof stockRaw === 'number' ? stockRaw : stockRaw == null ? NaN : Number(stockRaw);
      const stock = Number.isFinite(stockNum) ? Math.max(0, Math.floor(stockNum)) : 0;
      const stockStatus = stock <= 0 ? 'OUT_OF_STOCK' : stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';

      const node = {
        id: productId,
        name: String(h?.label || p?.name || 'منتج'),
        description: String(p?.description || ''),
        price: resolvedPrice,
        category: String(p?.category || 'عام'),
        confidence: typeof h?.aiMeta?.confidence === 'number' ? h.aiMeta.confidence : 1,
        stock,
        stockStatus,
        x: typeof h?.x === 'number' ? h.x : Number(h?.x || 0),
        y: typeof h?.y === 'number' ? h.y : Number(h?.y || 0),
        unit: typeof (p as any)?.unit === 'string' ? (p as any).unit : undefined,
        packOptions: typeof (p as any)?.packOptions === 'undefined' ? undefined : (p as any).packOptions,
        colors: Array.isArray(p?.colors) ? p.colors : undefined,
        sizes: Array.isArray(p?.sizes) ? p.sizes : undefined,
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

    if (!sectionList.length) {
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-slate-600 font-black">{error}</div>
        <button onClick={() => navigate(`/shop/${slug}`)} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black">
          رجوع للمتجر
        </button>
      </div>
    );
  }

  if (!map || sections.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-slate-600 font-black">لا توجد معاينة بالصورة لهذا المتجر حالياً</div>
        <button onClick={() => navigate(`/shop/${slug}`)} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black">
          رجوع للمتجر
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <div className="absolute top-0 left-0 right-0 z-[60] p-3 sm:p-6 flex justify-between pointer-events-none">
        <button
          onClick={() => navigate(`/shop/${slug}`)}
          className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-2xl hover:bg-white/10 transition-colors font-black"
          type="button"
        >
          رجوع
        </button>
        <div className="pointer-events-auto bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white font-black">
          {shop?.name ? `تسوق من ${shop.name}` : 'وضع الشراء'}
        </div>
      </div>
      <CustomerView shop={legacyShop as any} shopCategory={String(shop?.category || '')} onExit={() => navigate(`/shop/${slug}`)} />
    </div>
  );
};

export default ShopImageMapPurchaseView;
