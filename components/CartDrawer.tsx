
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ChevronLeft, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { ApiService } from '../services/api.service';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  shopId: string;
  shopName: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = { name: item.shopName, items: [] };
    }
    acc[item.shopId].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; items: CartItem[] }>);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setError('');
    
    try {
      // إرسال الطلب للباك إند
      await ApiService.placeOrder({
        items,
        total,
        paymentMethod: 'card'
      });
      
      setIsProcessing(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        window.location.reload(); 
      }, 2500);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err.message || 'يجب تسجيل الدخول لإتمام الشراء');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed left-0 top-0 h-full w-full max-w-md bg-white z-[201] shadow-2xl flex flex-col text-right"
            dir="rtl"
          >
            <header className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-[#00E5FF]" /> سلة التسوق
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {showSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                   <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-bounce">
                      <CheckCircle2 size={48} className="text-white" />
                   </div>
                   <h3 className="text-3xl font-black mb-2">تم تأكيد طلبك!</h3>
                   <p className="text-slate-400 font-bold">شكراً لثقتك في "تست"، جاري تجهيز طلباتك الآن.</p>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <ShoppingBag className="w-20 h-20 mb-4 opacity-20" />
                  <p className="font-bold">سلتك فارغة حالياً</p>
                </div>
              ) : (
                Object.entries(groupedItems).map(([shopId, shop]: [string, any]) => (
                  <div key={shopId} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                       <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded">متجر</span>
                       <h3 className="font-black text-slate-900">{shop.name}</h3>
                    </div>
                    {shop.items.map((item: CartItem) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{item.name}</p>
                          <p className="text-[#00E5FF] font-black text-xs">ج.م {item.price} × {item.quantity}</p>
                        </div>
                        <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            {!showSuccess && items.length > 0 && (
              <footer className="p-8 border-t border-slate-100 bg-slate-50 space-y-6">
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-400">الإجمالي الكلي</span>
                  <span className="text-3xl font-black">ج.م {total}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-5 bg-black text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-[#00E5FF] hover:text-black transition-all shadow-xl disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <>إتمام عملية الشراء <CreditCard className="w-5 h-5" /></>}
                </button>
              </footer>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
