'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, Search, LogOut, User, ChevronDown, PanelLeft, LayoutGrid,
} from 'lucide-react';
import type { SidebarSection } from '@/config/sidebar';
import { SECTION_COLORS } from '@/config/sidebar';
import { useAuth } from '@/lib/auth';
import { useOrderBell } from '@/hooks/useOrderBell';
import useVisibleSections from '@/hooks/useVisibleSections';

type TopNavProps = {
  onMenuClick: () => void;
  onSwitchNav: () => void;
};

export default function TopNav({ onMenuClick, onSwitchNav }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount } = useOrderBell();
  const sections: SidebarSection[] = useVisibleSections();

  const [openSection, setOpenSection] = useState<string | null>(null);
  const [hoverSection, setHoverSection] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (appsRef.current && !appsRef.current.contains(e.target as Node)) {
        setAppsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  const isActive = (href: string) => {
    if (href.startsWith('/dashboard/settings?tab=')) {
      const url = new URL(href, 'http://localhost');
      const tabParam = url.searchParams.get('tab');
      const currentUrl = new URL(window.location.href);
      const currentTab = currentUrl.searchParams.get('tab');
      return pathname === '/dashboard/settings' && tabParam === currentTab;
    }
    return pathname === href;
  };

  // Which section matches the current page (kept in sync on navigation)
  const currentSectionId = useMemo(() => {
    for (const section of sections) {
      if (section.mainHref && pathname === section.mainHref.split('?')[0]) return section.id;
      if (section.items.some((item) => {
        const itemPath = item.href.split('?')[0];
        if (itemPath !== pathname) return false;
        if (item.href.startsWith('/dashboard/settings?tab=')) {
          const tabParam = new URL(item.href, 'http://localhost').searchParams.get('tab');
          return tabParam != null; // settings tab pages belong to settings section
        }
        return true;
      })) return section.id;
    }
    return null;
  }, [pathname, sections]);

  const activeSectionId = openSection ?? currentSectionId;
  const activeSection = sections.find((s) => s.id === activeSectionId) || null;
  const previewSection = sections.find((s) => s.id === hoverSection) || null;

  const handleSectionEnter = (sectionId: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoverSection(sectionId);
  };

  const handleSectionLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHoverSection(null), 180);
  };

  const navigateToSection = (section: SidebarSection) => {
    const href = section.mainHref || section.items[0]?.href;
    setOpenSection(section.id);
    if (href) router.push(href);
  };

  const handleSectionClick = (section: SidebarSection) => {
    setDropdownOpen(false);
    if (section.items.length <= 1) {
      const href = section.mainHref || section.items[0]?.href;
      setOpenSection(null);
      if (href) router.push(href);
      return;
    }
    if (activeSectionId === section.id) {
      setOpenSection(null);
      return;
    }
    navigateToSection(section);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userName = user?.name || 'مستخدم';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="shrink-0 relative z-40" onMouseLeave={handleSectionLeave}>
      {/* ===== Dark main header ===== */}
      <header className="h-16 bg-[#1A1A1A] flex items-center gap-2 px-3 md:px-5">
        {/* Mobile menu */}
        <button onClick={onMenuClick} className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 ml-1 md:ml-4">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center overflow-hidden">
            <Image src="/brand/logo-business.png" alt="نمّي أعمالك" width={28} height={28} className="w-6 h-6 object-contain" />
          </div>
          <span className="hidden lg:block font-black text-sm text-white">نمّي أعمالك</span>
        </Link>

        {/* Section nav (desktop) */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto no-scrollbar">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            const active = activeSectionId === section.id;
            const hovered = hoverSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section)}
                onMouseEnter={() => handleSectionEnter(section.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  active || hovered ? 'text-[#00E5FF] bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {SectionIcon && <SectionIcon size={16} className="shrink-0" />}
                <span>{section.titleAr}</span>
                {section.items.length > 1 && (
                  <ChevronDown
                    size={12}
                    className={`shrink-0 transition-transform duration-300 ${active || hovered ? 'rotate-180' : ''}`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Left utilities */}
        <div className="flex items-center gap-1 mr-auto md:mr-0">
          {/* Apps / all sections grid (desktop) */}
          <div className="relative hidden md:block" ref={appsRef}>
            <button
              onClick={() => setAppsOpen(!appsOpen)}
              onMouseEnter={() => handleSectionEnter('__none__')}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <LayoutGrid size={18} />
            </button>
            <AnimatePresence>
              {appsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
                >
                  <div className="max-h-80 overflow-y-auto">
                    {sections.map((section) => {
                      const SectionIcon = section.icon;
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setAppsOpen(false);
                            handleSectionClick(section);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors text-right"
                        >
                          {SectionIcon && (
                            <SectionIcon size={16} className={`shrink-0 ${SECTION_COLORS[section.id] || 'text-slate-400'}`} />
                          )}
                          <span className="flex-1">{section.titleAr}</span>
                          {section.items.length > 1 && <ChevronDown size={12} className="text-slate-300 -rotate-90" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search (desktop) */}
          <div className="relative hidden lg:block">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="بحث..."
              className="w-48 xl:w-64 bg-white/10 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-xs font-bold text-white placeholder:text-white/40 outline-none focus:bg-white/15 focus:border-[#00E5FF]/40 transition-all"
            />
          </div>

          {/* Notifications */}
          <Link href="/dashboard/notifications" className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Switch back to sidebar mode */}
          <button
            onClick={onSwitchNav}
            title="التبديل إلى القائمة الجانبية"
            className="hidden md:block p-2 text-white/70 hover:text-[#00E5FF] hover:bg-white/10 rounded-xl transition-colors"
          >
            <PanelLeft size={18} />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-xl transition-all"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">{userInitial}</span>
              </div>
              <span className="hidden xl:block text-xs font-black text-white/90">{userName}</span>
              <ChevronDown size={14} className={`hidden xl:block text-white/50 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-slate-50">
                    <div className="text-xs font-black text-slate-900">{userName}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{user?.email || ''}</div>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); router.push('/dashboard/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <User size={16} className="text-slate-400" />
                    الإعدادات
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    تسجيل الخروج
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ===== Hover preview — all branch pages of the hovered section ===== */}
      <AnimatePresence>
        {previewSection && previewSection.items.length > 0 && (
          <motion.div
            key={`preview-${previewSection.id}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-16 right-0 left-0 hidden md:block"
          >
            <div className="mx-3 md:mx-5 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-50">
                {previewSection.icon && (
                  <previewSection.icon size={16} className={SECTION_COLORS[previewSection.id] || 'text-slate-400'} />
                )}
                <span className="text-xs font-black text-slate-900">{previewSection.titleAr}</span>
                <span className="text-[10px] font-bold text-slate-300 mr-auto">{previewSection.items.length} صفحات</span>
              </div>
              <div className="p-2 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0.5 max-h-[60vh] overflow-y-auto">
                {previewSection.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => { setOpenSection(previewSection.id); setHoverSection(null); }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-slate-900/5 text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {ItemIcon && (
                        <span className={`w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 ${active ? 'ring-1 ring-[#00E5FF]/40' : ''}`}>
                          <ItemIcon size={14} className={SECTION_COLORS[previewSection.id] || 'text-slate-400'} />
                        </span>
                      )}
                      <span className="flex-1 text-right">{item.labelAr}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== White sub-section bar (branch pages) ===== */}
      <AnimatePresence initial={false}>
        {activeSection && activeSection.items.length > 0 && (
          <motion.div
            key={activeSection.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="flex items-center gap-1 px-3 md:px-5 py-2.5 overflow-x-auto no-scrollbar">
              {/* Section anchor on the right */}
              <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-100 shrink-0">
                {activeSection.icon && (
                  <activeSection.icon size={16} className={SECTION_COLORS[activeSection.id] || 'text-slate-400'} />
                )}
                <span className="text-xs font-black text-slate-900 whitespace-nowrap">{activeSection.titleAr}</span>
              </div>
              {activeSection.items.map((item) => {
                const ItemIcon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpenSection(null)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      active
                        ? 'text-slate-900 bg-slate-900/5'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {ItemIcon && (
                      <ItemIcon size={14} className={`shrink-0 ${SECTION_COLORS[activeSection.id] || 'text-slate-400'}`} />
                    )}
                    <span>{item.labelAr}</span>
                    {active && (
                      <motion.span
                        layoutId="topnav-active-underline"
                        className="absolute bottom-0 right-3 left-3 h-0.5 bg-[#00E5FF] rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
