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

  // Local interactive state for preview mode (e.g. FAQ accordion toggle, form submission, mega menu dropdown)
  const [isFaqOpen, setIsFaqOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const node = website.components[nodeId];
  if (!node || node.isHidden) return null;

  const isSelected = selectedNodeId === node.id && !isInteractivePreview;
  const isHovered = hoveredNodeId === node.id && !isSelected && !isInteractivePreview;

  const currentViewport = overrideViewport || viewport;

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
      position: merged.position,
      top: merged.top,
      right: merged.right,
      bottom: merged.bottom,
      left: merged.left,
      zIndex: merged.zIndex,
    };

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
      const cleanSlug = url.replace(/^[#/]+/, '').toLowerCase().trim();
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

      if (lowerText.includes('أسطول') || lowerText.includes('سيارات') || lowerText.includes('معرض') || lowerText.includes('موديل')) {
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
          (p) => p.slug === 'certifications' || p.id === 'page_certifications' || p.name.includes('اعتمادات')
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
      const hasDropdown = node.props.hasDropdown || node.id === 'nav_link_2' || !!node.props.dropdownItems;
      const dropdownItems = node.props.dropdownItems || [
        { id: 'sub_all', title: 'كافة أسطول 2025', description: 'جميع الموديلات الفاخرة المتاحة للتسليم الفوري', url: '/fleet', pageId: 'page_fleet', badge: 'شامل' },
        { id: 'sub_amg', title: 'مرسيدس AMG & مايباخ', description: 'سيدان وكوبيه VIP الرياضية', url: '/fleet', pageId: 'page_fleet', badge: '14 سيارة' },
        { id: 'sub_gt3', title: 'بورش 911 & GT3 RS', description: 'أداء حلبات خارق وفخامة فائقة', url: '/fleet', pageId: 'page_fleet', badge: '12 سيارة' },
        { id: 'sub_suv', title: 'رينج روفر SV & كولينان', description: 'دفع رباعي فاخر بقمة الهيبة', url: '/fleet', pageId: 'page_fleet', badge: '9 سيارات' },
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
      if (isInteractivePreview && typeof text === 'string' && (text.includes(' • ') || text.includes(' | '))) {
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
      const isSubmitBtn = node.id === 'contact_btn_submit' || node.props.text?.includes('إرسال طلب');
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
          {isHeaderCta && (
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
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

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
            {node.props.image && node.props.price && (
              <div className="flex flex-col h-full">
                <div className="h-48 w-full overflow-hidden bg-slate-100 rounded-t-xl">
                  <img
                    src={node.props.image}
                    alt={node.props.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
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
                    <button
                      onClick={(e) => {
                        if (isInteractivePreview) {
                          e.stopPropagation();
                          const rawPrice = typeof node.props.price === 'string'
                            ? parseInt(node.props.price.replace(/[^0-9]/g, '')) || 750000
                            : (node.props.price || 750000);

                          addToCart({
                            id: `cart_${node.id}`,
                            title: node.props.title || 'سيارة فاخرة',
                            price: rawPrice,
                            priceFormatted: node.props.price || `${rawPrice.toLocaleString()} ر.س`,
                            image: node.props.image || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80',
                            badge: node.props.badge || 'فئة أولى',
                          });
                        }
                      }}
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>إضافة للسلة</span>
                    </button>

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
                      className="py-2.5 px-3 text-white font-bold text-xs shadow-xs transition-all hover:opacity-90 cursor-pointer active:scale-98 text-center"
                    >
                      {node.props.ctaText || 'طلب فحص'}
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                      {isFaqOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
              شكراً لاختيارك شركة المجد للسيارات. سيتواصل معك مستشار مبيعات VIP على الرقم المسجل خلال 15 دقيقة لتأكيد الموعد وتجهيز السيارة المطلوبة.
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
                      : `${rawPrice.toLocaleString()} ر.س`;

                  return (
                    <div
                      key={prod.id || idx}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Image & Badge */}
                      {prod.image && (
                        <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                          <img
                            src={prod.image}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          {prod.badge && (
                            <span className="absolute top-3 right-3 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                      )}

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
                            <span className="text-xs text-slate-500 font-medium">/{tier.period}</span>
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
                            handleInteraction(e, '/contact', 'page_contact', tier.ctaText || 'اشتراك');
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
                      {feat.icon ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : (
                        <span>⭐</span>
                      )}
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
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                {node.props.badge}
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                {node.props.title}
              </h2>
              {node.props.subtitle && (
                <p className="text-sm text-slate-600 leading-relaxed">{node.props.subtitle}</p>
              )}
            </div>
          )}

          {/* Stats item render */}
          {node.props.value && node.props.label && (
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900 font-mono">
                {node.props.value}
              </div>
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
