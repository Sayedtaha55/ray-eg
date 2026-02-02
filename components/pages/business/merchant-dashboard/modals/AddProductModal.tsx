import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Upload, X } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components';
import { Category } from '@/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  shopCategory?: Category | string;
};

const MotionDiv = motion.div as any;

const AddProductModal: React.FC<Props> = ({ isOpen, onClose, shopId, shopCategory }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [cat, setCat] = useState('عام');
  const [description, setDescription] = useState('');
  const [menuVariantItems, setMenuVariantItems] = useState<
    Array<{
      id: string;
      name: string;
      priceSmall: string;
      priceMedium: string;
      priceLarge: string;
    }>
  >([]);
  const [addonItems, setAddonItems] = useState<
    Array<{
      id: string;
      name: string;
      imagePreview: string | null;
      imageUploadFile: File | null;
      priceSmall: string;
      priceMedium: string;
      priceLarge: string;
    }>
  >([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadFile, setImageUploadFile] = useState<File | null>(null);
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

  const toLatinDigits = (input: string) => {
    const map: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    };
    return String(input || '').replace(/[٠-٩۰-۹]/g, (d) => map[d] || d);
  };

  const parseNumberInput = (value: any) => {
    if (typeof value === 'number') return value;
    const raw = String(value ?? '').trim();
    if (!raw) return NaN;
    const cleaned = toLatinDigits(raw)
      .replace(/[٬،]/g, '')
      .replace(/[٫]/g, '.')
      .replace(/\s+/g, '');
    const n = Number(cleaned);
    return n;
  };

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
    if (!imageUploadFile) {
      addToast('يرجى اختيار صورة للمنتج أولاً', 'info');
      return;
    }

    const menuVariants = (() => {
      if (!isRestaurant) return undefined;
      const list = Array.isArray(menuVariantItems) ? menuVariantItems : [];
      if (list.length === 0) return undefined;
      const mapped = list
        .map((t) => {
          const tid = String(t?.id || '').trim();
          const tname = String(t?.name || '').trim();
          if (!tid || !tname) return null;
          const ps = parseNumberInput(t.priceSmall);
          const pm = parseNumberInput(t.priceMedium);
          const pl = parseNumberInput(t.priceLarge);
          if (![ps, pm, pl].every((n) => Number.isFinite(n) && n >= 0)) return null;
          return {
            id: tid,
            name: tname,
            sizes: [
              { id: 'small', label: 'صغير', price: ps },
              { id: 'medium', label: 'وسط', price: pm },
              { id: 'large', label: 'كبير', price: pl },
            ],
          };
        })
        .filter(Boolean);

      if (mapped.length !== list.length) {
        return '__INVALID__';
      }
      return mapped;
    })();

    if (menuVariants === '__INVALID__') {
      addToast('يرجى إدخال النوع والسعر لكل المقاسات (صغير/وسط/كبير)', 'error');
      return;
    }

    const parsedPrice = parseNumberInput(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      addToast('السعر غير صحيح', 'error');
      return;
    }

    const parsedStock = isRestaurant ? 0 : parseNumberInput(stock);
    if (!isRestaurant && (!Number.isFinite(parsedStock) || parsedStock < 0)) {
      addToast('الكمية غير صحيحة', 'error');
      return;
    }

    setLoading(true);
    try {
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

      await ApiService.addProduct({
        shopId,
        name,
        price: parsedPrice,
        stock: isRestaurant ? 0 : parsedStock,
        category: String(cat || '').trim() || 'عام',
        imageUrl: upload.url,
        description: description ? description : null,
        trackStock: isRestaurant ? false : true,
        ...(isRestaurant ? { menuVariants } : {}),
        ...(isRestaurant
          ? {}
          : {
              images: [upload.url, ...extraUrls],
              colors,
              sizes,
            }),
      });
      addToast('تمت إضافة المنتج بنجاح!', 'success');
      setName('');
      setPrice('');
      setStock('');
      setCat('عام');
      setDescription('');
      setMenuVariantItems([]);
      setAddonItems([]);
      setSelectedColors([]);
      setSelectedSizes([]);
      setCustomSize('');
      try {
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
      } catch {
        // ignore
      }

      try {
        for (const p of extraImagePreviews) {
          if (p && p.startsWith('blob:')) URL.revokeObjectURL(p);
        }
      } catch {
      }
      setImagePreview(null);
      setImageUploadFile(null);
      setExtraImagePreviews([]);
      setExtraImageUploadFiles([]);
      onClose();
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : 'فشل في إضافة المنتج';
      addToast(msg, 'error');
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
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-[#00E5FF] transition-colors">
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

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">القسم</label>
              <input
                placeholder={isRestaurant ? 'مثلاً: وجبات - مشروبات - إضافات' : 'مثلاً: ملابس صيفية'}
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-black text-lg text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الوصف</label>
              <textarea
                placeholder={isRestaurant ? 'مثلاً: مكونات الوجبة...' : 'مثلاً: خامات المنتج، طريقة الاستخدام...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 font-bold text-right outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all min-h-[140px]"
              />
            </div>

            {isRestaurant && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">الأنواع والمقاسات (اختياري)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuVariantItems((prev) => [
                        ...prev,
                        {
                          id: `type_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                          name: '',
                          priceSmall: '',
                          priceMedium: '',
                          priceLarge: '',
                        },
                      ]);
                    }}
                    className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
                  >
                    + إضافة نوع
                  </button>
                </div>

                {menuVariantItems.length > 0 && (
                  <div className="space-y-4">
                    {menuVariantItems.map((t, idx) => (
                      <div key={t.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black">نوع #{idx + 1}</p>
                          <button
                            type="button"
                            onClick={() => setMenuVariantItems((prev) => prev.filter((x) => x.id !== t.id))}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">اسم النوع</label>
                          <input
                            value={t.name}
                            onChange={(e) => {
                              const v = e.target.value;
                              setMenuVariantItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, name: v } : x)));
                            }}
                            placeholder="مثلاً: مشكل فراخ"
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">صغير</label>
                            <input
                              type="number"
                              value={t.priceSmall}
                              onChange={(e) => {
                                const v = e.target.value;
                                setMenuVariantItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, priceSmall: v } : x)));
                              }}
                              placeholder="0"
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">وسط</label>
                            <input
                              type="number"
                              value={t.priceMedium}
                              onChange={(e) => {
                                const v = e.target.value;
                                setMenuVariantItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, priceMedium: v } : x)));
                              }}
                              placeholder="0"
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">كبير</label>
                            <input
                              type="number"
                              value={t.priceLarge}
                              onChange={(e) => {
                                const v = e.target.value;
                                setMenuVariantItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, priceLarge: v } : x)));
                              }}
                              placeholder="0"
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isRestaurant && false && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">منتجات إضافية (اختياري)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAddonItems((prev) => [
                        ...prev,
                        {
                          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                          name: '',
                          imagePreview: null,
                          imageUploadFile: null,
                          priceSmall: '',
                          priceMedium: '',
                          priceLarge: '',
                        },
                      ]);
                    }}
                    className="px-4 py-2 rounded-xl font-black text-xs bg-slate-900 text-white"
                  >
                    + إضافة
                  </button>
                </div>

                <div className="space-y-4">
                  {addonItems.map((a, idx) => (
                    <div key={a.id} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black">إضافة #{idx + 1}</p>
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              if (a.imagePreview && a.imagePreview.startsWith('blob:')) URL.revokeObjectURL(a.imagePreview);
                            } catch {
                            }
                            setAddonItems((prev) => prev.filter((x) => x.id !== a.id));
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">اسم الإضافة</label>
                          <input
                            value={a.name}
                            onChange={(e) => {
                              const v = e.target.value;
                              setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, name: v } : x)));
                            }}
                            placeholder="مثلاً: بطاطس"
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">صورة صغيرة</label>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200">
                              {a.imagePreview ? <img src={a.imagePreview} className="w-full h-full object-cover" /> : null}
                            </div>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const mime = String(file.type || '').toLowerCase().trim();
                                const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
                                if (!mime || !allowed.has(mime)) {
                                  addToast('نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو AVIF', 'error');
                                  return;
                                }
                                if (file.size > 2 * 1024 * 1024) {
                                  addToast('الصورة كبيرة جداً، يرجى اختيار صورة أقل من 2 ميجابايت', 'error');
                                  return;
                                }
                                setAddonItems((prev) =>
                                  prev.map((x) => {
                                    if (x.id !== a.id) return x;
                                    try {
                                      if (x.imagePreview && x.imagePreview.startsWith('blob:')) URL.revokeObjectURL(x.imagePreview);
                                    } catch {
                                    }
                                    return { ...x, imageUploadFile: file, imagePreview: URL.createObjectURL(file) };
                                  }),
                                );
                              }}
                              className="block w-full text-xs font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">صغير (ج.م)</label>
                          <input
                            type="number"
                            value={a.priceSmall}
                            onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceSmall: e.target.value } : x)))}
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">وسط (ج.م)</label>
                          <input
                            type="number"
                            value={a.priceMedium}
                            onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceMedium: e.target.value } : x)))}
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4 mb-2">كبير (ج.م)</label>
                          <input
                            type="number"
                            value={a.priceLarge}
                            onChange={(e) => setAddonItems((prev) => prev.map((x) => (x.id === a.id ? { ...x, priceLarge: e.target.value } : x)))}
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-bold text-right outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
            {loading ? 'جاري الحفظ...' : 'تأكيد وحفظ الصنف'}
          </button>
        </form>
      </MotionDiv>
    </div>
  );
};

export default AddProductModal;
