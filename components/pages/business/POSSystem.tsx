import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Search, ChevronRight, Loader2, Ruler, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';

// Sub-components
import POSCart from './pos/POSCart';
import POSProductCard from './pos/POSProductCard';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  addons?: any;
  variantSelection?: any;
}

const MotionDiv = motion.div as any;

const POSSystem: React.FC<{ onClose: () => void; shopId: string; shop?: any }> = ({ onClose, shopId, shop }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [receiptTheme, setReceiptTheme] = useState<any>({});
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configProduct, setConfigProduct] = useState<any | null>(null);
  const [selectedMenuTypeId, setSelectedMenuTypeId] = useState('');
  const [selectedMenuSizeId, setSelectedMenuSizeId] = useState('');
  const [selectedFashionColorValue, setSelectedFashionColorValue] = useState('');
  const [selectedFashionSize, setSelectedFashionSize] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<Array<{ optionId: string; variantId: string }>>([]);
  const [usingOfflineData, setUsingOfflineData] = useState(false);

  const isRestaurant = String(shop?.category || shop?.shopCategory || '').toUpperCase() === 'RESTAURANT';
  const isFashion = String(shop?.category || shop?.shopCategory || '').toUpperCase() === 'FASHION';
  const shopAddonsDef = useMemo(() => {
    const raw = (shop as any)?.addons;
    return Array.isArray(raw) ? raw : [];
  }, [shop]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await ApiService.getProducts(shopId);
        setProducts(data || []);
        setUsingOfflineData(false);
        localStorage.setItem(`pos_products_${shopId}`, JSON.stringify(data || []));
      } catch {
        const cached = JSON.parse(localStorage.getItem(`pos_products_${shopId}`) || '[]');
        if (cached.length > 0) {
          setProducts(cached);
          setUsingOfflineData(true);
        }
      }
    };
    loadProducts();
  }, [shopId]);

  useEffect(() => {
    const loadTheme = () => {
      const raw = RayDB.getReceiptTheme(shopId) as any;
      setReceiptTheme({
        ...raw,
        shopName: raw?.shopName || shop?.name || '',
        phone: raw?.phone || shop?.phone || '',
        city: raw?.city || shop?.city || '',
        address: raw?.address || shop?.addressDetailed || '',
        logoDataUrl: raw?.logoDataUrl || shop?.logoUrl || '',
      });
    };
    loadTheme();
  }, [shopId, shop]);

  const effectiveReceiptTheme = useMemo(() => {
    const raw = receiptTheme || {};
    return {
      ...raw,
      vatRatePercent: Number.isFinite(Number(raw?.vatRatePercent)) ? Math.min(100, Math.max(0, Number(raw.vatRatePercent))) : 14,
    };
  }, [receiptTheme]);

  const getProductStock = useCallback((product: any) => {
    const trackStock = product?.trackStock ?? product?.track_stock ?? true;
    return trackStock ? (Number.isFinite(product?.stock) ? product.stock : 0) : Infinity;
  }, []);

  const getProductEffectivePrice = useCallback((product: any) => {
    const menuVariants = product?.menuVariants ?? product?.menu_variants;
    if (Array.isArray(menuVariants) && menuVariants.length > 0) {
      let min = Infinity;
      menuVariants.forEach(t => {
        (t?.sizes || []).forEach((s: any) => {
          const p = Number(s?.price);
          if (p > 0) min = Math.min(min, p);
        });
      });
      return min === Infinity ? Number(product?.price || 0) : min;
    }
    return Number(product?.price || 0);
  }, []);

  const addToCart = useCallback((product: any, qty: number = 1) => {
    const stock = getProductStock(product);
    if (stock <= 0) return;

    const hasVariants = (product?.menuVariants?.length > 0) || (product?.menu_variants?.length > 0) || (isFashion && (product?.colors?.length > 0 || product?.sizes?.length > 0));
    
    if (hasVariants || (isRestaurant && shopAddonsDef.length > 0)) {
      setConfigProduct(product);
      setSelectedAddons([]);
      if (isFashion) {
        setSelectedFashionColorValue(product?.colors?.[0]?.value || '');
        setSelectedFashionSize(product?.sizes?.[0]?.label || '');
      }
      setIsConfigOpen(true);
      return;
    }

    const lineId = product.id;
    setCart(prev => {
      const existing = prev.find(i => i.id === lineId);
      if (existing) {
        return prev.map(i => i.id === lineId ? { ...i, quantity: Math.min(stock, i.quantity + qty) } : i);
      }
      return [...prev, { id: lineId, productId: product.id, name: product.name, price: getProductEffectivePrice(product), quantity: Math.min(stock, qty) }];
    });
  }, [getProductStock, getProductEffectivePrice, isFashion, isRestaurant, shopAddonsDef]);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const product = products.find(p => p.id === i.productId);
      const stock = getProductStock(product);
      return { ...i, quantity: Math.min(stock, Math.max(0, i.quantity + delta)) };
    }).filter(i => i.quantity > 0));
  }, [products, getProductStock]);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
  const vatRatePct = effectiveReceiptTheme.vatRatePercent;
  const vatAmount = subtotal * (vatRatePct / 100);
  const total = subtotal + vatAmount;

  const processPayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      await ApiService.placeOrder({
        shopId,
        items: cart.map(i => ({ id: i.productId, quantity: i.quantity, addons: i.addons, variantSelection: i.variantSelection })),
        total,
        paymentMethod: orderType,
      });
      const updated = await ApiService.getProducts(shopId);
      setProducts(updated || []);
      setShowSuccess(true);
      setCart([]);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch {
      // error handling
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = useMemo(() => 
    products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col md:flex-row font-sans text-right overflow-hidden" dir="rtl">
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        <header className="p-4 md:p-8 bg-white border-b flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight /></button>
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن منتج..." 
              className="w-full bg-slate-50 border rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-[#BD00FF]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="رقم العميل"
            className="bg-white border rounded-2xl py-3 px-4 w-40 md:w-48 outline-none"
          />
        </header>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <POSProductCard
              key={p.id}
              product={p}
              addToCart={addToCart}
              isProductHasMenuVariants={(p) => (p?.menuVariants?.length > 0 || p?.menu_variants?.length > 0)}
              isProductHasFashionDifferentSizePrices={(p) => isFashion && p?.sizes?.length > 1}
              getProductEffectivePrice={getProductEffectivePrice}
              getProductStock={getProductStock}
              isProductTrackStockEnabled={(p) => p?.trackStock ?? p?.track_stock ?? true}
            />
          ))}
        </div>
      </div>

      <POSCart
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        subtotal={subtotal}
        vatAmount={vatAmount}
        total={total}
        vatRatePct={vatRatePct}
        orderType={orderType}
        setOrderType={setOrderType}
        isProcessing={isProcessing}
        processPayment={processPayment}
      />

      <AnimatePresence>
        {isConfigOpen && configProduct && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black/40 flex items-center justify-center p-4">
            <MotionDiv initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-md bg-white rounded-[2rem] p-6">
              <h3 className="text-xl font-black mb-4">{configProduct.name}</h3>
              <button 
                onClick={() => {
                  const lineId = `${configProduct.id}-${Date.now()}`;
                  setCart(prev => [...prev, { 
                    id: lineId, 
                    productId: configProduct.id, 
                    name: configProduct.name, 
                    price: getProductEffectivePrice(configProduct), 
                    quantity: 1 
                  }]);
                  setIsConfigOpen(false);
                }}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black"
              >
                إضافة للسلة
              </button>
              <button onClick={() => setIsConfigOpen(false)} className="w-full mt-2 py-2 text-slate-400 font-bold">إلغاء</button>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <MotionDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl">
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-black">تم بنجاح!</h3>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POSSystem;
