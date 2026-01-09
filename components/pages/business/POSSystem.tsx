
import React, { useState, useEffect } from 'react';
import { RayDB } from '@/constants';
import { Search, ShoppingCart, Plus, Minus, Trash2, ChevronRight, CheckCircle2, Info, HelpCircle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;

const POSSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');

  useEffect(() => {
    const loadProducts = async () => {
      const data = await RayDB.getProducts();
      setProducts(data);
    };
    loadProducts();
  }, []);

  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  };

  const processPayment = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const sale = {
      id: Math.random().toString(36).substr(2, 6),
      items: cart,
      total: subtotal * 1.14,
      type: orderType,
      createdAt: Date.now()
    };

    setTimeout(() => {
      RayDB.addSale(sale);
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCart([]);
        onClose();
      }, 1500);
    }, 1200);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal * 1.14;
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col md:flex-row font-sans text-right overflow-hidden" dir="rtl">
      
      {/* Product Feed - Main Area */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
        <header className="p-4 md:p-8 bg-white border-b border-slate-100 flex items-center gap-3 md:gap-6 flex-row-reverse">
          <button onClick={onClose} className="p-2 md:p-3 hover:bg-slate-100 rounded-xl md:rounded-2xl transition-all">
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-slate-900" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن منتج..." 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl py-3 md:py-5 pr-12 md:pr-16 pl-4 md:pl-8 outline-none focus:ring-2 focus:ring-[#BD00FF] transition-all text-sm md:text-xl font-bold text-right"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pb-32 md:pb-10">
          {products.filter(p => p.name.includes(search)).map(product => (
            <MotionButton 
              whileTap={{ scale: 0.95 }}
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-3 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#BD00FF] transition-all group flex flex-col items-center text-center relative"
            >
              <div className="w-full aspect-square rounded-xl md:rounded-[1.8rem] bg-slate-50 mb-3 md:mb-6 overflow-hidden">
                <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-black text-xs md:text-lg mb-1 truncate w-full">{product.name}</h3>
              <p className="text-[#BD00FF] font-black text-sm md:text-2xl">ج.م {product.price}</p>
              <div className={`absolute top-4 left-4 md:top-8 md:left-8 px-2 py-0.5 rounded-lg text-[8px] md:text-[10px] font-black shadow-sm ${product.stock < 5 ? 'bg-red-500 text-white' : 'bg-white/90'}`}>
                {product.stock}
              </div>
            </MotionButton>
          ))}
        </div>

        {/* Floating Mobile Cart Bar */}
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-[210]">
           <button 
             onClick={() => setShowCartMobile(true)}
             disabled={cart.length === 0}
             className={`w-full h-16 rounded-2xl flex items-center justify-between px-6 shadow-2xl transition-all active:scale-95 ${cart.length > 0 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400 opacity-50'}`}
           >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-[#BD00FF] rounded-lg flex items-center justify-center font-black">{cartCount}</div>
                 <span className="font-black text-sm">عرض الطلب</span>
              </div>
              <span className="font-black text-lg">ج.م {total.toFixed(0)}</span>
           </button>
        </div>
      </div>

      {/* Cart Sidebar / Bottom Sheet */}
      <AnimatePresence>
        {(showCartMobile || window.innerWidth > 768) && (
          <>
            {/* Overlay for Mobile */}
            <MotionDiv 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCartMobile(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[220] md:hidden"
            />
            
            <MotionDiv 
              initial={window.innerWidth < 768 ? { y: '100%' } : { x: '100%' }}
              animate={window.innerWidth < 768 ? { y: 0 } : { x: 0 }}
              exit={window.innerWidth < 768 ? { y: '100%' } : { x: '100%' }}
              className="fixed bottom-0 left-0 right-0 md:relative md:w-[450px] lg:w-[500px] h-[85vh] md:h-full bg-white md:border-r border-slate-100 flex flex-col shadow-2xl z-[230] rounded-t-[2.5rem] md:rounded-none"
            >
              <div className="p-6 md:p-10 border-b border-slate-50 flex items-center justify-between flex-row-reverse">
                <h2 className="text-xl md:text-3xl font-black flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-[#BD00FF]" /> الفاتورة
                </h2>
                <button onClick={() => setShowCartMobile(false)} className="md:hidden p-2 bg-slate-50 rounded-full"><X size={20} /></button>
              </div>

              <div className="p-6 border-b border-slate-50 space-y-4">
                 <div className="flex gap-2">
                    <button onClick={() => setOrderType('dine-in')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${orderType === 'dine-in' ? 'bg-[#BD00FF] text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>محلي</button>
                    <button onClick={() => setOrderType('takeaway')} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${orderType === 'takeaway' ? 'bg-[#BD00FF] text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>سفري</button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                     <p className="font-black">السلة فارغة</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between flex-row-reverse">
                      <div className="text-right flex-1 pr-3">
                         <p className="font-black text-sm text-slate-900">{item.name}</p>
                         <p className="text-[10px] font-bold text-slate-400">ج.م {item.price}</p>
                      </div>
                      <div className="flex items-center bg-white rounded-lg p-1.5 shadow-sm border border-slate-100 flex-row-reverse">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-50 rounded-lg"><Minus size={14} /></button>
                        <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-50 rounded-lg"><Plus size={14} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 md:p-10 bg-slate-50 border-t border-slate-200 space-y-4">
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="font-black text-slate-400">الإجمالي</span>
                  <span className="text-2xl md:text-4xl font-black text-[#BD00FF]">ج.م {total.toFixed(0)}</span>
                </div>
                <button 
                  disabled={cart.length === 0 || isProcessing}
                  onClick={processPayment}
                  className="w-full py-4 md:py-6 bg-slate-900 text-white rounded-2xl md:rounded-[2rem] font-black text-lg md:text-2xl hover:bg-[#BD00FF] transition-all shadow-2xl flex items-center justify-center gap-3"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'تأكيد ودفع'}
                </button>
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>

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
