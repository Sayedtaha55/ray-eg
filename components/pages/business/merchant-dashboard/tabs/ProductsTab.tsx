import React, { useEffect, useState } from 'react';
import { Plus, Tag, Trash2, Edit, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components';
import EditProductModal from '../modals/EditProductModal';

type Props = {
  products: Product[];
  onAdd: () => void;
  onMakeOffer: (p: Product) => void;
  onDelete: (id: string) => void;
  onUpdate: (product: Product) => void;
  shopId: string;
  shopCategory?: string;
  shop?: any;
};

const ProductsTab: React.FC<Props> = ({ products, onAdd, onMakeOffer, onDelete, onUpdate, shopId, shopCategory, shop }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [togglingId, setTogglingId] = useState<string>('');

  const { addToast } = useToast();

  const [addonItems, setAddonItems] = useState<
    Array<{
      id: string;
      name: string;
      imagePreview: string | null;
      imageUrl: string | null;
      imageUploadFile: File | null;
      hasSmall: boolean;
      hasMedium: boolean;
      hasLarge: boolean;
      priceSmall: string;
      priceMedium: string;
      priceLarge: string;
    }>
  >([]);
  const [savingAddons, setSavingAddons] = useState(false);

  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';

  useEffect(() => {
    if (!isRestaurant) return;
    const raw = (shop as any)?.addons;
    const groups = Array.isArray(raw) ? raw : [];
    const first = groups[0];
    const options = Array.isArray(first?.options) ? first.options : [];
    const mapped = options
      .map((o: any) => {
        const optId = String(o?.id || '').trim();
        if (!optId) return null;
        const vars = Array.isArray(o?.variants) ? o.variants : [];
        const getPrice = (vid: string) => {
          const v = vars.find((x: any) => String(x?.id || '').trim() === vid);
          const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
          return Number.isFinite(p) ? String(p) : '';
        };
        const hasSize = (vid: string) => {
          const v = vars.find((x: any) => String(x?.id || '').trim() === vid);
          if (!v) return false;
          const p = typeof v?.price === 'number' ? v.price : Number(v?.price || 0);
          return Number.isFinite(p) && p > 0;
        };
        const img = typeof o?.imageUrl === 'string' ? String(o.imageUrl) : (typeof o?.image_url === 'string' ? String(o.image_url) : '');
        return {
          id: optId,
          name: String(o?.name || o?.title || '').trim(),
          imagePreview: img || null,
          imageUrl: img || null,
          imageUploadFile: null,
          hasSmall: hasSize('small'),
          hasMedium: hasSize('medium'),
          hasLarge: hasSize('large'),
          priceSmall: getPrice('small'),
          priceMedium: getPrice('medium'),
          priceLarge: getPrice('large'),
        };
      })
      .filter(Boolean);
    setAddonItems(mapped as any);
  }, [isRestaurant, shop]);

  const parseNumberInput = (value: any) => {
    if (typeof value === 'number') return value;
    const raw = String(value ?? '').trim();
    if (!raw) return NaN;
    const cleaned = raw
      .replace(/[٠-٩۰-۹]/g, (d) => {
        const map: Record<string, string> = {
          '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
          '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
        };
        return map[d] || d;
      })
      .replace(/[٬،]/g, '')
      .replace(/[٫]/g, '.')
      .replace(/\s+/g, '');
    const n = Number(cleaned);
    return n;
  };

  const saveShopAddons = async () => {
    if (!isRestaurant) return;
    setSavingAddons(true);
    try {
      const uploadedAddonOptions = await Promise.all(
        (addonItems || []).map(async (a) => {
          const optId = String(a?.id || '').trim() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
          const optName = String(a?.name || '').trim();
          if (!optName) return null;

          let imageUrl: string | null = a?.imageUrl ? String(a.imageUrl) : null;
          const file = a?.imageUploadFile;
          if (file) {
            const upload = await ApiService.uploadMedia({
              file,
              purpose: 'product_image',
              shopId,
            });
            const nextUrl = String(upload?.url || '').trim();
            if (nextUrl) imageUrl = nextUrl;
          }

          const pSmall = parseNumberInput(a?.priceSmall);
          const pMed = parseNumberInput(a?.priceMedium);
          const pLarge = parseNumberInput(a?.priceLarge);

          const variants: Array<{ id: string; label: string; price: number }> = [];
          if ((a as any)?.hasSmall) {
            if (!Number.isFinite(pSmall) || pSmall <= 0) {
              throw new Error(`سعر غير صحيح للإضافة: ${optName} (صغير)`);
            }
            variants.push({ id: 'small', label: 'صغير', price: pSmall });
          }
          if ((a as any)?.hasMedium) {
            if (!Number.isFinite(pMed) || pMed <= 0) {
              throw new Error(`سعر غير صحيح للإضافة: ${optName} (وسط)`);
            }
            variants.push({ id: 'medium', label: 'وسط', price: pMed });
          }
          if ((a as any)?.hasLarge) {
            if (!Number.isFinite(pLarge) || pLarge <= 0) {
              throw new Error(`سعر غير صحيح للإضافة: ${optName} (كبير)`);
            }
            variants.push({ id: 'large', label: 'كبير', price: pLarge });
          }

          if (variants.length === 0) {
            throw new Error(`اختر مقاس واحد على الأقل للإضافة: ${optName}`);
          }

          return {
            id: optId,
            name: optName,
            imageUrl,
            variants,
          };
        }),
      );

      const options = uploadedAddonOptions.filter(Boolean);
      const addons = options.length > 0
        ? [
            {
              id: 'addons',
              title: 'منتجات إضافية',
              options,
            },
          ]
        : [];

      await ApiService.updateMyShop({ shopId, addons });
      addToast('تم حفظ إضافات المطعم', 'success');
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : 'فشل حفظ الإضافات';
      addToast(msg, 'error');
    } finally {
      setSavingAddons(false);
    }
  };

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

        {isRestaurant && (
          <div className="mb-12 p-6 md:p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
            <div className="flex items-center justify-between flex-row-reverse">
              <div className="text-right">
                <h4 className="text-xl font-black">إضافات المطعم</h4>
                <p className="text-xs font-bold text-slate-400">تتضاف مرة واحدة وتظهر تحت كل المنتجات</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAddonItems((prev) => [
                      ...prev,
                      {
                        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        name: '',
                        imagePreview: null,
                        imageUrl: null,
                        imageUploadFile: null,
                        hasSmall: true,
                        hasMedium: true,
                        hasLarge: true,
                        priceSmall: '',
                        priceMedium: '',
                        priceLarge: '',
                      },
                    ]);
                  }}
                  className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
                >
                  + إضافة
                </button>
                <button
                  type="button"
                  onClick={saveShopAddons}
                  className="px-4 py-2 rounded-xl font-black text-xs bg-[#00E5FF] text-black"
                  disabled={savingAddons}
                >
                  {savingAddons ? <Loader2 size={16} className="animate-spin" /> : 'حفظ'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {addonItems.map((a, idx) => (
                <div key={a.id} className="p-4 rounded-3xl bg-white border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black">إضافة #{idx + 1}</p>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (a.imagePreview && a.imagePreview.startsWith('blob:')) URL.revokeObjectURL(a.imagePreview);
                        } catch {
                        }
                        setAddonItems((prev) => prev.filter((x) => x.id !== a.id));
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">اسم الإضافة</label>
                      <input
                        value={a.name}
                        onChange={(e) => {
                          const v = e.target.value;
                          setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, name: v } : x)));
                        }}
                        placeholder="مثلاً: بطاطس"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">صورة صغيرة</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200">
                          {a.imagePreview ? <img src={a.imagePreview} className="w-full h-full object-cover" /> : null}
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const mime = String(file.type || '').toLowerCase().trim();
                            const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
                            if (!mime || !allowed.has(mime)) {
                              addToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF', 'error');
                              return;
                            }
                            if (file.size > 2 * 1024 * 1024) {
                              addToast('الصورة كبيرة جداً، يرجى اختيار صورة أقل من 2 ميجابايت', 'error');
                              return;
                            }
                            setAddonItems((prev) =>
                              prev.map((x) => {
                                if (x.id !== a.id) return x;
                                try {
                                  if (x.imagePreview && x.imagePreview.startsWith('blob:')) URL.revokeObjectURL(x.imagePreview);
                                } catch {
                                }
                                return { ...x, imageUploadFile: file, imagePreview: URL.createObjectURL(file) };
                              }),
                            );
                          }}
                          className="block w-full text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">صغير (ج.م)</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAddonItems((prev) =>
                              prev.map((x) =>
                                x.id === a.id
                                  ? { ...x, hasSmall: !x.hasSmall, priceSmall: !x.hasSmall ? x.priceSmall : '' }
                                  : x,
                              ),
                            );
                          }}
                          className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                        >
                          {a.hasSmall ? 'لا يوجد' : 'موجود'}
                        </button>
                      </div>
                      <input
                        type="number"
                        disabled={!a.hasSmall}
                        value={a.hasSmall ? a.priceSmall : ''}
                        onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceSmall: e.target.value } : x)))}
                        placeholder={a.hasSmall ? '' : 'لا يوجد'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">وسط (ج.م)</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAddonItems((prev) =>
                              prev.map((x) =>
                                x.id === a.id
                                  ? { ...x, hasMedium: !x.hasMedium, priceMedium: !x.hasMedium ? x.priceMedium : '' }
                                  : x,
                              ),
                            );
                          }}
                          className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                        >
                          {a.hasMedium ? 'لا يوجد' : 'موجود'}
                        </button>
                      </div>
                      <input
                        type="number"
                        disabled={!a.hasMedium}
                        value={a.hasMedium ? a.priceMedium : ''}
                        onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceMedium: e.target.value } : x)))}
                        placeholder={a.hasMedium ? '' : 'لا يوجد'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">كبير (ج.م)</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAddonItems((prev) =>
                              prev.map((x) =>
                                x.id === a.id
                                  ? { ...x, hasLarge: !x.hasLarge, priceLarge: !x.hasLarge ? x.priceLarge : '' }
                                  : x,
                              ),
                            );
                          }}
                          className="text-[10px] font-black px-2 py-1 rounded-lg bg-white border border-slate-200"
                        >
                          {a.hasLarge ? 'لا يوجد' : 'موجود'}
                        </button>
                      </div>
                      <input
                        type="number"
                        disabled={!a.hasLarge}
                        value={a.hasLarge ? a.priceLarge : ''}
                        onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceLarge: e.target.value } : x)))}
                        placeholder={a.hasLarge ? '' : 'لا يوجد'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className={`group relative bg-slate-50/50 p-4 md:p-5 rounded-[2rem] md:rounded-[2.5rem] border border-transparent hover:border-[#00E5FF] hover:bg-white transition-all hover:shadow-2xl ${
                isRestaurant && (p as any)?.isActive === false ? 'opacity-70' : ''
              }`}
            >
              <div className="aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-4 md:mb-6 bg-white shadow-sm">
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
              <h4 className="font-black text-sm md:text-base mb-2 text-right text-slate-800 line-clamp-2">{p.name}</h4>
              <div className="flex items-center justify-between flex-row-reverse">
                <span className="text-[#00E5FF] font-black text-lg md:text-xl">ج.م {p.price}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-black text-slate-400">م: {(p as any).stock}</span>
              </div>
              <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-[-10px] md:group-hover:translate-x-0">
                <button
                  onClick={() => handleEdit(p)}
                  className="p-2.5 md:p-3 bg-white rounded-xl shadow-xl text-blue-500 hover:scale-110 transition-transform"
                >
                  <Edit size={18} className="md:w-5 md:h-5" />
                </button>
                {isRestaurant && (
                  <button
                    onClick={() => handleToggleActive(p)}
                    className={`p-2.5 md:p-3 bg-white rounded-xl shadow-xl hover:scale-110 transition-transform ${
                      (p as any)?.isActive === false ? 'text-slate-900' : 'text-slate-500'
                    }`}
                    disabled={String(togglingId) === String(p.id)}
                  >
                    {String(togglingId) === String(p.id)
                      ? <Loader2 size={18} className="animate-spin md:w-5 md:h-5" />
                      : ((p as any)?.isActive === false ? <Eye size={18} className="md:w-5 md:h-5" /> : <EyeOff size={18} className="md:w-5 md:h-5" />)}
                  </button>
                )}
                <button
                  onClick={() => onMakeOffer(p)}
                  className="p-2.5 md:p-3 bg-white rounded-xl shadow-xl text-[#BD00FF] hover:scale-110 transition-transform"
                >
                  <Tag size={18} className="md:w-5 md:h-5" />
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="p-2.5 md:p-3 bg-white rounded-xl shadow-xl text-red-500 hover:scale-110 transition-transform"
                >
                  <Trash2 size={18} className="md:w-5 md:h-5" />
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
