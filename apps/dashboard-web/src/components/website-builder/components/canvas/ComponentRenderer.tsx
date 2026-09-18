import React, { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { StyleProperties, ViewportBreakpoint } from '../../types/builder';
import { CustomCodeRenderer } from '../code/CustomCodeRenderer';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  MessageCircle,
  Star,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Check,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Layers,
  Store,
  Globe2,
  Menu,
  X,
  ShoppingCart,
  Package,
  Tag,
  Zap,
} from 'lucide-react';

interface ComponentRendererProps {
  nodeId: string;
  isInteractivePreview?: boolean;
  overrideViewport?: ViewportBreakpoint;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  nodeId,
  isInteractivePreview = false,
  overrideViewport,
}) => {
  const {
    website,
    selectedNodeId,
    hoveredNodeId,
    selectNode,
    setHoveredNode,
    viewport,
    activePage,
    switchPage,
    cartCount,
    setIsCartOpen,
    addToCart,
    cartMode,
    selectedProductCategory,
    setSelectedProductCategory,
    productSearchQuery,
    setProductSearchQuery,
  } = useBuilder();

  // Local interactive state for preview mode (e.g. FAQ accordion toggle, form submission, mega menu dropdown, mobile drawer)
  const [isFaqOpen, setIsFaqOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [openFaqItems, setOpenFaqItems] = useState<Record<string, boolean>>({});
  const [isMobileMenuDrawerOpen, setIsMobileMenuDrawerOpen] = useState<boolean>(false);
  const [hoveredProductCardId, setHoveredProductCardId] = useState<string | null>(null);

  const node = website.components[nodeId];
  if (!node || node.isHidden) return null;

  const isSelected = selectedNodeId === node.id && !isInteractivePreview;
  const isHovered = hoveredNodeId === node.id && !isSelected && !isInteractivePreview;

  const currentViewport = overrideViewport || viewport;
  const themeColors = website.theme?.colors;
  const themeCardStyle: React.CSSProperties = {
    backgroundColor: themeColors?.background || '#ffffff',
    borderColor: themeColors?.border || '#e2e8f0',
    borderRadius: website.theme?.radius?.lg || '16px',
  };
  const themeMutedStyle: React.CSSProperties = { color: themeColors?.textSecondary || '#475569' };

  // Compute responsive styles merged by current breakpoint
  const getComputedStyles = (): React.CSSProperties => {
    const d = node.styles.desktop || {};
    const t = node.styles.tablet || {};
    const m = node.styles.mobile || {};

    let merged: StyleProperties = { ...d };
    if (currentViewport === 'tablet') {
      merged = { ...merged, ...t };
    } else if (currentViewport === 'mobile') {
      merged = { ...merged, ...t, ...m };
    }

    const css: React.CSSProperties = {
      display: merged.display,
      flexDirection: merged.flexDirection,
      justifyContent: merged.justifyContent,
      alignItems: merged.alignItems,
      flexWrap: merged.flexWrap,
      gridTemplateColumns: merged.gridColumns,
      gap: merged.gap,

      width: merged.width,
      minWidth: merged.minWidth,
      maxWidth: merged.maxWidth,
      height: merged.height,
      minHeight: merged.minHeight,
      maxHeight: merged.maxHeight,

      paddingTop: merged.paddingTop,
      paddingRight: merged.paddingRight,
      paddingBottom: merged.paddingBottom,
      paddingLeft: merged.paddingLeft,

      marginTop: merged.marginTop,
      marginRight: merged.marginRight,
      marginBottom: merged.marginBottom,
      marginLeft: merged.marginLeft,

      fontFamily: merged.fontFamily || website.theme?.typography?.fontBody || 'Cairo, sans-serif',
      fontSize: merged.fontSize,
      fontWeight: merged.fontWeight as any,
      lineHeight: merged.lineHeight,
      letterSpacing: merged.letterSpacing,
      textAlign: merged.textAlign,
      color: merged.textColor,
      textTransform: merged.textTransform,

      backgroundColor: merged.backgroundColor,
      backgroundImage: merged.backgroundImage,
      backgroundSize: merged.backgroundSize,
      backgroundPosition: merged.backgroundPosition,

      borderWidth: merged.borderWidth,
      borderStyle: merged.borderStyle,
      borderColor: merged.borderColor,
      borderRadius: merged.borderRadius,

      boxShadow: merged.boxShadow,
      opacity: merged.opacity,
      backdropFilter: merged.backdropBlur ? `blur(${merged.backdropBlur})` : undefined,
      WebkitBackdropFilter: merged.backdropBlur ? `blur(${merged.backdropBlur})` : undefined,
      overflow: merged.overflow,
      textOverflow: merged.textOverflow,
      flexShrink: merged.flexShrink as any,
      wordBreak: 'normal',
      overflowWrap: 'break-word',
      position: merged.position,
      top: merged.top,
      right: merged.right,
      bottom: merged.bottom,
      left: merged.left,
      zIndex: merged.zIndex,
    };

    // Responsive Mobile Safeguards for All Themes:
    if (currentViewport === 'mobile') {
      // 1. Buttons must never awkwardly wrap single characters or break Arabic words vertically
      if (node.type === 'button') {
        css.whiteSpace = 'nowrap';
        css.flexShrink = 0;
        css.wordBreak = 'normal';
        if (!m.fontSize && (!d.fontSize || parseInt(d.fontSize) > 13)) {
          css.fontSize = '12px';
        }
        if (!m.paddingLeft && (!d.paddingLeft || parseInt(d.paddingLeft) > 12)) {
          css.paddingLeft = '12px';
        }
        if (!m.paddingRight && (!d.paddingRight || parseInt(d.paddingRight) > 12)) {
          css.paddingRight = '12px';
        }
        if (!m.paddingTop && (!d.paddingTop || parseInt(d.paddingTop) > 8)) {
          css.paddingTop = '6px';
        }
        if (!m.paddingBottom && (!d.paddingBottom || parseInt(d.paddingBottom) > 8)) {
          css.paddingBottom = '6px';
        }
      }

      // 2. Headings must never break letters of an Arabic word awkwardly
      if (node.type === 'heading') {
        css.wordBreak = 'normal';
        css.overflowWrap = 'break-word';
        if (!m.fontSize && d.fontSize && parseInt(d.fontSize) > 20) {
          css.fontSize = `${Math.max(15, Math.round(parseInt(d.fontSize) * 0.72))}px`;
        }
        // In headers, keep brand heading single line
        if (
          node.parentId?.includes('header') ||
          node.id?.includes('brand') ||
          node.id?.includes('logo')
        ) {
          css.whiteSpace = 'nowrap';
          css.fontSize = m.fontSize || '14px';
          css.flexShrink = 0;
        }
      }

      // 3. Header navigation links on mobile: hide cramped bullet text on small phone screens
      if (
        (typeof node.props.text === 'string' &&
          (node.props.text.includes('•') ||
            node.props.text.includes('|') ||
            node.props.text.includes('▾'))) ||
        ((node.parentId?.includes('header') ||
          node.parentId?.includes('sec_') ||
          node.id?.includes('nav')) &&
          (node.type === 'paragraph' || node.id?.includes('nav') || node.category === 'navigation'))
      ) {
        css.display = 'none';
      }

      // 4. Containers and sections: never exceed screen width on mobile
      if (node.type === 'header' || node.category === 'section' || node.type === 'container') {
        css.maxWidth = '100%';
        if (!m.paddingLeft && d.paddingLeft && parseInt(d.paddingLeft) > 16) {
          css.paddingLeft = '14px';
        }
        if (!m.paddingRight && d.paddingRight && parseInt(d.paddingRight) > 16) {
          css.paddingRight = '14px';
        }
      }

      // 5. Flex rows: allow wrapping if content overflows
      if (
        merged.display === 'flex' &&
        merged.flexDirection === 'row' &&
        !m.flexWrap &&
        !merged.flexWrap
      ) {
        if (!node.parentId?.includes('header')) {
          css.flexWrap = 'wrap';
        }
        css.gap = merged.gap || '8px';
      }
    }

    return css;
  };

  // Smart Navigation and Action handler for preview mode
  const handleInteraction = (
    e: React.MouseEvent,
    overrideUrl?: string,
    overridePageId?: string,
    overrideText?: string
  ) => {
    if (!isInteractivePreview) return;

    const url = (overrideUrl ?? node.props.url ?? node.props.href ?? node.props.link ?? '').trim();
    const pageId = (overridePageId ?? node.props.pageId ?? node.props.targetPage ?? '').trim();
    const text = (overrideText ?? node.props.text ?? node.props.title ?? '').trim();

    // 1. Direct Page ID target match
    if (pageId) {
      const pageMatch = website.pages.find((p) => p.id === pageId);
      if (pageMatch) {
        e.preventDefault();
        e.stopPropagation();
        switchPage(pageMatch.id);
        return;
      }
    }

    // 2. URL / Route / Anchor resolution
    if (url) {
      // Check for anchor to an in-page section
      if (url.startsWith('#')) {
        const anchorName = url.replace(/^#+/, '').trim().toLowerCase();

        // Check if anchor corresponds to a dedicated page (e.g. #fleet, #contact, #home)
        const matchedPage = website.pages.find(
          (p) =>
            p.slug.toLowerCase() === anchorName ||
            p.id.toLowerCase() === anchorName ||
            p.id.toLowerCase() === `page_${anchorName}`
        );

        if (matchedPage && matchedPage.id !== activePage.id) {
          e.preventDefault();
          e.stopPropagation();
          switchPage(matchedPage.id);
          return;
        }

        // Try smooth-scrolling to local element on current page
        e.preventDefault();
        e.stopPropagation();
        const targetElement =
          document.getElementById(anchorName) ||
          document.getElementById(`comp_${anchorName}`) ||
          document.getElementById(`tmpl_${anchorName}`) ||
          document.getElementById(nodeId);

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      // Check for internal path (e.g. "/fleet", "/contact", "/home", "fleet", "contact")
      const cleanSlug = url
        .replace(/^[#/]+/, '')
        .toLowerCase()
        .trim();
      const pageBySlug = website.pages.find(
        (p) =>
          p.slug.toLowerCase() === cleanSlug ||
          p.id.toLowerCase() === cleanSlug ||
          p.id.toLowerCase() === `page_${cleanSlug}` ||
          p.name.trim().toLowerCase() === cleanSlug
      );

      if (pageBySlug) {
        e.preventDefault();
        e.stopPropagation();
        switchPage(pageBySlug.id);
        return;
      }

      // External protocol links
      if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('tel:') ||
        url.startsWith('mailto:')
      ) {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
    }

    // 3. Fallback: match by link / button label text against website pages
    if (text) {
      const pageByExactName = website.pages.find((p) => p.name.trim() === text);
      if (pageByExactName) {
        e.preventDefault();
        e.stopPropagation();
        switchPage(pageByExactName.id);
        return;
      }

      // Common Arabic keywords for navigation
      const lowerText = text.toLowerCase();
      if (lowerText.includes('رئيسية') || lowerText.includes('المجد')) {
        const homePage = website.pages.find(
          (p) => p.slug === 'home' || p.id === 'page_home' || p.metadata?.isHomePage
        );
        if (homePage && activePage.id !== homePage.id) {
          e.preventDefault();
          e.stopPropagation();
          switchPage(homePage.id);
          return;
        }
      }

      if (
        lowerText.includes('أسطول') ||
        lowerText.includes('سيارات') ||
        lowerText.includes('معرض') ||
        lowerText.includes('موديل')
      ) {
        const fleetPage = website.pages.find(
          (p) => p.slug === 'fleet' || p.id.includes('fleet') || p.name.includes('أسطول')
        );
        if (fleetPage && activePage.id !== fleetPage.id) {
          e.preventDefault();
          e.stopPropagation();
          switchPage(fleetPage.id);
          return;
        }
      }

      if (
        lowerText.includes('من نحن') ||
        lowerText.includes('قصتنا') ||
        lowerText.includes('رؤيتنا') ||
        lowerText.includes('عن الشركة') ||
        lowerText.includes('عن المجد')
      ) {
        const aboutPage = website.pages.find(
          (p) => p.slug === 'about' || p.id === 'page_about' || p.name.includes('من نحن')
        );
        if (aboutPage && activePage.id !== aboutPage.id) {
          e.preventDefault();
          e.stopPropagation();
          switchPage(aboutPage.id);
          return;
        }
      }

      if (
        lowerText.includes('فريق') ||
        lowerText.includes('القيادة') ||
        lowerText.includes('الخبراء') ||
        lowerText.includes('المستشار')
      ) {
        const teamPage = website.pages.find(
          (p) => p.slug === 'team' || p.id === 'page_team' || p.name.includes('فريق')
        );
        if (teamPage && activePage.id !== teamPage.id) {
          e.preventDefault();
          e.stopPropagation();
          switchPage(teamPage.id);
          return;
        }
      }

      if (
        lowerText.includes('فروع') ||
        lowerText.includes('صالات') ||
        lowerText.includes('الموقع') ||
        lowerText.includes('الرياض') ||
        lowerText.includes('جدة') ||
        lowerText.includes('الخبر')
      ) {
        const branchesPage = website.pages.find(
          (p) => p.slug === 'branches' || p.id === 'page_branches' || p.name.includes('فروع')
        );
        if (branchesPage && activePage.id !== branchesPage.id) {
          e.preventDefault();
          e.stopPropagation();
          switchPage(branchesPage.id);
          return;
        }
      }

      if (
        lowerText.includes('اعتماد') ||
        lowerText.includes('جوائز') ||
        lowerText.includes('شهادات') ||
        lowerText.includes('أيزو') ||
        lowerText.includes('توف') ||
        lowerText.includes('جودة')
      ) {
        const certsPage = website.pages.find(
          (p) =>
            p.slug === 'certifications' ||
            p.id === 'page_certifications' ||
            p.name.includes('اعتمادات')
        );
        if (certsPage && activePage.id !== certsPage.id) {
          e.preventDefault();
          e.stopPropagation();
          switchPage(certsPage.id);
          return;
        }
      }

      if (
        lowerText.includes('تواصل') ||
        lowerText.includes('حجز') ||
        lowerText.includes('اتصل') ||
        lowerText.includes('تجربة') ||
        lowerText.includes('فحص')
      ) {
        const contactPage = website.pages.find(
          (p) => p.slug === 'contact' || p.id.includes('contact') || p.name.includes('تواصل')
        );
        if (contactPage && activePage.id !== contactPage.id) {
          e.preventDefault();
          e.stopPropagation();
          switchPage(contactPage.id);
          return;
        }
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isInteractivePreview) {
      handleInteraction(e);
      return;
    }
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isInteractivePreview) return;
    e.stopPropagation();
    setHoveredNode(node.id);
  };

  const handleMouseLeave = () => {
    if (isInteractivePreview) return;
    setHoveredNode(null);
  };

  // Selection & Hover classes
  const outlineClass = isInteractivePreview
    ? ''
    : isSelected
      ? 'ring-2 ring-blue-600 ring-offset-2 relative z-20'
      : isHovered
        ? 'ring-1 ring-blue-300 ring-offset-1 relative'
        : '';

  // Render children recursively
  const renderChildren = () => {
    if (!node.childrenIds || node.childrenIds.length === 0) return null;
    return node.childrenIds.map((childId) => (
      <ComponentRenderer
        key={childId}
        nodeId={childId}
        isInteractivePreview={isInteractivePreview}
        overrideViewport={overrideViewport}
      />
    ));
  };

  // Detect if current node is a nav link targeting the active page
  const isNavNode =
    node.parentId === 'header_nav' ||
    node.parentId === 'tmpl_nav_comp_box' ||
    Boolean(node.props.url) ||
    Boolean(node.props.pageId);

  const isActiveLink = Boolean(
    isNavNode &&
    ((node.props.pageId && node.props.pageId === activePage.id) ||
      (node.props.url &&
        (node.props.url === `/${activePage.slug}` ||
          node.props.url === `#${activePage.slug}` ||
          node.props.url === activePage.slug ||
          (activePage.slug === 'home' &&
            (node.props.url === '/' ||
              node.props.url === '#home' ||
              node.props.url === '/home')))) ||
      (node.props.text && node.props.text.trim() === activePage.name.trim()))
  );

  // Custom Rendering for specific Component Types
  switch (node.type) {
    case 'header': {
      const isMobile = currentViewport === 'mobile';
      const hideCart = Boolean(node.props.hideCart || (website.theme as any)?.hideCart);
      const cartIconType = node.props.cartIcon || 'ShoppingBag';

      return (
        <header
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass} relative`}
        >
          {isMobile ? (
            <div className="w-full flex items-center justify-between gap-3 px-3 py-2.5">
              {/* Brand Logo / Name */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {node.childrenIds && node.childrenIds.length > 0 ? (
                  node.childrenIds.map((cId) => {
                    const child = website.components[cId];
                    if (!child) return null;
                    if (
                      child.id.includes('nav') ||
                      child.type === 'paragraph' ||
                      child.category === 'navigation'
                    )
                      return null;
                    if (child.type === 'button' || child.id.includes('cta')) return null;
                    return (
                      <ComponentRenderer
                        key={cId}
                        nodeId={cId}
                        isInteractivePreview={isInteractivePreview}
                        overrideViewport={overrideViewport}
                      />
                    );
                  })
                ) : (
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                    {node.props.title || website.name || 'المتجر الإلكتروني'}
                  </div>
                )}
              </div>

              {/* Mobile Actions: Cart + Hamburger Menu */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Cart Button */}
                {!hideCart && (
                  <button
                    onClick={(e) => {
                      if (isInteractivePreview) {
                        e.stopPropagation();
                        setIsCartOpen(true);
                      }
                    }}
                    title="سلة التسوق"
                    className="relative p-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                  >
                    {cartIconType === 'ShoppingCart' ? (
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                    ) : cartIconType === 'Package' ? (
                      <Package className="w-4 h-4 text-blue-600" />
                    ) : cartIconType === 'Store' ? (
                      <Store className="w-4 h-4 text-blue-600" />
                    ) : cartIconType === 'CreditCard' ? (
                      <CreditCard className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                    )}
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-xs">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Mobile Menu Hamburger Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuDrawerOpen(true);
                  }}
                  title="القائمة الرئيسية"
                  className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Slide-Over Drawer */}
              {isMobileMenuDrawerOpen && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuDrawerOpen(false);
                  }}
                  className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-4/5 max-w-xs h-full bg-white text-slate-900 shadow-2xl flex flex-col justify-between p-5 animate-in slide-in-from-right duration-300 overflow-y-auto text-right"
                  >
                    <div className="space-y-6">
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {website.name ? website.name[0] : '⚡'}
                          </div>
                          <span className="font-black text-sm text-slate-900 truncate max-w-[140px]">
                            {website.name || 'المتجر'}
                          </span>
                        </div>
                        <button
                          onClick={() => setIsMobileMenuDrawerOpen(false)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          صفحات الموقع
                        </span>
                        {website.pages.map((p) => {
                          const isActive = p.id === activePage.id;
                          return (
                            <button
                              key={p.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                switchPage(p.id);
                                setIsMobileMenuDrawerOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{p.name}</span>
                              <ArrowRight
                                className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'} rtl:rotate-180`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Contact Actions */}
                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          تواصل سريع
                        </span>
                        <a
                          href="https://wa.me/201000000000"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>تواصل عبر واتساب</span>
                        </a>

                        <a
                          href="tel:01000000000"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span>اتصال مباشر</span>
                        </a>
                      </div>
                    </div>

                    {/* Drawer Footer Branding */}
                    <div className="pt-6 border-t border-slate-100 text-center">
                      <span className="text-[10px] font-semibold text-slate-400">
                        صنع بكل فخر عبر{' '}
                        <strong className="text-blue-600 font-bold">نمّي أعمالك</strong> ⚡
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            renderChildren()
          )}
        </header>
      );
    }

    case 'custom-code': {
      return (
        <div
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          <CustomCodeRenderer node={node} isInteractivePreview={isInteractivePreview} />
          {renderChildren()}
        </div>
      );
    }

    case 'heading': {
      const tag = node.props.tag || 'h2';
      const headingClass = `cursor-pointer transition-all ${outlineClass} ${
        isInteractivePreview && isNavNode ? 'hover:opacity-80' : ''
      }`;
      const headingStyle = getComputedStyles();
      const text = node.props.text || 'عنوان المكون';

      const content = (
        <>
          {text}
          {node.props.badgeText && (
            <span
              style={{
                backgroundColor: `${website.theme.colors.primary}20`,
                color: website.theme.colors.primary,
              }}
              className="mr-2 text-xs font-bold px-2 py-0.5 rounded-full inline-block align-middle"
            >
              {node.props.badgeText}
            </span>
          )}
        </>
      );

      if (tag === 'h1') {
        return (
          <h1
            id={node.id}
            style={headingStyle}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={headingClass}
          >
            {content}
          </h1>
        );
      }
      if (tag === 'h3') {
        return (
          <h3
            id={node.id}
            style={headingStyle}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={headingClass}
          >
            {content}
          </h3>
        );
      }
      if (tag === 'h4') {
        return (
          <h4
            id={node.id}
            style={headingStyle}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={headingClass}
          >
            {content}
          </h4>
        );
      }
      return (
        <h2
          id={node.id}
          style={headingStyle}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={headingClass}
        >
          {content}
        </h2>
      );
    }

    case 'paragraph': {
      const text = node.props.text || 'نص توضيحي افتراضي للمكون.';
      const computed = getComputedStyles();

      // If this paragraph is an active nav link, apply active color and weight
      if (isActiveLink) {
        computed.color = website.theme.colors.primary;
        computed.fontWeight = '700';
      }

      // Check if this node has a dropdown sub-menu (e.g. أسطول السيارات)
      const hasDropdown =
        node.props.hasDropdown || node.id === 'nav_link_2' || !!node.props.dropdownItems;
      const dropdownItems = node.props.dropdownItems || [
        {
          id: 'sub_all',
          title: 'كافة أسطول 2025',
          description: 'جميع الموديلات الفاخرة المتاحة للتسليم الفوري',
          url: '/fleet',
          pageId: 'page_fleet',
          badge: 'شامل',
        },
        {
          id: 'sub_amg',
          title: 'مرسيدس AMG & مايباخ',
          description: 'سيدان وكوبيه VIP الرياضية',
          url: '/fleet',
          pageId: 'page_fleet',
          badge: '14 سيارة',
        },
        {
          id: 'sub_gt3',
          title: 'بورش 911 & GT3 RS',
          description: 'أداء حلبات خارق وفخامة فائقة',
          url: '/fleet',
          pageId: 'page_fleet',
          badge: '12 سيارة',
        },
        {
          id: 'sub_suv',
          title: 'رينج روفر SV & كولينان',
          description: 'دفع رباعي فاخر بقمة الهيبة',
          url: '/fleet',
          pageId: 'page_fleet',
          badge: '9 سيارات',
        },
      ];

      if (hasDropdown) {
        return (
          <div
            id={node.id}
            onMouseEnter={(e) => {
              handleMouseEnter(e);
              if (isInteractivePreview) setOpenDropdown(true);
            }}
            onMouseLeave={() => {
              handleMouseLeave();
              if (isInteractivePreview) setOpenDropdown(false);
            }}
            className="relative inline-block"
          >
            <div
              style={computed}
              onClick={(e) => {
                if (isInteractivePreview) {
                  setOpenDropdown(!openDropdown);
                } else {
                  handleClick(e);
                }
              }}
              className={`cursor-pointer transition-all flex items-center gap-1.5 ${
                isInteractivePreview && isNavNode ? 'hover:text-blue-600' : ''
              } ${outlineClass}`}
            >
              <span>{text}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  openDropdown ? 'rotate-180 text-blue-600' : 'opacity-70'
                }`}
              />
            </div>

            {/* Dropdown / Mega Menu Panel */}
            {isInteractivePreview && openDropdown && (
              <div
                style={{ direction: 'rtl' }}
                className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-slate-100"
              >
                <div className="px-3 py-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    تصفح أسطول المعرض والأقسام
                  </span>
                </div>
                <div className="py-1 space-y-1">
                  {dropdownItems.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(false);
                        if (item.id === 'sub_amg') setSelectedProductCategory('mercedes');
                        else if (item.id === 'sub_gt3') setSelectedProductCategory('porsche');
                        else if (item.id === 'sub_suv') setSelectedProductCategory('suv');
                        else setSelectedProductCategory('all');
                        handleInteraction(e, item.url || '/fleet', item.pageId || 'page_fleet');
                      }}
                      className="p-2.5 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer group flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 px-2 py-0.5 rounded-full shrink-0 transition-colors">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      // Fleet Category Filter Tabs (e.g. fleet_filter_tabs)
      if (node.id === 'fleet_filter_tabs' || node.props.isFilterTabs) {
        const filterPills = [
          { id: 'all', label: 'كافة الأسطول (48)' },
          { id: 'mercedes', label: 'مرسيدس AMG (14)' },
          { id: 'porsche', label: 'بورش GT3 (12)' },
          { id: 'suv', label: 'رينج روفر SUV (9)' },
          { id: 'bentley', label: 'بنتلي & فيراري (13)' },
        ];

        return (
          <div
            id={node.id}
            style={computed}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`cursor-pointer transition-all flex flex-wrap items-center justify-center gap-2 ${outlineClass}`}
          >
            {filterPills.map((pill) => {
              const isPillActive = selectedProductCategory === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={(e) => {
                    if (isInteractivePreview) {
                      e.stopPropagation();
                      setSelectedProductCategory(pill.id);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPillActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                      : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        );
      }

      // If text contains multi-link separators like ' • ' or ' | ' in preview mode, render individual interactive items
      if (
        isInteractivePreview &&
        typeof text === 'string' &&
        (text.includes(' • ') || text.includes(' | '))
      ) {
        const delimiter = text.includes(' • ') ? ' • ' : ' | ';
        const items: string[] = text.split(delimiter);

        return (
          <p
            id={node.id}
            style={computed}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`cursor-pointer transition-all flex flex-wrap items-center gap-2 ${outlineClass}`}
          >
            {items.map((item: string, index: number) => {
              const trimmed = item.trim();
              const isItemActive =
                activePage.name.trim() === trimmed ||
                (trimmed === 'الرئيسية' && activePage.slug === 'home');

              return (
                <React.Fragment key={index}>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInteraction(e, undefined, undefined, trimmed);
                    }}
                    className={`transition-colors hover:text-blue-600 cursor-pointer ${
                      isItemActive ? 'font-bold text-blue-600' : ''
                    }`}
                  >
                    {trimmed}
                  </span>
                  {index < items.length - 1 && <span className="opacity-40 select-none">•</span>}
                </React.Fragment>
              );
            })}
          </p>
        );
      }

      return (
        <p
          id={node.id}
          style={computed}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${
            isInteractivePreview && isNavNode ? 'hover:text-blue-600' : ''
          } ${outlineClass}`}
        >
          {text}
        </p>
      );
    }

    case 'button': {
      const isSubmitBtn =
        node.id === 'contact_btn_submit' || node.props.text?.includes('إرسال طلب');
      const isHeaderCta = node.id === 'header_cta_btn';

      const handleBtnClick = (e: React.MouseEvent) => {
        if (isInteractivePreview) {
          if (isSubmitBtn) {
            e.preventDefault();
            e.stopPropagation();
            setFormSubmitted(true);
            return;
          }
          handleInteraction(e);
          return;
        }
        handleClick(e);
      };

      return (
        <div className="inline-flex items-center gap-2">
          {/* Header Cart Button if this is the header CTA */}
          {isHeaderCta &&
            !website.components['comp_header']?.props?.hideCart &&
            !(website.theme as any)?.hideCart &&
            !node.props.hideCart &&
            (() => {
              const headerCartIcon =
                website.components['comp_header']?.props?.cartIcon ||
                node.props.cartIcon ||
                'ShoppingBag';
              return (
                <button
                  onClick={(e) => {
                    if (isInteractivePreview) {
                      e.stopPropagation();
                      setIsCartOpen(true);
                    }
                  }}
                  title="سلة المشتريات والحجوزات"
                  className="relative p-2.5 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 hover:text-blue-600 shadow-xs transition-all flex items-center justify-center cursor-pointer active:scale-95"
                >
                  {headerCartIcon === 'ShoppingCart' ? (
                    <ShoppingCart className="w-4 h-4" />
                  ) : headerCartIcon === 'Package' ? (
                    <Package className="w-4 h-4" />
                  ) : headerCartIcon === 'Store' ? (
                    <Store className="w-4 h-4" />
                  ) : headerCartIcon === 'CreditCard' ? (
                    <CreditCard className="w-4 h-4" />
                  ) : (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </button>
              );
            })()}

          <button
            id={node.id}
            style={getComputedStyles()}
            onClick={handleBtnClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`cursor-pointer transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 ${outlineClass}`}
          >
            {node.props.iconName === 'Sparkles' && <Sparkles className="w-4 h-4" />}
            {node.props.iconName === 'MessageCircle' && <MessageCircle className="w-4 h-4" />}
            {node.props.iconName === 'Phone' && <Phone className="w-4 h-4" />}
            {node.props.iconName === 'Mail' && <Mail className="w-4 h-4" />}
            {node.props.iconName === 'MapPin' && <MapPin className="w-4 h-4" />}
            <span>{node.props.text || 'زر الإجراء'}</span>
          </button>
        </div>
      );
    }

    case 'image': {
      return (
        <div
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer overflow-hidden transition-all ${outlineClass}`}
        >
          <img
            src={
              node.props.src ||
              'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80'
            }
            alt={node.props.alt || 'صورة المكون'}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    case 'badge': {
      return (
        <div
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer inline-flex items-center transition-all ${outlineClass}`}
        >
          {node.props.text || 'شارة مميزة'}
        </div>
      );
    }

    case 'card': {
      // Specialized card content (Cars, Bento, Testimonials, FAQ, Pricing)
      if (
        node.props.icon ||
        node.props.specs ||
        node.props.quote ||
        node.props.question ||
        node.props.features
      ) {
        return (
          <div
            id={node.id}
            style={getComputedStyles()}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`cursor-pointer transition-all flex flex-col justify-between ${outlineClass}`}
          >
            {/* CAR PRODUCT CARD */}
            {node.props.image &&
              node.props.price &&
              (() => {
                const hoverImg =
                  node.props.hoverImage ||
                  (Array.isArray(node.props.images) && node.props.images[1]) ||
                  (node.props.image.includes('1614162692292')
                    ? 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&auto=format&fit=crop&q=80'
                    : undefined);
                const buyBtnIcon = node.props.buyButtonIcon || 'ShoppingBag';
                const buyBtnText = node.props.buyButtonText || 'إضافة للسلة';
                const hideBuyBtn = Boolean(node.props.hideBuyButton);

                return (
                  <div className="flex flex-col h-full group/pcard">
                    <div className="h-48 w-full overflow-hidden bg-slate-100 rounded-t-xl relative group/cardimg">
                      <img
                        src={node.props.image}
                        alt={node.props.title}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                          hoverImg
                            ? 'group-hover/cardimg:opacity-0 group-hover/cardimg:scale-105'
                            : 'hover:scale-105'
                        }`}
                      />
                      {hoverImg && (
                        <img
                          src={hoverImg}
                          alt={`${node.props.title} - صورة ثانوية`}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/cardimg:opacity-100 group-hover/cardimg:scale-105 transition-all duration-500 pointer-events-none"
                        />
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            style={{
                              backgroundColor: `${website.theme.colors.primary}18`,
                              color: website.theme.colors.primary,
                            }}
                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                          >
                            {node.props.badge || 'حصري'}
                          </span>
                          <span
                            style={{ color: website.theme.colors.primary }}
                            className="text-base font-extrabold font-mono"
                          >
                            {node.props.price}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {node.props.title}
                        </h3>
                      </div>

                      {node.props.specs && (
                        <div className="space-y-1 py-2 border-t border-slate-100 text-xs text-slate-600">
                          {node.props.specs.map((s: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {!hideBuyBtn && (
                          <button
                            onClick={(e) => {
                              if (isInteractivePreview) {
                                e.stopPropagation();
                                const rawPrice =
                                  typeof node.props.price === 'string'
                                    ? parseInt(node.props.price.replace(/[^0-9]/g, '')) || 750000
                                    : node.props.price || 750000;

                                addToCart({
                                  id: `cart_${node.id}`,
                                  title: node.props.title || 'منتج',
                                  price: rawPrice,
                                  priceFormatted:
                                    node.props.price || `${rawPrice.toLocaleString()} ج.م`,
                                  image:
                                    node.props.image ||
                                    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80',
                                  badge: node.props.badge || 'فئة أولى',
                                });
                              }
                            }}
                            className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                          >
                            {buyBtnIcon === 'ShoppingCart' ? (
                              <ShoppingCart className="w-3.5 h-3.5" />
                            ) : buyBtnIcon === 'Zap' ? (
                              <Zap className="w-3.5 h-3.5" />
                            ) : buyBtnIcon === 'Sparkles' ? (
                              <Sparkles className="w-3.5 h-3.5" />
                            ) : buyBtnIcon === 'Tag' ? (
                              <Tag className="w-3.5 h-3.5" />
                            ) : (
                              <ShoppingBag className="w-3.5 h-3.5" />
                            )}
                            <span>{buyBtnText}</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            if (isInteractivePreview) {
                              e.stopPropagation();
                              handleInteraction(e, '/contact', 'page_contact', 'تواصل معنا');
                            }
                          }}
                          style={{
                            backgroundColor: website.theme.colors.secondary || '#0f172a',
                            borderRadius: website.theme.radius.lg || '10px',
                          }}
                          className={`py-2.5 px-3 text-white font-bold text-xs shadow-xs transition-all hover:opacity-90 cursor-pointer active:scale-98 text-center ${hideBuyBtn ? 'col-span-2' : ''}`}
                        >
                          {node.props.ctaText || 'طلب فحص'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* BENTO FEATURE CARD */}
            {node.props.icon && (
              <div className="space-y-3">
                <div
                  style={{
                    backgroundColor: `${website.theme.colors.primary}18`,
                    color: website.theme.colors.primary,
                    borderRadius: website.theme.radius.md || '10px',
                  }}
                  className="w-12 h-12 flex items-center justify-center"
                >
                  {node.props.icon === 'ShieldCheck' && <ShieldCheck className="w-6 h-6" />}
                  {node.props.icon === 'Truck' && <Truck className="w-6 h-6" />}
                  {node.props.icon === 'CreditCard' && <CreditCard className="w-6 h-6" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{node.props.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{node.props.description}</p>
                {node.props.tag && (
                  <span
                    style={{ color: website.theme.colors.primary }}
                    className="inline-block text-[11px] font-semibold"
                  >
                    {node.props.tag} &larr;
                  </span>
                )}
              </div>
            )}

            {/* TESTIMONIAL CARD */}
            {node.props.quote && (
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(node.props.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{node.props.quote}"
                </p>
                <div className="pt-2 border-t border-slate-200/60">
                  <h4 className="text-xs font-bold text-slate-900">{node.props.author}</h4>
                  <span className="text-[11px] text-slate-500">{node.props.role}</span>
                </div>
              </div>
            )}

            {/* FAQ ITEM WITH INTERACTIVE TOGGLE */}
            {node.props.question && (
              <div
                onClick={(e) => {
                  if (isInteractivePreview) {
                    e.stopPropagation();
                    setIsFaqOpen(!isFaqOpen);
                  }
                }}
                className="space-y-2 select-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{node.props.question}</h4>
                  {isInteractivePreview && (
                    <span className="text-slate-400 p-1">
                      {isFaqOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
                {(!isInteractivePreview || isFaqOpen) && (
                  <p className="text-xs text-slate-600 leading-relaxed">{node.props.answer}</p>
                )}
              </div>
            )}

            {/* PRICING TIER */}
            {node.props.features && (
              <div className="space-y-4">
                {node.props.badge && (
                  <span
                    style={{
                      backgroundColor: website.theme.colors.primary,
                      borderRadius: website.theme.radius.full || '9999px',
                    }}
                    className="inline-block text-[11px] font-bold text-white px-2.5 py-0.5"
                  >
                    {node.props.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold">{node.props.title}</h3>
                <div
                  style={{ color: website.theme.colors.primary }}
                  className="text-2xl font-extrabold font-mono"
                >
                  {node.props.price}
                </div>
                <div className="space-y-2 py-3 border-t border-slate-200/30 text-xs">
                  {node.props.features.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    if (isInteractivePreview) {
                      e.stopPropagation();
                      handleInteraction(e, '/contact', 'page_contact', 'تواصل معنا');
                    }
                  }}
                  style={{
                    backgroundColor: website.theme.colors.primary,
                    borderRadius: website.theme.radius.lg || '10px',
                  }}
                  className="w-full py-2.5 text-white font-bold text-xs transition-all hover:opacity-90 active:scale-98 cursor-pointer"
                >
                  {node.props.ctaText || 'اختيار الباقة'}
                </button>
              </div>
            )}

            {renderChildren()}
          </div>
        );
      }

      // Contact Form Box with interactive submission feedback
      if (node.id === 'contact_form_box' && isInteractivePreview && formSubmitted) {
        return (
          <div
            id={node.id}
            style={getComputedStyles()}
            className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-xl font-bold text-emerald-900">تم استلام طلب حجزك بنجاح!</h3>
            <p className="text-sm text-emerald-700 max-w-md leading-relaxed">
              شكراً لاختيارك شركة المجد للسيارات. سيتواصل معك مستشار مبيعات VIP على الرقم المسجل
              خلال 15 دقيقة لتأكيد الموعد وتجهيز السيارة المطلوبة.
            </p>
            <button
              onClick={() => setFormSubmitted(false)}
              className="mt-2 text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 cursor-pointer"
            >
              إرسال طلب جديد
            </button>
          </div>
        );
      }

      return (
        <div
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          {renderChildren()}
        </div>
      );
    }

    // Products / Catalog / Fleet / Menu section
    case 'products': {
      const productsList = node.props.products || [];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {/* Section Header */}
            {(node.props.title || node.props.badge) && (
              <div className="text-center mb-10 space-y-2 max-w-2xl mx-auto">
                {node.props.badge && (
                  <span
                    style={{
                      backgroundColor: `${website.theme.colors.primary}18`,
                      color: website.theme.colors.primary,
                    }}
                    className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block"
                  >
                    {node.props.badge}
                  </span>
                )}
                {node.props.title && (
                  <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                    {node.props.title}
                  </h2>
                )}
                {node.props.subtitle && (
                  <p className="text-sm text-slate-600 leading-relaxed">{node.props.subtitle}</p>
                )}
              </div>
            )}

            {/* Products Grid */}
            {productsList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsList.map((prod: any, idx: number) => {
                  const rawPrice =
                    typeof prod.price === 'number'
                      ? prod.price
                      : parseInt(String(prod.price).replace(/[^0-9]/g, '')) || 100;
                  const formattedPrice =
                    typeof prod.price === 'string'
                      ? prod.price
                      : `${rawPrice.toLocaleString()} ج.م`;

                  return (
                    <div
                      key={prod.id || idx}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Image & Badge */}
                      {prod.image &&
                        (() => {
                          const prodHoverImg =
                            prod.hoverImage ||
                            (Array.isArray(prod.images) && prod.images[1]) ||
                            (prod.image.includes('1614162692292')
                              ? 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&auto=format&fit=crop&q=80'
                              : undefined);

                          return (
                            <div className="relative aspect-16/10 overflow-hidden bg-slate-100 group/prodimg">
                              <img
                                src={prod.image}
                                alt={prod.title}
                                className={`w-full h-full object-cover transition-all duration-500 ${
                                  prodHoverImg
                                    ? 'group-hover/prodimg:opacity-0 group-hover/prodimg:scale-105'
                                    : 'group-hover:scale-105'
                                }`}
                                referrerPolicy="no-referrer"
                              />
                              {prodHoverImg && (
                                <img
                                  src={prodHoverImg}
                                  alt={`${prod.title} - صورة بديلة`}
                                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/prodimg:opacity-100 group-hover/prodimg:scale-105 transition-all duration-500 pointer-events-none"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              {prod.badge && (
                                <span className="absolute top-3 right-3 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs z-10">
                                  {prod.badge}
                                </span>
                              )}
                            </div>
                          );
                        })()}

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                              {prod.title}
                            </h3>
                            <span
                              style={{ color: website.theme.colors.primary }}
                              className="text-base font-extrabold font-mono shrink-0"
                            >
                              {formattedPrice}
                            </span>
                          </div>
                          {prod.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {prod.description}
                            </p>
                          )}
                        </div>

                        {/* Specs */}
                        {prod.specs && prod.specs.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 py-2 border-t border-slate-100">
                            {prod.specs.map((spec: string, sIdx: number) => (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md font-medium border border-slate-100"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              if (isInteractivePreview) {
                                e.stopPropagation();
                                addToCart({
                                  id: `cart_${prod.id || idx}`,
                                  title: prod.title,
                                  price: rawPrice,
                                  priceFormatted: formattedPrice,
                                  image: prod.image,
                                  badge: prod.badge,
                                });
                              }
                            }}
                            style={{
                              backgroundColor: website.theme.colors.primary,
                              borderRadius: website.theme.radius.lg || '10px',
                            }}
                            className="py-2.5 px-3 text-white font-bold text-xs shadow-xs transition-all hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>طلب / شراء</span>
                          </button>

                          <button
                            onClick={(e) => {
                              if (isInteractivePreview) {
                                e.stopPropagation();
                                handleInteraction(e, '/contact', 'page_contact', 'حجز ومعاينة');
                              }
                            }}
                            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer text-center active:scale-98"
                          >
                            تفاصيل وحجز
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {renderChildren()}
          </div>
        </section>
      );
    }

    // Pricing / Subscription Plans Section
    case 'pricing': {
      const tiersList = node.props.tiers || [];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {(node.props.title || node.props.badge) && (
              <div className="text-center mb-10 space-y-2 max-w-2xl mx-auto">
                {node.props.badge && (
                  <span
                    style={{
                      backgroundColor: `${website.theme.colors.primary}18`,
                      color: website.theme.colors.primary,
                    }}
                    className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block"
                  >
                    {node.props.badge}
                  </span>
                )}
                {node.props.title && (
                  <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                    {node.props.title}
                  </h2>
                )}
                {node.props.subtitle && (
                  <p className="text-sm text-slate-600 leading-relaxed">{node.props.subtitle}</p>
                )}
              </div>
            )}

            {tiersList.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {tiersList.map((tier: any, idx: number) => {
                  const isPopular = Boolean(tier.isPopular || tier.badge);
                  return (
                    <div
                      key={tier.id || idx}
                      className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative transition-all duration-300 ${
                        isPopular
                          ? 'border-blue-600 shadow-xl ring-2 ring-blue-600/30 scale-102 z-10'
                          : 'border-slate-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {tier.badge && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full shadow-md">
                          {tier.badge}
                        </span>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{tier.title}</h3>
                          {tier.description && (
                            <p className="text-xs text-slate-500 mt-1">{tier.description}</p>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1 py-2">
                          <span
                            style={{ color: website.theme.colors.primary }}
                            className="text-3xl font-black font-mono"
                          >
                            {tier.price}
                          </span>
                          {tier.period && (
                            <span className="text-xs text-slate-500 font-medium">
                              /{tier.period}
                            </span>
                          )}
                        </div>

                        {tier.features && (
                          <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                            {tier.features.map((feat: string, fIdx: number) => (
                              <div key={fIdx} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          if (isInteractivePreview) {
                            e.stopPropagation();
                            handleInteraction(
                              e,
                              '/contact',
                              'page_contact',
                              tier.ctaText || 'اشتراك'
                            );
                          }
                        }}
                        style={{
                          backgroundColor: isPopular ? website.theme.colors.primary : '#0f172a',
                          borderRadius: website.theme.radius.lg || '10px',
                        }}
                        className="w-full mt-6 py-3 text-white font-bold text-xs shadow-xs hover:opacity-90 active:scale-98 transition-all cursor-pointer text-center"
                      >
                        {tier.ctaText || 'اختيار الخطة والبدء'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {renderChildren()}
          </div>
        </section>
      );
    }

    // Features / Highlights / Why Choose Us Section
    case 'features': {
      const featuresList = node.props.features || [];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {(node.props.title || node.props.badge) && (
              <div className="text-center mb-10 space-y-2 max-w-2xl mx-auto">
                {node.props.badge && (
                  <span
                    style={{
                      backgroundColor: `${website.theme.colors.primary}18`,
                      color: website.theme.colors.primary,
                    }}
                    className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block"
                  >
                    {node.props.badge}
                  </span>
                )}
                {node.props.title && (
                  <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                    {node.props.title}
                  </h2>
                )}
                {node.props.subtitle && (
                  <p className="text-sm text-slate-600 leading-relaxed">{node.props.subtitle}</p>
                )}
              </div>
            )}

            {featuresList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuresList.map((feat: any, idx: number) => (
                  <div
                    key={feat.id || idx}
                    className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 space-y-3 flex flex-col justify-between"
                  >
                    <div
                      style={{
                        backgroundColor: `${website.theme.colors.primary}15`,
                        color: website.theme.colors.primary,
                      }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    >
                      {feat.icon ? <ShieldCheck className="w-6 h-6" /> : <span>⭐</span>}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {renderChildren()}
          </div>
        </section>
      );
    }

    // Hero Section (For Activity Templates and Custom Hero Blocks)
    case 'hero': {
      const heroStats = node.props.stats || [];
      const primaryColor = website.theme?.colors?.primary || '#2563eb';

      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Text Column */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-right">
                {node.props.badge && (
                  <span
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{node.props.badge}</span>
                  </span>
                )}

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                  {node.props.title}
                  {node.props.highlightTitle && (
                    <span style={{ color: primaryColor }} className="block sm:inline sm:mr-2">
                      {node.props.highlightTitle}
                    </span>
                  )}
                </h1>

                {node.props.description && (
                  <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                    {node.props.description}
                  </p>
                )}

                {/* Hero Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-2">
                  {node.props.primaryCtaText && (
                    <button
                      onClick={(e) => {
                        if (isInteractivePreview) {
                          e.stopPropagation();
                          handleInteraction(
                            e,
                            node.props.primaryCtaLink || '#items',
                            undefined,
                            node.props.primaryCtaText
                          );
                        }
                      }}
                      style={{
                        backgroundColor: primaryColor,
                        borderRadius: website.theme?.radius?.lg || '12px',
                      }}
                      className="px-5 sm:px-7 py-3 text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                    >
                      <span>{node.props.primaryCtaText}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  )}

                  {node.props.secondaryCtaText && (
                    <button
                      onClick={(e) => {
                        if (isInteractivePreview) {
                          e.stopPropagation();
                          handleInteraction(
                            e,
                            node.props.secondaryCtaLink || '#contact',
                            'page_contact',
                            node.props.secondaryCtaText
                          );
                        }
                      }}
                      className="px-4 sm:px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <span>{node.props.secondaryCtaText}</span>
                    </button>
                  )}
                </div>

                {/* Stats Bar */}
                {heroStats.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-slate-200/80">
                    {heroStats.map((stat: any, sIdx: number) => (
                      <div key={sIdx} className="space-y-0.5">
                        <div
                          style={{ color: primaryColor }}
                          className="text-base sm:text-2xl font-black font-mono"
                        >
                          {stat.value}
                        </div>
                        <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Column */}
              {node.props.imageUrl && (
                <div className="lg:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-100 aspect-4/3 sm:aspect-16/10 lg:aspect-square">
                    <img
                      src={node.props.imageUrl}
                      alt={node.props.title || 'صورة الواجهة'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  </div>
                </div>
              )}
            </div>

            {renderChildren()}
          </div>
        </section>
      );
    }

    // Grid Section (Products / Services / Catalog Grid)
    case 'grid': {
      const itemsList = node.props.items || [];
      const primaryColor = website.theme?.colors?.primary || '#2563eb';

      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
            {(node.props.title || node.props.subtitle) && (
              <div className="text-center mb-8 sm:mb-12 space-y-2 max-w-2xl mx-auto">
                {node.props.badge && (
                  <span
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      color: primaryColor,
                    }}
                    className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block"
                  >
                    {node.props.badge}
                  </span>
                )}
                {node.props.title && (
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {node.props.title}
                  </h2>
                )}
                {node.props.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {node.props.subtitle}
                  </p>
                )}
              </div>
            )}

            {itemsList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {itemsList.map((item: any, idx: number) => {
                  const rawPrice =
                    typeof item.price === 'number'
                      ? item.price
                      : parseInt(String(item.price).replace(/[^0-9]/g, '')) || 350;
                  const formattedPrice =
                    typeof item.price === 'string'
                      ? item.price
                      : `${rawPrice.toLocaleString()} ج.م`;

                  return (
                    <div
                      key={item.id || idx}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group/card"
                    >
                      {item.image && (
                        <div className="relative aspect-16/10 overflow-hidden bg-slate-100 group/img">
                          <img
                            src={item.image}
                            alt={item.title}
                            className={`w-full h-full object-cover transition-all duration-500 ${
                              item.hoverImage ||
                              item.secondaryImage ||
                              (item.images && item.images.length > 1)
                                ? 'group-hover/img:scale-105 group-hover/img:opacity-0'
                                : 'group-hover/img:scale-105'
                            }`}
                            loading="lazy"
                          />
                          {(item.hoverImage ||
                            item.secondaryImage ||
                            (item.images && item.images.length > 1)) && (
                            <img
                              src={item.hoverImage || item.secondaryImage || item.images?.[1]}
                              alt={`${item.title} - صورة إضافية`}
                              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 scale-100 group-hover/img:opacity-100 group-hover/img:scale-105"
                              loading="lazy"
                            />
                          )}
                          {item.badge && (
                            <span className="absolute top-2.5 right-2.5 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs z-10 shadow-xs">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                              {item.title}
                            </h3>
                            <span
                              style={{ color: primaryColor }}
                              className="text-sm sm:text-base font-extrabold font-mono shrink-0"
                            >
                              {formattedPrice}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={(e) => {
                              if (isInteractivePreview) {
                                e.stopPropagation();
                                addToCart({
                                  id: `cart_${item.id || idx}`,
                                  title: item.title,
                                  price: rawPrice,
                                  priceFormatted: formattedPrice,
                                  image: item.image,
                                  badge: item.badge,
                                });
                              }
                            }}
                            style={{
                              backgroundColor: primaryColor,
                              borderRadius: website.theme?.radius?.md || '8px',
                            }}
                            className="py-2 px-2.5 text-white font-bold text-xs shadow-xs hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {node.props.btnIcon === 'ShoppingCart' ? (
                              <ShoppingCart className="w-3.5 h-3.5" />
                            ) : node.props.btnIcon === 'Zap' ? (
                              <Zap className="w-3.5 h-3.5" />
                            ) : (
                              <ShoppingBag className="w-3.5 h-3.5" />
                            )}
                            <span>{node.props.btnText || 'طلب الآن'}</span>
                          </button>

                          <button
                            onClick={(e) => {
                              if (isInteractivePreview) {
                                e.stopPropagation();
                                handleInteraction(e, '#contact', 'page_contact', 'استفسار وحجز');
                              }
                            }}
                            className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer text-center active:scale-98"
                          >
                            تفاصيل
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {renderChildren()}
          </div>
        </section>
      );
    }

    // Form Section (Inquiry, Booking, and Lead Capture)
    case 'form': {
      const fieldsList = node.props.fields || [
        { name: 'name', label: 'الاسم الكريم', type: 'text', placeholder: 'الاسم بالكامل' },
        { name: 'phone', label: 'رقم الهاتف / واتساب', type: 'tel', placeholder: '05xxxxxxxx' },
        {
          name: 'notes',
          label: 'ملاحظات أو تفاصيل الطلب',
          type: 'text',
          placeholder: 'اكتب رسالتك...',
        },
      ];
      const primaryColor = website.theme?.colors?.primary || '#2563eb';

      const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInteractivePreview) {
          setFormSubmitted(true);
        }
      };

      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {node.props.title || 'تواصل معنا واحجز موعدك'}
                </h2>
                {node.props.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
                    {node.props.subtitle}
                  </p>
                )}
              </div>

              {isInteractivePreview && formSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-900">تم إرسال طلبك بنجاح!</h3>
                  <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
                    شكراً لتواصلك معنا. سيقوم فريق خدمة العملاء بالرد عليك وتأكيد حجزك في أقرب وقت.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="text-xs font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer pt-2"
                  >
                    إرسال طلب آخر
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fieldsList.map((f: any, fIdx: number) => (
                      <div
                        key={f.name || fIdx}
                        className={
                          fIdx === fieldsList.length - 1 && fieldsList.length % 2 !== 0
                            ? 'sm:col-span-2'
                            : ''
                        }
                      >
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 text-right">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={f.type || 'text'}
                          placeholder={f.placeholder || ''}
                          required={f.required}
                          value={inputValues[f.name] || ''}
                          onChange={(e) =>
                            setInputValues({ ...inputValues, [f.name]: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors text-right"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: primaryColor,
                      borderRadius: website.theme?.radius?.lg || '12px',
                    }}
                    className="w-full py-3 sm:py-3.5 text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{node.props.buttonText || 'تأكيد إرسال الطلب'}</span>
                  </button>
                </form>
              )}
            </div>

            {renderChildren()}
          </div>
        </section>
      );
    }

    // Footer Section
    case 'footer': {
      const brandName = node.props.brandName || website.name || 'المتجر الإلكتروني';
      const description =
        node.props.description || 'منصة متكاملة للتجارة والخدمات بأعلى معايير الجودة.';

      return (
        <footer
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-right">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pb-8 border-b border-slate-800">
              {/* Brand Col */}
              <div className="space-y-2.5">
                <h3 className="text-base sm:text-lg font-black text-white">{brandName}</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{description}</p>
              </div>

              {/* Contact Info Col */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  معلومات التواصل
                </h4>
                <div className="space-y-1.5 text-xs text-slate-400">
                  {node.props.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span dir="ltr">{node.props.phone}</span>
                    </div>
                  )}
                  {node.props.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{node.props.email}</span>
                    </div>
                  )}
                  {node.props.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{node.props.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Trust Col */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  ضمان واعتماد
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  جميع المعاملات والخدمات مشمولة بضمان معتمد وفريق دعم فني متواجد على مدار الساعة.
                </p>
              </div>
            </div>

            {/* Copyright & Powered by Badge */}
            <div className="pt-6 pb-2 text-center flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400 select-none border-t border-slate-800/60 mt-6">
              <span>
                {node.props.copyright ||
                  `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${brandName}`}
              </span>
              <span className="hidden sm:inline opacity-30">•</span>
              <a
                href="https://mnmknk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px] font-medium shadow-xs"
              >
                <span>صنع بكل فخر عبر</span>
                <strong className="text-blue-400 font-extrabold flex items-center gap-1">
                  <span>نمّي أعمالك</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </strong>
              </a>
            </div>

            {renderChildren()}
          </div>
        </footer>
      );
    }

    // ── Testimonials ──────────────────────────────────────────────────────────
    case 'testimonials': {
      const items: any[] = node.props.items || [
        {
          name: 'أحمد محمد',
          role: 'عميل مميز',
          text: 'خدمة ممتازة وتوصيل سريع، أنصح الجميع بالتعامل معهم!',
          rating: 5,
        },
        {
          name: 'فاطمة علي',
          role: 'عميلة دائمة',
          text: 'منتجات أصلية وجودة عالية، سعيدة جداً بتجربتي.',
          rating: 5,
        },
        {
          name: 'محمود حسن',
          role: 'عميل جديد',
          text: 'سهولة الطلب والدفع عند الاستلام خلاني ما أتردد.',
          rating: 4,
        },
      ];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-12 px-4 ${outlineClass}`}
        >
          <div className="max-w-6xl mx-auto text-right">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              {node.props.title || 'آراء عملائنا'}
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              {node.props.subtitle || 'ماذا قالوا عنّا'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {items.map((t: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating || 5 }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {(t.name || '؟')[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{t.name}</p>
                      <p className="text-[10px] text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {renderChildren()}
        </section>
      );
    }

    // ── Gallery ────────────────────────────────────────────────────────────────
    case 'gallery': {
      const images: any[] = node.props.images || [
        { src: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400', caption: '' },
        { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', caption: '' },
        { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', caption: '' },
        { src: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', caption: '' },
      ];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-10 px-4 ${outlineClass}`}
        >
          <div className="max-w-6xl mx-auto text-right">
            {node.props.title && (
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">{node.props.title}</h2>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((img: any, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={img.src || img}
                    alt={img.caption || `صورة ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
          {renderChildren()}
        </section>
      );
    }

    // ── Team ───────────────────────────────────────────────────────────────────
    case 'team': {
      const members: any[] = node.props.members || [
        { name: 'محمد أحمد', role: 'المدير التنفيذي', image: '' },
        { name: 'سارة علي', role: 'مدير المبيعات', image: '' },
        { name: 'خالد حسن', role: 'مدير العمليات', image: '' },
      ];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-12 px-4 ${outlineClass}`}
        >
          <div className="max-w-5xl mx-auto text-right">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              {node.props.title || 'فريقنا'}
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              {node.props.subtitle || 'نخبة من الخبراء في خدمتك'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {members.map((m: any, i: number) => (
                <div
                  key={i}
                  className="text-center bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                >
                  {m.image ? (
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-black">
                      {(m.name || '?')[0]}
                    </div>
                  )}
                  <p className="font-bold text-slate-800">{m.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
          {renderChildren()}
        </section>
      );
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    case 'stats': {
      const items: any[] = node.props.items || [
        { value: '+١٠٠٠', label: 'عميل راضٍ' },
        { value: '+٥٠٠', label: 'طلب منجز' },
        { value: '٩٨٪', label: 'نسبة رضا' },
        { value: '+٢٠', label: 'سنة خبرة' },
      ];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-8 sm:py-10 px-4 ${outlineClass}`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {items.map((s: any, i: number) => (
                <div key={i} style={themeCardStyle} className="p-4 sm:p-5 shadow-sm border">
                  <div
                    style={{ color: themeColors?.primary }}
                    className="text-2xl sm:text-3xl font-black mb-1"
                  >
                    {s.value}
                  </div>
                  <div style={themeMutedStyle} className="text-xs sm:text-sm">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {renderChildren()}
        </section>
      );
    }

    // ── FAQ ────────────────────────────────────────────────────────────────────
    case 'faq': {
      const items: any[] = node.props.items || [
        {
          q: 'كيف أطلب؟',
          a: 'اختر منتجاتك وأضفها للسلة ثم أتم الطلب، سنتواصل معك لتأكيد التوصيل.',
        },
        { q: 'هل الدفع آمن؟', a: 'نعم، ندعم الدفع عند الاستلام بدون أي رسوم إضافية.' },
        { q: 'ما مدة التوصيل؟', a: 'من 2-5 أيام عمل حسب موقعك.' },
      ];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-8 sm:py-12 px-4 ${outlineClass}`}
        >
          <div className="max-w-3xl mx-auto text-right">
            <h2
              style={{ color: themeColors?.textPrimary }}
              className="text-2xl font-extrabold mb-2"
            >
              {node.props.title || 'الأسئلة الشائعة'}
            </h2>
            <p style={themeMutedStyle} className="text-sm mb-6 sm:mb-8">
              {node.props.subtitle || 'إجابات على أكثر الأسئلة شيوعاً'}
            </p>
            <div className="space-y-3">
              {items.map((f: any, i: number) => {
                const itemKey = `${node.id}-${i}`;
                const isOpen = Boolean(openFaqItems[itemKey]);
                return (
                  <div key={i} style={themeCardStyle} className="border overflow-hidden">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between p-4 cursor-pointer text-right transition-colors hover:opacity-80"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenFaqItems((previous) => ({ ...previous, [itemKey]: !isOpen }));
                      }}
                    >
                      <ChevronDown
                        style={{ color: themeColors?.textMuted }}
                        className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                      <span
                        style={{ color: themeColors?.textPrimary }}
                        className="font-semibold text-sm flex-1 text-right pr-2"
                      >
                        {f.q}
                      </span>
                    </button>
                    {isOpen && (
                      <div style={themeMutedStyle} className="px-4 pb-4 text-sm leading-relaxed">
                        {f.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {renderChildren()}
        </section>
      );
    }

    // ── Contact Section ────────────────────────────────────────────────────────
    case 'contact-section':
    case 'contact': {
      const contactFields = [
        { name: 'name', type: 'text', placeholder: 'الاسم', required: true },
        { name: 'phone', type: 'tel', placeholder: 'رقم الهاتف', required: true },
        { name: 'message', type: 'text', placeholder: 'رسالتك...' },
      ];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-8 sm:py-12 px-4 ${outlineClass}`}
        >
          <div className="max-w-5xl mx-auto text-right">
            <h2
              style={{ color: themeColors?.textPrimary }}
              className="text-2xl font-extrabold mb-2"
            >
              {node.props.title || 'تواصل معنا'}
            </h2>
            <p style={themeMutedStyle} className="text-sm mb-6 sm:mb-8">
              {node.props.subtitle || 'نحن هنا للمساعدة'}
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {(node.props.phone || node.props.whatsapp) && (
                  <a
                    href={`tel:${String(node.props.phone || node.props.whatsapp).replace(/\s/g, '')}`}
                    style={themeCardStyle}
                    className="flex items-center gap-3 p-4 border shadow-sm transition-transform hover:scale-[1.01]"
                  >
                    <div
                      style={{
                        backgroundColor: `${themeColors?.primary || '#2563eb'}18`,
                        color: themeColors?.primary,
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p style={{ color: themeColors?.textMuted }} className="text-xs">
                        هاتف / واتساب
                      </p>
                      <p
                        style={{ color: themeColors?.textPrimary }}
                        className="font-bold"
                        dir="ltr"
                      >
                        {node.props.phone || node.props.whatsapp}
                      </p>
                    </div>
                  </a>
                )}
                {node.props.email && (
                  <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">البريد الإلكتروني</p>
                      <p className="font-bold text-slate-800">{node.props.email}</p>
                    </div>
                  </div>
                )}
                {node.props.address && (
                  <div className="flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">العنوان</p>
                      <p className="font-bold text-slate-800">{node.props.address}</p>
                    </div>
                  </div>
                )}
              </div>
              <form
                style={themeCardStyle}
                className="p-4 sm:p-6 border shadow-sm space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setFormSubmitted(true);
                }}
              >
                {formSubmitted ? (
                  <div className="text-center py-6">
                    <CheckCircle
                      style={{ color: themeColors?.success }}
                      className="w-8 h-8 mx-auto mb-2"
                    />
                    <p style={{ color: themeColors?.textPrimary }} className="font-bold">
                      تم إرسال رسالتك بنجاح.
                    </p>
                    <button
                      type="button"
                      style={{ color: themeColors?.primary }}
                      className="text-sm mt-2 underline"
                      onClick={() => setFormSubmitted(false)}
                    >
                      إرسال رسالة أخرى
                    </button>
                  </div>
                ) : (
                  contactFields.map((field) =>
                    field.name === 'message' ? (
                      <textarea
                        key={field.name}
                        required={field.required}
                        value={inputValues[field.name] || ''}
                        onChange={(event) =>
                          setInputValues((previous) => ({
                            ...previous,
                            [field.name]: event.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-right resize-none"
                        style={{ borderColor: themeColors?.border }}
                      />
                    ) : (
                      <input
                        key={field.name}
                        type={field.type}
                        required={field.required}
                        value={inputValues[field.name] || ''}
                        onChange={(event) =>
                          setInputValues((previous) => ({
                            ...previous,
                            [field.name]: event.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        className="w-full border rounded-lg px-3 py-2 text-sm text-right"
                        style={{ borderColor: themeColors?.border }}
                        dir={field.type === 'tel' ? 'ltr' : undefined}
                      />
                    )
                  )
                )}
                {!formSubmitted && (
                  <button
                    type="submit"
                    style={{
                      backgroundColor: themeColors?.primary,
                      borderRadius: website.theme?.radius?.md || '8px',
                    }}
                    className="w-full text-white py-2.5 text-sm font-bold"
                  >
                    إرسال
                  </button>
                )}
              </form>
            </div>
          </div>
          {renderChildren()}
        </section>
      );
    }

    // ── Services Grid ──────────────────────────────────────────────────────────
    case 'services-grid':
    case 'services': {
      const items: any[] = node.props.items || [
        { title: 'خدمة ١', description: 'وصف مختصر للخدمة الأولى وما تقدمه من قيمة.', icon: '✨' },
        { title: 'خدمة ٢', description: 'وصف مختصر للخدمة الثانية وما تقدمه من قيمة.', icon: '🚀' },
        { title: 'خدمة ٣', description: 'وصف مختصر للخدمة الثالثة وما تقدمه من قيمة.', icon: '💎' },
      ];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-12 px-4 ${outlineClass}`}
        >
          <div className="max-w-5xl mx-auto text-right">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              {node.props.title || 'خدماتنا'}
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              {node.props.subtitle || 'نقدم لك أفضل الخدمات'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {items.map((s: any, i: number) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-3">{s.icon || '⚡'}</div>
                  <h3 className="font-bold text-slate-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
          {renderChildren()}
        </section>
      );
    }

    // ── Spacer ─────────────────────────────────────────────────────────────────
    case 'spacer': {
      const h = node.props.height || 60;
      return (
        <div
          id={node.id}
          style={{ height: h, ...getComputedStyles() }}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all w-full relative ${outlineClass}`}
        >
          {!isInteractivePreview && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                مسافة {h}px
              </span>
            </div>
          )}
        </div>
      );
    }

    // ── Divider ────────────────────────────────────────────────────────────────
    case 'divider': {
      const style = node.props.style || 'solid';
      const color = node.props.color || '#e2e8f0';
      return (
        <div
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all px-4 py-3 ${outlineClass}`}
        >
          <hr
            style={{
              borderStyle: style,
              borderColor: color,
              borderTopWidth: node.props.thickness || 1,
            }}
            className="w-full"
          />
        </div>
      );
    }

    // ── Trust Badges ───────────────────────────────────────────────────────────
    case 'trust-badges':
    case 'trust_badges': {
      const badges = node.props.badges || [
        { icon: '🚚', label: 'توصيل سريع' },
        { icon: '💰', label: 'دفع عند الاستلام' },
        { icon: '🔄', label: 'إرجاع مجاني' },
        { icon: '🔒', label: 'تسوق آمن' },
        { icon: '⭐', label: 'جودة مضمونة' },
      ];
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-6 px-4 bg-slate-50 border-y border-slate-100 ${outlineClass}`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {badges.map((b: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-slate-700">
                  <span className="text-xl">{b.icon}</span>
                  <span className="text-sm font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          {renderChildren()}
        </section>
      );
    }

    // ── Before / After ─────────────────────────────────────────────────────────
    case 'before-after':
    case 'before_after': {
      return (
        <section
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-12 px-4 ${outlineClass}`}
        >
          <div className="max-w-4xl mx-auto text-right">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              {node.props.title || 'قبل وبعد'}
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              {node.props.subtitle || 'شاهد الفرق بنفسك'}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-2xl border-2 border-red-200 bg-red-50">
                {node.props.beforeImage ? (
                  <img
                    src={node.props.beforeImage}
                    alt="قبل"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-400 text-4xl">
                    📷
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  قبل
                </div>
              </div>
              <div className="relative overflow-hidden rounded-2xl border-2 border-green-200 bg-green-50">
                {node.props.afterImage ? (
                  <img src={node.props.afterImage} alt="بعد" className="w-full h-48 object-cover" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center text-green-400 text-4xl">
                    ✨
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  بعد
                </div>
              </div>
            </div>
          </div>
          {renderChildren()}
        </section>
      );
    }

    // ── Promo Banner / Announcement Bar ───────────────────────────────────────
    case 'promo-banner':
    case 'promo_banner':
    case 'announcement-bar':
    case 'announcement_bar': {
      const bgColor = node.props.bgColor || themeColors?.primary || '#1d4ed8';
      const textColor = node.props.textColor || '#ffffff';
      return (
        <div
          id={node.id}
          style={{ backgroundColor: bgColor, color: textColor, ...getComputedStyles() }}
          onClick={(event) =>
            isInteractivePreview
              ? handleInteraction(
                  event,
                  node.props.link || node.props.url,
                  node.props.pageId,
                  node.props.text
                )
              : handleClick(event)
          }
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all py-2.5 px-4 text-center ${outlineClass}`}
        >
          <p className="text-sm font-semibold">
            {node.props.text || '🎉 عرض خاص — خصم ١٠٪ على أول طلب! استخدم الكود: WELCOME10'}
          </p>
          {renderChildren()}
        </div>
      );
    }

    // ── WhatsApp Float ─────────────────────────────────────────────────────────
    case 'whatsapp-float':
    case 'whatsapp_button': {
      const whatsappNumber = String(
        node.props.phone || node.props.whatsapp || '201000000000'
      ).replace(/[^0-9]/g, '');
      const whatsappMessage = encodeURIComponent(
        node.props.message || `مرحباً، أود الاستفسار عن ${website.name || 'الخدمات'}`
      );
      return (
        <div
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          {/* Canvas preview — fixed position only on published site */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="flex items-center gap-2 bg-[#25D366] text-white rounded-full px-4 py-2 shadow-lg w-fit hover:brightness-95 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{node.props.label || 'تواصل عبر واتساب'}</span>
          </a>
          <p className="text-[10px] text-slate-400 mt-1 text-right">
            (سيظهر عائماً في الزاوية على الموقع المنشور)
          </p>
          {renderChildren()}
        </div>
      );
    }

    // Default container / sections / flex / grid

    default: {
      return (
        <div
          id={node.id}
          style={getComputedStyles()}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={`cursor-pointer transition-all ${outlineClass}`}
        >
          {/* Bento header text render */}
          {node.props.badge && node.props.title && (
            <div className="text-center mb-10 space-y-2 max-w-2xl mx-auto">
              <span
                style={{
                  color: themeColors?.primary,
                  backgroundColor: `${themeColors?.primary || '#2563eb'}15`,
                }}
                className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              >
                {node.props.badge}
              </span>
              <h2
                style={{ color: themeColors?.textPrimary }}
                className="text-2xl sm:text-3xl font-extrabold leading-tight"
              >
                {node.props.title}
              </h2>
              {node.props.subtitle && (
                <p style={themeMutedStyle} className="text-sm leading-relaxed">
                  {node.props.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Stats item render */}
          {node.props.value && node.props.label && (
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 font-mono">{node.props.value}</div>
              <div className="text-xs text-slate-500 font-medium">{node.props.label}</div>
            </div>
          )}

          {/* Footer content render with interactive links */}
          {node.props.copyright && (
            <div className="w-full text-center text-xs text-slate-500">{node.props.copyright}</div>
          )}
          {node.props.heading && node.props.links && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {node.props.heading}
              </h4>
              <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                {node.props.links.map((link: string, i: number) => (
                  <span
                    key={i}
                    onClick={(e) => {
                      if (isInteractivePreview) {
                        e.stopPropagation();
                        handleInteraction(e, undefined, undefined, link);
                      }
                    }}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    {link}
                  </span>
                ))}
              </div>
            </div>
          )}
          {node.props.heading && node.props.info && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                {node.props.heading}
              </h4>
              <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                {node.props.info.map((inf: string, i: number) => (
                  <span key={i}>{inf}</span>
                ))}
              </div>
            </div>
          )}

          {renderChildren()}
        </div>
      );
    }
  }
};
