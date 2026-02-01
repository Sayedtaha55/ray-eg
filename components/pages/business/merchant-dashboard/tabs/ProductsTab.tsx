import React, { useState } from 'react';
import { Plus, Tag, Trash2, Edit, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { ApiService } from '@/services/api.service';
import EditProductModal from '../modals/EditProductModal';

type Props = {
  products: Product[];
  onAdd: () => void;
  onMakeOffer: (p: Product) => void;
  onDelete: (id: string) => void;
  onUpdate: (product: Product) => void;
  shopId: string;
  shopCategory?: string;
};

const ProductsTab: React.FC<Props> = ({ products, onAdd, onMakeOffer, onDelete, onUpdate, shopId, shopCategory }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [togglingId, setTogglingId] = useState<string>('');

  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductUpdate = (updatedProduct: Product) => {
    onUpdate(updatedProduct);
    handleEditModalClose();
  };

  const handleToggleActive = async (product: Product) => {
    if (!isRestaurant) return;
    const current = typeof (product as any)?.isActive === 'boolean' ? (product as any).isActive : true;
    const next = !current;
    setTogglingId(String(product.id));
    try {
      const updated = await ApiService.updateProduct(String(product.id), { isActive: next });
      onUpdate(updated);
    } catch {
    } finally {
      setTogglingId('');
    }
  };

  return (
    <>
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-12 flex-row-reverse">
          <h3 className="text-3xl font-black">المخزون والمنتجات</h3>
          <button
            onClick={onAdd}
            className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm flex items-center gap-3 shadow-2xl hover:bg-black transition-all"
          >
            <Plus size={24} /> إضافة صنف جديد
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className={`group relative bg-slate-50/50 p-5 rounded-[2.5rem] border border-transparent hover:border-[#00E5FF] hover:bg-white transition-all hover:shadow-2xl ${
                isRestaurant && (p as any)?.isActive === false ? 'opacity-70' : ''
              }`}
            >
              <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 bg-white shadow-sm">
                <img
                  src={(p as any).imageUrl || (p as any).image_url}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1s]"
                />
              </div>
              {isRestaurant && (p as any)?.isActive === false && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black">
                  مقفول
                </div>
              )}
              <h4 className="font-black text-base mb-2 truncate text-right text-slate-800">{p.name}</h4>
              <div className="flex items-center justify-between flex-row-reverse">
                <span className="text-[#00E5FF] font-black text-xl">ج.م {p.price}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black text-slate-400">م: {(p as any).stock}</span>
              </div>
              <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                <button
                  onClick={() => handleEdit(p)}
                  className="p-3 bg-white rounded-xl shadow-xl text-blue-500 hover:scale-110 transition-transform"
                >
                  <Edit size={20} />
                </button>
                {isRestaurant && (
                  <button
                    onClick={() => handleToggleActive(p)}
                    className={`p-3 bg-white rounded-xl shadow-xl hover:scale-110 transition-transform ${
                      (p as any)?.isActive === false ? 'text-slate-900' : 'text-slate-500'
                    }`}
                    disabled={String(togglingId) === String(p.id)}
                  >
                    {String(togglingId) === String(p.id)
                      ? <Loader2 size={20} className="animate-spin" />
                      : ((p as any)?.isActive === false ? <Eye size={20} /> : <EyeOff size={20} />)}
                  </button>
                )}
                <button
                  onClick={() => onMakeOffer(p)}
                  className="p-3 bg-white rounded-xl shadow-xl text-[#BD00FF] hover:scale-110 transition-transform"
                >
                  <Tag size={20} />
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="p-3 bg-white rounded-xl shadow-xl text-red-500 hover:scale-110 transition-transform"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditProductModal
        isOpen={editModalOpen}
        onClose={handleEditModalClose}
        shopId={shopId}
        shopCategory={shopCategory}
        product={selectedProduct}
        onUpdate={handleProductUpdate}
      />
    </>
  );
};

export default ProductsTab;
