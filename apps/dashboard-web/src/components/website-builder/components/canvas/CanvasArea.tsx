import React, { useRef } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { ComponentRenderer } from './ComponentRenderer';
import { SelectionOverlay } from './SelectionOverlay';
import { ContextToolbar } from './ContextToolbar';

export const CanvasArea: React.FC = () => {
  const { website, activePage, viewport, zoom, selectNode, isRtl, isThemeLoading } = useBuilder();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Compute Viewport Frame Width
  const getViewportWidth = () => {
    switch (viewport) {
      case 'desktop':
        return '100%';
      case 'tablet':
        return '768px';
      case 'mobile':
        return '100%';
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If clicked directly on canvas background, deselect
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).id === 'canvas_viewport_wrapper'
    ) {
      selectNode(null);
    }
  };

  return (
    <main
      ref={canvasContainerRef}
      id="canvas_main_container"
      className="flex-1 h-[calc(100vh-3.5rem)] bg-slate-100/80 overflow-y-auto overflow-x-hidden sm:overflow-x-auto relative flex flex-col items-center min-h-0 transition-all"
      onClick={handleCanvasClick}
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Context Toolbar for Selected Element (Only visible when editing a node) */}
      <ContextToolbar />

      {/* Viewport Frame Container */}
      <div
        id="canvas_viewport_wrapper"
        className="w-full flex justify-center py-2 sm:py-6 px-0 sm:px-6 pb-36 transition-all max-w-full"
      >
        <div
          className="transition-all duration-300 origin-top flex flex-col shadow-xl rounded-none sm:rounded-2xl overflow-hidden border-x-0 sm:border border-slate-300/80 bg-white w-full sm:w-auto"
          style={{
            width: viewport === 'mobile' ? 'min(100%, 430px)' : getViewportWidth(),
            maxWidth: viewport === 'desktop' ? '1200px' : viewport === 'tablet' ? '768px' : '430px',
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          {/* Mobile / Tablet Simulated Device Header Frame (Visible only on desktop simulation) */}
          {viewport !== 'desktop' && (
            <div className="hidden sm:flex h-7 bg-slate-900 text-white items-center justify-between px-4 text-[10px] font-mono select-none shrink-0">
              <span>9:41</span>
              <div className="w-16 h-3 bg-slate-800 rounded-full" />
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Page Component Tree Render */}
          <div
            className="w-full min-h-[900px] flex flex-col"
            style={{
              backgroundColor: website.theme?.colors?.background || '#ffffff',
              color: website.theme?.colors?.textPrimary || '#0f172a',
              fontFamily: website.theme?.typography?.fontBody || 'Cairo, sans-serif',
            }}
          >
            {isThemeLoading || !website?.components[activePage.rootNodeId] ? (
              <div className="w-full p-6 sm:p-12 space-y-8 animate-pulse text-right">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="w-32 h-8 bg-slate-200 rounded-xl" />
                  <div className="hidden sm:flex gap-4">
                    <div className="w-16 h-4 bg-slate-100 rounded" />
                    <div className="w-20 h-4 bg-slate-100 rounded" />
                    <div className="w-16 h-4 bg-slate-100 rounded" />
                  </div>
                  <div className="w-24 h-9 bg-slate-200 rounded-xl" />
                </div>

                {/* Hero Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 items-center">
                  <div className="space-y-4">
                    <div className="w-28 h-6 bg-blue-100 rounded-full" />
                    <div className="w-3/4 h-10 bg-slate-200 rounded-xl" />
                    <div className="w-full h-16 bg-slate-100 rounded-xl" />
                    <div className="flex gap-3 pt-2">
                      <div className="w-32 h-11 bg-slate-200 rounded-xl" />
                      <div className="w-24 h-11 bg-slate-100 rounded-xl" />
                    </div>
                  </div>
                  <div className="w-full aspect-16/10 bg-slate-200 rounded-2xl" />
                </div>

                {/* Cards Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-slate-100 rounded-2xl p-4 space-y-3">
                      <div className="w-full aspect-16/10 bg-slate-200 rounded-xl" />
                      <div className="w-2/3 h-5 bg-slate-200 rounded" />
                      <div className="w-full h-8 bg-slate-100 rounded" />
                      <div className="w-1/3 h-6 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ComponentRenderer nodeId={activePage.rootNodeId} />
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb / Path Overlay at bottom */}
      <SelectionOverlay />
    </main>
  );
};
