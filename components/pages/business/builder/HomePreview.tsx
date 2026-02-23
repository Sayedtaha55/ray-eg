import React from 'react';
import SmartImage from '@/components/common/ui/SmartImage';
import { isVideoUrl, coerceNumber } from './utils';

interface HomePreviewProps {
  config: any;
  shop: any;
  logoDataUrl: string;
  isMenuOpen: boolean;
  setIsMenuOpen: (val: boolean) => void;
}

const HomePreview: React.FC<HomePreviewProps> = ({ config, shop, logoDataUrl }) => {
  const isBold = config.layout === 'bold';
  const bannerUrl = config.bannerUrl || '';

  return (
    <>
      <div className="h-40 md:h-64 relative shrink-0">
        {bannerUrl ? (
          isVideoUrl(bannerUrl) ? (
            <video
              src={bannerUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <SmartImage
              src={bannerUrl}
              className="w-full h-full"
              imgClassName="object-cover"
              loading="eager"
              fetchPriority="high"
              style={{ objectPosition: `${coerceNumber(config.bannerPosX, 50)}% ${coerceNumber(config.bannerPosY, 50)}%` }}
            />
          )
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <p className="text-slate-400 font-black">لا توجد صورة بانر</p>
          </div>
        )}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-white via-transparent" />
      </div>

      <div className={`p-5 sm:p-8 -mt-16 relative flex flex-col gap-5 sm:gap-6 flex-1 ${String(config.headerType || 'centered') === 'side' ? 'items-end text-right' : 'items-center text-center'}`}>
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl p-2 border border-slate-50">
          {logoDataUrl ? (
            <SmartImage
              src={logoDataUrl}
              alt="logo"
              className="w-full h-full rounded-[1.6rem] sm:rounded-[2rem]"
              imgClassName="object-cover rounded-[1.6rem] sm:rounded-[2rem]"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="w-full h-full bg-slate-50 rounded-[1.6rem] sm:rounded-[2rem] flex items-center justify-center font-black text-slate-200 border-2 border-dashed border-slate-100 overflow-hidden text-[8px]">LOGO</div>
          )}
        </div>
        <div className="space-y-2">
          <h1 className={`font-black ${config.headingSize || 'text-4xl'}`} style={{ color: config.primaryColor }}>{shop?.name || 'معاينة المتجر'}</h1>
          <p className={`font-bold ${config.textSize || 'text-sm'} text-slate-500`}>{shop?.description || 'وصف بسيط للمتجر يظهر للعملاء'}</p>
        </div>
        <button className={`${config.buttonPadding || 'px-6 py-3'} ${config.buttonShape || 'rounded-2xl'} text-white font-black text-sm shadow-xl transition-all hover:opacity-90 active:scale-[0.98]`} style={{ backgroundColor: config.primaryColor }}>متابعة</button>

        <div className={`w-full mt-10 space-y-6 ${config.itemGap || 'gap-4 md:gap-6'}`}>
          {(config.productDisplay || 'cards') === 'cards' ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className={`p-3 rounded-2xl border ${isBold ? 'border-2' : 'border-transparent'}`} style={{ borderColor: isBold ? config.primaryColor + '22' : 'transparent' }}>
                  <div className="aspect-square bg-slate-100 rounded-xl mb-2" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded-full mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex flex-row-reverse items-center gap-3 ${(config.productDisplay === 'minimal') ? 'border-b border-slate-100 py-3' : 'bg-white border border-slate-100 rounded-2xl p-3'}`}>
                  <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
                    <div className="h-3 w-1/3 bg-slate-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(HomePreview);
