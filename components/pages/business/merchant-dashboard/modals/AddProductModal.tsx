import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
};

const MotionDiv = motion.div as any;

const AddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('عام');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('الصورة كبيرة جداً، يرجى اختيار صورة أقل من 2 ميجابايت', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!imageFile) {
      addToast('يرجى اختيار صورة للمنتج أولاً', 'info');
      return;
    }
    setLoading(true);
    try {
      await ApiService.addProduct({
        shopId,
        name,
        price: Number(price),
        stock: Number(stock),
        category: cat,
        imageUrl: imageFile,
      });
      addToast('تمت إضافة المنتج بنجاح!', 'success');
      setName('');
      setPrice('');
      setStock('');
      setCat('عام');
      setImageFile(null);
      onClose();
    } catch {
      addToast('فشل في إضافة المنتج', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 text-right shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">إضافة صنف جديد</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">صورة المنتج</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-square md:aspect-video rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group ${
                imageFile ? 'border-transparent' : 'border-slate-100 hover:border-[#00E5FF] hover:bg-cyan-50'
              }`}
            >
              {imageFile ? (
                <>
                  <img src={imageFile} className="w-full h-full object-cover" alt="preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2">
                      <Upload size={16} /> تغيير الصورة
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-[#00E5FF] transition-colors">
                    <Upload size={32} />
                  </div>
                  <p className="font-black text-slate-900 mb-1">اضغط لرفع صورة</p>
                  <p className="text-xs text-slate-400 font-bold">JPG, PNG (بحد أقصى 2 ميجا)</p>
                </div>
              )}
              <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handleImageChange} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اسم الصنف</label>
              <input
                required
                placeholder="مثلاً: قميص أبيض قطن"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">السعر (ج.م)</label>
                <input
                  required
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الكمية المتوفرة</label>
                <input
                  required
                  type="number"
                  placeholder="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">القسم</label>
              <input
                placeholder="مثلاً: ملابس صيفية"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-2xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 mt-4 disabled:bg-slate-200"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} className="text-[#00E5FF]" />}
            {loading ? 'جاري الحفظ...' : 'تأكيد وحفظ الصنف'}
          </button>
        </form>
      </MotionDiv>
    </div>
  );
};

export default AddProductModal;
