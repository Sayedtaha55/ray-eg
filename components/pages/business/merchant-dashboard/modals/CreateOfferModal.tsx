import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { Product } from '@/types';
import { useToast } from '@/components';

type Props = {
  product: Product | null;
  onClose: () => void;
  shopId: string;
};

const MotionDiv = motion.div as any;

const CreateOfferModal: React.FC<Props> = ({ product, onClose, shopId }) => {
  const [discount, setDiscount] = useState('20');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  if (!product) return null;

  const newPrice = Math.round((product as any).price * (1 - Number(discount) / 100));

  const handleCreate = async () => {
    setLoading(true);
    try {
      await ApiService.createOffer({
        productId: (product as any).id,
        shopId,
        title: (product as any).name,
        description: `عرض خاص وحصري على ${(product as any).name}`,
        discount: Number(discount),
        oldPrice: (product as any).price,
        newPrice,
        imageUrl: (product as any).imageUrl || (product as any).image_url,
      });
      addToast('تم نشر العرض في الصفحة الرئيسية!', 'success');
      onClose();
    } catch {
      addToast('فشل في إنشاء العرض', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-md rounded-[3rem] p-10 text-right shadow-2xl">
        <h2 className="text-3xl font-black mb-8">
          إنشاء عرض فلاش <Zap className="text-[#BD00FF] inline" />
        </h2>
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
            <img src={(product as any).imageUrl || (product as any).image_url} className="w-16 h-16 rounded-xl object-cover" />
            <div className="text-right">
              <p className="font-black text-sm">{(product as any).name}</p>
              <p className="text-slate-400 font-bold text-xs">ج.م {(product as any).price}</p>
            </div>
          </div>
          <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full bg-slate-50 rounded-2xl p-6 text-3xl font-black text-center" />
          <div className="p-6 bg-purple-50 rounded-2xl text-center border border-purple-100">
            <p className="text-[10px] font-black text-purple-400 uppercase mb-2">السعر بعد الخصم</p>
            <p className="text-4xl font-black text-[#BD00FF]">ج.م {newPrice}</p>
          </div>
          <button onClick={handleCreate} disabled={loading} className="w-full py-5 bg-[#BD00FF] text-white rounded-2xl font-black text-xl shadow-xl">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'نشر العرض الآن'}
          </button>
        </div>
      </MotionDiv>
    </div>
  );
};

export default CreateOfferModal;
