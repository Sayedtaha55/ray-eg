import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FileText, X } from 'lucide-react';

interface CustomPage {
  id: string;
  title: string;
  content: string;
  showStandalone?: boolean;
  showInHeader?: boolean;
  showInHome?: boolean;
}

interface CustomPagesWidgetProps {
  config: any;
  primaryColor?: string;
  textColor?: string;
  className?: string;
  showHeader?: boolean;
  showHome?: boolean;
  showModal?: boolean;
  enableHashRouting?: boolean;
}

const CustomPagesWidget: React.FC<CustomPagesWidgetProps> = ({
  config,
  primaryColor = '#0EA5E9',
  textColor = '#0F172A',
  className = '',
  showHeader = true,
  showHome = true,
  showModal = true,
  enableHashRouting = true,
}) => {
  const [activePage, setActivePage] = useState<CustomPage | null>(null);

  const pages = useMemo<CustomPage[]>(() => {
    return Array.isArray(config?.customPages) ? config.customPages : [];
  }, [config?.customPages]);

  const headerPages = useMemo(() => pages.filter((p) => p.showInHeader && p.title), [pages]);
  const homePages = useMemo(() => pages.filter((p) => p.showInHome && p.title), [pages]);

  const findPageById = useCallback((id: string) => {
    return pages.find((p) => p.id === id) || null;
  }, [pages]);

  const openPage = useCallback((page: CustomPage) => {
    if (page.showStandalone) {
      try {
        window.location.hash = `page=${page.id}`;
      } catch {}
    }
    setActivePage(page);
  }, []);

  const closeModal = useCallback(() => {
    try {
      if (window.location.hash.startsWith('#page=')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch {}
    setActivePage(null);
  }, []);

  useEffect(() => {
    if (!enableHashRouting) return;
    const handleHash = () => {
      try {
        const hash = window.location.hash.replace('#', '');
        if (!hash.startsWith('page=')) return;
        const id = hash.replace('page=', '').trim();
        if (!id) return;
        const page = findPageById(id);
        if (page && page.showStandalone) setActivePage(page);
      } catch {}
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [findPageById, enableHashRouting]);

  return (
    <>
      {/* Header links */}
      {showHeader && headerPages.length > 0 && (
        <div className={`flex items-center gap-2 flex-wrap ${className}`}>
          {headerPages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => openPage(page)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-white/80 border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              {page.title}
            </button>
          ))}
        </div>
      )}

      {/* Home sections */}
      {showHome && homePages.length > 0 && (
        <div className="space-y-4 mt-4">
          {homePages.map((page) => (
            <div
              key={page.id}
              className="bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 shadow-sm"
            >
              <h3 className="text-lg sm:text-xl font-black mb-3" style={{ color: textColor }}>
                {page.title}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed whitespace-pre-wrap">
                {page.content || 'لا يوجد محتوى.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && activePage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 text-right" dir="rtl">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-5 sm:p-6 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">{activePage.title}</h3>
              <button
                type="button"
                onClick={closeModal}
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                {activePage.content || 'لا يوجد محتوى لهذه الصفحة.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomPagesWidget;
export type { CustomPage, CustomPagesWidgetProps };
