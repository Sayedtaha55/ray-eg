import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

const MotionDiv = motion.div as any;

interface POSCartProps {
  cart: any[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  subtotal: number;
  vatAmount: number;
  total: number;
  vatRatePct: number;
  orderType: 'dine-in' | 'takeaway';
  setOrderType: (type: 'dine-in' | 'takeaway') => void;
  isProcessing: boolean;
  processPayment: () => void;
}

const POSCart: React.FC<POSCartProps> = ({
  cart,
  updateQuantity,
  removeFromCart,
  subtotal,
  vatAmount,
  total,
  vatRatePct,
  orderType,
  setOrderType,
  isProcessing,
  processPayment,
}) => {
  return (
    <div className="w-full md:w-[450px] bg-white border-r border-slate-100 flex flex-col shadow-2xl relative z-50">
      <div className="p-6 md:p-8 border-b border-slate-100 bg-white sticky top-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#BD00FF]/10 p-2.5 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-[#BD00FF]" />
            </div>
            <h2 className="text-xl md:text-2xl font-black">السلة الحالية</h2>
          </div>
          <span className="bg-slate-100 px-4 py-1.5 rounded-full text-xs font-black">{cart.length} أصناف</span>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1.5">
          <button
            onClick={() => setOrderType('dine-in')}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${orderType === 'dine-in' ? 'bg-white shadow-md text-slate-900 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            محلي
          </button>
          <button
            onClick={() => setOrderType('takeaway')}
            className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${orderType === 'takeaway' ? 'bg-white shadow-md text-slate-900 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            سفري
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {cart.map((item) => (
            <MotionDiv
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              key={item.id}
              className="bg-white border border-slate-100 p-4 md:p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 text-right">
                  <h4 className="font-black text-slate-900 leading-tight mb-1">{item.name}</h4>
                  <p className="text-[#BD00FF] font-black text-sm">ج.م {item.price.toFixed(2)}</p>
                  {item.variantSelection && (
                    <div className="text-[10px] font-bold text-slate-400 mt-1">
                      {item.variantSelection.typeName && `${item.variantSelection.typeName} - `}
                      {item.variantSelection.sizeLabel || item.variantSelection.size || ''}
                      {item.variantSelection.colorName && ` (${item.variantSelection.colorName})`}
                    </div>
                  )}
                  {item.addons?.length > 0 && (
                    <div className="text-[10px] font-bold text-emerald-500 mt-0.5">
                      + {item.addons.map((a: any) => a.optionName || a.variantLabel).join(', ')}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:border-[#BD00FF] hover:text-[#BD00FF] transition-all active:scale-90"
                  >
                    <Plus size={18} />
                  </button>
                  <span className="font-black text-lg w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all active:scale-90"
                  >
                    <Minus size={18} />
                  </button>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-900">ج.م {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </MotionDiv>
          ))}
        </AnimatePresence>

        {cart.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
            <ShoppingCart size={64} className="mb-4 opacity-20" />
            <p className="font-black text-lg">السلة فارغة</p>
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 bg-white border-t border-slate-100 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-slate-500 font-bold">
            <span>المجموع الفرعي</span>
            <span>ج.م {subtotal.toFixed(2)}</span>
          </div>
          {vatRatePct > 0 && (
            <div className="flex justify-between text-slate-500 font-bold">
              <span>الضريبة ({vatRatePct}%)</span>
              <span>ج.م {vatAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-end pt-2">
            <span className="text-xl md:text-2xl font-black text-slate-900">الإجمالي</span>
            <span className="text-2xl md:text-3xl font-black text-[#BD00FF]">ج.م {total.toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={cart.length === 0 || isProcessing}
          onClick={processPayment}
          className="w-full py-5 md:py-6 bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black text-lg md:text-xl shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isProcessing ? 'جاري التنفيذ...' : 'إتمام العملية الآن'}
        </button>
      </div>
    </div>
  );
};

export default POSCart;
