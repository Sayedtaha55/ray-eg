import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Share2, Menu, X, Home, Utensils, Info, ShoppingBag, Eye, Star, Clock, MapPin, Phone
} from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';
import NavTab from './NavTab';
import { hexToRgba, isVideoUrl, IS_LOW_END_DEVICE } from './utils';

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
}) => {
  const { t } = useTranslation();
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const [stuck, setStuck] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const primaryColor = String(currentDesign?.primaryColor || '').trim() || '#00E5FF';
  const buttonShape = String((currentDesign as any)?.buttonShape || '').trim() || 'rounded-full';
  const buttonPadding = String((currentDesign as any)?.buttonPadding || '').trim() || 'px-6 py-2.5';

  const showHeaderNavHome = isVisible('headerNavHome', true);
  const showHeaderNavGallery = isVisible('headerNavGallery', true);
  const showHeaderNavInfo = isVisible('headerNavInfo', true);
  const showHeaderNav = showHeaderNavHome || showHeaderNavGallery || showHeaderNavInfo;
  const showHeaderShareButton = isVisible('headerShareButton', true);
  const showShopFollowersCount = isVisible('shopFollowersCount', true);
  const showShopFollowButton = isVisible('shopFollowButton', true);
  const showProfileBanner = isVisible('profileBanner', true);

  const bannerUrl = String(currentDesign?.bannerUrl || '').trim();
  const isVideoBanner = isVideoUrl(bannerUrl);
  const headerOverlayBanner = Boolean(currentDesign?.headerOverlayBanner);

  const shouldPlayVideoBanner = isVideoBanner && !IS_LOW_END_DEVICE && !prefersReducedMotion;

  const MobileMenuWrapper: any = prefersReducedMotion || IS_LOW_END_DEVICE ? 'div' : MotionDiv;
  const mobileMenuMotionProps = prefersReducedMotion || IS_LOW_END_DEVICE
    ? {}
    : {
      initial: { opacity: 0, x: '100%' },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: '100%' },
    };

  const Backdrop: any = prefersReducedMotion || IS_LOW_END_DEVICE ? 'div' : MotionDiv;
  const backdropMotionProps = prefersReducedMotion || IS_LOW_END_DEVICE
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

  const effectiveStuck = isBuilderPreview ? true : stuck;
  const headerPositionClass = isBuilderPreview
    ? 'sticky top-0'
    : headerOverlayBanner
      ? 'fixed top-0 left-0 right-0'
      : 'sticky top-0';

  return (
    <div className="relative">
      {/* Banner Section */}
      {showProfileBanner ? (
        <div ref={bannerRef} className="relative h-[250px] md:h-[400px] overflow-hidden">
          {!bannerReady && <div className="absolute inset-0 bg-slate-100 animate-pulse" />}
          {bannerUrl ? (isVideoBanner ? (
            shouldPlayVideoBanner ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                poster={currentDesign?.bannerPosterUrl}
                className="w-full h-full object-cover"
                src={bannerUrl}
                preload="none"
              />
            ) : (
              <video
                controls
                playsInline
                poster={currentDesign?.bannerPosterUrl}
                className="w-full h-full object-cover"
                src={bannerUrl}
                preload="metadata"
              />
            )
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
          <div className="absolute inset-0 bg-black/20" />

          {purchaseModeButton ? (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-6 md:bottom-8 z-[50]">
              {purchaseModeButton}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Header - Always Fixed */}
      <header
        ref={headerRef as any}
        className={`${headerPositionClass} z-[100] transition-all duration-300 ${
          effectiveStuck ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
        style={{ color: effectiveStuck ? undefined : headerTextColor }}
      >
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between flex-row-reverse">
            {/* Logo & Name */}
            <div className="flex items-center gap-3 md:gap-4 flex-row-reverse">
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
              <div className="text-right">
                <h1 className="font-black text-sm md:text-xl leading-none mb-1">{shop?.name}</h1>
                {showShopFollowersCount && (
                  <p className="text-[10px] md:text-xs opacity-70 flex items-center gap-1 justify-end">
                    {shop?.followers || 0} {t('shopProfile.followers')} <Users size={10} />
                  </p>
                )}
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-row-reverse">
              {showHeaderNavHome && (
                <NavTab 
                  active={activeTab === 'products'} 
                  onClick={() => setActiveTab('products')}
                  icon={<ShoppingBag size={18} />}
                  label={t('shopProfile.productsTab')}
                  design={currentDesign}
                />
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

            {/* Actions */}
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
                  className={`px-4 py-2 rounded-full font-black text-xs md:text-sm transition-all ${
                    hasFollowed ? 'bg-white/20' : buttonShape
                  } ${buttonPadding}`}
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
          </div>
        </header>

      {!isBuilderPreview && headerOverlayBanner && stuck && headerHeight ? <div style={{ height: headerHeight }} /> : null}

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
                <div className="flex items-center justify-between mb-10">
                  <h2 className="font-black text-xl">{t('shopProfile.menu')}</h2>
                  <button onClick={() => setIsHeaderMenuOpen(false)} className="p-2">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4 flex-1">
                  {showHeaderNavHome && (
                    <button 
                      onClick={() => { setActiveTab('products'); setIsHeaderMenuOpen(false); }}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-colors active:scale-[0.99] ${activeTab === 'products' ? 'bg-slate-100' : ''}`}
                    >
                      <ShoppingBag /> {t('shopProfile.productsTab')}
                    </button>
                  )}
                  {showHeaderNavGallery && (
                    <button 
                      onClick={() => { setActiveTab('gallery'); setIsHeaderMenuOpen(false); }}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-colors active:scale-[0.99] ${activeTab === 'gallery' ? 'bg-slate-100' : ''}`}
                    >
                      <Utensils /> {t('shopProfile.galleryTab')}
                    </button>
                  )}
                  {showHeaderNavInfo && (
                    <button 
                      onClick={() => { setActiveTab('info'); setIsHeaderMenuOpen(false); }}
                      className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-colors active:scale-[0.99] ${activeTab === 'info' ? 'bg-slate-100' : ''}`}
                    >
                      <Info /> {t('shopProfile.infoTab')}
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
