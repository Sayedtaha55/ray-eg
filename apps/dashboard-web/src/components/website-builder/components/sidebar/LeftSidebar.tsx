import React, { useState } from 'react';
import {
  Layers,
  LayoutGrid,
  FileText,
  Palette,
  Globe,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { LayersPanel } from './LayersPanel';
import { SectionLibraryPanel } from './SectionLibraryPanel';
import { PagesPanel } from './PagesPanel';
import { DesignSystemPanel } from './DesignSystemPanel';
import { SeoPanel } from './SeoPanel';

export const LeftSidebar: React.FC = () => {
  const { activeSidebarTab, setActiveSidebarTab } = useBuilder();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isExpandedWidth, setIsExpandedWidth] = useState(false);

  const navItems = [
    { id: 'layers', label: 'الطبقات', icon: Layers },
    { id: 'sections', label: 'الأقسام', icon: LayoutGrid },
    { id: 'pages', label: 'الصفحات', icon: FileText },
    { id: 'design', label: 'السمة', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Globe },
  ] as const;

  const handleTabClick = (tabId: typeof activeSidebarTab) => {
    if (activeSidebarTab === tabId && isDrawerOpen) {
      // Toggle collapse if clicking the active tab
      setIsDrawerOpen(false);
    } else {
      setActiveSidebarTab(tabId);
      setIsDrawerOpen(true);
    }
  };

  const getActiveTabTitle = () => {
    const current = navItems.find((n) => n.id === activeSidebarTab);
    return current ? current.label : '';
  };

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] bg-white border-l border-slate-200 flex select-none shrink-0 z-20 shadow-xs transition-all duration-200 ${
        isDrawerOpen
          ? isExpandedWidth
            ? 'w-[320px] sm:w-[400px] md:w-[440px]'
            : 'w-[260px] sm:w-[320px] md:w-[360px]'
          : 'w-12 sm:w-14'
      }`}
    >
      {/* Navigation Rail (Leftmost) */}
      <div className="w-12 sm:w-14 bg-slate-50 border-l border-slate-200 flex flex-col items-center py-2.5 sm:py-3 justify-between shrink-0">
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-full">
          {navItems.map((item) => {
            const isActive = activeSidebarTab === item.id && isDrawerOpen;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                title={item.label}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[8px] sm:text-[9px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Expand / Collapse Toggle Button */}
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          title={isDrawerOpen ? 'طي القائمة الجانبية' : 'فتح القائمة الجانبية'}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 transition-colors cursor-pointer"
        >
          {isDrawerOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Panel Drawer Container */}
      {isDrawerOpen && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white min-w-0 animate-in fade-in duration-150">
          {/* Drawer Top Header with Close & Resize Action */}
          <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
            <span className="text-xs font-bold text-slate-800">{getActiveTabTitle()}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpandedWidth(!isExpandedWidth)}
                className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors font-medium cursor-pointer"
                title={isExpandedWidth ? 'عرض عادي' : 'عرض واسع'}
              >
                {isExpandedWidth ? 'تضييق' : 'توسيع'}
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="إخفاء اللوحة"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {activeSidebarTab === 'layers' && <LayersPanel />}
            {activeSidebarTab === 'sections' && <SectionLibraryPanel />}
            {activeSidebarTab === 'pages' && <PagesPanel />}
            {activeSidebarTab === 'design' && <DesignSystemPanel />}
            {activeSidebarTab === 'seo' && <SeoPanel />}
          </div>
        </div>
      )}
    </aside>
  );
};

