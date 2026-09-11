'use client';

import { useState, useEffect, useMemo } from 'react';
import { sidebarSections, type SidebarSection } from '@/config/sidebar';
import { apiRequest } from '@/lib/auth';

type Shop = {
  id?: string;
  name?: string;
  layoutConfig?: {
    enabledFeatures?: Record<string, string[]>;
  };
};

const DEFAULT_FEATURES: Record<string, string[]> = {
  branches: ['branchesList', 'branchCompare'],
  team: ['teamMembers', 'teamRoles'],
  sales: ['orders', 'salesOrders', 'deliveryNotes'],
  inventory: ['products'],
  finance: ['invoice', 'revenue', 'wallets', 'payments', 'eta'],
  accounting: ['accounts', 'journal', 'trialBalance', 'financialReports', 'expenses', 'taxes'],
  crm: ['customers', 'customerStatements', 'creditLimits', 'wholesalePricing'],
  pos: ['posCheckout'],
};

const FEATURE_ALIASES: Record<string, string> = {
  sales: 'orders',
  addProduct: 'products',
  'my-site': 'website',
  customerSegments: 'customers',
  customerTags: 'customers',
  marketingHub: 'campaigns',
  promotions: 'campaigns',
  bookingsOverview: 'reservations',
  aiTheme: 'aiContent',
  aiPages: 'aiContent',
  aiBrand: 'aiContent',
  aiDesign: 'aiContent',
  aiReplies: 'aiContent',
  aiSuggestions: 'aiContent',
  aiPageGen: 'aiContent',
  aiDataAnalysis: 'aiAnalysis',
  aiAutomations: 'aiContent',
};

const MODULE_ALIASES: Record<string, string> = {
  customers: 'crm',
};

/**
 * Shared section-visibility logic used by both the classic Sidebar and the
 * TopNav header: merges merchant-enabled features on top of defaults and
 * returns only the sections that should be shown.
 */
export default function useVisibleSections() {
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    const handleModulesChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ enabledFeatures?: Record<string, string[]> }>).detail;
      if (detail?.enabledFeatures) {
        setShop((current) => ({
          ...(current || {}),
          layoutConfig: { ...(current?.layoutConfig || {}), enabledFeatures: detail.enabledFeatures },
        }));
      }
    };
    window.addEventListener('merchant-modules-changed', handleModulesChanged);
    let cancelled = false;
    (async () => {
      try {
        const shopData = await apiRequest('/shops/me');
        if (cancelled) return;
        setShop(shopData);
      } catch {
        if (!cancelled) setShop(null);
      }
    })();
    return () => {
      cancelled = true;
      window.removeEventListener('merchant-modules-changed', handleModulesChanged);
    };
  }, []);

  const enabledFeatures = useMemo(() => {
    const saved = shop?.layoutConfig?.enabledFeatures;
    const merged: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(DEFAULT_FEATURES)) merged[k] = [...v];
    if (saved && typeof saved === 'object') {
      for (const [k, v] of Object.entries(saved)) {
        merged[k] = [...(merged[k] || []), ...(Array.isArray(v) ? v : [])];
      }
    }
    return Object.fromEntries(Object.entries(merged).map(([moduleId, features]) => [
      moduleId.toLowerCase(), new Set((Array.isArray(features) ? features : []).map((feature) => String(feature).toLowerCase())),
    ])) as Record<string, Set<string>>;
  }, [shop]);

  const visibleSections: SidebarSection[] = useMemo(() => {
    return sidebarSections.map((section) => {
      // Always show dashboard and settings
      if (section.id === 'dashboard' || section.id === 'settings') return section;
      if (!section.moduleId) return section;

      const moduleId = (MODULE_ALIASES[section.moduleId.toLowerCase()] || section.moduleId).toLowerCase();
      const activeFeatures = enabledFeatures[moduleId] || new Set<string>();
      const items = section.items.filter((item) => {
        const featureId = (FEATURE_ALIASES[item.id] || item.id).toLowerCase();
        return activeFeatures.has(featureId);
      });
      if (items.length === 0) return null;
      return { ...section, items };
    }).filter((section): section is SidebarSection => Boolean(section)).filter((section) => {
      if (section.moduleId) {
        const mod = section.moduleId.toLowerCase();
        if (mod === 'bookings' || mod === 'reservations') {
          return (enabledFeatures.bookings?.size || 0) > 0 || (enabledFeatures.reservations?.size || 0) > 0;
        }
        return section.items.length > 0;
      }
      return true;
    });
  }, [enabledFeatures]);

  return visibleSections;
}
