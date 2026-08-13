'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, X, Menu, LogOut } from 'lucide-react';
import { sidebarSections, type SidebarSection } from '@/config/sidebar';
import { useAuth, apiRequest } from '@/lib/auth';
import { useRouter } from 'next/navigation';

type Shop = {
  id?: string;
  name?: string;
  layoutConfig?: {
    enabledModules?: Array<{ id?: string; moduleId?: string; key?: string } | string>;
  };
};

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
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
    return () => { cancelled = true; };
  }, []);

  const enabledModules = useMemo(() => {
    const DEFAULT_MODULES = ['sales', 'inventory', 'crm', 'finance', 'marketing', 'bookings', 'reservations'];
    if (!shop?.layoutConfig) return new Set<string>(DEFAULT_MODULES);
    const raw = shop.layoutConfig?.enabledModules;
    if (!Array.isArray(raw)) return new Set<string>(DEFAULT_MODULES);
    const set = new Set(
      raw.map((x: any) => String(x?.id ?? x?.moduleId ?? x?.key ?? x ?? '').trim().toLowerCase()).filter(Boolean)
    );
    if (set.has('reservations')) set.add('bookings');
    if (set.has('bookings')) set.add('reservations');
    return set;
  }, [shop]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isSectionView = activeSection !== null;
  const visibleSections: SidebarSection[] = useMemo(() => {
    const filtered = sidebarSections.filter((section) => {
      // Always show dashboard and settings
      if (section.id === 'dashboard' || section.id === 'settings') return true;
      // For module-based sections, check if module is enabled
      if (section.moduleId) {
        const mod = section.moduleId.toLowerCase();
        if (mod === 'bookings' || mod === 'reservations') {
          return enabledModules.has('bookings') || enabledModules.has('reservations');
        }
        return enabledModules.has(mod);
      }
      return true;
    });

    return isSectionView
      ? filtered.filter((s) => s.id === activeSection)
      : filtered;
  }, [isSectionView, activeSection, enabledModules]);

  const isActive = (href: string) => {
    // For settings page, check if the tab parameter matches
    if (href.startsWith('/dashboard/settings?tab=')) {
      const url = new URL(href, 'http://localhost');
      const tabParam = url.searchParams.get('tab');
      const currentUrl = new URL(window.location.href);
      const currentTab = currentUrl.searchParams.get('tab');
      return pathname === '/dashboard/settings' && tabParam === currentTab;
    }
    // Use exact matching for other pages
    return pathname === href;
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-72'
      } bg-white border-l border-slate-100 flex flex-col h-full transition-all duration-300 shrink-0`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-50 shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <span className="font-black text-sm text-slate-900">راي</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="w-9 h-9 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">R</span>
            </div>
          </Link>
        )}
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 hover:bg-slate-50 rounded-lg"
            >
              <X size={18} className="text-slate-400" />
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block p-1.5 hover:bg-slate-50 rounded-lg"
          >
            {collapsed ? (
              <ChevronLeft size={18} className="text-slate-400" />
            ) : (
              <ChevronRight size={18} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {isSectionView && (
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-2 px-4 py-2 mb-2 text-xs font-black text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronRight size={14} />
            كل الأقسام
          </button>
        )}

        {visibleSections.map((section) => {
          const SectionIcon = section.icon;
          const hasModule = Boolean(section.moduleId);

          if (!isSectionView && hasModule) {
            // Show section title only — click to expand (and navigate if mainHref is set)
            const handleSectionClick = () => {
              setActiveSection(section.id);
              if (section.mainHref) {
                router.push(section.mainHref);
                if (onClose) onClose();
              }
            };
            return (
              <div key={section.id} className="px-3 mb-1">
                <button
                  onClick={handleSectionClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all group"
                >
                  {SectionIcon && (
                    <SectionIcon size={18} className="text-slate-400 shrink-0" />
                  )}
                  {!collapsed && (
                    <>
                      <span className="text-xs font-black text-slate-700 flex-1 text-right">
                        {section.titleAr}
                      </span>
                      <ExternalLink
                        size={12}
                        className="text-slate-300 group-hover:text-slate-500 transition-colors"
                      />
                    </>
                  )}
                </button>
              </div>
            );
          }

          // Show section items
          return (
            <div key={section.id} className="mb-2">
              {!collapsed && !isSectionView && (
                <div className="px-6 py-1.5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  {section.titleAr}
                </div>
              )}
              {isSectionView && !collapsed && (
                <div className="px-6 py-1.5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                  {section.titleAr}
                </div>
              )}
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                const active = isActive(item.href);
                const isNewInvoice = item.id === 'newInvoice';
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl transition-all ${
                      isNewInvoice
                        ? 'bg-[#00E5FF]/10 text-[#00B8CC] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20'
                        : active
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ItemIcon
                      size={16}
                      className={`shrink-0 ${isNewInvoice ? 'text-[#00B8CC]' : active ? 'text-[#00E5FF]' : 'text-slate-400'}`}
                    />
                    {!collapsed && (
                      <span className="text-xs font-bold flex-1 text-right">
                        {item.labelAr}
                      </span>
                    )}
                    {active && !collapsed && !isNewInvoice && (
                      <div className="w-1 h-1 rounded-full bg-[#00E5FF]" />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Logout — pinned at bottom */}
      <div className="px-3 py-2 border-t border-slate-50 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={16} className="shrink-0 text-red-400" />
          {!collapsed && (
            <span className="text-xs font-bold flex-1 text-right">تسجيل الخروج</span>
          )}
        </button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-50 shrink-0">
          <div className="text-[9px] font-bold text-slate-300 text-center">
            © 2026 راي — نمّي أعمالك
          </div>
        </div>
      )}
    </aside>
  );
}
