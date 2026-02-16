import React from 'react';
import { Product } from '@/types';
import { Plus, Tag, Trash2, Edit, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Package } from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import EditProductModal from '../modals/EditProductModal';

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
  const { addToast } = useToast();

  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';
  const pageTitle = isRestaurant ? 'المنيو' : 'المخزون';

  const handleToggleActive = async (product: Product) => {
    if (!shopId || togglingId) return;
    setTogglingId(product.id);
    try {
      await ApiService.updateProduct(product.id, { 
        isActive: !product.isActive 
      });
      onUpdate({ ...product, isActive: !product.isActive });
      addToast(product.isActive ? 'تم إخفاء المنتج' : 'تم إظهار المنتج', 'success');
    } catch (err) {
      addToast('تعذر تحديث حالة المنتج', 'error');
    } finally {
      setTogglingId('');
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
          إضافة منتج
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="font-bold">لا توجد منتجات حالياً</p>
          <button
            onClick={onAdd}
            className="mt-4 px-6 py-3 bg-[#00E5FF] text-black rounded-xl font-black hover:brightness-110 transition-all"
          >
            أضف أول منتج
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
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
                    title={product.isActive ? 'إخفاء' : 'إظهار'}
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
              <p className="text-slate-500 font-bold mb-4">ج.م {product.price}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setEditModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  <Edit size={16} />
                  تعديل
                </button>
                <button
                  onClick={() => onMakeOffer(product)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#BD00FF]/10 text-[#BD00FF] rounded-xl font-bold hover:bg-[#BD00FF]/20 transition-all"
                >
                  <Tag size={16} />
                  عرض
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
