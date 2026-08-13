'use client';

import React, { useState, useMemo } from 'react';
import { UnifiedBuilderConfig } from '@/types/builder';
import {
  getUnifiedColors,
  getColorWithDarkMode,
  getButtonColors,
  getHeaderColors,
  getFooterColors,
} from '@/lib/builder/colorSystem';
import { Menu, X, Search, ShoppingBag, Home, Info, Image as ImageIcon, Users, Phone, Mail, MapPin, Instagram, Twitter, Facebook, MessageCircle, Share2 } from 'lucide-react';

interface ShopProfilePreviewProps {
  config: UnifiedBuilderConfig;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  shop?: {
    name?: string;
    description?: string;
    logoUrl?: string;
    phone?: string;
    email?: string;
    city?: string;
    governorate?: string;
    followers?: number;
  };
}

export default function ShopProfilePreview({ config, previewMode, shop = {} }: ShopProfilePreviewProps) {
  const colors = getUnifiedColors(config);
  const buttonColors = getButtonColors(config);
  const headerColors = getHeaderColors(config);
  const footerColors = getFooterColors(config);
  
  const isDarkMode = config.darkMode && config.darkModeColors;
  
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'gallery' | 'info'>('home');
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const containerStyle = {
    width: previewMode === 'desktop' ? '100%' : 
           previewMode === 'tablet' ? '768px' : '375px',
    height: '100%',
    minHeight: '600px',
    backgroundColor: getColorWithDarkMode(config, 'background', 'background'),
    fontFamily: config.typography?.fontFamily?.body || 'Inter',
    direction: 'rtl' as const,
    overflowY: 'auto' as const,
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode
      ? (config.darkModeColors?.surface || colors.surface)
      : headerColors.backgroundColor,
    color: isDarkMode
      ? (config.darkModeColors?.text?.primary || colors.text.primary)
      : headerColors.textColor,
    opacity: headerColors.transparent ? (headerColors.opacity || 60) / 100 : 1,
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: buttonColors.backgroundColor,
    color: buttonColors.textColor,
    borderRadius: buttonColors.shape,
    padding: buttonColors.padding,
    fontWeight: config.fontWeight || 'font-black',
  };

  const footerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode
      ? (config.darkModeColors?.surface || colors.surface)
      : footerColors.backgroundColor,
    color: isDarkMode
      ? (config.darkModeColors?.text?.primary || colors.text.primary)
      : footerColors.textColor,
    opacity: footerColors.transparent ? (footerColors.opacity || 90) / 100 : 1,
  };

  const elementsVisibility = config.elementsVisibility || {};
  const isVisible = (key: string, fallback: boolean = true) => {
    return elementsVisibility[key] !== undefined ? elementsVisibility[key] : fallback;
  };

  const bannerHeight = config.bannerSize === 'large' ? '450px' : config.bannerSize === 'medium' ? '350px' : '250px';

  return (
    <div style={containerStyle} className="transition-all duration-300 relative">
      {/* Header */}
      <header style={headerStyle} className="sticky top-0 z-50 shadow-sm">
        <div className={`${config.pagePadding || 'p-4 md:p-6'} flex items-center justify-between`}>
          {/* Logo & Shop Name */}
          <div className="flex items-center gap-3">
            {shop.logoUrl && (
              <img
                src={shop.logoUrl}
                alt={shop.name || 'Shop'}
                className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
              />
            )}
            <div>
              <h1 className={`font-bold ${config.headingSize || 'text-lg'}`}>
                {shop.name || config.homePageName || 'المتجر'}
              </h1>
              {isVisible('shopFollowersCount', true) && (
                <p className="text-xs opacity-70 font-bold">
                  {shop.followers || 0} متابع
                </p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isVisible('headerNavHome', true) && (
              <button
                onClick={() => setActiveTab('home')}
                className={`text-sm font-bold transition-all ${activeTab === 'home' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
              >
                <Home size={16} className="inline ml-1" />
                الرئيسية
              </button>
            )}
            {isVisible('headerNavGallery', true) && (
              <button
                onClick={() => setActiveTab('gallery')}
                className={`text-sm font-bold transition-all ${activeTab === 'gallery' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
              >
                <ImageIcon size={16} className="inline ml-1" />
                المعرض
              </button>
            )}
            {isVisible('headerNavInfo', true) && (
              <button
                onClick={() => setActiveTab('info')}
                className={`text-sm font-bold transition-all ${activeTab === 'info' ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
              >
                <Info size={16} className="inline ml-1" />
                معلومات
              </button>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isVisible('headerSearch', true) && (
              <div className="relative hidden md:block">
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 pl-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm w-40 focus:w-60 transition-all"
                />
              </div>
            )}
            {isVisible('headerShareButton', true) && (
              <button className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <Share2 size={18} />
              </button>
            )}
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              {isHeaderMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isHeaderMenuOpen && (
          <div className="md:hidden border-t border-white/10 p-4">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => { setActiveTab('home'); setIsHeaderMenuOpen(false); }}
                className={`text-sm font-bold text-right p-2 rounded-lg transition-all ${activeTab === 'home' ? 'bg-white/10' : ''}`}
              >
                <Home size={16} className="inline ml-2" />
                الرئيسية
              </button>
              <button
                onClick={() => { setActiveTab('products'); setIsHeaderMenuOpen(false); }}
                className={`text-sm font-bold text-right p-2 rounded-lg transition-all ${activeTab === 'products' ? 'bg-white/10' : ''}`}
              >
                <ShoppingBag size={16} className="inline ml-2" />
                المنتجات
              </button>
              <button
                onClick={() => { setActiveTab('gallery'); setIsHeaderMenuOpen(false); }}
                className={`text-sm font-bold text-right p-2 rounded-lg transition-all ${activeTab === 'gallery' ? 'bg-white/10' : ''}`}
              >
                <ImageIcon size={16} className="inline ml-2" />
                المعرض
              </button>
              <button
                onClick={() => { setActiveTab('info'); setIsHeaderMenuOpen(false); }}
                className={`text-sm font-bold text-right p-2 rounded-lg transition-all ${activeTab === 'info' ? 'bg-white/10' : ''}`}
              >
                <Info size={16} className="inline ml-2" />
                معلومات
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Banner */}
      {config.bannerUrl && isVisible('profileBanner', true) && (
        <div className="relative w-full" style={{ height: bannerHeight }}>
          <img
            src={config.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
            style={{ objectPosition: `${config.bannerPosX || 50}% ${config.bannerPosY || 50}%` }}
          />
          {config.bannerTitle && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-center text-white">
                <h1 className={`font-black ${config.headingSize || 'text-2xl'} mb-2`}>{config.bannerTitle}</h1>
                {config.bannerSubtitle && <p className="font-bold">{config.bannerSubtitle}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className={`${config.pagePadding || 'p-6 md:p-12'}`} style={{ gap: config.itemGap || 'gap-6', paddingBottom: previewMode === 'mobile' ? '80px' : '0' }}>
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Marquee Offers */}
            {(config.homeRightAdTitle || config.homeLeftAdTitle) && (
              <div className="overflow-hidden bg-white/40 backdrop-blur-sm border border-slate-100 rounded-2xl py-3 relative">
                <div className="flex gap-12 whitespace-nowrap animate-marquee flex-row-reverse">
                  <span className="text-xs font-black flex items-center gap-1.5">
                    🚚 {config.homeRightAdTitle || 'شحن مجاني لكافة المحافظات!'}
                  </span>
                  <span className="text-xs font-black flex items-center gap-1.5">
                    🔥 {config.homeLeftAdTitle || 'خصم 15% على طلبك الأول!'}
                  </span>
                  <span className="text-xs font-black flex items-center gap-1.5">
                    ⭐ {config.homeStoryText || 'عروض حصرية لفترة محدودة!'}
                  </span>
                </div>
              </div>
            )}

            {/* About Section */}
            {config.homeIntroText && (
              <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 md:p-8">
                <h3 className="text-lg md:text-2xl font-black mb-4">{(config as any).homeAboutTitle || 'من نحن'}</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">{config.homeIntroText}</p>
              </div>
            )}

            {/* Products Preview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="aspect-square" style={{ backgroundColor: `${colors.primary}20` }} />
                  <div className="p-3">
                    <p className="font-bold text-sm mb-1">منتج {i}</p>
                    <p className="font-black" style={{ color: colors.primary }}>{i * 50} ج.م</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button style={buttonStyle} className="hover:opacity-90 transition-opacity">
                عرض جميع المنتجات
              </button>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square" style={{ backgroundColor: `${colors.primary}20` }} />
                <div className="p-3">
                  <p className="font-bold text-sm mb-1">منتج {i}</p>
                  <p className="font-black" style={{ color: colors.primary }}>{i * 50} ر.س</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: `${colors.primary}30` }} />
            ))}
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-lg mb-4">تواصل معنا</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone size={18} />
                  <span className="font-bold text-sm">{shop.phone || '01xxxxxxxx'}</span>
                </div>
                {shop.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} />
                    <span className="font-bold text-sm">{shop.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin size={18} />
                  <span className="font-bold text-sm">{shop.city || 'القاهرة'}، {shop.governorate || 'مصر'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {isVisible('footer', true) && (
        <footer style={footerStyle} className="border-t border-white/10">
          <div className={`${config.pagePadding || 'p-6 md:p-12'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Shop Info */}
              <div className="text-center md:text-right space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  {shop.logoUrl && (
                    <img
                      src={shop.logoUrl}
                      alt={shop.name}
                      className="w-10 h-10 rounded-full border-2 border-white/20"
                    />
                  )}
                  <h4 className="font-black">{shop.name || 'المتجر'}</h4>
                </div>
                <p className="opacity-70 text-sm leading-relaxed font-bold">
                  {shop.description || 'أفضل المنتجات بجودة عالية'}
                </p>
                {isVisible('shopFollowersCount', true) && (
                  <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                    <div className="bg-white/10 p-2 rounded-xl">
                      <Users size={16} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-50 font-black">المتابعين</p>
                      <p className="text-sm font-black">{shop.followers || 0}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              {isVisible('footerQuickLinks', true) && (
                <div className="text-center md:text-right space-y-4">
                  <h5 className="font-black">روابط سريعة</h5>
                  <ul className="space-y-2 font-bold opacity-70 text-sm">
                    <li><a href="#" className="hover:opacity-100 transition-opacity">الرئيسية</a></li>
                    <li><a href="#" className="hover:opacity-100 transition-opacity">المنتجات</a></li>
                    <li><a href="#" className="hover:opacity-100 transition-opacity">من نحن</a></li>
                    <li><a href="#" className="hover:opacity-100 transition-opacity">اتصل بنا</a></li>
                  </ul>
                </div>
              )}

              {/* Contact & Social */}
              {isVisible('footerContact', true) && (
                <div className="text-center md:text-right space-y-4">
                  <h5 className="font-black">تواصل معنا</h5>
                  <div className="flex justify-center md:justify-start gap-4">
                    {config.footerInstagram && (
                      <a href={config.footerInstagram} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                        <Instagram size={18} />
                      </a>
                    )}
                    {config.footerTwitter && (
                      <a href={config.footerTwitter} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                        <Twitter size={18} />
                      </a>
                    )}
                    {config.footerFacebook && (
                      <a href={config.footerFacebook} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                        <Facebook size={18} />
                      </a>
                    )}
                    {config.footerWhatsApp && (
                      <a href={config.footerWhatsApp} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                        <MessageCircle size={18} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Copyright */}
            <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs font-bold opacity-40">
              <p>{config.footerCopyright || `© ${new Date().getFullYear()} ${shop.name}. جميع الحقوق محفوظة`}</p>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Nav */}
      {previewMode === 'mobile' && isVisible('mobileBottomNav', true) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around md:hidden z-50" style={{ width: previewMode === 'mobile' ? '375px' : '100%' }}>
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${activeTab === 'home' ? 'text-cyan-500' : 'text-slate-500'}`}
          >
            <Home size={20} />
            <span className="text-[10px] font-bold">الرئيسية</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${activeTab === 'products' ? 'text-cyan-500' : 'text-slate-500'}`}
          >
            <ShoppingBag size={20} />
            <span className="text-[10px] font-bold">المنتجات</span>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${activeTab === 'gallery' ? 'text-cyan-500' : 'text-slate-500'}`}
          >
            <ImageIcon size={20} />
            <span className="text-[10px] font-bold">المعرض</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${activeTab === 'info' ? 'text-cyan-500' : 'text-slate-500'}`}
          >
            <Info size={20} />
            <span className="text-[10px] font-bold">معلومات</span>
          </button>
        </div>
      )}

      {/* Floating Chat Button */}
      {isVisible('floatingChatButton', true) && (
        <button className="fixed bottom-8 md:bottom-8 left-4 p-3 rounded-full shadow-lg transition-all hover:scale-110 z-40" style={{ backgroundColor: colors.primary, color: 'white' }}>
          <MessageCircle size={20} />
        </button>
      )}
    </div>
  );
}