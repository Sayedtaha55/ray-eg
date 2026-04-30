import React, { useEffect, useMemo } from 'react';
import { Product } from '@/types';
import { Plus, Tag, Trash2, Edit, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Package } from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import EditProductModal from '../modals/EditProductModal';
import { useTranslation } from 'react-i18next';

type Props = {
  products: Product[];
  onAdd: () => void;
  onMakeOffer: (product: Product) => void;
  onDelete: (id: string) => void;
  onUpdate: (product: Product) => void;
  shopId?: string;
  shopCategory?: string;
  shop?: any;
};

const SharedProductsTab: React.FC<Props> = ({ 
  products, 
  onAdd, 
  onMakeOffer, 
  onDelete, 
  onUpdate,
  shopId,
  shopCategory,
  shop 
}) => {
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [togglingId, setTogglingId] = React.useState<string>('');
  const [renderCount, setRenderCount] = React.useState(0);
  const { addToast } = useToast();

  const { t } = useTranslation();
  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';
  const pageTitle = isRestaurant ? t('business.sharedProducts.menu') : t('business.sharedProducts.inventory');

  const isLowEndDevice = useMemo(() => {
    try {
      const mem = typeof (navigator as any)?.deviceMemory === 'number' ? Number((navigator as any).deviceMemory) : undefined;
      const cores = typeof navigator?.hardwareConcurrency === 'number' ? Number(navigator.hardwareConcurrency) : undefined;
      if (typeof mem === 'number' && mem > 0 && mem <= 4) return true;
      if (typeof cores === 'number' && cores > 0 && cores <= 4) return true;
      return false;
    } catch {
      return false;
    }
  }, []);

  const initialBatch = isLowEndDevice ? 18 : 30;
  const batchSize = isLowEndDevice ? 12 : 20;

  useEffect(() => {
    setRenderCount(Math.min(initialBatch, products.length));
  }, [initialBatch, products.length]);

  useEffect(() => {
    if (renderCount >= products.length) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (cancelled) return;
      setRenderCount((prev) => Math.min(prev + batchSize, products.length));
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [batchSize, products.length, renderCount]);

  const handleToggleActive = async (product: Product) => {
    if (!shopId || togglingId) return;
    setTogglingId(product.id);
    try {
      await ApiService.updateProduct(product.id, { 
        isActive: !product.isActive 
      });
      onUpdate({ ...product, isActive: !product.isActive });
      addToast(product.isActive ? t('business.sharedProducts.productHidden') : t('business.sharedProducts.productShown'), 'success');
    } catch (err) {
      addToast(t('business.sharedProducts.updateStatusFailed'), 'error');
    } finally {
      setTogglingId('');
    }
  };

  const handleEdit = async (product: Product) => {
    const pid = String((product as any)?.id || '').trim();
    if (!pid) return;
    try {
      setSelectedProduct(product);
      setEditModalOpen(true);
      const full = await ApiService.getProductById(pid);
      if (full) {
        setSelectedProduct(full as any);
      }
    } catch {
      // keep the partial product if fetch fails
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">{pageTitle}</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all"
        >
          <Plus size={20} />
          {t('business.sharedProducts.addProduct')}
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="font-bold">{t('business.sharedProducts.noProducts')}</p>
          <button
            onClick={onAdd}
            className="mt-4 px-6 py-3 bg-[#00E5FF] text-black rounded-xl font-black hover:brightness-110 transition-all"
          >
            {t('business.sharedProducts.addFirstProduct')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.slice(0, renderCount).map((product) => (
            <div
              key={product.id}
              className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-lg transition-all"
            >
              <div className="relative aspect-square rounded-xl bg-slate-50 mb-4 overflow-hidden">
                {product.imageUrl ? (
                  <SmartImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full"
                    imgClassName="object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-slate-200" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => handleToggleActive(product)}
                    disabled={togglingId === product.id}
                    className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-all"
                    title={product.isActive ? t('business.sharedProducts.hide') : t('business.sharedProducts.show')}
                  >
                    {togglingId === product.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : product.isActive ? (
                      <Eye size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </button>
                </div>
              </div>

              <h3 className="font-black text-lg mb-2 line-clamp-1">{product.name}</h3>
              <p className="text-slate-500 font-bold mb-4">{t('business.sharedProducts.currency')} {product.price}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    void handleEdit(product);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  <Edit size={16} />
                  {t('business.sharedProducts.edit')}
                </button>
                <button
                  onClick={() => onMakeOffer(product)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#BD00FF]/10 text-[#BD00FF] rounded-xl font-bold hover:bg-[#BD00FF]/20 transition-all"
                >
                  <Tag size={16} />
                  {t('business.sharedProducts.offer')}
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <EditProductModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onUpdate={(updated) => {
            onUpdate(updated);
            setEditModalOpen(false);
            setSelectedProduct(null);
          }}
          shopId={shopId}
          shopCategory={shopCategory}
        />
      )}
    </div>
  );
};

export default SharedProductsTab;
