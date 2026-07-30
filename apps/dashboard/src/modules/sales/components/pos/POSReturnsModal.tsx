import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Search, Loader2, AlertCircle } from 'lucide-react';
import { ApiService } from '@/services/api.service';

const MotionDiv = motion.div as any;

interface Props {
  open: boolean;
  onClose: () => void;
  shopId: string;
  isArabic: boolean;
}

const POSReturnsModal: React.FC<Props> = ({ open, onClose, shopId, isArabic }) => {
  const [search, setSearch] = useState('');
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const searchOrder = useCallback(async () => {
    const q = search.trim();
    if (!q || !shopId) return;
    setLoading(true);
    setError('');
    setFoundOrder(null);
    try {
      const data = await ApiService.getAllOrders({ shopId });
      const orders = Array.isArray(data) ? data : [];
      const match = orders.find((o: any) =>
        String(o?.id || '').includes(q) ||
        String(o?.orderNumber || '').includes(q)
      );
      if (match) {
        setFoundOrder(match);
      } else {
        setError(isArabic ? 'لم يتم العثور على الفاتورة' : 'Invoice not found');
      }
    } catch {
      setError(isArabic ? 'خطأ في البحث' : 'Search error');
    } finally {
      setLoading(false);
    }
  }, [search, shopId, isArabic]);

  const processReturn = async () => {
    if (!foundOrder?.id) return;
    setProcessing(true);
    setError('');
    try {
      await (ApiService as any).updateOrder?.(foundOrder.id, { status: 'RETURNED' });
      setFoundOrder(null);
      setSearch('');
    } catch (e: any) {
      setError(e?.message || (isArabic ? 'فشل المرتجع' : 'Return failed'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[800] bg-black/40 flex items-center justify-center p-3 md:p-4"
          onClick={onClose}>
          <MotionDiv initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-lg bg-white rounded-[2rem] p-4 md:p-6 flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e: any) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 flex-row-reverse">
              <h3 className="text-lg md:text-xl font-black flex items-center gap-2">
                <RotateCcw size={20} />
                {isArabic ? 'مرتجع بالفاتورة' : 'Return by Invoice'}
              </h3>
              <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchOrder()}
                  placeholder={isArabic ? 'رقم الفاتورة...' : 'Invoice number...'}
                  className="w-full bg-slate-50 border rounded-xl py-2.5 pr-9 pl-4 outline-none text-sm focus:ring-2 focus:ring-[#BD00FF]" />
              </div>
              <button type="button" onClick={searchOrder} disabled={loading || !search.trim()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm disabled:opacity-50">
                {isArabic ? 'بحث' : 'Search'}
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold mb-4">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {foundOrder && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="font-black text-sm">#{foundOrder.orderNumber || foundOrder.id?.slice(-6)}</div>
                      <div className="text-[10px] text-slate-400 font-bold">
                        {foundOrder.createdAt ? new Date(foundOrder.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="font-black text-lg text-[#BD00FF]">
                        {isArabic ? 'ج.م' : 'EGP'} {Number(foundOrder.total || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {(Array.isArray(foundOrder.items) ? foundOrder.items : []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs font-bold text-slate-600 py-1 border-t border-slate-100">
                      <span>{item?.name || item?.productName || '—'} × {item?.quantity || 0}</span>
                      <span>{Number(item?.price || 0) * Number(item?.quantity || 0)}</span>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={processReturn} disabled={processing}
                  className="w-full py-3.5 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <RotateCcw size={18} />
                  {processing ? (isArabic ? 'جاري المعالجة...' : 'Processing...') : (isArabic ? 'تأكيد المرتجع' : 'Confirm Return')}
                </button>
              </div>
            )}

            {!loading && !error && !foundOrder && (
              <div className="text-center text-slate-400 py-12 font-bold text-sm">
                {isArabic ? 'ابحث عن فاتورة لعمل مرتجع' : 'Search for an invoice to process a return'}
              </div>
            )}
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
};

export default POSReturnsModal;
