import React, { useEffect, useMemo, useState } from 'react';
import { StoreEditor } from './components/StoreEditor';
import { CustomerView } from './components/CustomerView';
import { db } from './services/db';
import type { Shop, StoreSection } from './types';
import { useToast } from '@/components';
import { PurchaseModeButton } from '@/components/common/PurchaseModeButton';
import { ApiService } from '@/services/api.service';

type Props = {
  shopId: string;
  onClose?: () => void;
};

const App: React.FC<Props> = ({ shopId, onClose }) => {
  const sid = useMemo(() => String(shopId || '').trim(), [shopId]);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState<Shop | null>(null);
  const [mode, setMode] = useState<'editor' | 'customer'>('editor');
  const [shopCategory, setShopCategory] = useState<string>('');
  const [productEditorVisibility, setProductEditorVisibility] = useState<Record<string, any> | undefined>(undefined);

  const { addToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!sid) {
        if (mounted) {
          setShop(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const [data, shopData] = await Promise.all([
          db.getCurrentShop({ shopId: sid }),
          ApiService.getMyShop(),
        ]);
        if (mounted) {
          setShop(data);
          setShopCategory(String(shopData?.category || '').toUpperCase());
          const pageDesign = (shopData as any)?.pageDesign;
          const vis = pageDesign?.productEditorVisibility;
          setProductEditorVisibility(vis && typeof vis === 'object' ? ({ ...(vis as any) } as any) : undefined);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [sid]);

  useEffect(() => {
    const applyPreview = () => {
      try {
        const raw = localStorage.getItem('ray_builder_preview_design');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const vis = parsed?.productEditorVisibility;
        setProductEditorVisibility(vis && typeof vis === 'object' ? ({ ...(vis as any) } as any) : undefined);
      } catch {
      }
    };

    const onPreviewUpdate = () => applyPreview();
    const onStorage = (e: StorageEvent) => {
      if (!e) return;
      if (e.key !== 'ray_builder_preview_design') return;
      applyPreview();
    };
    try {
      window.addEventListener('ray-builder-preview-update', onPreviewUpdate as any);
      window.addEventListener('storage', onStorage as any);
    } catch {
    }

    applyPreview();
    return () => {
      try {
        window.removeEventListener('ray-builder-preview-update', onPreviewUpdate as any);
        window.removeEventListener('storage', onStorage as any);
      } catch {
      }
    };
  }, []);

  const handleSave = async (payload: { name: string; type: string; sections: StoreSection[] }) => {
    if (!sid) return;
    const nextShop: Shop = {
      id: sid,
      name: String(payload?.name || shop?.name || 'المخزون'),
      type: String(payload?.type || shop?.type || 'عام'),
      coverImage: String(shop?.coverImage || payload?.sections?.[0]?.image || ''),
      sections: Array.isArray(payload?.sections) ? payload.sections : [],
    };

    try {
      await db.saveCurrentShop({ shopId: sid, shop: nextShop });
      // Reload fresh data from backend to get updated productIds and stock
      const freshData = await db.getCurrentShop({ shopId: sid });
      if (freshData) setShop(freshData);
      addToast('تم الحفظ', 'success');
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'فشل الحفظ';
      addToast(msg, 'error');
      throw e;
    }
  };

  const openCustomerMode = async () => {
    if (!sid) return;
    setLoading(true);
    try {
      const data = await db.getCurrentShop({ shopId: sid });
      setShop(data);
      if (!data) {
        addToast('لا يوجد بيانات محفوظة لعرضها في وضع الشراء', 'error');
        return;
      }
      setMode('customer');
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'فشل تحميل البيانات';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!sid) return;
    try {
      await db.deleteCurrentShop({ shopId: sid });
      const data = await db.getCurrentShop({ shopId: sid });
      setShop(data);
      addToast('تم المسح', 'success');
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'فشل المسح';
      addToast(msg, 'error');
    }
  };

  if (!sid) {
    return <div className="p-6 text-white">shopId مطلوب</div>;
  }

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  const sections = shop?.sections || [];

  if (mode === 'customer' && shop) {
    return <CustomerView shop={shop} shopCategory={shopCategory} productEditorVisibility={productEditorVisibility} onExit={() => setMode('editor')} />;
  }

  const handleCancel = () => {
    if (typeof onClose === 'function') {
      onClose();
      return;
    }
    setMode('editor');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <StoreEditor
        shopId={sid}
        initialSections={sections}
        initialStoreName={shop?.name}
        initialStoreType={shop?.type}
        shopCategory={shopCategory}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      <div className="px-6 pb-10">
        <PurchaseModeButton onClick={openCustomerMode} className="mt-4" />
        <button
          type="button"
          onClick={handleReset}
          className="mt-4 mr-3 px-5 py-3 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default App;
