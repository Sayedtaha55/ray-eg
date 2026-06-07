import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Share2, Menu, X, Home, Utensils, Info, ShoppingBag, Eye, Star, Clock, MapPin, Phone, Search, Check
} from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';
import NavTab from './NavTab';
import { coerceBoolean, hexToRgba, isVideoUrl } from './utils';
import { isLowEndDevice } from '@/utils/performanceProfile';

const MotionDiv = motion.div as any;

interface ProfileHeaderProps {
  shop: any;
  currentDesign: any;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isHeaderMenuOpen: boolean;
  setIsHeaderMenuOpen: (open: boolean) => void;
  hasFollowed: boolean;
  followLoading: boolean;
  handleFollow: () => void;
  handleShare: () => void;
  isVisible: (key: string, fallback?: boolean) => boolean;
  prefersReducedMotion: boolean;
  headerBg: string;
  headerTextColor: string;
  bannerReady: boolean;
  purchaseModeButton?: React.ReactNode;
  isBuilderPreview?: boolean;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  shop,
  currentDesign,
  activeTab,
  setActiveTab,
  isHeaderMenuOpen,
  setIsHeaderMenuOpen,
  hasFollowed,
  followLoading,
  handleFollow,
  handleShare,
  isVisible,
  prefersReducedMotion,
  headerBg,
  headerTextColor,
  bannerReady,
  purchaseModeButton,
  isBuilderPreview = false,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { t } = useTranslation();
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stuck, setStuck] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const primaryColor = String(currentDesign?.primaryColor || '').trim() || '#00E5FF';
  const buttonShape = String((currentDesign as any)?.buttonShape || '').trim() || 'rounded-full';
  const buttonPadding = String((currentDesign as any)?.buttonPadding || '').trim() || 'px-6 py-2.5';
  const buttonPreset = String((currentDesign as any)?.buttonPreset || 'primary').trim();
  const buttonPresetCls = (() => {
    if (buttonPreset === 'ghost') return 'border border-white/30 bg-white/10 backdrop-blur text-white';
    if (buttonPreset === 'premium') return 'bg-gradient-to-l from-fuchsia-600 to-indigo-600 text-white shadow-lg';
    if (buttonPreset === 'urgent') return 'bg-gradient-to-l from-rose-600 to-orange-500 text-white shadow-lg';
    return '';
  })();
  const usePrimarySolidColor = buttonPreset === 'primary' || !buttonPreset;

  const showHeaderNavHome = isVisible('headerNavHome', true);
  const showHeaderNavGallery = isVisible('headerNavGallery', true);
  const showHeaderNavInfo = isVisible('headerNavInfo', true);
  const showHeaderNav = showHeaderNavHome || showHeaderNavGallery || showHeaderNavInfo;
  const showHeaderShareButton = isVisible('headerShareButton', true);
  const showShopFollowersCount = isVisible('shopFollowersCount', true);
  const showShopFollowButton = isVisible('shopFollowButton', true);
  const hasHomeLayout = String(currentDesign?.homeLayoutMode || '') === 'banner_ads_story';
  const showProfileBanner = isVisible('profileBanner', true) && (!hasHomeLayout || activeTab === 'home');

  const bannerUrl = String(currentDesign?.bannerUrl || '').trim();
  const bannerIsVideoFlag = currentDesign?.bannerIsVideo ?? currentDesign?.banner_is_video;
  const isVideoBanner = bannerIsVideoFlag !== undefined
    ? coerceBoolean(bannerIsVideoFlag, isVideoUrl(bannerUrl))
    : isVideoUrl(bannerUrl);
  const headerOverlayBanner = Boolean(currentDesign?.headerOverlayBanner);
  const shouldOverlay = !headerOverlayBanner;

  const bannerSize = String(currentDesign?.bannerSize || 'normal').trim();
  const bannerHeightClass = (() => {
    if (bannerSize === 'medium') return 'h-[350px] md:h-[550px]';
    if (bannerSize === 'large') return 'h-[450px] md:h-[700px]';
    if (bannerSize === 'fullscreen') return 'h-screen';
    return 'h-[250px] md:h-[400px]';
  })();

  const headerType = String(currentDesign?.headerType || 'centered').trim();
  const isTransparentActive = coerceBoolean(currentDesign?.headerTransparent, false);

  const lowEnd = useMemo(() => isLowEndDevice(), []);

  const shouldPlayVideoBanner = isVideoBanner && !lowEnd && !prefersReducedMotion;

  const MobileMenuWrapper: any = prefersReducedMotion || lowEnd ? 'div' : MotionDiv;
  const mobileMenuMotionProps = prefersReducedMotion || lowEnd
    ? {}
    : {
      initial: { opacity: 0, x: '100%' },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: '100%' },
    };

  const Backdrop: any = prefersReducedMotion || lowEnd ? 'div' : MotionDiv;
  const backdropMotionProps = prefersReducedMotion || lowEnd
    ? {}
    : {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.18 },
    };

  useEffect(() => {
    let rafId: any = null;
    let lastStuck: boolean | null = null;

    const measure = () => {
      try {
        const h = headerRef.current ? Number((headerRef.current as any).offsetHeight || 0) : 0;
        setHeaderHeight(Number.isFinite(h) ? h : 0);
      } catch {
        setHeaderHeight(0);
      }
    };

    const computeStuck = () => {
      try {
        if (!bannerRef.current && !showProfileBanner) {
          // No banner - always stuck
          if (lastStuck !== true) {
            lastStuck = true;
            setStuck(true);
          }
          return;
        }
        
        if (bannerRef.current) {
          const rect = bannerRef.current.getBoundingClientRect();
          const next = rect.bottom <= 0;
          if (lastStuck === null || next !== lastStuck) {
            lastStuck = next;
            setStuck(next);
          }
        }
      } catch {
      }
    };

    const onScroll = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        computeStuck();
      });
    };

    measure();
    computeStuck();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => {
      try {
        if (rafId != null) cancelAnimationFrame(rafId);
      } catch {
      }
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll as any);
    };
  }, [showProfileBanner]);

  const effectiveStuck = isBuilderPreview ? !shouldOverlay : stuck;
  const headerPositionClass = shouldOverlay
    ? (isBuilderPreview ? 'absolute top-0 left-0 right-0' : 'fixed top-0 left-0 right-0')
    : 'sticky top-0';

  const dynamicHeaderStyle = useMemo(() => {
    const isOverlayTransparentAtTop = shouldOverlay && isTransparentActive && !effectiveStuck;
    return {
      color: headerTextColor,
      backgroundColor: isOverlayTransparentAtTop ? 'transparent' : headerBg,
      backdropFilter: (isTransparentActive && !isOverlayTransparentAtTop) ? 'blur(12px)' : undefined,
      WebkitBackdropFilter: (isTransparentActive && !isOverlayTransparentAtTop) ? 'blur(12px)' : undefined,
    };
  }, [shouldOverlay, isTransparentActive, effectiveStuck, headerTextColor, headerBg]);

  useEffect(() => {
    try {
      if (videoRef.current && isVideoBanner && showProfileBanner) {
        videoRef.current.muted = true;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Video autoplay failed, user interaction may be required:', err);
          });
        }
      }
    } catch (e) {
      console.warn('Video autoplay trigger failed:', e);
    }
  }, [bannerUrl, isVideoBanner, showProfileBanner]);

  const renderLogoAndName = (alignment: 'right' | 'center' | 'left' = 'right') => (
    <div className={`flex items-center gap-3 md:gap-4 ${alignment === 'center' ? 'justify-center mx-auto' : alignment === 'left' ? 'flex-row' : 'flex-row-reverse text-right'}`}>
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
        {shop?.logoUrl ? (
          <SmartImage
            src={shop.logoUrl}
            alt={shop?.name}
            className="w-full h-full"
            imgClassName="object-cover"
            optimizeVariant="thumb"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        ) : null}
      </div>
      <div className={alignment === 'center' ? 'text-center' : alignment === 'left' ? 'text-left' : 'text-right'}>
        <h1 className="font-black text-sm md:text-xl leading-none mb-1">{shop?.name}</h1>
        {showShopFollowersCount && (
          <p className="text-[10px] md:text-xs opacity-70 flex items-center gap-1 justify-end">
            {shop?.followers || 0} {t('shopProfile.followers')} <Users size={10} />
          </p>
        )}
      </div>
    </div>
  );

  const renderDesktopNav = () => (
    <nav className="hidden md:flex items-center gap-1 flex-row-reverse">
      {String(currentDesign?.homeLayoutMode || '') === 'banner_ads_story' ? (
        <>
          {showHeaderNavHome && (
            <NavTab 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')}
              icon={<Home size={18} />}
              label={String(currentDesign.homePageName || 'الرئيسية')}
              design={currentDesign}
            />
          )}
          {showHeaderNavHome && (
            <NavTab 
              active={activeTab === 'products'} 
              onClick={() => setActiveTab('products')}
              icon={<ShoppingBag size={18} />}
              label={String(currentDesign.allProductsPageName || 'جميع المنتجات')}
              design={currentDesign}
            />
          )}
        </>
      ) : (
        showHeaderNavHome && (
          <NavTab 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')}
            icon={<ShoppingBag size={18} />}
            label={t('shopProfile.productsTab')}
            design={currentDesign}
          />
        )
      )}
      {showHeaderNavGallery && (
        <NavTab 
          active={activeTab === 'gallery'} 
          onClick={() => setActiveTab('gallery')}
          icon={<Utensils size={18} />}
          label={t('shopProfile.galleryTab')}
          design={currentDesign}
        />
      )}
      {showHeaderNavInfo && (
        <NavTab 
          active={activeTab === 'info'} 
          onClick={() => setActiveTab('info')}
          icon={<Info size={18} />}
          label={t('shopProfile.infoTab')}
          design={currentDesign}
        />
      )}
    </nav>
  );

  const renderActions = () => (
    <div className="flex items-center gap-2 flex-row-reverse">
      {showHeaderShareButton && (
        <button
          onClick={handleShare}
          className="p-2 rounded-full transition-all hover:bg-white/20"
          aria-label={t('shopProfile.shareAria')}
        >
          <Share2 size={18} />
        </button>
      )}
      {showShopFollowButton && (
        <button
          onClick={handleFollow}
          disabled={followLoading}
          className={`font-black text-xs md:text-sm transition-all ${
            hasFollowed 
              ? 'bg-white/20 px-4 py-2 rounded-full text-white' 
              : `${buttonShape} ${buttonPadding} ${buttonPresetCls}`
          }`}
          style={(!hasFollowed && usePrimarySolidColor) ? { backgroundColor: primaryColor, color: '#FFFFFF' } : undefined}
        >
          {followLoading ? '...' : hasFollowed ? t('shopProfile.following') : t('shopProfile.follow')}
        </button>
      )}
      <button
        className="md:hidden p-2 rounded-full transition-all hover:bg-white/20"
        onClick={() => setIsHeaderMenuOpen(true)}
      >
        <Menu size={24} />
      </button>
    </div>
  );

  const renderSearchBar = () => (
    <div className="hidden md:flex items-center flex-1 max-w-sm mx-4" dir="rtl">
      <div className="relative w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            if (setSearchQuery) {
              setSearchQuery(val);
            }
            if (val && activeTab !== 'products') {
              setActiveTab('products');
            }
          }}
          placeholder={t('shopProfile.searchPlaceholder', 'البحث عن منتج...')}
          className="w-full py-2 pl-8 pr-10 rounded-2xl border border-slate-200 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/40 text-xs font-bold text-slate-800 transition-all placeholder:text-slate-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setActiveTab('products');
            }
          }}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>
        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              if (setSearchQuery) {
                setSearchQuery('');
              }
            }}
            className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 hover:text-slate-650 transition-colors"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );

  const renderHeaderContent = () => {
    if (headerType === 'split_branding') {
      return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between flex-row-reverse relative">
          <div className="flex-1 flex justify-start">{renderActions()}</div>
          {/* Desktop: Centered Branding */}
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:block">
            {renderLogoAndName('center')}
          </div>
          {/* Mobile: Standard Right Branding */}
          <div className="md:hidden">
            {renderLogoAndName('right')}
          </div>
          <div className="flex-1 justify-end hidden md:flex">{renderDesktopNav()}</div>
        </div>
      );
    }
    
    if (headerType === 'minimal_left') {
      return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between flex-row-reverse">
          {renderLogoAndName('right')}
          <div className="flex items-center gap-6 flex-row-reverse">
            {renderDesktopNav()}
            <div className="h-6 w-px bg-slate-200/50 hidden md:block" />
            {renderActions()}
          </div>
        </div>
      );
    }
    
    if (headerType === 'search_bar') {
      return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between flex-row-reverse">
          {renderLogoAndName('right')}
          {renderSearchBar()}
          <div className="flex items-center gap-4 flex-row-reverse">
            {renderDesktopNav()}
            {renderActions()}
          </div>
        </div>
      );
    }
    
    if (headerType === 'stacked_bold') {
      return (
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-row-reverse">
            {renderLogoAndName('right')}
            {renderActions()}
          </div>
          <div className="h-px bg-slate-100/50 hidden md:block" />
          <div className="hidden md:flex items-center justify-between flex-row-reverse">
            {renderDesktopNav()}
            {renderSearchBar()}
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between flex-row-reverse">
        {renderLogoAndName('right')}
        {renderDesktopNav()}
        {renderActions()}
      </div>
    );
  };

  const getTextPositionClasses = (pos: string) => {
    const p = String(pos || 'center').toLowerCase().trim();
    switch (p) {
      case 'top-right': return 'items-start justify-end text-right';
      case 'top-center': return 'items-start justify-center text-center';
      case 'top-left': return 'items-start justify-start text-left';
      case 'center-right': return 'items-center justify-end text-right';
      case 'center-left': return 'items-center justify-start text-left';
      case 'bottom-right': return 'items-end justify-end text-right';
      case 'bottom-center': return 'items-end justify-center text-center';
      case 'bottom-left': return 'items-end justify-start text-left';
      case 'center':
      default:
        return 'items-center justify-center text-center';
    }
  };

  return (
    <div className="relative">
      {/* Header - positioned based on overlay setting */}
      {shouldOverlay ? null : (
        /* When NOT overlaying: header comes FIRST, then banner below it */
        <header
          ref={headerRef as any}
          className={`${headerPositionClass} z-[100] transition-all duration-300 ${effectiveStuck ? 'shadow-sm' : ''}`}
          style={dynamicHeaderStyle}
        >
          {renderHeaderContent()}
        </header>
      )}

      {/* Banner Section */}
      {showProfileBanner ? (
        <div ref={bannerRef} className={`relative ${bannerHeightClass} overflow-hidden`}>
          {!bannerReady && <div className="absolute inset-0 bg-slate-100 animate-pulse" />}
          {bannerUrl ? (isVideoBanner ? (
            <video
              ref={videoRef}
              key={bannerUrl}
              autoPlay
              loop
              muted
              playsInline
              {...{ webkitPlaysInline: true } as any}
              poster={currentDesign?.bannerPosterUrl || currentDesign?.banner_poster_url || undefined}
              className="w-full h-full object-cover"
              src={bannerUrl}
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              onLoadedData={() => {
                try {
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                    const p = videoRef.current.play();
                    if (p !== undefined) {
                      p.catch(() => {});
                    }
                  }
                } catch {}
              }}
              onError={(e) => {
                console.warn('Video banner error:', (e.target as any)?.error?.message || 'unknown');
              }}
            />
          ) : (
            <img
              src={bannerUrl}
              alt={shop?.name}
              className="w-full h-full object-cover"
              decoding="async"
              fetchPriority="high"
              loading="eager"
            />
          )) : (
            <div className="absolute inset-0 bg-slate-100" />
          )}
          
          {/* Banner Text Overlay */}
          {(currentDesign?.bannerTitle || currentDesign?.bannerSubtitle) ? (
            <div className={`absolute inset-0 z-10 flex flex-col ${getTextPositionClasses(currentDesign?.bannerTextPosition)} p-6 md:p-12 text-white`}>
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent pointer-events-none" />
              <div className="relative max-w-2xl space-y-2" dir="rtl">
                {currentDesign?.bannerTitle && (
                  <h2 className="text-xl md:text-4xl font-black leading-tight drop-shadow-lg">
                    {currentDesign.bannerTitle}
                  </h2>
                )}
                {currentDesign?.bannerSubtitle && (
                  <p className="text-sm md:text-lg font-bold opacity-90 drop-shadow-md">
                    {currentDesign.bannerSubtitle}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          )}

          {purchaseModeButton ? (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 md:bottom-8 z-[50]">
              {purchaseModeButton}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Header - Overlay mode: header sits ON TOP of banner */}
      {shouldOverlay ? (
        <header
          ref={headerRef as any}
          className={`${headerPositionClass} z-[100] transition-all duration-300 ${
            effectiveStuck ? 'shadow-sm' : ''
          }`}
          style={dynamicHeaderStyle}
        >
          {renderHeaderContent()}
        </header>
      ) : null}

      {/* Mobile Menu */}
      <AnimatePresence>
        {isHeaderMenuOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <Backdrop
              {...backdropMotionProps}
              className="absolute inset-0 bg-black/35"
              onClick={() => setIsHeaderMenuOpen(false)}
            />

            <MobileMenuWrapper
              {...mobileMenuMotionProps}
              className="absolute inset-y-0 right-0 w-[88%] max-w-sm bg-white shadow-2xl"
            >
              <div className="p-6 flex flex-col h-full text-right" dir="rtl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-xl">{t('shopProfile.menu')}</h2>
                  <button onClick={() => setIsHeaderMenuOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {/* Mobile Search Bar */}
                <div className="relative mb-6">
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (setSearchQuery) setSearchQuery(val);
                      if (val && activeTab !== 'products') setActiveTab('products');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setActiveTab('products');
                        setIsHeaderMenuOpen(false);
                      }
                    }}
                    placeholder={t('shopProfile.searchPlaceholder', 'البحث عن منتج...')}
                    className="w-full h-11 pr-10 pl-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-300 transition-all"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => { if (setSearchQuery) setSearchQuery(''); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  ) : null}
                </div>
                
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {String(currentDesign?.homeLayoutMode || '') === 'banner_ads_story' ? (
                    <>
                      {showHeaderNavHome && (
                        <button 
                          onClick={() => { setActiveTab('home'); setIsHeaderMenuOpen(false); }}
                          className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-all active:scale-[0.98] ${activeTab === 'home' ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'}`}
                          style={activeTab === 'home' ? { borderRight: `3px solid ${primaryColor}` } : undefined}
                        >
                          <Home size={20} className={activeTab === 'home' ? '' : 'text-slate-400'} style={activeTab === 'home' ? { color: primaryColor } : undefined} /> {String(currentDesign.homePageName || 'الرئيسية')}
                        </button>
                      )}
                      {showHeaderNavHome && (
                        <button 
                          onClick={() => { setActiveTab('products'); setIsHeaderMenuOpen(false); }}
                          className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-all active:scale-[0.98] ${activeTab === 'products' ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'}`}
                          style={activeTab === 'products' ? { borderRight: `3px solid ${primaryColor}` } : undefined}
                        >
                          <ShoppingBag size={20} className={activeTab === 'products' ? '' : 'text-slate-400'} style={activeTab === 'products' ? { color: primaryColor } : undefined} /> {String(currentDesign.allProductsPageName || 'جميع المنتجات')}
                        </button>
                      )}
                    </>
                  ) : (
                    showHeaderNavHome && (
                      <button 
                        onClick={() => { setActiveTab('products'); setIsHeaderMenuOpen(false); }}
                        className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-all active:scale-[0.98] ${activeTab === 'products' ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'}`}
                        style={activeTab === 'products' ? { borderRight: `3px solid ${primaryColor}` } : undefined}
                      >
                        <ShoppingBag size={20} className={activeTab === 'products' ? '' : 'text-slate-400'} style={activeTab === 'products' ? { color: primaryColor } : undefined} /> {t('shopProfile.productsTab')}
                      </button>
                    )
                  )}
                  {showHeaderNavGallery && (
                    <button 
                      onClick={() => { setActiveTab('gallery'); setIsHeaderMenuOpen(false); }}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-all active:scale-[0.98] ${activeTab === 'gallery' ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'}`}
                      style={activeTab === 'gallery' ? { borderRight: `3px solid ${primaryColor}` } : undefined}
                    >
                      <Utensils size={20} className={activeTab === 'gallery' ? '' : 'text-slate-400'} style={activeTab === 'gallery' ? { color: primaryColor } : undefined} /> {t('shopProfile.galleryTab')}
                    </button>
                  )}
                  {showHeaderNavInfo && (
                    <button 
                      onClick={() => { setActiveTab('info'); setIsHeaderMenuOpen(false); }}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-all active:scale-[0.98] ${activeTab === 'info' ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'}`}
                      style={activeTab === 'info' ? { borderRight: `3px solid ${primaryColor}` } : undefined}
                    >
                      <Info size={20} className={activeTab === 'info' ? '' : 'text-slate-400'} style={activeTab === 'info' ? { color: primaryColor } : undefined} /> {t('shopProfile.infoTab')}
                    </button>
                  )}
                </div>

                {showShopFollowButton && (
                  <button
                    onClick={() => { handleFollow(); setIsHeaderMenuOpen(false); }}
                    disabled={followLoading || hasFollowed}
                    className={`w-full py-5 ${buttonShape} font-black text-lg shadow-xl transition-all ${
                      hasFollowed ? 'bg-slate-100 text-slate-400' : 'text-white active:scale-95'
                    }`}
                    style={!hasFollowed ? { backgroundColor: primaryColor } : undefined}
                  >
                    {hasFollowed ? t('shopProfile.followingShop') : t('shopProfile.followShop')}
                  </button>
                )}
              </div>
            </MobileMenuWrapper>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileHeader;
