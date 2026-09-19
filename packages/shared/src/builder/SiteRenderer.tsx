'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { SiteProduct, SiteShopContext, ViewportBreakpoint, Website } from './types';
import { buildWhatsAppLink, resolveTheme } from './theme';
import { NodeView, NodeViewContext } from './NodeView';

interface SiteRendererProps {
  website: Website;
  shop: SiteShopContext;
  products: SiteProduct[];
  /** Wire the published site into the host app's unified cart (optional). */
  onAddToCart?: (product: SiteProduct) => void;
  onOpenCart?: () => void;
  /** Current unified-cart item count (badges on the mobile footer bar). */
  cartCount?: number;
}

/**
 * Public renderer for a published builder website.
 * Renders the exact component tree built in the editor: pages, sections,
 * theme tokens — with client-side page navigation.
 */
export const SiteRenderer: React.FC<SiteRendererProps> = ({
  website,
  shop,
  products,
  onAddToCart,
  onOpenCart,
  cartCount,
}) => {
  const pages = website.pages || [];
  const homePage = useMemo(
    () =>
      pages.find((p) => p.metadata?.isHomePage) ||
      pages.find((p) => p.id === 'page_home') ||
      pages[0],
    [pages]
  );

  const [activePageId, setActivePageId] = useState<string>(homePage?.id || pages[0]?.id);
  // SSR renders desktop; after hydration match the visitor's device width.
  const [viewport, setViewport] = useState<ViewportBreakpoint>('desktop');
  // Prevent flash of unstyled content during hydration.
  const [hydrated, setHydrated] = useState(false);
  const [pageChanging, setPageChanging] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const compute = () => {
      const w = window.innerWidth;
      setViewport(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const theme = useMemo(() => resolveTheme(website.theme), [website.theme]);

  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId) || homePage,
    [pages, activePageId, homePage]
  );

  const navigateToPage = (pageId: string) => {
    setPageChanging(true);
    setTimeout(() => {
      setActivePageId(pageId);
      setPageChanging(false);
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        window.scrollTo(0, 0);
      }
    }, 120);
  };

  const waLink = (text: string) => buildWhatsAppLink(shop.whatsapp || shop.phone, text);

  if (!activePage) {
    return (
      <div
        dir={website.defaultDirection || 'rtl'}
        className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold"
      >
        لا يوجد محتوى منشور بعد
      </div>
    );
  }

  // Skeleton shown before hydration to prevent layout shift
  if (!hydrated) {
    return (
      <div
        dir={website.defaultDirection || 'rtl'}
        className="pub-site min-h-screen animate-pulse"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="h-16 bg-slate-200/60 w-full" />
        <div className="h-[60vh] bg-slate-100/80 w-full" />
        <div className="h-32 bg-slate-200/40 w-full mt-4" />
      </div>
    );
  }

  const ctx: NodeViewContext = {
    website,
    viewport,
    activePage,
    theme,
    shop,
    realProducts: products || [],
    onNavigatePage: navigateToPage,
    waLink,
    onAddToCart,
    onOpenCart,
    cartCount,
  };

  return (
    <div
      dir={website.defaultDirection || 'rtl'}
      className="pub-site min-h-screen"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textPrimary,
        opacity: pageChanging ? 0.5 : 1,
        transition: 'opacity 0.12s ease',
      }}
    >
      {/* Theme typography tokens applied globally to the published site */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .pub-site { font-family: ${theme.typography.fontBody}; font-size: ${theme.typography.baseFontSize || '16px'}; }
            .pub-site h1, .pub-site h2, .pub-site h3, .pub-site h4 { font-family: ${theme.typography.fontHeading}; }
          `,
        }}
      />
      <NodeView nodeId={activePage.rootNodeId} ctx={ctx} />
    </div>
  );
};
