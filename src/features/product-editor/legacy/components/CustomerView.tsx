import React, { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, ChevronUp, ChevronDown, Plus, Minus, Trash2 } from 'lucide-react';
import { Shop, Product, CartItem } from '../types';
import { StoreViewer } from './StoreViewer';
import { RayDB } from '@/constants';
import { useCartSound } from '@/hooks/useCartSound';
import CartDrawer from '@/components/pages/shared/CartDrawer';

interface CustomerViewProps {
  shop: Shop;
  shopCategory?: string;
  onExit: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ shop, shopCategory = '', onExit }) => {
  const [cart, setCart] = useState<any[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { playSound } = useCartSound();

  useEffect(() => {
    try {
      const sid = String((shop as any)?.id || '').trim();
      if (!sid) return;

      const sections = Array.isArray((shop as any)?.sections) ? (shop as any).sections : [];
      const productById = new Map<string, any>();
      for (const sec of sections) {
        const products = Array.isArray((sec as any)?.products) ? (sec as any).products : [];
        for (const p of products) {
          const pid = String((p as any)?.id || '').trim();
          if (pid) productById.set(pid, p);
        }
      }

      const prev = RayDB.getCart();
      if (!Array.isArray(prev) || prev.length === 0) return;

      const next = prev.map((it: any) => {
        const itemShopId = String(it?.shopId || '').trim();
        const itemProductId = String(it?.id || it?.productId || '').trim();
        if (!itemShopId || itemShopId !== sid) return it;
        if (!itemProductId) return it;

        const p = productById.get(itemProductId);
        if (!p) return it;

        const basePriceRaw = (p as any)?.price;
        const basePrice = typeof basePriceRaw === 'number' ? basePriceRaw : Number(basePriceRaw || 0);

        const unit = typeof (p as any)?.unit === 'string' ? (p as any).unit : it?.unit;
        const packOptions = typeof (p as any)?.packOptions === 'undefined' ? undefined : (p as any).packOptions;
        const furnitureMeta = typeof (p as any)?.furnitureMeta === 'undefined' ? (it as any)?.furnitureMeta : (p as any).furnitureMeta;

        const variantSelection = (it as any)?.variantSelection ?? (it as any)?.variant_selection;
        const kind = variantSelection && typeof variantSelection === 'object' ? String((variantSelection as any)?.kind || '').trim().toLowerCase() : '';

        const resolvedPrice = (() => {
          if (kind === 'pack') {
            const packId = String((variantSelection as any)?.packId || (variantSelection as any)?.id || '').trim();
            const defs = Array.isArray(packOptions) ? (packOptions as any[]) : [];
            const def = packId ? defs.find((x: any) => String(x?.id || '').trim() === packId) : null;
            const pr = def ? (typeof def?.price === 'number' ? def.price : Number(def?.price || NaN)) : NaN;
            return Number.isFinite(pr) ? pr : (Number.isFinite(basePrice) ? basePrice : (Number(it?.price) || 0));
          }
          return Number.isFinite(basePrice) ? basePrice : (Number(it?.price) || 0);
        })();

        return {
          ...it,
          name: String((p as any)?.name || it?.name || ''),
          imageUrl: (p as any)?.imageUrl || (p as any)?.image_url || it?.imageUrl || it?.image_url,
          unit,
          packOptions,
          furnitureMeta,
          price: resolvedPrice,
        };
      });

      const changed = JSON.stringify(prev) !== JSON.stringify(next);
      if (changed) {
        RayDB.setCart(next);
      }
    } catch {
    }
  }, [shop, shopCategory]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    const sync = () => {
      try {
        setCart(RayDB.getCart());
      } catch {
        setCart([]);
      }
    };

    sync();
    window.addEventListener('cart-updated', sync);
    return () => {
      window.removeEventListener('cart-updated', sync);
    };
  }, []);

  const addToCart = (product: Product) => {
    const isFood = String(shopCategory || '').toUpperCase() === 'FOOD';
    const selectedPackId = String((product as any)?.selectedPackId || '').trim();
    const packDefs = isFood && Array.isArray((product as any)?.packOptions) ? (product as any).packOptions : [];
    const selectedPack = selectedPackId && Array.isArray(packDefs)
      ? (packDefs as any[]).find((p: any) => String(p?.id || '').trim() === selectedPackId)
      : null;
    const packPriceRaw = selectedPack ? (typeof selectedPack?.price === 'number' ? selectedPack.price : Number(selectedPack?.price || NaN)) : NaN;
    const packPrice = Number.isFinite(packPriceRaw) && packPriceRaw >= 0 ? packPriceRaw : NaN;

    const selectedColor = String((product as any)?.selectedColor || '').trim();
    const selectedSizeLabel = (() => {
      const s = (product as any)?.selectedSize;
      if (!s) return '';
      if (typeof s === 'string') return String(s).trim();
      if (s && typeof s === 'object') return String((s as any)?.label || '').trim();
      return '';
    })();
    const variantSelection = selectedColor && selectedSizeLabel
      ? {
          kind: 'fashion',
          colorName: selectedColor,
          colorValue: selectedColor,
          size: selectedSizeLabel,
        }
      : (isFood && selectedPackId ? { kind: 'pack', packId: selectedPackId } : undefined);

    const payload = (product as any)?.__cartPayload || {
      productId: String((product as any)?.id || ''),
      shopId: String((shop as any)?.id || ''),
      name: String((product as any)?.name || ''),
      price: isFood && selectedPackId && Number.isFinite(packPrice)
        ? packPrice
        : (typeof (product as any)?.price === 'number' ? (product as any).price : Number((product as any)?.price || 0)),
      imageUrl: (product as any)?.imageUrl || (product as any)?.image_url,
      shopName: (shop as any)?.name,
      quantity: 1,
      ...(variantSelection ? { variantSelection } : {}),
      unit: typeof (product as any)?.unit === 'string' ? (product as any).unit : undefined,
      furnitureMeta: (product as any)?.furnitureMeta,
    };

    try {
      RayDB.addToCart(payload);
    } catch {
    }
    try {
      playSound();
    } catch {
    }
    setIsCartOpen(true);
  };

  const total = cart.reduce((sum, item: any) => sum + Number(item?.price || 0) * Number(item?.quantity || 0), 0);
  const count = cart.reduce((sum, item: any) => sum + Number(item?.quantity || 0), 0);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative">
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={cart as any}
        onRemove={(id: string) => {
          try {
            RayDB.removeFromCart(id);
          } catch {
          }
        }}
        onUpdateQuantity={(id: string, delta: number) => {
          try {
            RayDB.updateCartItemQuantity(id, delta);
          } catch {
          }
        }}
      />

      {/* SaaS Navigation Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[60] p-3 sm:p-6 flex justify-between pointer-events-none">
        <button
          onClick={onExit}
          className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 text-white p-2.5 sm:p-3 rounded-full hover:bg-white/10 transition-colors"
        >
          <LogOut size={24} />
        </button>
        <div className="pointer-events-auto bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white font-bold flex flex-col items-center">
          <span>{shop.name}</span>
          <span className="text-[10px] text-cyan-400 font-normal">{shop.type}</span>
        </div>
      </div>

      <main className="h-full w-full">
        <StoreViewer sections={shop.sections || []} shopCategory={shopCategory} onAddToCart={addToCart} />
      </main>

      {/* Holographic Cart */}
      <div
        className="fixed bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-auto z-[100] preserve-3d transition-transform duration-100 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(${mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg) translateZ(50px)`,
        }}
      >
        <div
          className="relative w-full sm:w-80 max-w-sm bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(8,145,178,0.2)] overflow-hidden transition-transform duration-300 ease-out"
          style={{
            transform: isCartOpen ? 'translateY(0px)' : 'translateY(calc(100% - 72px))',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee]"></div>
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="w-full p-4 border-b border-white/10 flex justify-between items-center bg-black/40 text-left"
          >
            <div className="flex items-center gap-2 text-cyan-400">
              <ShoppingCart size={18} />
              <span className="font-bold text-sm tracking-widest uppercase">سلة ثلاثية الأبعاد</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-900 text-cyan-200 text-xs px-2 py-0.5 rounded border border-cyan-500/30">{count} منتجات</span>
              {isCartOpen ? <ChevronDown size={16} className="text-cyan-300" /> : <ChevronUp size={16} className="text-cyan-300" />}
            </div>
          </button>

          {isCartOpen && (
            <>
              <div className="max-h-48 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {cart.length === 0 ? (
                  <div className="text-center py-4 opacity-50 text-xs">
                    <div className="mb-2">السلة فارغة</div>
                    <div>انظر للمنتج لإضافته</div>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center animate-slide-in-right text-sm">
                      <div className="min-w-0">
                        <div className="text-slate-300 truncate w-32">{item.name}</div>
                        {(item as any)?.furnitureMeta && typeof (item as any)?.furnitureMeta === 'object' && (
                          <div className="text-[10px] text-slate-500 truncate w-32">
                            {typeof (item as any)?.furnitureMeta?.lengthCm === 'number' ? `${(item as any).furnitureMeta.lengthCm}×` : ''}
                            {typeof (item as any)?.furnitureMeta?.widthCm === 'number' ? `${(item as any).furnitureMeta.widthCm}` : ''}
                            {typeof (item as any)?.furnitureMeta?.heightCm === 'number' ? `×${(item as any).furnitureMeta.heightCm}` : ''}
                            {((item as any)?.furnitureMeta?.lengthCm != null || (item as any)?.furnitureMeta?.widthCm != null || (item as any)?.furnitureMeta?.heightCm != null)
                              ? ' سم'
                              : ''}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const key = String(item?.lineId || `${item?.shopId || 'unknown'}:${item?.id}`);
                              RayDB.updateCartItemQuantity(key, -1);
                            } catch {
                            }
                          }}
                          className="text-cyan-200 hover:text-white"
                          aria-label="تقليل"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-slate-500">x{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const key = String(item?.lineId || `${item?.shopId || 'unknown'}:${item?.id}`);
                              RayDB.updateCartItemQuantity(key, 1);
                            } catch {
                            }
                          }}
                          className="text-cyan-200 hover:text-white"
                          aria-label="زيادة"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              const key = String(item?.lineId || `${item?.shopId || 'unknown'}:${item?.id}`);
                              RayDB.removeFromCart(key);
                            } catch {
                            }
                          }}
                          className="text-slate-400 hover:text-red-400"
                          aria-label="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className="text-white font-mono">{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-gradient-to-t from-cyan-900/40 to-transparent border-t border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-400 text-xs">المجموع</span>
                  <span className="text-xl font-bold text-white font-mono">{total} ج.م</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartDrawerOpen(true)}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(8,145,178,0.5)] transition-all"
                >
                  إتمام الشراء
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
