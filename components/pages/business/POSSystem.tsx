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
      try {
        const menuVariants = (product?.menuVariants ?? product?.menu_variants) as any[];
        const firstType = Array.isArray(menuVariants) ? menuVariants[0] : undefined;
        const firstTypeId = String(firstType?.id || '').trim();
        const firstSize = Array.isArray(firstType?.sizes) ? firstType.sizes[0] : undefined;
        const firstSizeId = String(firstSize?.id || '').trim();
        setSelectedMenuTypeId(firstTypeId);
        setSelectedMenuSizeId(firstSizeId);
      } catch {
        setSelectedMenuTypeId('');
        setSelectedMenuSizeId('');
      }
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

  const handlePrintReceipt = useCallback(() => {
    if (!shopId) return;
    if (!cart || cart.length === 0) return;

    const theme = effectiveReceiptTheme || {};
    const shopName = String((theme as any)?.shopName || '').trim();
    const phone = String((theme as any)?.phone || '').trim();
    const city = String((theme as any)?.city || '').trim();
    const address = String((theme as any)?.address || '').trim();
    const footerNote = String((theme as any)?.footerNote || '').trim();

    const fmt = (n: any) => {
      const v = typeof n === 'number' ? n : Number(n);
      if (!Number.isFinite(v)) return '0.00';
      return v.toFixed(2);
    };

    const now = new Date();
    const dateLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const linesHtml = cart
      .map((i) => {
        const name = String(i?.name || '').trim();
        const qty = Number(i?.quantity || 0);
        const price = Number(i?.price || 0);
        const lineTotal = qty * price;
        return `
          <tr>
            <td style="padding: 6px 0;">${name}</td>
            <td style="padding: 6px 0; text-align:left;">${qty}x</td>
            <td style="padding: 6px 0; text-align:left;">${fmt(lineTotal)}</td>
          </tr>
        `;
      })
      .join('');

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Receipt</title>
          <style>
            @page { margin: 8mm; }
            body { font-family: Arial, sans-serif; direction: rtl; }
            .wrap { max-width: 80mm; margin: 0 auto; }
            h1 { font-size: 16px; margin: 0 0 6px; text-align: center; }
            .meta { font-size: 11px; color: #111; text-align: center; margin-bottom: 10px; }
            .sep { border-top: 1px dashed #999; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            .totals { font-size: 12px; }
            .row { display:flex; justify-content: space-between; gap: 10px; padding: 4px 0; }
            .foot { font-size: 11px; text-align:center; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="wrap">
            <h1>${shopName || 'فاتورة'}</h1>
            <div class="meta">
              ${phone ? `<div>${phone}</div>` : ''}
              ${city ? `<div>${city}</div>` : ''}
              ${address ? `<div>${address}</div>` : ''}
              <div>${dateLabel}</div>
            </div>
            <div class="sep"></div>
            <table>
              <tbody>
                ${linesHtml}
              </tbody>
            </table>
            <div class="sep"></div>
            <div class="totals">
              <div class="row"><span>المجموع الفرعي</span><span>ج.م ${fmt(subtotal)}</span></div>
              ${vatRatePct > 0 ? `<div class="row"><span>الضريبة (${vatRatePct}%)</span><span>ج.م ${fmt(vatAmount)}</span></div>` : ''}
              <div class="row" style="font-weight:700;"><span>الإجمالي</span><span>ج.م ${fmt(total)}</span></div>
            </div>
            ${footerNote ? `<div class="sep"></div><div class="foot">${footerNote}</div>` : ''}
          </div>
        </body>
      </html>
    `;

    try {
      const doPrintInWindow = () => {
        try {
          const w = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720');
          if (!w) return false;
          w.document.open();
          w.document.write(html);
          w.document.close();

          const cleanup = () => {
            try {
              w.close();
            } catch {
            }
          };

          w.addEventListener('afterprint', cleanup);

          try {
            w.focus();
            w.print();
          } catch {
            cleanup();
            return false;
          }

          setTimeout(() => cleanup(), 15_000);
          return true;
        } catch {
          return false;
        }
      };

      if (doPrintInWindow()) return;

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.open();
      doc.write(html);
      doc.close();

      const cleanup = () => {
        try {
          document.body.removeChild(iframe);
        } catch {
        }
      };

      try {
        (iframe.contentWindow as any)?.addEventListener?.('afterprint', cleanup);
      } catch {
      }

      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        cleanup();
      }

      setTimeout(() => cleanup(), 15_000);
    } catch {
    }
  }, [shopId, cart, effectiveReceiptTheme, subtotal, vatAmount, vatRatePct, total]);

  const processPayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      await ApiService.placeOrder({
        shopId,
        items: cart.map(i => ({ id: i.productId, quantity: i.quantity, addons: i.addons, variantSelection: i.variantSelection })),
        total,
        paymentMethod: 'cashier',
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

        <div className="flex-1 overflow-y-auto p-3 md:p-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
          {filteredProducts.map(p => (
            <POSProductCard
              key={p.id}
              product={p}
              addToCart={addToCart}
              showConfigureIcon={
                (p?.menuVariants?.length > 0 || p?.menu_variants?.length > 0) ||
                (isFashion && (p?.sizes?.length > 1 || p?.colors?.length > 0)) ||
                (isRestaurant && shopAddonsDef.length > 0)
              }
              onConfigure={(prod) => {
                setConfigProduct(prod);
                setSelectedAddons([]);
                try {
                  const menuVariants = (prod?.menuVariants ?? prod?.menu_variants) as any[];
                  const firstType = Array.isArray(menuVariants) ? menuVariants[0] : undefined;
                  const firstTypeId = String(firstType?.id || '').trim();
                  const firstSize = Array.isArray(firstType?.sizes) ? firstType.sizes[0] : undefined;
                  const firstSizeId = String(firstSize?.id || '').trim();
                  setSelectedMenuTypeId(firstTypeId);
                  setSelectedMenuSizeId(firstSizeId);
                } catch {
                  setSelectedMenuTypeId('');
                  setSelectedMenuSizeId('');
                }
                if (isFashion) {
                  setSelectedFashionColorValue(prod?.colors?.[0]?.value || '');
                  setSelectedFashionSize(prod?.sizes?.[0]?.label || '');
                }
                setIsConfigOpen(true);
              }}
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
        isProcessing={isProcessing}
        processPayment={processPayment}
        onPrintReceipt={handlePrintReceipt}
        variant="desktop"
      />

      <POSCart
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        subtotal={subtotal}
        vatAmount={vatAmount}
        total={total}
        vatRatePct={vatRatePct}
        isProcessing={isProcessing}
        processPayment={processPayment}
        onPrintReceipt={handlePrintReceipt}
        variant="mobile"
      />

      <AnimatePresence>
        {isConfigOpen && configProduct && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[600] bg-black/40 flex items-center justify-center p-4">
            <MotionDiv initial={{ y: 20 }} animate={{ y: 0 }} className="w-full max-w-md bg-white rounded-[2rem] p-6 max-h-[85vh] overflow-y-auto">
              <h3 className="text-xl font-black mb-4">{configProduct.name}</h3>

              {(() => {
                const mv = (configProduct?.menuVariants ?? configProduct?.menu_variants) as any[];
                const hasMenuVariants = Array.isArray(mv) && mv.length > 0;
                if (!hasMenuVariants) return null;

                const typeOptions = mv.map((t: any) => ({
                  id: String(t?.id || '').trim(),
                  label: String(t?.name || t?.label || '').trim() || 'نوع',
                  sizes: Array.isArray(t?.sizes) ? t.sizes : [],
                })).filter((t: any) => t.id);

                const selectedType = typeOptions.find((t: any) => t.id === String(selectedMenuTypeId || '').trim()) || typeOptions[0];
                const sizeOptions = Array.isArray(selectedType?.sizes)
                  ? selectedType.sizes.map((s: any) => ({
                    id: String(s?.id || '').trim(),
                    label: String(s?.label || s?.name || '').trim() || 'حجم',
                    price: Number(s?.price),
                  })).filter((s: any) => s.id)
                  : [];

                const effectiveSizeId = String(selectedMenuSizeId || '').trim() || String(sizeOptions[0]?.id || '').trim();
                const selectedSize = sizeOptions.find((s: any) => s.id === effectiveSizeId) || sizeOptions[0];

                return (
                  <div className="space-y-3 mb-5">
                    <div className="font-black text-sm text-slate-900">اختيار الحجم</div>
                    <div className="flex flex-wrap gap-2">
                      {typeOptions.map((t: any) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedMenuTypeId(t.id);
                            const first = Array.isArray(t?.sizes) ? t.sizes[0] : undefined;
                            setSelectedMenuSizeId(String(first?.id || '').trim());
                          }}
                          className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${String(selectedType?.id) === String(t.id) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {sizeOptions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {sizeOptions.map((s: any) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedMenuSizeId(s.id)}
                            className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${String(effectiveSizeId) === String(s.id) ? 'bg-[#00E5FF] text-slate-900 border-[#00E5FF]' : 'bg-white text-slate-700 border-slate-200'}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {selectedSize && Number.isFinite(Number(selectedSize?.price)) ? (
                      <div className="text-xs font-bold text-slate-500">سعر الحجم: ج.م {Number(selectedSize.price).toFixed(2)}</div>
                    ) : null}
                  </div>
                );
              })()}

              {isFashion ? (
                <div className="space-y-3 mb-5">
                  {Array.isArray(configProduct?.colors) && configProduct.colors.length > 0 ? (
                    <div className="space-y-2">
                      <div className="font-black text-sm text-slate-900">اللون</div>
                      <div className="flex flex-wrap gap-2">
                        {configProduct.colors.map((c: any) => (
                          <button
                            key={String(c?.value || c?.id || c?.name)}
                            type="button"
                            onClick={() => setSelectedFashionColorValue(String(c?.value || ''))}
                            className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${String(selectedFashionColorValue) === String(c?.value) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                          >
                            {String(c?.name || c?.label || c?.value || 'لون')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {Array.isArray(configProduct?.sizes) && configProduct.sizes.length > 0 ? (
                    <div className="space-y-2">
                      <div className="font-black text-sm text-slate-900">المقاس</div>
                      <div className="flex flex-wrap gap-2">
                        {configProduct.sizes.map((s: any) => (
                          <button
                            key={String(s?.label || s?.id || s?.name)}
                            type="button"
                            onClick={() => setSelectedFashionSize(String(s?.label || s?.name || ''))}
                            className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${String(selectedFashionSize) === String(s?.label || s?.name) ? 'bg-[#00E5FF] text-slate-900 border-[#00E5FF]' : 'bg-white text-slate-700 border-slate-200'}`}
                          >
                            {String(s?.label || s?.name || 'مقاس')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {isRestaurant && shopAddonsDef.length > 0 ? (
                <div className="space-y-3 mb-5">
                  <div className="font-black text-sm text-slate-900">الإضافات</div>
                  <div className="space-y-3">
                    {shopAddonsDef.map((g: any) => {
                      const groupId = String(g?.id || '').trim();
                      const groupName = String(g?.name || g?.label || '').trim();
                      const opts = Array.isArray(g?.options) ? g.options : [];
                      if (!groupId || opts.length === 0) return null;

                      const selectedVariantId = selectedAddons.find((x) => String(x?.optionId) === groupId)?.variantId;
                      return (
                        <div key={groupId} className="p-3 rounded-2xl border border-slate-100 bg-slate-50">
                          <div className="font-black text-xs text-slate-700 mb-2">{groupName || 'مجموعة'}</div>
                          <div className="flex flex-wrap gap-2">
                            {opts.map((opt: any) => {
                              const optId = String(opt?.id || '').trim();
                              if (!optId) return null;
                              const label = String(opt?.name || opt?.label || '').trim() || 'خيار';
                              const price = Number(opt?.price);
                              const isSelected = String(selectedVariantId || '') === optId;
                              return (
                                <button
                                  key={optId}
                                  type="button"
                                  onClick={() => {
                                    setSelectedAddons((prev) => {
                                      const arr = Array.isArray(prev) ? prev : [];
                                      const next = arr.filter((x) => String(x?.optionId) !== groupId);
                                      if (isSelected) return next;
                                      return [...next, { optionId: groupId, variantId: optId }];
                                    });
                                  }}
                                  className={`px-3 py-2 rounded-xl border text-xs font-black transition-all ${isSelected ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}
                                >
                                  {label}{Number.isFinite(price) && price > 0 ? ` (+${price})` : ''}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {(() => {
                const mv = (configProduct?.menuVariants ?? configProduct?.menu_variants) as any[];
                const hasMenuVariants = Array.isArray(mv) && mv.length > 0;

                let price = getProductEffectivePrice(configProduct);
                let variantSelection: any = undefined;

                if (hasMenuVariants) {
                  const type = mv.find((t: any) => String(t?.id || '').trim() === String(selectedMenuTypeId || '').trim()) || mv[0];
                  const sizes = Array.isArray(type?.sizes) ? type.sizes : [];
                  const size = sizes.find((s: any) => String(s?.id || '').trim() === String(selectedMenuSizeId || '').trim()) || sizes[0];
                  const sizePrice = Number(size?.price);
                  if (Number.isFinite(sizePrice) && sizePrice > 0) price = sizePrice;
                  variantSelection = {
                    menuTypeId: String(type?.id || '').trim(),
                    menuSizeId: String(size?.id || '').trim(),
                    menuTypeLabel: String(type?.name || type?.label || '').trim(),
                    menuSizeLabel: String(size?.label || size?.name || '').trim(),
                  };
                }

                if (isFashion) {
                  variantSelection = {
                    ...(variantSelection || {}),
                    fashionColor: String(selectedFashionColorValue || ''),
                    fashionSize: String(selectedFashionSize || ''),
                  };
                }

                const addonsPrice = (() => {
                  if (!isRestaurant) return 0;
                  if (!Array.isArray(shopAddonsDef) || shopAddonsDef.length === 0) return 0;
                  const priceById = new Map<string, number>();
                  for (const g of shopAddonsDef) {
                    const opts = Array.isArray((g as any)?.options) ? (g as any).options : [];
                    for (const opt of opts) {
                      const id = String(opt?.id || '').trim();
                      const p = Number(opt?.price);
                      if (id && Number.isFinite(p) && p > 0) priceById.set(id, p);
                    }
                  }
                  return (selectedAddons || []).reduce((sum, a) => sum + (priceById.get(String(a?.variantId || '').trim()) || 0), 0);
                })();

                const finalPrice = price + addonsPrice;

                return (
                  <button
                    type="button"
                    onClick={() => {
                      const lineId = `${configProduct.id}-${Date.now()}`;
                      const suffix = (() => {
                        const parts: string[] = [];
                        if (variantSelection?.menuSizeLabel) parts.push(String(variantSelection.menuSizeLabel));
                        if (variantSelection?.fashionSize) parts.push(String(variantSelection.fashionSize));
                        if (variantSelection?.fashionColor) parts.push(String(variantSelection.fashionColor));
                        return parts.length ? ` (${parts.join(' - ')})` : '';
                      })();

                      setCart((prev) => [
                        ...(Array.isArray(prev) ? prev : []),
                        {
                          id: lineId,
                          productId: configProduct.id,
                          name: `${configProduct.name}${suffix}`,
                          price: finalPrice,
                          quantity: 1,
                          addons: selectedAddons,
                          variantSelection,
                        },
                      ]);

                      setIsConfigOpen(false);
                    }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black"
                  >
                    إضافة للسلة
                  </button>
                );
              })()}

              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="w-full mt-2 py-2 text-slate-400 font-bold"
              >
                إلغاء
              </button>
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
