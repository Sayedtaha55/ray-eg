import React, { useState } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Zap,
  Globe,
  Languages,
  CheckCircle,
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import { ComponentRenderer } from '../canvas/ComponentRenderer';
import { ViewportBreakpoint } from '../../types/builder';

export const LivePreviewModal: React.FC = () => {
  const {
    isLivePreviewOpen,
    setIsLivePreviewOpen,
    website,
    activePage,
    switchPage,
    currentTenant,
    isRtl,
    setIsRtl,
  } = useBuilder();

  const [previewViewport, setPreviewViewport] = useState<ViewportBreakpoint>('desktop');

  if (!isLivePreviewOpen) return null;

  const getContainerWidth = () => {
    switch (previewViewport) {
      case 'desktop':
        return '100%';
      case 'tablet':
        return 'min(100%, 768px)';
      case 'mobile':
        return 'min(100%, 390px)';
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex flex-col bg-slate-900 text-slate-100 animate-in fade-in duration-200 select-none">
      {/* Live Preview Top Control Bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2">
        {/* Left: Domain & Page Navigator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden min-[600px]:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">https://{currentTenant.customDomain || 'almajd-motors.com'}</span>
          </div>

          <div className="flex items-center gap-1">
            {website.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => switchPage(p.id)}
                className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  p.id === activePage.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Responsive Viewport Switcher */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setPreviewViewport('desktop')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              previewViewport === 'desktop' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setPreviewViewport('tablet')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              previewViewport === 'tablet' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setPreviewViewport('mobile')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              previewViewport === 'mobile' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Core Web Vitals & Close */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 bg-emerald-950/70 border border-emerald-800 px-3 py-1 rounded-full text-xs font-mono text-emerald-400">
            <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>Next.js 15 RSC | 98/100 Core Vitals</span>
          </div>

          <button
            onClick={() => setIsRtl(!isRtl)}
            title="تبديل RTL / LTR"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
          >
            <Languages className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsLivePreviewOpen(false)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* Frame Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-900/90 flex justify-center items-start p-2 sm:p-6 pb-24 min-h-0">
        <div
          className="bg-white text-slate-900 transition-all duration-300 rounded-xl overflow-hidden shadow-2xl min-h-[90vh] flex flex-col mb-12"
          style={{
            width: getContainerWidth(),
            maxWidth: previewViewport === 'desktop' ? '1280px' : getContainerWidth(),
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          <ComponentRenderer
            nodeId={activePage.rootNodeId}
            isInteractivePreview={true}
            overrideViewport={previewViewport}
          />
        </div>
      </div>
    </div>
  );
};
