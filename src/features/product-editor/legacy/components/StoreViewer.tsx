import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Product, StoreSection, SizeVariant } from '../types';
import { Eye, AlertCircle, Lock, ChevronLeft, ChevronRight, Map, X, ShoppingBag, CalendarCheck } from 'lucide-react';

interface StoreViewerProps {
  sections: StoreSection[];
  onAddToCart: (product: Product) => void;
  onReserve?: (product: Product) => void;
  shopCategory?: string;
  productEditorVisibility?: Record<string, any>;
}

type MetaChip = { label: string; value: string };

const coerceBoolean = (value: any, fallback: boolean = true): boolean => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (!v) return fallback;
    if (v === 'false' || v === '0' || v === 'no' || v === 'off') return false;
    if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true;
    return fallback;
  }
  return Boolean(value);
};

const formatUnitLabel = (raw: string): string => {
  const u = String(raw || '').trim();
  const up = u.toUpperCase();
  if (up === 'PIECE') return 'قطعة';
  if (up === 'KG') return 'كيلو';
  if (up === 'G') return 'جرام';
  if (up === 'L') return 'لتر';
  if (up === 'ML') return 'ملّي';
  if (up === 'PACK') return 'عبوة';
  return u;
};

const formatMetaValue = (value: any): string | null => {
  if (value == null) return null;
  if (typeof value === 'string') return value.trim() ? value.trim() : null;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null;
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    const allStrings = value.every((v) => typeof v === 'string');
    if (allStrings) return value.map((v) => String(v).trim()).filter(Boolean).join('، ');
    if (value.every((v) => v && typeof v === 'object' && typeof v.label === 'string')) {
      return value.map((v: any) => String(v.label).trim()).filter(Boolean).join('، ');
    }
    return `(${value.length})`;
  }
  if (typeof value === 'object') {
    if (
      typeof (value as any).lengthCm !== 'undefined' ||
      typeof (value as any).widthCm !== 'undefined' ||
      typeof (value as any).heightCm !== 'undefined' ||
      typeof (value as any).length_cm !== 'undefined' ||
      typeof (value as any).width_cm !== 'undefined' ||
      typeof (value as any).height_cm !== 'undefined'
    ) {
      const parts: string[] = [];
      const lRaw = typeof (value as any).lengthCm !== 'undefined' ? (value as any).lengthCm : (value as any).length_cm;
      const wRaw = typeof (value as any).widthCm !== 'undefined' ? (value as any).widthCm : (value as any).width_cm;
      const hRaw = typeof (value as any).heightCm !== 'undefined' ? (value as any).heightCm : (value as any).height_cm;
      const l = lRaw == null ? NaN : Number(lRaw);
      const w = wRaw == null ? NaN : Number(wRaw);
      const h = hRaw == null ? NaN : Number(hRaw);
      if (Number.isFinite(l)) parts.push(`${l}`);
      if (Number.isFinite(w)) parts.push(`${w}`);
      if (Number.isFinite(h)) parts.push(`${h}`);
      const dims = parts.length ? parts.join('×') : '';
      const unitRaw = typeof (value as any).unit !== 'undefined' ? (value as any).unit : (value as any).unit_name;
      const u = typeof unitRaw === 'string' ? formatUnitLabel(String(unitRaw)) : '';
      return [dims, u].filter(Boolean).join(' ');
    }
    try {
      const s = JSON.stringify(value);
      if (!s || s === '{}' || s === '[]') return null;
      return s.length > 80 ? `${s.slice(0, 77)}...` : s;
    } catch {
      return null;
    }
  }
  return null;
};

const getProductMetaChips = (product: any): MetaChip[] => {
  if (!product || typeof product !== 'object') return [];

  const normalized: any = { ...(product as any) };
  if ((normalized.furnitureMeta == null || typeof normalized.furnitureMeta === 'undefined') && normalized.furniture_meta != null) {
    normalized.furnitureMeta = normalized.furniture_meta;
  }

  if (normalized.furnitureMeta == null || typeof normalized.furnitureMeta === 'undefined') {
    const lRaw = typeof normalized.lengthCm !== 'undefined' ? normalized.lengthCm : normalized.length_cm;
    const wRaw = typeof normalized.widthCm !== 'undefined' ? normalized.widthCm : normalized.width_cm;
    const hRaw = typeof normalized.heightCm !== 'undefined' ? normalized.heightCm : normalized.height_cm;

    const l = lRaw == null ? NaN : Number(lRaw);
    const w = wRaw == null ? NaN : Number(wRaw);
    const h = hRaw == null ? NaN : Number(hRaw);

    if (Number.isFinite(l) || Number.isFinite(w) || Number.isFinite(h)) {
      normalized.furnitureMeta = {
        lengthCm: Number.isFinite(l) ? l : undefined,
        widthCm: Number.isFinite(w) ? w : undefined,
        heightCm: Number.isFinite(h) ? h : undefined,
        unit: typeof normalized.unit === 'string' ? normalized.unit : undefined,
      };
    }
  }

  const hiddenKeys = new Set([
    'id',
    'name',
    'description',
    'price',
    'category',
    'confidence',
    'stockStatus',
    'x',
    'y',
    'productId',
    'backendProductId',
    'selectedPackId',
    'furniture_meta',
    'lengthCm',
    'widthCm',
    'heightCm',
    'length_cm',
    'width_cm',
    'height_cm',
  ]);

  const labelMap: Record<string, string> = {
    unit: 'الوحدة',
    stock: 'المتاح',
    packOptions: 'باقات',
    colors: 'الألوان',
    sizes: 'المقاسات',
    furnitureMeta: 'الأبعاد',
    addons: 'إضافات',
    menuVariants: 'اختيارات',
    images: 'صور',
    imageUrl: 'صورة',
  };

  const preferred = ['unit', 'furnitureMeta', 'colors', 'sizes', 'packOptions', 'addons', 'menuVariants'];
  const keys = Object.keys(normalized);
  const ordered = [...preferred.filter((k) => keys.includes(k)), ...keys.filter((k) => !preferred.includes(k)).sort()];

  const out: MetaChip[] = [];
  for (const key of ordered) {
    if (hiddenKeys.has(key)) continue;
    const val = normalized[key];
    const formatted = key === 'unit' && typeof val === 'string' ? formatUnitLabel(val) : formatMetaValue(val);
    if (!formatted) continue;
    const label = labelMap[key] || key;
    out.push({ label, value: formatted });
  }

  return out;
};

export const StoreViewer: React.FC<StoreViewerProps> = React.memo(({ sections, onAddToCart, onReserve, shopCategory = '', productEditorVisibility }) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const activeSection = sections[activeSectionIndex];
  const isFood = String(shopCategory || '').toUpperCase() === 'FOOD';

  // State to track which product card is currently open
  const [openProductId, setOpenProductId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageNatural, setImageNatural] = useState<{ w: number; h: number } | null>(null);
  const [panOffsetPx, setPanOffsetPx] = useState(0);
  const panStateRef = useRef<{ active: boolean; startX: number; startOffset: number }>({
    active: false,
    startX: 0,
    startOffset: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setContainerSize({ w: rect.width, h: rect.height });
    return () => ro.disconnect();
  }, []);

  const coverMetrics = (() => {
    const nat = imageNatural;
    const cw = containerSize.w;
    const ch = containerSize.h;
    if (!nat || !cw || !ch || !nat.w || !nat.h) {
      return {
        objectPosXPercent: 50,
        scale: 1,
        scaledW: 0,
        scaledH: 0,
        cropX: 0,
        cropY: 0,
      };
    }

    const scale = Math.max(cw / nat.w, ch / nat.h);
    const scaledW = nat.w * scale;
    const scaledH = nat.h * scale;

    const overflowX = Math.max(0, scaledW - cw);
    const overflowY = Math.max(0, scaledH - ch);

    const clampedX = overflowX
      ? Math.max(-(overflowX / 2), Math.min(overflowX / 2, panOffsetPx))
      : 0;
    const objectPosXPercent = overflowX ? ((clampedX + overflowX / 2) / overflowX) * 100 : 50;

    // crop offset in pixels from the LEFT/TOP of the scaled image.
    // object-position x% means the left edge shifts accordingly.
    const cropX = overflowX ? (objectPosXPercent / 100) * overflowX : 0;
    // y stays centered for now.
    const cropY = overflowY ? overflowY / 2 : 0;

    return { objectPosXPercent, scale, scaledW, scaledH, cropX, cropY };
  })();

  // 3D Tilt & Parallax Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 2 - 1;
    const y = ((e.clientY - top) / height) * 2 - 1;
    setRotation({ x: -y * 2, y: x * 2 }); // Reduced tilt for better usability with clicks
  };

  const handleNextSection = () => {
    setActiveSectionIndex((prev) => (prev + 1) % sections.length);
    setOpenProductId(null); // Close cards when changing section
    setPanOffsetPx(0);
    setImageNatural(null);
  };

  const handlePrevSection = () => {
    setActiveSectionIndex((prev) => (prev - 1 + sections.length) % sections.length);
    setOpenProductId(null);
    setPanOffsetPx(0);
    setImageNatural(null);
  };

  useEffect(() => {
    setPanOffsetPx(0);
  }, [activeSectionIndex, activeSection?.id]);

  // Close card when clicking on background
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpenProductId(null);
    }
  };

  if (!activeSection) return <div>Loading...</div>;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden perspective-container">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900/50 to-black z-10 pointer-events-none opacity-50" />

      {/* The 3D World */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setRotation({ x: 0, y: 0 });
        }}
        className="relative w-full h-full preserve-3d transition-transform duration-500 ease-out"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(0.9)`,
          zIndex: openProductId ? 60 : 0,
        }}
      >
        {/* Store Environment Layer */}
        <div key={activeSection.id} className="absolute inset-0 z-0 animate-fade-in" onClick={handleBackgroundClick}>
          {String(activeSection.image || '').trim() ? (
            <img
              src={String(activeSection.image).trim()}
              alt={activeSection.name}
              ref={(el) => {
                imageRef.current = el;
              }}
              onLoad={(e) => {
                const el = e.currentTarget;
                const w = Number(el.naturalWidth);
                const h = Number(el.naturalHeight);
                if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
                  setImageNatural({ w, h });
                }
              }}
              onPointerDown={(e) => {
                if (!containerRef.current) return;
                if (e.pointerType === 'mouse') return;
                const overflowX = Math.max(0, coverMetrics.scaledW - containerSize.w);
                if (!overflowX) return;

                panStateRef.current = {
                  active: true,
                  startX: e.clientX,
                  startOffset: panOffsetPx,
                };
                try {
                  (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                } catch {
                }
              }}
              onPointerMove={(e) => {
                if (!panStateRef.current.active) return;
                if (e.pointerType === 'mouse') return;
                const overflowX = Math.max(0, coverMetrics.scaledW - containerSize.w);
                if (!overflowX) return;

                const dx = e.clientX - panStateRef.current.startX;
                const half = overflowX / 2;
                const next = panStateRef.current.startOffset + dx;
                setPanOffsetPx(Math.max(-half, Math.min(half, next)));
                
                // Handle swipe navigation with reversed logic for RTL
                if (Math.abs(dx) > 50) {
                  if (dx < 0) {
                    // Swipe left (negative dx) = next section
                    handleNextSection();
                  } else {
                    // Swipe right (positive dx) = previous section  
                    handlePrevSection();
                  }
                  panStateRef.current.active = false;
                }
              }}
              onPointerUp={() => {
                panStateRef.current.active = false;
              }}
              onPointerCancel={() => {
                panStateRef.current.active = false;
              }}
              style={{ objectPosition: `${coverMetrics.objectPosXPercent}% 50%`, touchAction: 'pan-y' }}
              className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1]"
            />
          ) : (
            <div className="w-full h-full bg-black/20" />
          )}
          {/* Noise overlay */}
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        </div>

        {/* Products Layer (Interactive Dots) */}
        <div
          key={`products-${activeSection.id}`}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          {activeSection.products.map((product, idx) => (
            <ProductNode
              key={product.id}
              product={product}
              coverMetrics={coverMetrics}
              containerSize={containerSize}
              isOpen={openProductId === product.id}
              onToggle={() => setOpenProductId(openProductId === product.id ? null : product.id)}
              onAddToCart={onAddToCart}
              onReserve={onReserve}
              isFood={isFood}
              productEditorVisibility={productEditorVisibility}
            />
          ))}
        </div>
      </div>

      {/* Section Navigation Controls (Buyer UI) */}
      {sections.length > 1 && (
        <div className="absolute top-20 sm:top-28 inset-x-0 flex items-center justify-center gap-3 sm:gap-4 z-40 pointer-events-auto">
          <button
            onClick={handlePrevSection}
            className="p-2 sm:p-3 rounded-full bg-black/60 backdrop-blur border border-white/10 hover:border-cyan-500 text-white transition-all hover:scale-110"
          >
            <ChevronRight size={24} />
          </button>

          <div className="bg-black/60 backdrop-blur px-4 sm:px-6 py-2 rounded-xl border border-white/10 flex items-center gap-2 sm:gap-3">
            <Map size={16} className="text-cyan-400" />
            <span className="text-white font-bold">{activeSection.name}</span>
            <span className="text-xs text-slate-500">({activeSectionIndex + 1}/{sections.length})</span>
          </div>

          <button
            onClick={handleNextSection}
            className="p-2 sm:p-3 rounded-full bg-black/60 backdrop-blur border border-white/10 hover:border-cyan-500 text-white transition-all hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
      )}
    </div>
  );
});

interface ProductNodeProps {
  product: Product;
  coverMetrics: { objectPosXPercent: number; scale: number; scaledW: number; scaledH: number; cropX: number; cropY: number };
  containerSize: { w: number; h: number };
  isOpen: boolean;
  onToggle: () => void;
  onAddToCart: (p: Product) => void;
  onReserve?: (p: Product) => void;
  isFood: boolean;
  productEditorVisibility?: Record<string, any>;
}

const ProductNode: React.FC<ProductNodeProps> = React.memo(({ product, coverMetrics, containerSize, isOpen, onToggle, onAddToCart, onReserve, isFood, productEditorVisibility }) => {
  const isGhost = product.stockStatus === 'OUT_OF_STOCK';
  const isLowStock = product.stockStatus === 'LOW_STOCK';
  const [justAdded, setJustAdded] = useState(false);

  const isVisible = useCallback(
    (key: string, fallback: boolean = true) => {
      const current = (productEditorVisibility || {}) as Record<string, any>;
      if (current[key] === undefined || current[key] === null) return fallback;
      return coerceBoolean(current[key], fallback);
    },
    [productEditorVisibility]
  );

  const showPrice = isVisible('productCardPrice', true);
  const showStock = isVisible('productCardStock', true);
  const showAddToCart = isVisible('productCardAddToCart', true);
  const showReserve = isVisible('productCardReserve', true);

  const furnitureMeta = (product as any)?.furnitureMeta ?? (product as any)?.furniture_meta;

  const compactDimsLabel = useMemo(() => {
    const formatted = furnitureMeta ? formatMetaValue(furnitureMeta) : null;
    return formatted || null;
  }, [furnitureMeta]);

  const metaChips = useMemo(() => {
    const all = getProductMetaChips(product as any);
    if (showStock) return all;
    return all.filter((c) => c.label !== 'المتاح');
  }, [product, showStock]);

  const unitRaw = typeof (product as any)?.unit === 'string' ? String((product as any).unit).trim() : '';
  
  // Selection states
  const [selectedColor, setSelectedColor] = useState<string | null>(
    Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : null
  );
  const [selectedSize, setSelectedSize] = useState<SizeVariant | null>(
    Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : null
  );

  const packDefs = isFood && Array.isArray((product as any)?.packOptions) ? ((product as any).packOptions as any[]) : [];
  const hasPacks = Array.isArray(packDefs) && packDefs.length > 0;
  const [selectedPackId, setSelectedPackId] = useState<string>(() => {
    if (!hasPacks) return '';
    const first = packDefs[0];
    return String(first?.id || '').trim();
  });

  useEffect(() => {
    if (!hasPacks) {
      if (selectedPackId) setSelectedPackId('');
      return;
    }
    const exists = packDefs.some((p: any) => String(p?.id || '').trim() === String(selectedPackId || '').trim());
    if (!exists) {
      const first = packDefs[0];
      setSelectedPackId(String(first?.id || '').trim());
    }
  }, [hasPacks, selectedPackId, (product as any)?.packOptions]);

  // Calculate final price based on selected size / pack
  const packPriceRaw = (() => {
    if (!hasPacks || !selectedPackId) return NaN;
    const def = packDefs.find((p: any) => String(p?.id || '').trim() === String(selectedPackId || '').trim());
    const pr = def ? (typeof def?.price === 'number' ? def.price : Number(def?.price || NaN)) : NaN;
    return Number.isFinite(pr) && pr >= 0 ? pr : NaN;
  })();
  const finalPrice = hasPacks && Number.isFinite(packPriceRaw)
    ? packPriceRaw
    : (selectedSize?.price ?? product.price);

  const handleReserve = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReserve) {
      onReserve(product);
      setJustAdded(true);
      setTimeout(() => {
        setJustAdded(false);
        onToggle(); // Close card after reserving
      }, 800);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create enhanced product with selections
    const cartProduct = {
      ...product,
      price: finalPrice,
      unit: unitRaw ? unitRaw : undefined,
      furnitureMeta,
      selectedColor,
      selectedSize: selectedSize ? {
        label: selectedSize.label === 'custom' ? String(selectedSize.customValue) : selectedSize.label,
        price: selectedSize.price,
      } : undefined,
      ...(hasPacks
        ? (() => {
            const def = packDefs.find((p: any) => String(p?.id || '').trim() === String(selectedPackId || '').trim());
            const qty = def ? (typeof def?.qty === 'number' ? def.qty : Number(def?.qty || NaN)) : NaN;
            const u = String(def?.unit || unitRaw || '').trim();
            const label = String(def?.label || def?.name || '').trim() || (Number.isFinite(qty) && qty > 0 ? `${qty} ${u}` : 'باقة');
            return {
              selectedPackId,
              variantSelection: { kind: 'pack', packId: selectedPackId, label, qty: Number.isFinite(qty) ? qty : undefined, unit: u || undefined },
            };
          })()
        : {}),
    };
    
    onAddToCart(cartProduct);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onToggle(); // Close card after adding
    }, 800);
  };

  const computePxPosition = () => {
    const xPct = typeof (product as any)?.x === 'number' ? (product as any).x : Number((product as any)?.x);
    const yPct = typeof (product as any)?.y === 'number' ? (product as any).y : Number((product as any)?.y);
    if (!Number.isFinite(xPct) || !Number.isFinite(yPct)) {
      return { left: '50%', top: '50%' };
    }

    if (!coverMetrics.scaledW || !coverMetrics.scaledH || !containerSize.w || !containerSize.h) {
      return { left: `${xPct}%`, top: `${yPct}%` };
    }

    const xPx = (xPct / 100) * coverMetrics.scaledW - coverMetrics.cropX;
    const yPx = (yPct / 100) * coverMetrics.scaledH - coverMetrics.cropY;

    return { left: `${xPx}px`, top: `${yPx}px` };
  };

  const { left, top } = computePxPosition();

  return (
    <div
      className="absolute transition-all duration-500 transform preserve-3d pointer-events-auto"
      style={{
        top,
        left,
        zIndex: isOpen ? 100 : 10,
        transform: isOpen ? 'translateZ(50px)' : 'translateZ(0px)',
      }}
    >
      {/* 1. The Hotspot (Circle) - Always visible when closed */}
      <div
        onClick={onToggle}
        className={`
                absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group
                ${isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}
            `}
      >
        {/* Outer Ripple */}
        <div
          className={`
                absolute inset-0 rounded-full animate-ping opacity-75
                ${isGhost ? 'bg-red-500' : 'bg-cyan-500'}
            `}
          style={{ width: '100%', height: '100%' }}
        ></div>

        {/* The Dot */}
        <div
          className={`
                relative w-4 h-4 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-125
                ${isGhost ? 'bg-red-500/80 border-red-300' : 'bg-cyan-500/80 border-white backdrop-blur-sm'}
            `}
        >
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>

        {/* Price Tag Hint (Optional small hover text) */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/70 backdrop-blur rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {showPrice && <div className="leading-tight">{product.price} ج.م</div>}
          {compactDimsLabel && <div className="leading-tight text-slate-200">{compactDimsLabel}</div>}
        </div>
      </div>

      {/* 2. The Detail Card - Visible only when Open */}
      {isOpen &&
        (typeof document !== 'undefined'
          ? createPortal(
              <div
                className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
                onClick={(e) => {
                  if (e.target === e.currentTarget) onToggle();
                }}
              >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
                <div
                  className={`
                        relative w-full max-w-sm sm:max-w-md
                        bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(6,182,212,0.1)] transition-all duration-500 flex flex-col overflow-hidden
                        ${justAdded ? 'scale-95 opacity-0 translate-y-8' : 'scale-100 opacity-100 translate-y-0'}
                    `}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Close Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle();
                    }}
                    className="absolute top-2 left-2 text-slate-400 hover:text-white z-10 p-1 hover:bg-white/10 rounded-full transition-colors"
                    type="button"
                  >
                    <X size={14} />
                  </button>

                  {/* Card Content */}
                  <div className="p-4 pt-6 text-center max-h-[75vh] overflow-y-auto">
                    <h3 className={`font-bold text-base mb-2 leading-tight ${isGhost ? 'text-slate-400' : 'text-white'}`}>{product.name}</h3>
                    {product.description && (
                      <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">{product.description}</p>
                    )}

                    {metaChips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center mb-2">
                        {metaChips.map((c) => (
                          <span
                            key={`${c.label}:${c.value}`}
                            className="text-[10px] text-slate-200 bg-slate-800/60 border border-slate-700/60 rounded-full px-2 py-1"
                          >
                            <span className="text-slate-400">{c.label}:</span> <span className="text-cyan-300">{c.value}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Status Badges */}
                    {isGhost ? (
                      <div className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-900/30 px-2 py-1 rounded-full mt-2">
                        <Lock size={12} /> <span>غير متوفر</span>
                      </div>
                    ) : (
                      <div className="space-y-3 mt-2">
                        {hasPacks && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                              <span className="text-[10px] text-slate-400">الباقة</span>
                            </div>
                            <select
                              value={selectedPackId}
                              onChange={(e) => setSelectedPackId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-white text-sm"
                            >
                              {packDefs.map((p: any) => {
                                const pid = String(p?.id || '').trim();
                                const qty = p?.qty;
                                const unit = String(p?.unit || (product as any)?.unit || '').trim();
                                const label = String(p?.label || p?.name || '').trim() || `${qty} ${unit}`;
                                return (
                                  <option key={pid} value={pid}>
                                    {label} - {p?.price} ج.م
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        )}

                {/* Fashion: Colors Selection */}
                {Array.isArray(product.colors) && product.colors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] text-slate-400">اللون</span>
                      {selectedColor && <span className="text-[10px] text-cyan-400">{selectedColor}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            selectedColor === color
                              ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                              : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fashion: Sizes Selection */}
                {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] text-slate-400">المقاس</span>
                      {selectedSize && (
                        <span className="text-[10px] text-cyan-400">
                          {selectedSize.label === 'custom' ? selectedSize.customValue : selectedSize.label} - {selectedSize.price}ج
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {product.sizes.map((size, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all min-w-[3rem] ${
                            selectedSize === size
                              ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                              : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {size.label === 'custom' ? size.customValue : size.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Display */}
                {showPrice && (
                  <div className="pt-2 border-t border-slate-700/50">
                    <div className="text-3xl font-black text-cyan-400 font-mono tracking-tight">
                      {finalPrice} <span className="text-sm text-cyan-600">EGP</span>
                    </div>
                    {selectedSize && selectedSize.price !== product.price && (
                      <div className="text-[10px] text-slate-500 line-through">{product.price} EGP</div>
                    )}
                  </div>
                )}

                {isLowStock && (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 bg-amber-900/20 py-1 rounded">
                    <AlertCircle size={10} /> <span>كمية محدودة</span>
                  </div>
                )}

                {/* Selected Summary */}
                {(selectedColor || selectedSize) && (
                  <div className="text-[10px] text-slate-400 bg-slate-800/50 rounded-lg py-2 px-3">
                    {selectedColor && <span className="text-cyan-400">{selectedColor}</span>}
                    {selectedColor && selectedSize && <span className="mx-1">•</span>}
                    {selectedSize && (
                      <span className="text-cyan-400">
                        {selectedSize.label === 'custom' ? selectedSize.customValue : selectedSize.label}
                      </span>
                    )}
                  </div>
                )}

                {(showAddToCart || (showReserve && onReserve)) && (
                  <div className="flex gap-2 mt-2">
                    {showAddToCart && (
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 py-3 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 active:scale-95 transform hover:scale-[1.02]"
                      >
                        <ShoppingBag size={18} />
                        إضافة للسلة
                      </button>
                    )}
                    {showReserve && onReserve && (
                      <button
                        onClick={handleReserve}
                        className="flex-1 py-3 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:from-amber-500 hover:via-orange-400 hover:to-amber-500 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 transition-all duration-300 active:scale-95 transform hover:scale-[1.02]"
                      >
                        <CalendarCheck size={18} />
                        حجز
                      </button>
                    )}
                  </div>
                )}
                      </div>
                    )}
                  </div>
                </div>
              </div>,
              document.body
            )
          : null)}
    </div>
  );
});
