import React from 'react';
import { motion } from 'framer-motion';
import { Card, Button } from '../../common/ui';
import { ShoppingCart, Tag } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  onCheckout: () => void;
  loading?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  discount,
  delivery,
  total,
  onCheckout,
  loading = false,
}) => {
  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingCart size={24} className="text-[#00E5FF]" />
        <h3 className="text-xl font-black text-white">ملخص الطلب</h3>
      </div>

      <div className="space-y-4">
        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">المجموع الفرعي</span>
          <span className="text-white font-bold">{subtotal} ج.م</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-green-400" />
              <span className="text-green-400">الخصم</span>
            </div>
            <span className="text-green-400 font-bold">-{discount} ج.م</span>
          </div>
        )}

        {/* Delivery */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">رسوم التوصيل</span>
          <span className="text-white font-bold">
            {delivery === 0 ? 'مجاني' : `${delivery} ج.م`}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-black text-white">الإجمالي</span>
          <span className="text-2xl font-black text-[#00E5FF]">{total} ج.م</span>
        </div>
      </div>

      {/* Checkout Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onCheckout}
          loading={loading}
          disabled={total <= 0}
          className="w-full py-4 text-lg"
        >
          إتمام الطلب
        </Button>
      </motion.div>

      {/* Promo Code */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">كود الخصم</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="أدخل كود الخصم"
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none focus:border-[#00E5FF] transition-all"
          />
          <Button variant="secondary" size="sm">
            تطبيق
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CartSummary;
