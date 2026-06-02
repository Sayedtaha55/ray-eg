import React, { useMemo, useRef, useState } from 'react';
import { Layout, Move, X, Eye, EyeOff } from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';
import { useTranslation } from 'react-i18next';
import { isVideoUrl } from '@/components/pages/public/ShopProfile/utils';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  bannerFile: File | null;
  setBannerFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerPreview: string;
  setBannerPreview: React.Dispatch<React.SetStateAction<string>>;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const BannerSection: React.FC<Props> = ({
  config,
  setConfig,
  bannerFile,
  setBannerFile,
  bannerPreview,
  setBannerPreview,
}) => {
  const { t } = useTranslation();
  
  const getVis = (key: string, fallback = true) => {
    const cur = config?.elementsVisibility || {};
    if (cur[key] === undefined || cur[key] === null) return fallback;
    return Boolean(cur[key]);
  };

  const setVis = (key: string, value: boolean) => {
    setConfig((prev) => {
      const base = (prev?.elementsVisibility && typeof prev.elementsVisibility === 'object') ? prev.elementsVisibility : {};
      return { ...prev, elementsVisibility: { ...base, [key]: value } };
    });
  };
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [moveMode, setMoveMode] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number; pointerId: number | null }>({
    startX: 0,
    startY: 0,
    startPosX: 50,
    startPosY: 50,
    pointerId: null,
  });

  const posX = useMemo(() => {
    const v = Number((config as any)?.bannerPosX);
    return Number.isFinite(v) ? clamp(v, 0, 100) : 50;
  }, [config]);

  const posY = useMemo(() => {
    const v = Number((config as any)?.bannerPosY);
    return Number.isFinite(v) ? clamp(v, 0, 100) : 50;
  }, [config]);

  const isVideo = (bannerFile && bannerFile.type.startsWith('video/')) || isVideoUrl(bannerPreview || config.bannerUrl);
  const src = bannerPreview || config.bannerUrl;

  const setPos = (nextX: number, nextY: number) => {
    setConfig((prev) => ({
      ...prev,
      bannerPosX: clamp(nextX, 0, 100),
      bannerPosY: clamp(nextY, 0, 100),
    }));
  };

  return (
    <div className="space-y-3">
    <div className="relative">
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setBannerFile(file);
            const url = URL.createObjectURL(file);
            setBannerPreview(url);
            // Don't store blob URL in config, only use it for preview
          }
        }}
        className="hidden"
        id="banner-upload"
      />
      <label
        htmlFor="banner-upload"
        className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold outline-none border border-slate-100 text-right cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between"
      >
        <span className="text-slate-400">{bannerFile ? bannerFile.name : t('business.builder.banner.chooseImageOrVideo')}</span>
        <Layout size={20} className="text-slate-400" />
      </label>
    </div>

    {(bannerPreview || config.bannerUrl) && (
      <div className="relative rounded-2xl overflow-hidden bg-slate-100">
        {isVideo ? (
          <video src={src} className="w-full h-44 object-cover" controls />
        ) : (
          <div className="w-full h-56" ref={containerRef}>
            <SmartImage
              src={src}
              className="w-full h-full"
              imgClassName="object-cover"
              alt="Banner preview"
              loading="eager"
              fetchPriority="high"
              style={{
                objectPosition: `${posX}% ${posY}%`,
                cursor: moveMode ? 'grab' : 'default',
                touchAction: moveMode ? 'none' : 'auto',
                userSelect: 'none',
              }}
              imgProps={{
                onPointerDown: (e: any) => {
                  if (!moveMode) return;
                  const el = containerRef.current;
                  if (!el) return;
                  dragRef.current = {
                    startX: e.clientX,
                    startY: e.clientY,
                    startPosX: posX,
                    startPosY: posY,
                    pointerId: e.pointerId,
                  };
                  try {
                    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                  } catch {
                  }
                },
                onPointerMove: (e: any) => {
                  if (!moveMode) return;
                  const el = containerRef.current;
                  if (!el) return;
                  if (dragRef.current.pointerId == null || dragRef.current.pointerId !== e.pointerId) return;
                  const rect = el.getBoundingClientRect();
                  const dx = e.clientX - dragRef.current.startX;
                  const dy = e.clientY - dragRef.current.startY;
                  const nextX = clamp(dragRef.current.startPosX + (dx / Math.max(1, rect.width)) * 100, 0, 100);
                  const nextY = clamp(dragRef.current.startPosY + (dy / Math.max(1, rect.height)) * 100, 0, 100);
                  setPos(nextX, nextY);
                },
                onPointerUp: (e: any) => {
                  if (dragRef.current.pointerId !== e.pointerId) return;
                  dragRef.current.pointerId = null;
                  try {
                    (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
                  } catch {
                  }
                },
                onPointerCancel: (e: any) => {
                  if (dragRef.current.pointerId !== e.pointerId) return;
                  dragRef.current.pointerId = null;
                },
              }}
            />

            {moveMode && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-40" style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-3 py-1.5 rounded-full bg-black/40 text-white text-xs font-black">{t('business.builder.banner.dragToAdjust')}</div>
                </div>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => {
            setBannerFile(null);
            setBannerPreview('');
            setConfig((prev) => ({ ...prev, bannerUrl: '' }));
          }}
          className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <X size={16} />
        </button>

        {!isVideo && (
          <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMoveMode((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 text-slate-700 text-xs font-black shadow"
              >
                <Move size={14} />
                {moveMode ? t('business.builder.banner.endMove') : t('business.builder.banner.moveImage')}
              </button>
              <div className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 text-slate-700 text-[11px] font-black shadow">
                X: {Math.round(posX)}% • Y: {Math.round(posY)}%
              </div>
              <button
                type="button"
                onClick={() => setPos(50, 50)}
                className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 text-slate-700 text-xs font-black shadow"
              >
                {t('business.builder.banner.center')}
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl px-3 py-2 shadow">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-slate-700">{t('business.builder.banner.horizontal')}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={posX}
                  onChange={(e) => setPos(Number(e.target.value), posY)}
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] font-black text-slate-700">{t('business.builder.banner.vertical')}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={posY}
                  onChange={(e) => setPos(posX, Number(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )}

    {/* ─── Banner Size Selector ─── */}
    <div className="h-px bg-slate-100 my-3" />
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block text-right">حجم البانر (Banner Size)</label>
      <div className="grid grid-cols-2 gap-2">
        {[
          { id: 'normal', label: 'افتراضي', desc: 'Normal', barH: 'h-4' },
          { id: 'medium', label: 'متوسط', desc: 'Medium', barH: 'h-6' },
          { id: 'large', label: 'كبير', desc: 'Large', barH: 'h-8' },
          { id: 'fullscreen', label: 'ملء الشاشة', desc: 'Full Screen', barH: 'h-11' }
        ].map((sz) => {
          const isActive = (config.bannerSize || 'normal') === sz.id;
          return (
            <button
              key={sz.id}
              type="button"
              onClick={() => setConfig((prev) => ({ ...prev, bannerSize: sz.id }))}
              className={`p-3 rounded-xl border text-right transition-all flex items-center gap-3 flex-row-reverse ${
                isActive 
                  ? 'border-[#00E5FF] bg-cyan-50/70 shadow-sm' 
                  : 'border-slate-100 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex-1">
                <span className="font-black text-xs block">{sz.label}</span>
                <span className="text-[10px] text-slate-400 font-bold">{sz.desc}</span>
              </div>
              <div className={`w-6 ${sz.barH} rounded-sm transition-colors ${isActive ? 'bg-[#00E5FF]/30' : 'bg-slate-200'}`} />
            </button>
          );
        })}
      </div>
    </div>

    {/* ─── Banner Text Overlay ─── */}
    <div className="h-px bg-slate-100 my-3" />
    <div className="space-y-3">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest block pr-2">النص داخل البانر (Text Overlay)</label>
      
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">عنوان البانر (Banner Title)</label>
        <input
          type="text"
          value={String(config.bannerTitle || '')}
          onChange={(e) => {
            const val = e.target.value;
            setConfig((prev) => ({ ...prev, bannerTitle: val }));
          }}
          placeholder="مثال: خصومات الصيف الكبرى"
          className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-right"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">عنوان فرعي (Banner Subtitle)</label>
        <input
          type="text"
          value={String(config.bannerSubtitle || '')}
          onChange={(e) => {
            const val = e.target.value;
            setConfig((prev) => ({ ...prev, bannerSubtitle: val }));
          }}
          placeholder="مثال: احصل على خصم يصل إلى 50% على جميع المنتجات"
          className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-right"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">موضع النص (Text Position)</label>
        {/* Visual 3x3 grid selector */}
        <div className="grid grid-cols-3 gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
          {[
            { id: 'top-right', label: '↗' },
            { id: 'top-center', label: '↑' },
            { id: 'top-left', label: '↖' },
            { id: 'center-right', label: '→' },
            { id: 'center', label: '◉' },
            { id: 'center-left', label: '←' },
            { id: 'bottom-right', label: '↘' },
            { id: 'bottom-center', label: '↓' },
            { id: 'bottom-left', label: '↙' },
          ].map((pos) => {
            const isActive = String(config.bannerTextPosition || 'center') === pos.id;
            return (
              <button
                key={pos.id}
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, bannerTextPosition: pos.id }))}
                className={`h-10 rounded-xl border text-sm font-black transition-all ${
                  isActive
                    ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF] shadow-sm scale-105'
                    : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                {pos.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] font-bold text-slate-400 text-right">
          {(() => {
            const labels: Record<string, string> = {
              'top-right': 'أعلى اليمين',
              'top-center': 'أعلى الوسط',
              'top-left': 'أعلى اليسار',
              'center-right': 'الوسط يمين',
              'center': 'الوسط',
              'center-left': 'الوسط يسار',
              'bottom-right': 'أسفل اليمين',
              'bottom-center': 'أسفل الوسط',
              'bottom-left': 'أسفل اليسار',
            };
            return labels[String(config.bannerTextPosition || 'center')] || 'الوسط';
          })()}
        </p>
      </div>
    </div>

    {/* ─── Banner Section Visibility Toggle ─── */}
    <div className="h-px bg-slate-100 my-3" />
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60">
      <span className="font-black text-xs text-slate-700">{t('business.builder.visibility.items.profileBanner')}</span>
      <button
        type="button"
        onClick={() => setVis('profileBanner', !getVis('profileBanner'))}
        className={`p-1.5 rounded-lg transition-all ${getVis('profileBanner') ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : 'bg-slate-200 text-slate-400'}`}
      >
        {getVis('profileBanner') ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  </div>

  );
};

export default BannerSection;
