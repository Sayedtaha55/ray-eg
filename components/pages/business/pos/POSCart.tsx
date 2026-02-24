import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, Printer } from 'lucide-react';

const MotionDiv = motion.div as any;

interface POSCartProps {
  cart: any[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  subtotal: number;
  vatAmount: number;
  total: number;
  vatRatePct: number;
  isProcessing: boolean;
  processPayment: () => void;
  onPrintReceipt?: () => void;
  variant?: 'desktop' | 'mobile';
}

const POSCart: React.FC<POSCartProps> = ({
  cart,
  updateQuantity,
  removeFromCart,
  subtotal,
  vatAmount,
  total,
  vatRatePct,
  isProcessing,
  processPayment,
  onPrintReceipt,
  variant = 'desktop',
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const itemsCount = useMemo(() => {
    const count = cart.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0);
    return Number.isFinite(count) && count > 0 ? count : 0;
  }, [cart]);

  const canCheckout = cart.length > 0 && !isProcessing;

  const content = (
    <>
      <div className="p-4 md:p-8 border-b border-slate-100 bg-white sticky top-0">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#BD00FF]/10 p-2.5 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-[#BD00FF]" />
            </div>
            <h2 className="text-xl md:text-2xl font-black">السلة الحالية</h2>
          </div>
          <span className="bg-slate-100 px-4 py-1.5 rounded-full text-xs font-black">{cart.length} أصناف</span>
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
              className="bg-white border border-slate-100 p-3 md:p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 text-right">
                  <h4 className="font-black text-slate-900 leading-tight mb-0.5 text-sm md:text-base">{item.name}</h4>
                  <p className="text-[#BD00FF] font-black text-xs md:text-sm">ج.م {Number(item.price || 0).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-9 h-9 md:w-10 md:h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:border-[#BD00FF] hover:text-[#BD00FF] transition-all active:scale-90"
                  >
                    <Plus size={18} />
                  </button>
                  <span className="font-black text-base md:text-lg w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-9 h-9 md:w-10 md:h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all active:scale-90"
                  >
                    <Minus size={18} />
                  </button>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-900 text-sm md:text-base">ج.م {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</p>
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

      <div className="p-3 md:p-8 bg-white border-t border-slate-100 space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-slate-500 font-bold text-sm md:text-base">
            <span>المجموع الفرعي</span>
            <span>ج.م {subtotal.toFixed(2)}</span>
          </div>
          {vatRatePct > 0 && (
            <div className="flex justify-between text-slate-500 font-bold text-sm md:text-base">
              <span>الضريبة ({vatRatePct}%)</span>
              <span>ج.م {vatAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-end pt-1">
            <span className="text-lg md:text-2xl font-black text-slate-900">الإجمالي</span>
            <span className="text-xl md:text-3xl font-black text-[#BD00FF]">ج.م {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <button
            type="button"
            disabled={!canCheckout || typeof onPrintReceipt !== 'function'}
            onClick={() => onPrintReceipt?.()}
            className="w-full py-4 md:py-6 bg-white border border-slate-200 text-slate-900 rounded-2xl md:rounded-3xl font-black text-sm md:text-lg shadow-sm hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Printer size={18} className="md:w-5 md:h-5" /> طباعة
          </button>
          <button
            type="button"
            disabled={!canCheckout}
            onClick={processPayment}
            className="w-full py-4 md:py-6 bg-slate-900 text-white rounded-2xl md:rounded-3xl font-black text-base md:text-xl shadow-2xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isProcessing ? 'جاري التنفيذ...' : 'إتمام العملية الآن'}
          </button>
        </div>
      </div>
    </>
  );

  if (variant === 'mobile') {
    const sheetYClosed = 520;
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 z-[120] md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="w-full px-4 pb-4"
          >
            <div className="mx-auto max-w-[1400px] rounded-[1.6rem] bg-slate-900 text-white shadow-2xl flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 w-10 h-10 rounded-2xl flex items-center justify-center">
                  <ShoppingCart size={18} />
                </div>
                <div className="text-right">
                  <div className="font-black text-sm">السلة</div>
                  <div className="text-xs text-white/70 font-bold">{itemsCount} قطعة</div>
                </div>
              </div>
              <div className="text-left">
                <div className="text-xs text-white/70 font-bold">الإجمالي</div>
                <div className="font-black">ج.م {total.toFixed(2)}</div>
              </div>
            </div>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[130] md:hidden bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen ? (
            <MotionDiv
              key="pos-cart-sheet"
              initial={{ y: sheetYClosed }}
              animate={{ y: 0 }}
              exit={{ y: sheetYClosed }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: sheetYClosed }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.y > 160 || info.velocity.y > 900) setMobileOpen(false);
              }}
              className="fixed bottom-0 left-0 right-0 z-[140] md:hidden bg-white rounded-t-[2rem] shadow-2xl flex flex-col h-[92vh]"
            >
              <div className="w-full flex justify-center pt-3 pb-2">
                <div className="w-14 h-1.5 rounded-full bg-slate-200" />
              </div>
              {content}
            </MotionDiv>
          ) : null}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="hidden md:flex w-full md:w-[450px] bg-white border-r border-slate-100 flex-col shadow-2xl relative z-50">
      {content}
    </div>
  );
};

export default POSCart;
