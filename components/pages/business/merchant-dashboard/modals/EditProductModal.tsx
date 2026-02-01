import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components';
import { Category, Product } from '@/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
  product: Product | null;
  onUpdate: (product: Product) => void;
};

const MotionDiv = motion.div as any;

const EditProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory, product, onUpdate }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('عام');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadFile, setImageUploadFile] = useState<File | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [extraImagePreviews, setExtraImagePreviews] = useState<string[]>([]);
  const [extraImageUploadFiles, setExtraImageUploadFiles] = useState<File[]>([]);
  const [selectedColors, setSelectedColors] = useState<Array<{ name: string; value: string }>>([]);
  const [customColor, setCustomColor] = useState('#000000');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSize, setCustomSize] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraFilesInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const isRestaurant = String(shopCategory || '').toUpperCase() === 'RESTAURANT';

  const presetColors: Array<{ name: string; value: string }> = [
    { name: 'أسود', value: '#111827' },
    { name: 'أبيض', value: '#ffffff' },
    { name: 'رمادي', value: '#9ca3af' },
    { name: 'أحمر', value: '#ef4444' },
    { name: 'وردي', value: '#ec4899' },
    { name: 'بنفسجي', value: '#a855f7' },
    { name: 'أزرق', value: '#3b82f6' },
    { name: 'سماوي', value: '#06b6d4' },
    { name: 'أخضر', value: '#22c55e' },
    { name: 'أصفر', value: '#eab308' },
    { name: 'برتقالي', value: '#f97316' },
    { name: 'بني', value: '#a16207' },
  ];

  const presetSizes: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  // Load product data when modal opens
  useEffect(() => {
    if (isOpen && product) {
      setName(product.name || '');
      setPrice(String(product.price || ''));
      setStock(String(product.stock || ''));
      setCat(product.category || 'عام');
      setDescription(product.description || '');
      setImagePreview((product as any).imageUrl || (product as any).image_url || null);
      
      // Load extra images if available
      const images = (product as any).images || [];
      if (Array.isArray(images)) {
        setExtraImagePreviews(images.filter((img: any) => typeof img === 'string'));
      }
      
      // Load colors if available
      const colors = (product as any).colors || [];
      if (Array.isArray(colors)) {
        setSelectedColors(colors.filter((c: any) => c && typeof c === 'object' && c.name && c.value));
      }
      
      // Load sizes if available
      const sizes = (product as any).sizes || [];
      if (Array.isArray(sizes)) {
        setSelectedSizes(sizes.filter((s: any) => typeof s === 'string'));
      }
    }
  }, [isOpen, product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mime = String(file.type || '').toLowerCase().trim();
      const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
      if (!mime || !allowed.has(mime)) {
        addToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF', 'error');
        try {
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch {
        }
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        addToast('الصورة كبيرة جداً، يرجى اختيار صورة أقل من 2 ميجابايت', 'error');
        return;
      }
      try {
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
      } catch {
        // ignore
      }
      setImageUploadFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageChanged(true);
    }
  };

  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
    const nextFiles: File[] = [];
    const nextPreviews: string[] = [];

    for (const file of files) {
      const mime = String(file.type || '').toLowerCase().trim();
      if (!mime || !allowed.has(mime)) {
        addToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF', 'error');
        continue;
      }
      if (file.size > 2 * 1024 * 1024) {
        addToast('الصورة كبيرة جداً، يرجى اختيار صورة أقل من 2 ميجابايت', 'error');
        continue;
      }
      nextFiles.push(file);
      nextPreviews.push(URL.createObjectURL(file));
    }

    const combinedFiles = [...extraImageUploadFiles, ...nextFiles].slice(0, 5);
    const combinedPreviews = [...extraImagePreviews, ...nextPreviews].slice(0, 5);

    setExtraImageUploadFiles(combinedFiles);
    setExtraImagePreviews(combinedPreviews);

    try {
      if (extraFilesInputRef.current) extraFilesInputRef.current.value = '';
    } catch {
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!product) return;
    
    setLoading(true);
    try {
      let imageUrl = (product as any).imageUrl || (product as any).image_url || '';
      
      // Upload new main image if changed
      if (imageChanged && imageUploadFile) {
        const mime = String(imageUploadFile.type || '').toLowerCase().trim();
        const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
        if (!mime || !allowed.has(mime)) {
          addToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF', 'error');
          return;
        }
        const upload = await ApiService.uploadMedia({
          file: imageUploadFile,
          purpose: 'product_image',
          shopId,
        });
        imageUrl = upload.url;
      }

      // Upload extra images if new ones added
      let extraUrls: string[] = [];
      if (!isRestaurant && extraImageUploadFiles.length > 0) {
        const uploads = await Promise.all(
          extraImageUploadFiles.map((f) =>
            ApiService.uploadMedia({
              file: f,
              purpose: 'product_image',
              shopId,
            }),
          ),
        );
        extraUrls = uploads.map((u) => String(u?.url || '')).filter(Boolean);
      }

      const colors = !isRestaurant
        ? (selectedColors || []).map((c) => ({ name: String(c?.name || '').trim(), value: String(c?.value || '').trim() })).filter((c) => c.name && c.value)
        : [];
      const sizes = !isRestaurant
        ? (selectedSizes || []).map((s) => String(s || '').trim()).filter(Boolean)
        : [];

      // Prepare update payload
      const updatePayload: any = {
        name,
        price: Number(price),
        category: isRestaurant ? 'عام' : cat,
        description: description ? description : null,
        imageUrl,
        trackStock: isRestaurant ? false : true,
        ...(isRestaurant
          ? {}
          : {
              images: extraUrls.length > 0 ? [imageUrl, ...extraUrls] : (product as any).images || [imageUrl],
              colors,
              sizes,
            }),
      };

      // Only include stock if not restaurant
      if (!isRestaurant) {
        updatePayload.stock = Number(stock);
      }

      // Update product via API
      const updated = await ApiService.updateProduct(product.id, updatePayload);
      
      addToast('تم تحديث المنتج بنجاح!', 'success');
      onUpdate(updated);
      onClose();
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : 'فشل في تحديث المنتج';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 text-right shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black">تعديل الصنف</h2>
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
                imagePreview ? 'border-transparent' : 'border-slate-100 hover:border-[#00E5FF] hover:bg-cyan-50'
              }`}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover" alt="preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2">
                      <Upload size={16} /> تغيير الصورة
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-2rem flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-[#00E5FF] transition-colors">
                    <Upload size={32} />
                  </div>
                  <p className="font-black text-slate-900 mb-1">اضغط لرفع صورة</p>
                  <p className="text-xs text-slate-400 font-bold">JPG, PNG (بحد أقصى 2 ميجا)</p>
                </div>
              )}
              <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif" ref={fileInputRef} onChange={handleImageChange} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اسم الصنف</label>
              <input
                required
                placeholder={isRestaurant ? 'مثلاً: بيتزا مارجريتا' : 'مثلاً: قميص أبيض قطن'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
              />
            </div>

            <div className={`grid grid-cols-1 ${isRestaurant ? '' : 'md:grid-cols-2'} gap-6`}>
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
              {!isRestaurant && (
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
              )}
            </div>

            {!isRestaurant && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">القسم</label>
                <input
                  placeholder="مثلاً: ملابس صيفية"
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الوصف</label>
              <textarea
                placeholder={isRestaurant ? 'مثلاً: مكونات الوجبة...' : 'مثلاً: خامات المنتج، طريقة الاستخدام...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-bold text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all min-h-[140px]"
              />
            </div>

            {!isRestaurant && (
              <>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">صور إضافية (اختياري)</label>
                  <div className="flex flex-col gap-4">
                    <button
                      type="button"
                      onClick={() => extraFilesInputRef.current?.click()}
                      className="w-full py-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] font-black text-slate-500 hover:border-[#00E5FF]/40 hover:bg-white transition-all"
                    >
                      إضافة صور (حد أقصى 5)
                    </button>
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      ref={extraFilesInputRef}
                      onChange={handleExtraImagesChange}
                    />

                    {extraImagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {extraImagePreviews.map((p, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100">
                            <img src={p} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الألوان (اختياري)</label>
                    <div className="bg-slate-50 rounded-[1.5rem] p-4 border-2 border-transparent">
                      <div className="flex flex-wrap gap-2 justify-end">
                        {presetColors.map((c) => {
                          const isActive = selectedColors.some((x) => x.value === c.value);
                          return (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => {
                                setSelectedColors((prev) => {
                                  const exists = prev.some((x) => x.value === c.value);
                                  if (exists) return prev.filter((x) => x.value !== c.value);
                                  return [...prev, c];
                                });
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-full border font-black text-xs transition-all ${isActive ? 'bg-white border-[#00E5FF]/30' : 'bg-white/70 border-slate-200 hover:bg-white'}`}
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-slate-200"
                                style={{ background: c.value }}
                              />
                              {c.name}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-4 gap-3 flex-row-reverse">
                        <button
                          type="button"
                          onClick={() => {
                            const hex = String(customColor || '').trim();
                            if (!hex) return;
                            setSelectedColors((prev) => {
                              const exists = prev.some((x) => x.value === hex);
                              if (exists) return prev;
                              return [...prev, { name: hex.toUpperCase(), value: hex }];
                            });
                          }}
                          className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
                        >
                          إضافة لون
                        </button>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            className="w-12 h-10 rounded-xl border border-slate-200 bg-white"
                          />
                          <div className="text-xs font-black text-slate-500">اختيار لون مخصص</div>
                        </div>
                      </div>

                      {selectedColors.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                          {selectedColors.map((c) => (
                            <span key={c.value} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 font-black text-xs">
                              <span className="w-4 h-4 rounded-full border border-slate-200" style={{ background: c.value }} />
                              {c.name}
                              <button
                                type="button"
                                onClick={() => setSelectedColors((prev) => prev.filter((x) => x.value !== c.value))}
                                className="p-1 rounded-full hover:bg-slate-50"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">المقاسات (اختياري)</label>
                    <div className="bg-slate-50 rounded-[1.5rem] p-4 border-2 border-transparent">
                      <div className="flex flex-wrap gap-2 justify-end">
                        {presetSizes.map((s) => {
                          const isActive = selectedSizes.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))}
                              className={`px-4 py-2 rounded-full border font-black text-xs transition-all ${isActive ? 'bg-white border-[#00E5FF]/30' : 'bg-white/70 border-slate-200 hover:bg-white'}`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-col md:flex-row-reverse md:items-center md:justify-between mt-4 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const v = String(customSize || '').trim();
                            if (!v) return;
                            setSelectedSizes((prev) => (prev.includes(v) ? prev : [...prev, v]));
                            setCustomSize('');
                          }}
                          className="w-full md:w-auto px-4 py-3 md:py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
                        >
                          إضافة مقاس
                        </button>
                        <input
                          placeholder="مثلاً: 42 أو 38"
                          value={customSize}
                          onChange={(e) => setCustomSize(e.target.value)}
                          className="w-full md:flex-1 bg-white border border-slate-200 rounded-xl py-3 md:py-2 px-4 font-bold text-right outline-none"
                        />
                      </div>

                      {selectedSizes.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                          {selectedSizes.map((s) => (
                            <span key={s} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 font-black text-xs">
                              {s}
                              <button
                                type="button"
                                onClick={() => setSelectedSizes((prev) => prev.filter((x) => x !== s))}
                                className="p-1 rounded-full hover:bg-slate-50"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-2xl hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-4 mt-4 disabled:bg-slate-200"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} className="text-[#00E5FF]" />}
            {loading ? 'جاري التحديث...' : 'تأكيد تحديث الصنف'}
          </button>
        </form>
      </MotionDiv>
    </div>
  );
};

export default EditProductModal;
