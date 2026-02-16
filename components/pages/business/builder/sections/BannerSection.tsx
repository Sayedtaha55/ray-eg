import React, { useMemo, useRef, useState } from 'react';
import { Layout, Move, X } from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';

const isVideoUrl = (url: string) => {
  const u = String(url || '').toLowerCase();
  return u.endsWith('.mp4') || u.endsWith('.webm') || u.endsWith('.mov');
};

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
        <span className="text-slate-400">{bannerFile ? bannerFile.name : 'اختر صورة أو فيديو من الجهاز'}</span>
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
                  <div className="px-3 py-1.5 rounded-full bg-black/40 text-white text-xs font-black">اسحب الصورة لضبط المكان</div>
                </div>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => {
            setBannerFile(null);
            setBannerPreview('');
            setConfig({ ...config, bannerUrl: '' });
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
                {moveMode ? 'إنهاء التحريك' : 'تحريك الصورة'}
              </button>
              <div className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 text-slate-700 text-[11px] font-black shadow">
                X: {Math.round(posX)}% • Y: {Math.round(posY)}%
              </div>
              <button
                type="button"
                onClick={() => setPos(50, 50)}
                className="px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 text-slate-700 text-xs font-black shadow"
              >
                توسيط
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl px-3 py-2 shadow">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-slate-700">أفقي</span>
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
                <span className="text-[11px] font-black text-slate-700">رأسي</span>
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
  </div>

  );
};

export default BannerSection;
