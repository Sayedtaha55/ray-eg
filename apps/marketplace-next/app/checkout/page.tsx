'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, Loader2, CheckCircle, Store, Truck, Banknote } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';
import { getStoredAuthToken, jsonRequest } from '@/lib/api';
import { LocationPicker } from '@/components/LocationPicker';
import { playOrderNotifSound } from '@/lib/sounds';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, itemsByShop, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<any>(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const shopGroups = itemsByShop();


  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    try {
      if (!getStoredAuthToken()) {
        router.push('/login?returnTo=/checkout');
        return;
      }

      const orders: any[] = [];
      const shopEntries = Object.entries(shopGroups);

      for (const [shopId, shopItems] of shopEntries) {
        const shopTotal = shopItems.reduce((s, i) => s + i.price * i.quantity, 0);
        const order = await jsonRequest<any>('/orders', {
          method: 'POST',
          body: JSON.stringify({
            shopId,
            items: shopItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
            customerPhone: phone || undefined,
            deliveryAddressManual: [city, district, address].filter(Boolean).join('، ') || undefined,
            deliveryLat: coords?.lat,
            deliveryLng: coords?.lng,
            deliveryNote: notes || undefined,
            paymentMethod: paymentMethod === 'cod' ? 'COD' : 'CARD',
            total: shopTotal,
            source: 'marketplace',
          }),
        }).catch((err) => {
          throw new Error(err?.message || `فشل إنشاء الطلب من ${shopItems[0]?.shopName}`);
        });

        orders.push(order);
      }

      clearCart();
      setSuccess({ orders, count: orders.length });
      playOrderNotifSound();
    } catch (err: any) {
      setError(err?.message || 'فشل إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">تم إنشاء طلبك بنجاح!</h1>
        <p className="text-slate-500 font-semibold mb-8">
          {success.count > 1
            ? `تم إنشاء ${success.count} طلبات من متاجر مختلفة`
            : 'سيتم التواصل معك قريباً لتأكيد الطلب'}
        </p>
        <div className="space-y-3 mb-8">
          {success.orders.map((o: any) => (
            <div
              key={String(o?.id || Math.random())}
              className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-brand-purple" />
                <div className="text-right">
                  <div className="font-bold text-sm">طلب #{String(o?.id || o?.orderNumber || '').slice(0, 8).toUpperCase()}</div>
                  <div className="text-xs text-slate-500">{o?.shopName || o?.shop?.name || ''}</div>
                </div>
              </div>
              <Link
                href={`/track/${o?.id || o?.orderNumber || ''}`}
                className="text-brand-cyan font-bold text-sm hover:underline"
              >
                تتبع الطلب
              </Link>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-brand-gradient text-white font-bold text-sm"
          >
            العودة للرئيسية
          </Link>
          <Link
            href="/dalil"
            className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-sm"
          >
            متابعة التسوق
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">سلتك فارغة</h1>
        <p className="text-slate-500 font-semibold mb-6">أضف منتجات قبل إتمام الطلب</p>
        <Link href="/dalil" className="px-6 py-3 rounded-xl bg-brand-gradient text-white font-bold text-sm">
          تصفح المتاجر
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
        <Link href="/" className="hover:text-brand-cyan">الرئيسية</Link>
        <span>/</span>
        <span className="text-slate-600 dark:text-slate-300">إتمام الطلب</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-8">إتمام الطلب</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Info */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-5">
              <MapPin className="w-5 h-5 text-brand-cyan" />
              بيانات التوصيل
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">الاسم الكامل *</label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 font-semibold text-sm outline-none focus:border-brand-cyan transition-colors"
                  placeholder="الاسم"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">رقم الهاتف *</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 font-semibold text-sm outline-none focus:border-brand-cyan transition-colors"
                  placeholder="01xxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">المدينة *</label>
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 font-semibold text-sm outline-none focus:border-brand-cyan transition-colors"
                  placeholder="القاهرة، الإسكندرية..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">المنطقة</label>
                <input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 font-semibold text-sm outline-none focus:border-brand-cyan transition-colors"
                  placeholder="المنطقة / الحي"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-2">العنوان بالتفصيل *</label>
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 font-semibold text-sm outline-none focus:border-brand-cyan transition-colors resize-none"
                  placeholder="الشارع، رقم المبنى، الشقة..."
                />
              </div>
              <div className="md:col-span-2">
                <LocationPicker
                  initialCoords={coords}
                  onLocationSelect={(lat, lng) => setCoords({ lat, lng })}
                  onAddressResolved={(addr) => {
                    if (addr.city) setCity(addr.city);
                    if (addr.district) setDistrict(addr.district);
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-2">ملاحظات (اختياري)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 font-semibold text-sm outline-none focus:border-brand-cyan transition-colors resize-none"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-5">
              <CreditCard className="w-5 h-5 text-brand-cyan" />
              طريقة الدفع
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-brand-cyan bg-brand-cyan/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <Banknote className={`w-6 h-6 ${paymentMethod === 'cod' ? 'text-brand-cyan' : 'text-slate-400'}`} />
                <span className="font-bold text-sm">الدفع عند الاستلام</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'border-brand-cyan bg-brand-cyan/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-brand-cyan' : 'text-slate-400'}`} />
                <span className="font-bold text-sm">بطاقة ائتمان</span>
              </button>
            </div>
            {paymentMethod === 'card' && (
              <div className="mt-4 p-4 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-bold">
                سيتم تحويلك لصفحة الدفع الآمن بعد تأكيد الطلب
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-5">ملخص الطلب</h2>

            {/* Items by shop */}
            <div className="space-y-4 mb-5 max-h-[300px] overflow-y-auto">
              {Object.entries(shopGroups).map(([shopId, shopItems]) => (
                <div key={shopId}>
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <Store className="w-4 h-4 text-brand-purple" />
                    <span className="font-bold text-xs text-slate-600 dark:text-slate-400">{shopItems[0].shopName}</span>
                  </div>
                  <div className="space-y-2">
                    {shopItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <span className="font-bold text-xs">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-sm font-semibold text-slate-500">
                <span>عدد المنتجات</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-500">
                <span>الشحن</span>
                <span className="text-green-500">يُحدد لاحقاً</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>الإجمالي</span>
                <span className="text-brand-cyan">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 rounded-xl text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-5 py-4 bg-brand-gradient text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
            </button>

            <Link
              href="/dalil"
              className="w-full mt-3 py-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-cyan transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              متابعة التسوق
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
