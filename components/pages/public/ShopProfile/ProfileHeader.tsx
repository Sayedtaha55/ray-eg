import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Share2, Menu, X, Home, Utensils, Info, ShoppingBag, Eye, Star, Clock, MapPin, Phone
} from 'lucide-react';
import NavTab from './NavTab';
import { hexToRgba, isVideoUrl } from './utils';

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
}) => {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const [stuck, setStuck] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const showHeaderNavHome = isVisible('headerNavHome', true);
  const showHeaderNavGallery = isVisible('headerNavGallery', true);
  const showHeaderNavInfo = isVisible('headerNavInfo', true);
  const showHeaderNav = showHeaderNavHome || showHeaderNavGallery || showHeaderNavInfo;
  const showHeaderShareButton = isVisible('headerShareButton', true);
  const showShopFollowersCount = isVisible('shopFollowersCount', true);
  const showShopFollowButton = isVisible('shopFollowButton', true);

  const bannerUrl = String(currentDesign?.bannerUrl || '').trim();
  const isVideoBanner = isVideoUrl(bannerUrl);

  const isLowEndDevice = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    return isMobile && (cores <= 4 || memory <= 4);
  }, []);

  const MobileMenuWrapper: any = prefersReducedMotion || isLowEndDevice ? 'div' : MotionDiv;
  const mobileMenuMotionProps = prefersReducedMotion || isLowEndDevice
    ? {}
    : {
      initial: { opacity: 0, x: '100%' },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: '100%' },
    };

  useEffect(() => {
    const measure = () => {
      try {
        const h = headerRef.current ? Number((headerRef.current as any).offsetHeight || 0) : 0;
        setHeaderHeight(Number.isFinite(h) ? h : 0);
      } catch {
        setHeaderHeight(0);
      }
    };

    const onScroll = () => {
      try {
        if (!bannerRef.current) return;
        const rect = bannerRef.current.getBoundingClientRect();
        const next = rect.bottom <= 0;
        setStuck(next);
      } catch {
      }
    };

    measure();
    onScroll();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll as any);
    };
  }, []);

  return (
    <div className="relative">
      {/* Banner Section */}
      <div ref={bannerRef} className="relative h-[250px] md:h-[400px] overflow-hidden">
        {!bannerReady && <div className="absolute inset-0 bg-slate-100 animate-pulse" />}
        {isVideoBanner ? (
          isLowEndDevice ? (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <img 
                src={currentDesign?.bannerPosterUrl || bannerUrl.replace(/\.(mp4|webm|mov)$/, '.jpg')} 
                className="w-full h-full object-cover"
                alt="Banner"
              />
            </div>
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster={currentDesign?.bannerPosterUrl}
              className="w-full h-full object-cover"
              src={bannerUrl}
            />
          )
        ) : (
          <img
            src={bannerUrl || '/placeholder-banner.jpg'}
            alt={shop?.name}
            className="w-full h-full object-cover"
            decoding="async"
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-0 bg-black/20" />

        {purchaseModeButton ? (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 md:bottom-8 z-[50]">
            {purchaseModeButton}
          </div>
        ) : null}
      </div>

      {stuck && headerHeight ? <div style={{ height: headerHeight }} /> : null}

      {/* Header Content */}
      <header 
        ref={headerRef as any}
        className={`${stuck ? 'fixed top-0 left-0 right-0' : ''} z-[100] transition-all duration-300`}
        style={{ backgroundColor: headerBg, color: headerTextColor }}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between flex-row-reverse">
          {/* Logo & Name */}
          <div className="flex items-center gap-3 md:gap-4 flex-row-reverse">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
              <img
                src={shop?.logoUrl || '/brand/logo.png'}
                alt={shop?.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            </div>
            <div className="text-right">
              <h1 className="font-black text-sm md:text-xl leading-none mb-1">{shop?.name}</h1>
              {showShopFollowersCount && (
                <p className="text-[10px] md:text-xs opacity-70 flex items-center gap-1 justify-end">
                  {shop?.followers || 0} متابع <Users size={10} />
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
                label="المنتجات"
                design={currentDesign}
              />
            )}
            {showHeaderNavGallery && (
              <NavTab 
                active={activeTab === 'gallery'} 
                onClick={() => setActiveTab('gallery')}
                icon={<Utensils size={18} />}
                label="المعرض"
                design={currentDesign}
              />
            )}
            {showHeaderNavInfo && (
              <NavTab 
                active={activeTab === 'info'} 
                onClick={() => setActiveTab('info')}
                icon={<Info size={18} />}
                label="عن المحل"
                design={currentDesign}
              />
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showHeaderShareButton && (
              <button 
                onClick={handleShare}
                className="p-2 md:p-2.5 rounded-full hover:bg-black/5 transition-colors"
              >
                <Share2 size={20} />
              </button>
            )}
            {showShopFollowButton && (
              <button
                onClick={handleFollow}
                disabled={followLoading || hasFollowed}
                className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-sm transition-all ${
                  hasFollowed 
                    ? 'bg-slate-100 text-slate-400 cursor-default' 
                    : 'bg-black text-white hover:scale-105 active:scale-95'
                }`}
              >
                {hasFollowed ? 'متابع' : 'متابعة'}
              </button>
            )}
            <button 
              className="md:hidden p-2 rounded-full hover:bg-black/5"
              onClick={() => setIsHeaderMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isHeaderMenuOpen && (
          <MobileMenuWrapper
            {...mobileMenuMotionProps}
            className="fixed inset-0 z-[200] bg-white md:hidden"
          >
            <div className="p-6 flex flex-col h-full text-right" dir="rtl">
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-black text-xl">القائمة</h2>
                <button onClick={() => setIsHeaderMenuOpen(false)} className="p-2">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4 flex-1">
                {showHeaderNavHome && (
                  <button 
                    onClick={() => { setActiveTab('products'); setIsHeaderMenuOpen(false); }}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-colors ${activeTab === 'products' ? 'bg-slate-100' : ''}`}
                  >
                    <ShoppingBag /> المنتجات
                  </button>
                )}
                {showHeaderNavGallery && (
                  <button 
                    onClick={() => { setActiveTab('gallery'); setIsHeaderMenuOpen(false); }}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-colors ${activeTab === 'gallery' ? 'bg-slate-100' : ''}`}
                  >
                    <Utensils /> المعرض
                  </button>
                )}
                {showHeaderNavInfo && (
                  <button 
                    onClick={() => { setActiveTab('info'); setIsHeaderMenuOpen(false); }}
                    className={`w-full p-4 rounded-2xl flex items-center gap-4 font-black transition-colors ${activeTab === 'info' ? 'bg-slate-100' : ''}`}
                  >
                    <Info /> عن المحل
                  </button>
                )}
              </div>

              {showShopFollowButton && (
                <button
                  onClick={() => { handleFollow(); setIsHeaderMenuOpen(false); }}
                  disabled={followLoading || hasFollowed}
                  className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all ${
                    hasFollowed ? 'bg-slate-100 text-slate-400' : 'bg-black text-white active:scale-95'
                  }`}
                >
                  {hasFollowed ? 'أنت تتابع هذا المحل' : 'متابعة المحل'}
                </button>
              )}
            </div>
          </MobileMenuWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileHeader;
