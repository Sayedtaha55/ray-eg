import React, { useEffect, useRef, useState, startTransition } from 'react';
import { Plus, Save, Edit3, Trash2, Loader2, X, Move, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, StockStatus, StoreSection } from '../types';
import { backendPost } from '@/services/api/httpClient';
import { ApiService } from '@/services/api.service';

const compressImage = (file: File, maxWidth = 2048, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (error) => reject(error);
  });
};

const fileToBase64 = async (file: File): Promise<string> => {
  if (file.size > 1024 * 1024) {
    return await compressImage(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result as string;
      encoded = encoded.replace(/^data:(.*,)?/, '');
      resolve(encoded);
    };
    reader.onerror = (error) => reject(error);
  });
};

async function base64ToFile(base64: string, filename: string) {
  const dataUrl = `data:image/jpeg;base64,${base64}`;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: String(blob.type || 'image/jpeg') });
}

const analyzeStoreImage = async (base64Image: string, shopId: string): Promise<{ products: Product[]; summary: string }> => {
  const sid = String(shopId || '').trim();
  if (!sid) throw new Error('shopId مطلوب');

  const file = await base64ToFile(base64Image, `ai-section-${Date.now()}.jpg`);
  const uploaded = await ApiService.uploadMedia({ file, purpose: 'shop-image-map', shopId: sid });
  const imageUrl = String(uploaded?.url || '').trim();
  if (!imageUrl) throw new Error('Upload failed');

  const data = await backendPost<any>(`/api/v1/shops/${encodeURIComponent(sid)}/image-maps/analyze`, {
    imageUrl,
    language: 'ar',
  });

  const hotspots = Array.isArray(data?.hotspots) ? data.hotspots : [];
  const products: Product[] = hotspots.map((h: any, index: number) => {
    const name = String(h?.label || h?.name || '').trim() || `منتج ${index + 1}`;
    const x = typeof h?.x === 'number' ? h.x : 20 + Math.random() * 60;
    const y = typeof h?.y === 'number' ? h.y : 20 + Math.random() * 60;
    const category = typeof h?.category === 'string' ? h.category : 'عام';
    const confidence = typeof h?.confidence === 'number' ? h.confidence : 1;

    return {
      id: `ai_${Date.now()}_${index}`,
      name,
      description: '',
      price: 0,
      stock: 0,
      category: '__IMAGE_MAP__',
      confidence,
      stockStatus: 'IN_STOCK',
      x,
      y,
    };
  });

  const summary = typeof data?.summary === 'string' && data.summary.trim() ? data.summary : 'تم تحليل القسم بنجاح';
  return { products, summary };
};

interface StoreEditorProps {
  initialSections: StoreSection[];
  initialStoreName?: string;
  initialStoreType?: string;
  shopId: string;
  shopCategory?: string;
  onSave: (data: { name: string; type: string; sections: StoreSection[] }) => Promise<void> | void;
  onCancel: () => void;
}

export const StoreEditor: React.FC<StoreEditorProps> = ({
  initialSections,
  initialStoreName = '',
  initialStoreType = '',
  shopId,
  shopCategory = '',
  onSave,
  onCancel,
}) => {
  const shopCategoryUpper = String(shopCategory || '').toUpperCase();
  const isFood = shopCategoryUpper === 'FOOD';
  const isRestaurant = shopCategoryUpper === 'RESTAURANT';
  const isService = shopCategoryUpper === 'SERVICE';
  const isRetail = shopCategoryUpper === 'RETAIL';
  const isFurnitureActivity = !isFood && !isRestaurant;
  // Store Metadata
  const [storeName] = useState(initialStoreName);
  const [storeType] = useState(initialStoreType);

  // Sections Management
  const [sections, setSections] = useState<StoreSection[]>(initialSections.length > 0 ? initialSections : []);
  const [activeSectionId, setActiveSectionId] = useState<string>(initialSections[0]?.id || '');

  const sectionsRef = useRef<StoreSection[]>(sections);
  useEffect(() => {
    sectionsRef.current = Array.isArray(sections) ? sections : [];
  }, [sections]);

  const didInitFromPropsRef = useRef(false);

  useEffect(() => {
    if (didInitFromPropsRef.current) return;
    if (!Array.isArray(initialSections) || initialSections.length === 0) return;
    didInitFromPropsRef.current = true;
    setSections(initialSections);
    setActiveSectionId(String(initialSections[0]?.id || ''));
  }, [initialSections]);

  // UI States
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [isProductSheetCollapsed, setIsProductSheetCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzingNewImage, setIsAnalyzingNewImage] = useState(false);
  const [pendingNewSectionBase64, setPendingNewSectionBase64] = useState<string | null>(null);
  const [isNewSectionModePickerOpen, setIsNewSectionModePickerOpen] = useState(false);

  const editorImageRef = useRef<HTMLDivElement>(null);
  const sectionInputRef = useRef<HTMLInputElement>(null);

  // Get active section data
  const activeSection = sections.find((s) => s.id === activeSectionId);
  const activeProducts = activeSection?.products || [];

  // --- Handlers for Sections ---

  const createNewSection = (base64: string, products: Product[]) => {
    const newSection: StoreSection = {
      id: `sec_${Date.now()}`,
      name: `قسم جديد ${sections.length + 1}`,
      image: `data:image/jpeg;base64,${base64}`,
      products,
    };

    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.id);
    setSelectedProductId(null);
    setIsAddingMode(false);
    setIsMoveMode(false);
  };

  const handleAddSection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setPendingNewSectionBase64(base64);
        setIsNewSectionModePickerOpen(true);
      } catch (error) {
        alert('فشل تحليل الصورة، حاول مرة أخرى');
      } finally {
        e.target.value = '';
      }
    }
  };

  const confirmNewSectionManual = () => {
    if (!pendingNewSectionBase64) return;
    createNewSection(pendingNewSectionBase64, []);
    setPendingNewSectionBase64(null);
    setIsNewSectionModePickerOpen(false);
  };

  const confirmNewSectionAI = async () => {
    if (!pendingNewSectionBase64) return;
    try {
      setIsNewSectionModePickerOpen(false);
      setIsAnalyzingNewImage(true);
      const analysis = await analyzeStoreImage(pendingNewSectionBase64, shopId);
      createNewSection(pendingNewSectionBase64, analysis.products);
      setPendingNewSectionBase64(null);
    } catch (error) {
      alert('فشل تحليل الصورة، حاول مرة أخرى');
    } finally {
      setIsAnalyzingNewImage(false);
    }
  };

  const updateActiveSectionName = (name: string) => {
    setSections((prev) => prev.map((s) => (s.id === activeSectionId ? { ...s, name } : s)));
  };

  const deleteSectionById = (sectionId: string) => {
    const sid = String(sectionId || '').trim();
    if (!sid) return;

    if (!window.confirm('هل أنت متأكد من حذف هذا القسم نهائياً؟ ستفقد جميع المنتجات بداخله.')) {
      return;
    }

    startTransition(() => {
      setSections((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        const idx = list.findIndex((s) => String(s?.id || '') === sid);
        if (idx === -1) return prev;
        const next = [...list.slice(0, idx), ...list.slice(idx + 1)];

        sectionsRef.current = next;

        const isDeletingActive = String(activeSectionId || '') === sid;
        if (isDeletingActive) {
          const nextActiveId = String(next[0]?.id || '');
          setActiveSectionId(nextActiveId);
          setSelectedProductId(null);
        }

        return next;
      });
    });
  };

  const deleteActiveSection = () => {
    deleteSectionById(activeSectionId);
  };

  // --- Handlers for Products (Inside Active Section) ---

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!editorImageRef.current || !activeSection) return;

    const rect = editorImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isAddingMode) {
      const isFashion = String(shopCategory).toUpperCase() === 'FASHION';
      const newProduct: Product = {
        id: `manual_${Date.now()}`,
        name: 'منتج جديد',
        description: '',
        price: 0,
        stock: 0,
        category: '__IMAGE_MAP__',
        confidence: 1,
        stockStatus: 'IN_STOCK',
        x,
        y,
        ...(isFashion ? { colors: [], sizes: [] } : {}),
      };

      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== activeSectionId) return s;
          const products = Array.isArray(s.products) ? s.products : [];
          return { ...s, products: [...products, newProduct] };
        }),
      );
      setSelectedProductId(newProduct.id);
      setIsAddingMode(false);
      return;
    }

    if (selectedProductId && isMoveMode) {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id !== activeSectionId) return s;
          const products = Array.isArray(s.products) ? s.products : [];
          return {
            ...s,
            products: products.map((p) => (p.id === selectedProductId ? { ...p, x, y } : p)),
          };
        }),
      );
    }
  };

  const updateSectionProducts = (newProducts: Product[]) => {
    setSections((prev) => prev.map((s) => (s.id === activeSectionId ? { ...s, products: newProducts } : s)));
  };

  const updateProductDetails = (id: string, updates: Partial<Product>) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== activeSectionId) return s;
        const products = Array.isArray(s.products) ? s.products : [];
        return {
          ...s,
          products: products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        };
      }),
    );
  };

  const deleteProduct = (id: string) => {
    // تأكيد حذف المنتج
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      return;
    }
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== activeSectionId) return s;
        const products = Array.isArray(s.products) ? s.products : [];
        return { ...s, products: products.filter((p) => p.id !== id) };
      }),
    );
    if (selectedProductId === id) setSelectedProductId(null);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Save all sections at once
      await onSave({ name: storeName, type: storeType, sections: sectionsRef.current });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedProduct = activeProducts.find((p) => p.id === selectedProductId);

  const shouldShowFurniture =
    Boolean(isFurnitureActivity) ||
    Boolean((selectedProduct as any)?.furnitureMeta);

  useEffect(() => {
    if (!selectedProduct) return;
    setIsProductSheetCollapsed(false);
  }, [selectedProduct?.id]);

  if (isAnalyzingNewImage) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <h3 className="text-xl font-bold">جاري تحليل القسم الجديد...</h3>
        <p className="text-slate-400">يقوم الذكاء الاصطناعي بتحديد المنتجات في الصورة</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-[#0b1121] overflow-hidden">
      {isNewSectionModePickerOpen && pendingNewSectionBase64 && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <div className="text-white font-bold">إضافة قسم جديد</div>
              <div className="text-slate-400 text-sm mt-1">هل تريد تعديل يدوي أم استخدام الذكاء الاصطناعي؟</div>
            </div>
            <div className="p-5 space-y-3">
              <button
                onClick={confirmNewSectionManual}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700 transition-colors"
              >
                تعديل يدوي
              </button>
              <button
                onClick={confirmNewSectionAI}
                className="w-full px-4 py-3 rounded-xl bg-cyan-600 border border-cyan-400/40 text-white font-bold hover:bg-cyan-500 transition-colors"
              >
                ذكاء صناعي (تحليل تلقائي)
              </button>
              <button
                onClick={() => {
                  setIsNewSectionModePickerOpen(false);
                  setPendingNewSectionBase64(null);
                }}
                className="w-full px-4 py-3 rounded-xl bg-transparent border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="h-14 sm:h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-2.5 sm:px-6 z-40">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="bg-cyan-900/50 p-1.5 sm:p-2 rounded-lg">
            <Edit3 size={16} className="text-cyan-400 sm:hidden" />
            <Edit3 size={18} className="text-cyan-400 hidden sm:block" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm sm:text-base">محرر المتجر المتكامل</h2>
            <p className="text-[10px] sm:text-xs text-slate-400">إدارة الأقسام والمنتجات</p>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-3">
          <button onClick={onCancel} className="px-2 sm:px-4 py-2 text-slate-300 hover:text-white transition-colors text-[11px] sm:text-sm">
            إلغاء
          </button>
          <button
            onClick={() => {
              if (!activeSection) return;
              setIsAddingMode(!isAddingMode);
              setSelectedProductId(null);
              setIsMoveMode(false);
            }}
            disabled={!activeSection}
            className={`px-2 sm:px-4 py-2 rounded-lg border font-bold transition-all text-[11px] sm:text-sm
              ${
                !activeSection
                  ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                  : isAddingMode
                    ? 'bg-green-600 border-green-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <Plus size={12} className="sm:hidden" />
              <Plus size={14} className="hidden sm:block" />
              {isAddingMode ? 'انقر على الصورة لإضافة المنتج' : 'إضافة منتج'}
            </span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 sm:px-6 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-black/50 flex flex-col">
          {/* Section Tabs / Filmstrip */}
          <div className="bg-slate-900/50 backdrop-blur border-b border-slate-700 p-2 flex gap-2 overflow-x-auto">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveSectionId(section.id);
                    setSelectedProductId(null);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-white/5 transition ${
                    activeSectionId === section.id ? 'bg-white/10' : ''
                  }`}
                >
                  {String(section.image || '').trim() ? (
                    <img src={String(section.image).trim()} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-white/10" />
                  )}
                  <span className="text-xs font-bold truncate max-w-[80px]">{section.name}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSectionById(section.id);
                  }}
                  className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-red-400 hover:bg-red-900/20 hover:border-red-900/50 transition-colors"
                  aria-label="حذف القسم"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <button
              onClick={() => sectionInputRef.current?.click()}
              className="flex flex-col items-center justify-center px-4 min-w-[80px] rounded-lg border border-dashed border-slate-600 hover:border-cyan-500 hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400 transition-all"
            >
              <Plus size={16} />
              <span className="text-[10px] mt-1">صورة جديدة</span>
            </button>
            <input type="file" ref={sectionInputRef} onChange={handleAddSection} accept="image/*" className="hidden" />
          </div>

          {activeSection && (
            <div className="bg-slate-900/40 backdrop-blur border-b border-slate-700 p-2 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <input
                  className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:border-cyan-500 outline-none"
                  placeholder="اسم القسم (مثلاً: رف الأدوية)"
                  value={activeSection.name}
                  onChange={(e) => updateActiveSectionName(e.target.value)}
                />
                <div className="text-[10px] text-slate-500 mt-1">{activeProducts.length} منتجات في هذا القسم</div>
              </div>
              <button
                onClick={deleteActiveSection}
                className="px-3 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded text-xs hover:bg-red-900/40 flex items-center gap-1"
              >
                <Trash2 size={12} /> حذف القسم
              </button>
            </div>
          )}

          {/* Image Editor */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-[url('/noise.svg')] bg-opacity-5">
            {activeSection ? (
              <div
                ref={editorImageRef}
                onClick={handleCanvasClick}
                className={`relative max-h-[55vh] sm:max-h-[75vh] shadow-2xl rounded-lg overflow-hidden border-2 transition-colors ${
                  isAddingMode
                    ? 'border-green-500 cursor-crosshair'
                    : isMoveMode
                      ? 'border-cyan-400 cursor-move'
                      : 'border-slate-700 cursor-default'
                }`}
              >
                {String(activeSection.image || '').trim() ? (
                  <img
                    src={activeSection.image}
                    alt="Active Section"
                    className="w-full max-h-[55vh] sm:max-h-[75vh] object-contain"
                  />
                ) : (
                  <div className="w-full h-[55vh] sm:h-[75vh] bg-slate-800 flex items-center justify-center text-slate-500">
                    لا توجد صورة للقسم
                  </div>
                )}
                {activeProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProductId(product.id);
                      setIsAddingMode(false);
                      setIsMoveMode(false);
                    }}
                    className={`absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center transition-all hover:scale-125 cursor-pointer z-10
                      ${
                        selectedProductId === product.id
                          ? 'bg-cyan-500 border-white shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-125'
                          : product.stockStatus === 'OUT_OF_STOCK'
                            ? 'bg-red-500/50 border-red-300'
                            : 'bg-white/20 border-white/50 hover:bg-cyan-400/50'
                      }
                    `}
                    style={{ left: `${product.x}%`, top: `${product.y}%` }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                  </div>
                ))}

                {(isAddingMode || (selectedProduct && !isMoveMode)) && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute bottom-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur border-t border-slate-700 transition-all ${
                      isProductSheetCollapsed ? 'p-2' : 'p-3 sm:p-4'
                    }`}
                    style={{
                      transform: isProductSheetCollapsed ? 'translateY(calc(100% - 56px))' : 'translateY(0)',
                      transitionProperty: 'transform, padding',
                      transitionDuration: '220ms',
                      transitionTimingFunction: 'ease',
                    }}
                  >
                    {isAddingMode && !selectedProduct && <div className="text-slate-200 text-sm font-bold">انقر على الصورة لإضافة المنتج</div>}

                    {selectedProduct && (
                      <div className={`bg-slate-800/70 rounded-xl border border-slate-700 ${isProductSheetCollapsed ? 'p-2' : 'p-3'} `}>
                        <div className="h-1.5 w-12 mx-auto rounded-full bg-slate-600/60" />
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xs font-bold text-slate-300 uppercase">تعديل المنتج</h3>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              type="button"
                              onClick={() => setIsProductSheetCollapsed((v) => !v)}
                              className="p-1 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:text-white"
                              aria-label={isProductSheetCollapsed ? 'فتح' : 'تصغير'}
                            >
                              {isProductSheetCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!selectedProductId) return;
                                setIsMoveMode(true);
                                setIsAddingMode(false);
                              }}
                              className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-[11px] sm:text-xs font-bold"
                            >
                              <span className="flex items-center gap-1">
                                <Move size={11} />
                                تحريك
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSave}
                              disabled={isSaving}
                              className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-[11px] sm:text-xs font-bold disabled:opacity-60"
                            >
                              حفظ
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProductId(null);
                                setIsMoveMode(false);
                              }}
                              className="text-slate-400 hover:text-white text-[11px] sm:text-xs"
                            >
                              إغلاق
                            </button>
                          </div>
                        </div>

                        {!isProductSheetCollapsed && (
                          <div className="space-y-3 mt-3">
                            <div className="h-1.5 w-14 mx-auto rounded-full bg-slate-600/60" />

                            <input
                              type="text"
                              value={selectedProduct.name}
                              onChange={(e) => updateProductDetails(selectedProduct.id, { name: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                              placeholder="اسم المنتج"
                            />
                            <input
                              type="number"
                              value={selectedProduct.price}
                              onChange={(e) => updateProductDetails(selectedProduct.id, { price: Number(e.target.value) })}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                              placeholder="السعر"
                            />

                            {shouldShowFurniture && (
                              <div className="space-y-2 pt-2 border-t border-slate-700">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">الأثاث</div>

                                <input
                                  type="text"
                                  value={String((selectedProduct as any)?.furnitureMeta?.unit || (selectedProduct as any)?.unit || '')}
                                  onChange={(e) => {
                                    const u = String(e.target.value || '').trim();
                                    const prev = (selectedProduct as any)?.furnitureMeta;
                                    const nextMeta = prev && typeof prev === 'object' ? { ...prev, unit: u || undefined } : { unit: u || undefined };
                                    updateProductDetails(selectedProduct.id, { unit: u || undefined, furnitureMeta: nextMeta } as any);
                                  }}
                                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                                  placeholder="الوحدة (مثال: قطعة)"
                                />

                                <div className="grid grid-cols-3 gap-2">
                                  <input
                                    type="number"
                                    value={String((selectedProduct as any)?.furnitureMeta?.lengthCm ?? '')}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      const n = v === '' ? undefined : Number(v);
                                      const prev = (selectedProduct as any)?.furnitureMeta;
                                      const nextMeta = prev && typeof prev === 'object' ? { ...prev, lengthCm: Number.isFinite(n as any) ? n : undefined } : { lengthCm: Number.isFinite(n as any) ? n : undefined };
                                      updateProductDetails(selectedProduct.id, { furnitureMeta: nextMeta } as any);
                                    }}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-xs"
                                    placeholder="الطول (سم)"
                                  />
                                  <input
                                    type="number"
                                    value={String((selectedProduct as any)?.furnitureMeta?.widthCm ?? '')}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      const n = v === '' ? undefined : Number(v);
                                      const prev = (selectedProduct as any)?.furnitureMeta;
                                      const nextMeta = prev && typeof prev === 'object' ? { ...prev, widthCm: Number.isFinite(n as any) ? n : undefined } : { widthCm: Number.isFinite(n as any) ? n : undefined };
                                      updateProductDetails(selectedProduct.id, { furnitureMeta: nextMeta } as any);
                                    }}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-xs"
                                    placeholder="العرض (سم)"
                                  />
                                  <input
                                    type="number"
                                    value={String((selectedProduct as any)?.furnitureMeta?.heightCm ?? '')}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      const n = v === '' ? undefined : Number(v);
                                      const prev = (selectedProduct as any)?.furnitureMeta;
                                      const nextMeta = prev && typeof prev === 'object' ? { ...prev, heightCm: Number.isFinite(n as any) ? n : undefined } : { heightCm: Number.isFinite(n as any) ? n : undefined };
                                      updateProductDetails(selectedProduct.id, { furnitureMeta: nextMeta } as any);
                                    }}
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-xs"
                                    placeholder="الارتفاع (سم)"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {isFood && !isProductSheetCollapsed && (
                          <div className="space-y-2 pt-2 border-t border-slate-700">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">سوبر ماركت</div>

                            <select
                              value={String((selectedProduct as any)?.unit || '')}
                              onChange={(e) => updateProductDetails(selectedProduct.id, { unit: e.target.value } as any)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                            >
                              <option value="">بدون وحدة</option>
                              <option value="PIECE">قطعة</option>
                              <option value="KG">كيلو</option>
                              <option value="G">جرام</option>
                              <option value="L">لتر</option>
                              <option value="ML">ملّي</option>
                              <option value="PACK">عبوة</option>
                            </select>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="text-[10px] font-bold text-slate-400 uppercase">باقات البيع</div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = Array.isArray((selectedProduct as any)?.packOptions) ? (selectedProduct as any).packOptions : [];
                                    const next = [
                                      ...current,
                                      {
                                        id: `pack_${Date.now()}_${Math.random().toString(16).slice(2)}`,
                                        qty: 1,
                                        unit: String((selectedProduct as any)?.unit || '').trim() || null,
                                        price: 0,
                                      },
                                    ];
                                    updateProductDetails(selectedProduct.id, { packOptions: next } as any);
                                  }}
                                  className="px-2 py-1 rounded border border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-xs font-bold"
                                >
                                  + إضافة باقة
                                </button>
                              </div>

                              {(Array.isArray((selectedProduct as any)?.packOptions) ? (selectedProduct as any).packOptions : []).map((p: any, idx: number) => (
                                <div key={String(p?.id || idx)} className="p-2 rounded border border-slate-700 bg-slate-900/40">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs font-bold text-slate-300">باقة #{idx + 1}</div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = Array.isArray((selectedProduct as any)?.packOptions) ? (selectedProduct as any).packOptions : [];
                                        const next = current.filter((x: any) => String(x?.id || '') !== String(p?.id || ''));
                                        updateProductDetails(selectedProduct.id, { packOptions: next } as any);
                                      }}
                                      className="text-slate-400 hover:text-red-400"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="number"
                                      value={Number.isFinite(Number(p?.qty)) ? String(p.qty) : ''}
                                      onChange={(e) => {
                                        const current = Array.isArray((selectedProduct as any)?.packOptions) ? (selectedProduct as any).packOptions : [];
                                        const next = current.map((x: any) =>
                                          String(x?.id || '') === String(p?.id || '')
                                            ? { ...x, qty: Number(e.target.value) }
                                            : x,
                                        );
                                        updateProductDetails(selectedProduct.id, { packOptions: next } as any);
                                      }}
                                      placeholder="الكمية"
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                                    />
                                    <input
                                      type="number"
                                      value={Number.isFinite(Number(p?.price)) ? String(p.price) : ''}
                                      onChange={(e) => {
                                        const current = Array.isArray((selectedProduct as any)?.packOptions) ? (selectedProduct as any).packOptions : [];
                                        const next = current.map((x: any) =>
                                          String(x?.id || '') === String(p?.id || '')
                                            ? { ...x, price: Number(e.target.value) }
                                            : x,
                                        );
                                        updateProductDetails(selectedProduct.id, { packOptions: next } as any);
                                      }}
                                      placeholder="السعر"
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          value={Number.isFinite(Number((selectedProduct as any)?.stock)) ? String(Math.max(0, Math.floor(Number((selectedProduct as any).stock)))) : '0'}
                          onChange={(e) => {
                            const raw = Number((e.target as any).value);
                            const nextStock = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
                            const nextStatus: StockStatus = nextStock <= 0 ? 'OUT_OF_STOCK' : nextStock <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
                            updateProductDetails(selectedProduct.id, { stock: nextStock, stockStatus: nextStatus } as any);
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-sm"
                          placeholder="المخزون"
                        />

                        <button
                          onClick={() => deleteProduct(selectedProduct.id)}
                          className="w-full py-1.5 bg-red-900/20 text-red-400 border border-red-900/50 rounded text-xs hover:bg-red-900/40"
                        >
                          حذف المنتج
                        </button>

                        {/* Fashion-specific: Colors */}
                        {String(shopCategory).toUpperCase() === 'FASHION' && (
                          <div className="space-y-2 pt-2 border-t border-slate-700">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">الألوان المتاحة</div>
                            <div className="flex flex-wrap gap-2">
                              {(['أسود', 'أبيض', 'رمادي', 'أحمر', 'أزرق', 'أخضر', 'أصفر', 'بني'] as const).map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => {
                                    const currentColors = selectedProduct.colors || [];
                                    const newColors = currentColors.includes(color)
                                      ? currentColors.filter((c) => c !== color)
                                      : [...currentColors, color];
                                    updateProductDetails(selectedProduct.id, { colors: newColors });
                                  }}
                                  className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${
                                    (selectedProduct.colors || []).includes(color)
                                      ? 'bg-cyan-600 border-cyan-400 text-white'
                                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'
                                  }`}
                                >
                                  {color}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fashion-specific: Size Variants */}
                        {String(shopCategory).toUpperCase() === 'FASHION' && (
                          <div className="space-y-2 pt-2 border-t border-slate-700">
                            <div className="text-[10px] font-bold text-slate-400 uppercase">المقاسات والأسعار</div>
                            <div className="space-y-2">
                              {(selectedProduct.sizes || []).map((size, idx) => {
                                const isCustom = size.label === 'custom' || size.label === '';
                                return (
                                  <div key={idx} className="flex items-center gap-2">
                                    <select
                                      value={isCustom ? 'custom' : size.label}
                                      onChange={(e) => {
                                        const newSizes = [...(selectedProduct.sizes || [])];
                                        const value = e.target.value;
                                        if (value === 'custom') {
                                          newSizes[idx] = { ...size, label: 'custom', customValue: size.customValue || 36 };
                                        } else {
                                          newSizes[idx] = { ...size, label: value, customValue: undefined };
                                        }
                                        updateProductDetails(selectedProduct.id, { sizes: newSizes });
                                      }}
                                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                                    >
                                      <option value="">اختر المقاس</option>
                                      {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                      <option value="custom">✏️ مقاس مخصص...</option>
                                    </select>
                                    {isCustom && (
                                      <input
                                        type="number"
                                        value={size.customValue || ''}
                                        onChange={(e) => {
                                          const newSizes = [...(selectedProduct.sizes || [])];
                                          newSizes[idx] = { ...size, customValue: Number(e.target.value) };
                                          updateProductDetails(selectedProduct.id, { sizes: newSizes });
                                        }}
                                        placeholder="رقم"
                                        className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                                        min={1}
                                      />
                                    )}
                                    <input
                                      type="number"
                                      value={size.price}
                                      onChange={(e) => {
                                        const newSizes = [...(selectedProduct.sizes || [])];
                                        newSizes[idx] = { ...size, price: Number(e.target.value) };
                                        updateProductDetails(selectedProduct.id, { sizes: newSizes });
                                      }}
                                      placeholder="السعر"
                                      className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newSizes = (selectedProduct.sizes || []).filter((_, i) => i !== idx);
                                        updateProductDetails(selectedProduct.id, { sizes: newSizes });
                                      }}
                                      className="px-2 py-1 text-red-400 hover:text-red-300 text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => {
                                  const newSizes = [...(selectedProduct.sizes || []), { label: '', price: selectedProduct.price }];
                                  updateProductDetails(selectedProduct.id, { sizes: newSizes });
                                }}
                                className="w-full py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-700"
                              >
                                + إضافة مقاس
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500">قم بإضافة صورة للبدء</div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-96 max-h-[45vh] md:max-h-none bg-slate-900 border-t md:border-t-0 md:border-r border-slate-700 flex flex-col z-30 shadow-2xl">
          {/* Active Section Info */}

          {/* Product List / Editor */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            {selectedProduct && <div className="text-center text-slate-600 text-xs mt-2">يتم تعديل المنتج أسفل الصورة</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
