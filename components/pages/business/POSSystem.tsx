import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, ChevronRight, ChevronUp, CheckCircle2, Loader2, Printer, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '@/services/api.service';
import { RayDB } from '@/constants';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

const POSSystem: React.FC<{ onClose: () => void; shopId: string; shop?: any }> = ({ onClose, shopId, shop }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [receiptTheme, setReceiptTheme] = useState<any>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await ApiService.getProducts(shopId);
        setProducts(data || []);
      } catch {
        setProducts([]);
      }
    };
    loadProducts();
  }, [shopId]);

  useEffect(() => {
    const loadTheme = () => {
      const raw = RayDB.getReceiptTheme(shopId) as any;
      const merged = {
        ...raw,
        shopName: String(raw?.shopName || shop?.name || ''),
        phone: String(raw?.phone || shop?.phone || ''),
        city: String(raw?.city || shop?.city || ''),
        address: String(raw?.address || shop?.addressDetailed || shop?.address_detailed || ''),
        logoDataUrl: String(raw?.logoDataUrl || shop?.logoUrl || shop?.logo_url || ''),
      };
      setReceiptTheme(merged);
    };
    loadTheme();
    window.addEventListener('receipt-theme-update', loadTheme);
    return () => window.removeEventListener('receipt-theme-update', loadTheme);
  }, [shopId, shop?.name, shop?.phone, shop?.city, shop?.addressDetailed, shop?.address_detailed, shop?.logoUrl, shop?.logo_url]);

  const effectiveReceiptTheme = (() => {
    const raw = (receiptTheme || {}) as any;
    return {
      ...raw,
      shopName: String(raw?.shopName || shop?.name || ''),
      phone: String(raw?.phone || shop?.phone || ''),
      city: String(raw?.city || shop?.city || ''),
      address: String(raw?.address || shop?.addressDetailed || shop?.address_detailed || ''),
      logoDataUrl: String(raw?.logoDataUrl || shop?.logoUrl || shop?.logo_url || ''),
      footerNote: String(raw?.footerNote || ''),
      vatRatePercent: (() => {
        const v = raw?.vatRatePercent;
        const n = typeof v === 'number' ? v : Number(v);
        if (!Number.isFinite(n)) return 14;
        return Math.min(100, Math.max(0, n));
      })(),
    };
  })();

  const getProductStock = (product: any) => {
    const trackStock = typeof product?.trackStock === 'boolean'
      ? product.trackStock
      : (typeof product?.track_stock === 'boolean' ? product.track_stock : true);
    if (!trackStock) return Number.POSITIVE_INFINITY;
    const stock = product?.stock;
    return typeof stock === 'number' && Number.isFinite(stock) ? stock : Number.POSITIVE_INFINITY;
  };

  const isProductTrackStockEnabled = (product: any) => {
    const trackStock = typeof product?.trackStock === 'boolean'
      ? product.trackStock
      : (typeof product?.track_stock === 'boolean' ? product.track_stock : true);
    return Boolean(trackStock);
  };

  const addToCart = (product: any, qty: number = 1) => {
    if (!product) return;
    const stock = getProductStock(product);
    if (stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentQty = existing?.quantity || 0;
      const desiredQty = currentQty + qty;
      const nextQty = Number.isFinite(stock) ? Math.min(stock, desiredQty) : desiredQty;
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: nextQty } : item);
      }
      const initialQty = Number.isFinite(stock) ? Math.min(stock, qty) : qty;
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: initialQty }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    const maxQty = getProductStock(product);
    setCart(prev => prev
      .map(item => item.id === id
        ? { ...item, quantity: Math.min(maxQty, Math.max(0, item.quantity + delta)) }
        : item
      )
      .filter(item => item.quantity > 0)
    );
  };

  const processPayment = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vatRate = Number((effectiveReceiptTheme as any)?.vatRatePercent);
    const vatRatePct = Number.isFinite(vatRate) ? vatRate : 14;
    const vatAmount = subtotal * (vatRatePct / 100);
    const totalWithVat = subtotal + vatAmount;

    setTimeout(() => {
      (async () => {
        try {
          await ApiService.placeOrder({
            shopId,
            items: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
            total: totalWithVat,
            paymentMethod: orderType,
          });

          const updated = await ApiService.getProducts(shopId);
          setProducts(updated || []);
          window.dispatchEvent(new Event('orders-updated'));
        } catch {
          // Stock sync errors are ignored
        } finally {
          setIsProcessing(false);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setCart([]);
            onClose();
          }, 1500);
        }
      })();
    }, 1200);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vatRate = Number((effectiveReceiptTheme as any)?.vatRatePercent);
  const vatRatePct = Number.isFinite(vatRate) ? vatRate : 14;
  const vatAmount = subtotal * (vatRatePct / 100);
  const total = subtotal + vatAmount;
  const showVat = vatRatePct > 0;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = products.filter(p => String(p?.name || '').toLowerCase().includes(normalizedSearch));

  const formatInvoiceText = () => {
    const lines: string[] = [];
    const shopName = String(effectiveReceiptTheme?.shopName || '').trim();
    const phone = String(effectiveReceiptTheme?.phone || '').trim();
    const city = String((effectiveReceiptTheme as any)?.city || '').trim();
    const address = String(effectiveReceiptTheme?.address || '').trim();
    const footerNote = String(effectiveReceiptTheme?.footerNote || '').trim();
    const now = new Date();

    if (shopName) lines.push(shopName);
    if (phone) lines.push(`هاتف: ${phone}`);
    if (city) lines.push(`المدينة: ${city}`);
    if (address) lines.push(`العنوان: ${address}`);
    lines.push('--------------------------');
    lines.push(`الوقت: ${now.toLocaleString('ar-EG')}`);
    lines.push(`نوع الطلب: ${orderType === 'dine-in' ? 'محلي' : 'سفري'}`);
    lines.push('--------------------------');

    for (const item of cart) {
      lines.push(`${item.name} x${item.quantity} = ج.م ${(item.price * item.quantity).toFixed(0)}`);
    }

    lines.push('--------------------------');
    lines.push(`الإجمالي قبل الضريبة: ج.م ${subtotal.toFixed(0)}`);
    if (showVat) {
      lines.push(`ضريبة (${vatRatePct}%): ج.م ${vatAmount.toFixed(0)}`);
    }
    lines.push(`الإجمالي: ج.م ${total.toFixed(0)}`);
    if (footerNote) {
      lines.push('--------------------------');
      lines.push(footerNote);
    }

    return lines.join('\n');
  };

  const normalizeWhatsappPhone = (raw: string) => {
    const digits = String(raw || '').replace(/[^0-9]/g, '');
    if (!digits) return '';
    if (/^01\d{9}$/.test(digits)) return `20${digits.slice(1)}`;
    if (/^0\d{9,14}$/.test(digits)) return digits.slice(1);
    return digits;
  };

  const handleWhatsAppInvoice = () => {
    if (cart.length === 0) return;
    const phone = normalizeWhatsappPhone(customerPhone);
    if (!phone) return;
    const text = encodeURIComponent(formatInvoiceText());
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrintInvoice = () => {
    if (cart.length === 0) return;

    const shopName = String(effectiveReceiptTheme?.shopName || '').trim();
    const phone = String(effectiveReceiptTheme?.phone || '').trim();
    const city = String((effectiveReceiptTheme as any)?.city || '').trim();
    const address = String(effectiveReceiptTheme?.address || '').trim();
    const footerNote = String(effectiveReceiptTheme?.footerNote || '').trim();
    const logoDataUrl = String(effectiveReceiptTheme?.logoDataUrl || '').trim();
    const now = new Date();

    const itemsHtml = cart
      .map((item) => {
        const name = String(item.name || '');
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const lineTotal = price * qty;
        return `
          <div class="item">
            <div class="item-name">${name}</div>
            <div class="item-meta">
              <span>×${qty}</span>
              <span>ج.م ${price.toFixed(0)}</span>
              <span>ج.م ${lineTotal.toFixed(0)}</span>
            </div>
          </div>
        `;
      })
      .join('');

    const html = `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Receipt</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            html, body { margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; color: #111; display: flex; justify-content: center; }
            .paper { width: 72mm; padding: 4mm; }
            .center { text-align: center; }
            .shop { font-weight: 900; font-size: 16px; margin: 0; }
            .meta { font-size: 11px; font-weight: 700; margin-top: 2px; color: #333; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .items { margin-top: 6px; }
            .item { padding: 6px 0; border-bottom: 1px dotted #bbb; }
            .item-name { font-size: 12px; font-weight: 900; }
            .item-meta { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; margin-top: 2px; }
            .totals { margin-top: 8px; font-size: 12px; font-weight: 900; }
            .totals-row { display: flex; justify-content: space-between; margin-top: 4px; }
            .footer { margin-top: 8px; font-size: 11px; font-weight: 800; text-align: center; color: #333; }
          </style>
        </head>
        <body>
          <div class="paper">
            <div class="center">
              ${logoDataUrl ? `<img src="${logoDataUrl}" alt="logo" style="width:52px;height:52px;border-radius:14px;object-fit:cover;border:1px solid #eee;" />` : ''}
              ${shopName ? `<p class="shop">${shopName}</p>` : ''}
              ${phone ? `<div class="meta">هاتف: ${phone}</div>` : ''}
              ${city ? `<div class="meta">المدينة: ${city}</div>` : ''}
              ${address ? `<div class="meta">العنوان: ${address}</div>` : ''}
              <div class="meta">${now.toLocaleString('ar-EG')}</div>
              <div class="meta">${orderType === 'dine-in' ? 'محلي' : 'سفري'}</div>
            </div>
            <div class="divider"></div>
            <div class="items">${itemsHtml}</div>
            <div class="divider"></div>
            <div class="totals">
              <div class="totals-row"><span>قبل الضريبة</span><span>ج.م ${subtotal.toFixed(0)}</span></div>
              ${showVat ? `<div class="totals-row"><span>ضريبة ${vatRatePct}%</span><span>ج.م ${vatAmount.toFixed(0)}</span></div>` : ''}
              <div class="totals-row"><span>الإجمالي</span><span>ج.م ${total.toFixed(0)}</span></div>
            </div>
            ${footerNote ? `<div class="footer">${footerNote}</div>` : ''}
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      try {
        document.body.removeChild(iframe);
      } catch {
      }
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
      }
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {
        }
      }, 300);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col md:flex-row font-sans text-right overflow-hidden" dir="rtl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      
      {/* Product Feed - Main Area */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
        <header className="sticky top-0 z-50 p-4 md:p-8 bg-white border-b border-slate-100 flex items-center gap-3 md:gap-6 flex-row-reverse">
          <button onClick={onClose} className="p-3 md:p-4 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all active:scale-95">
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-slate-900" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن منتج..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl py-4 md:py-5 pr-12 md:pr-16 pl-4 md:pl-8 outline-none focus:ring-2 focus:ring-[#BD00FF] transition-all text-base md:text-xl font-bold text-right"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="رقم العميل"
              className="bg-white border border-slate-200 rounded-xl md:rounded-2xl py-4 md:py-5 px-4 md:px-6 outline-none focus:ring-2 focus:ring-[#BD00FF] transition-all text-base md:text-xl font-bold text-right w-40 md:w-48"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-1 md:p-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-6 pb-24 md:pb-4">
          {filteredProducts.map(product => (
            <MotionDiv 
              whileTap={{ scale: 0.95 }}
              key={product.id}
              onClick={() => addToCart(product, 1)}
              className="relative active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed aspect-square"
            >
              <div className="w-full h-full rounded-lg md:rounded-[1.8rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#BD00FF] transition-all group overflow-hidden relative flex flex-col">
                <div className="flex-1 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <ShoppingCart className="w-6 h-6 md:w-12 md:h-12 text-slate-300" />
                    </div>
                  )}
                  {(() => {
                    const trackStock = isProductTrackStockEnabled(product);
                    if (!trackStock) {
                      return (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] md:text-[10px] font-black shadow-sm bg-emerald-50 text-emerald-700">
                          متاح
                        </div>
                      );
                    }

                    const stock = typeof product.stock === 'number' ? product.stock : undefined;
                    const cls = (stock ?? 0) <= 0 ? 'bg-slate-900 text-white' : (stock ?? 0) < 5 ? 'bg-red-500 text-white' : 'bg-white/90';
                    return (
                      <div className={`absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] md:text-[10px] font-black shadow-sm ${cls}` }>
                        {(stock ?? 0) <= 0 ? 'نفد' : (typeof stock === 'number' ? stock : '-')}
                      </div>
                    );
                  })()}
                </div>
                <p className="text-[#BD00FF] font-black text-[10px] md:text-lg text-center py-1 bg-white">ج.م {product.price}</p>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>

      {/* Mobile: Invoice Bar + Full Screen Invoice */}
      {!isInvoiceOpen && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-[250] bg-white border-t border-slate-200" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <button
            type="button"
            onClick={() => setIsInvoiceOpen(true)}
            className="w-full p-3 flex items-center justify-between flex-row-reverse active:scale-[0.99]"
          >
            <h2 className="text-base font-black flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-[#BD00FF]" /> عرض الفاتورة
            </h2>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-slate-900 text-white rounded-lg font-black text-xs">{cartCount}</div>
              <div className="font-black text-sm text-slate-900">ج.م {total.toFixed(0)}</div>
              <ChevronUp className="w-5 h-5 text-slate-400 rotate-180" />
            </div>
          </button>
        </div>
      )}

      <AnimatePresence>
        {isInvoiceOpen && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-[300] bg-white flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-row-reverse gap-3">
              <button onClick={() => setIsInvoiceOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all active:scale-95">
                <ChevronRight className="w-6 h-6 text-slate-900" />
              </button>

              <div className="flex-1 flex items-center justify-between gap-3 flex-row-reverse">
                <div className="text-right">
                  <p className="font-black text-base leading-tight">الفاتورة</p>
                  <p className="text-[11px] font-bold text-slate-400">عدد الأصناف: {cartCount}</p>
                </div>

                <div className="text-right">
                  {effectiveReceiptTheme?.shopName ? (
                    <p className="font-black text-sm text-slate-900 leading-tight">{effectiveReceiptTheme.shopName}</p>
                  ) : null}
                  <div className="text-[10px] font-bold text-slate-400 leading-tight">
                    {effectiveReceiptTheme?.phone ? <span>{effectiveReceiptTheme.phone}</span> : null}
                    {effectiveReceiptTheme?.phone && (effectiveReceiptTheme as any)?.city ? <span> • </span> : null}
                    {(effectiveReceiptTheme as any)?.city ? <span>{String((effectiveReceiptTheme as any).city)}</span> : null}
                  </div>
                </div>

                {effectiveReceiptTheme?.logoDataUrl ? (
                  <img
                    src={effectiveReceiptTheme.logoDataUrl}
                    className="w-10 h-10 rounded-2xl object-cover bg-white border border-slate-100"
                    alt="receipt-logo"
                  />
                ) : (
                  <div className="w-10 h-10" />
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                  <p className="font-black text-base">السلة فارغة</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between flex-row-reverse">
                    <div className="text-right flex-1 pr-2">
                      <p className="font-black text-[13px] text-slate-900 leading-tight">{item.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">ج.م {item.price}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-100 flex-row-reverse">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-slate-50 rounded-xl active:scale-95 min-h-[40px] w-[40px] flex items-center justify-center touch-manipulation"><Minus size={16} /></button>
                        <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-slate-50 rounded-xl active:scale-95 min-h-[40px] w-[40px] flex items-center justify-center touch-manipulation"><Plus size={16} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-red-500 active:scale-95 min-h-[40px] w-[40px] flex items-center justify-center touch-manipulation"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <div className="bg-white border border-slate-100 rounded-2xl p-3 mb-3">
                <div className="flex items-center justify-between flex-row-reverse text-[11px] font-black text-slate-600">
                  <span>قبل الضريبة</span>
                  <span>ج.م {subtotal.toFixed(0)}</span>
                </div>
                {showVat && (
                  <div className="flex items-center justify-between flex-row-reverse text-[11px] font-black text-slate-600 mt-2">
                    <span>ضريبة {vatRatePct}%</span>
                    <span>ج.م {vatAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between flex-row-reverse text-sm font-black text-slate-900 mt-2">
                  <span>الإجمالي</span>
                  <span className="text-[#BD00FF]">ج.م {total.toFixed(0)}</span>
                </div>
              </div>

              {effectiveReceiptTheme?.footerNote && (
                <div className="pb-2 text-center text-[10px] font-bold text-slate-400">{effectiveReceiptTheme.footerNote}</div>
              )}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={cart.length === 0}
                    onClick={handlePrintInvoice}
                    className="py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-900 hover:border-[#BD00FF] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Printer size={18} /> طباعة
                  </button>
                  <button
                    type="button"
                    disabled={cart.length === 0 || !String(customerPhone || '').trim()}
                    onClick={handleWhatsAppInvoice}
                    className="py-3 bg-white border border-slate-200 rounded-xl font-black text-sm text-slate-900 hover:border-[#BD00FF] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <MessageCircle size={18} /> واتساب
                  </button>
                </div>
              </div>
              <button
                disabled={cart.length === 0 || isProcessing}
                onClick={processPayment}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-[#BD00FF] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.97] min-h-[44px] touch-manipulation"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : 'تأكيد ودفع'}
              </button>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <div className="hidden md:flex md:w-[450px] lg:w-[500px] h-full bg-white border-r border-slate-100 flex-col shadow-2xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-row-reverse gap-6">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-[#BD00FF]" /> الفاتورة
          </h2>

          <div className="flex items-center gap-4 flex-row-reverse">
            <div className="text-right">
              {effectiveReceiptTheme?.shopName && <p className="font-black text-lg text-slate-900 leading-tight">{effectiveReceiptTheme.shopName}</p>}
              <div className="text-xs font-bold text-slate-400 leading-tight">
                {effectiveReceiptTheme?.phone ? <span>{effectiveReceiptTheme.phone}</span> : null}
                {effectiveReceiptTheme?.phone && (effectiveReceiptTheme as any)?.city ? <span> • </span> : null}
                {(effectiveReceiptTheme as any)?.city ? <span>{String((effectiveReceiptTheme as any).city)}</span> : null}
              </div>
              {effectiveReceiptTheme?.address && <div className="text-[11px] font-bold text-slate-400 leading-tight">{effectiveReceiptTheme.address}</div>}
            </div>
            {effectiveReceiptTheme?.logoDataUrl ? (
              <img src={effectiveReceiptTheme.logoDataUrl} className="w-14 h-14 rounded-3xl object-cover bg-white border border-slate-100" alt="receipt-logo" />
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
              <p className="font-black text-lg">السلة فارغة</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between flex-row-reverse">
                <div className="text-right flex-1 pr-3">
                  <p className="font-black text-sm text-slate-900">{item.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">ج.م {item.price}</p>
                </div>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="flex items-center bg-white rounded-lg p-2 shadow-sm border border-slate-100 flex-row-reverse">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-slate-50 rounded-lg active:scale-95"><Minus size={16} /></button>
                    <span className="w-10 text-center font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-slate-50 rounded-lg active:scale-95"><Plus size={16} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-red-500 active:scale-95"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-3">
            <div className="flex justify-between items-center flex-row-reverse text-xs font-black text-slate-600">
              <span>قبل الضريبة</span>
              <span>ج.م {subtotal.toFixed(0)}</span>
            </div>
            {showVat && (
              <div className="flex justify-between items-center flex-row-reverse text-xs font-black text-slate-600 mt-2">
                <span>ضريبة {vatRatePct}%</span>
                <span>ج.م {vatAmount.toFixed(0)}</span>
              </div>
            )}
            <div className="flex justify-between items-center flex-row-reverse mt-2">
              <span className="font-black text-slate-900 text-sm">الإجمالي</span>
              <span className="text-2xl font-black text-[#BD00FF]">ج.م {total.toFixed(0)}</span>
            </div>
          </div>
          {effectiveReceiptTheme?.footerNote && (
            <div className="text-center text-xs font-bold text-slate-400">{effectiveReceiptTheme.footerNote}</div>
          )}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handlePrintInvoice}
                className="py-4 bg-white border border-slate-200 rounded-2xl font-black text-base text-slate-900 hover:border-[#BD00FF] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <Printer size={20} /> طباعة
              </button>
              <button
                type="button"
                disabled={cart.length === 0 || !String(customerPhone || '').trim()}
                onClick={handleWhatsAppInvoice}
                className="py-4 bg-white border border-slate-200 rounded-2xl font-black text-base text-slate-900 hover:border-[#BD00FF] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <MessageCircle size={20} /> واتساب
              </button>
            </div>
          </div>
          <button 
            disabled={cart.length === 0 || isProcessing}
            onClick={processPayment}
            className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-[#BD00FF] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.97]"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : 'تأكيد ودفع'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[500] bg-white flex items-center justify-center p-6 text-center">
            <div className="space-y-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-[#BD00FF] rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <CheckCircle2 size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-black">تم البيع بنجاح</h2>
              <p className="text-slate-500 font-bold">تم تحديث المخزون والتقارير المالية.</p>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POSSystem;
