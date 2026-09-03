import React, { useRef } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { ComponentRenderer } from './ComponentRenderer';
import { SelectionOverlay } from './SelectionOverlay';
import { ContextToolbar } from './ContextToolbar';

export const CanvasArea: React.FC = () => {
  const { website, activePage, viewport, zoom, selectNode, isRtl } = useBuilder();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Compute Viewport Frame Width
  const getViewportWidth = () => {
    switch (viewport) {
      case 'desktop':
        return '100%';
      case 'tablet':
        return '768px';
      case 'mobile':
        return '390px';
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If clicked directly on canvas background, deselect
    if (e.target === e.currentTarget || (e.target as HTMLElement).id === 'canvas_viewport_wrapper') {
      selectNode(null);
    }
  };

  return (
    <main
      ref={canvasContainerRef}
      id="canvas_main_container"
      className="flex-1 h-[calc(100vh-3.5rem)] bg-slate-100/80 overflow-y-auto overflow-x-hidden relative flex flex-col items-center min-h-0"
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
        className="w-full flex justify-center py-6 px-4 pb-36"
      >
        <div
          className="transition-all duration-300 origin-top flex flex-col shadow-xl rounded-2xl overflow-hidden border border-slate-300/80 bg-white"
          style={{
            width: getViewportWidth(),
            maxWidth: viewport === 'desktop' ? '1280px' : getViewportWidth(),
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          {/* Mobile / Tablet Simulated Device Header Frame */}
          {viewport !== 'desktop' && (
            <div className="h-7 bg-slate-900 text-white flex items-center justify-between px-4 text-[10px] font-mono select-none shrink-0">
              <span>9:41</span>
              <div className="w-16 h-3 bg-slate-800 rounded-full" />
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* Page Component Tree Render */}
          <div className="w-full min-h-[900px] bg-white text-slate-900 flex flex-col">
            <ComponentRenderer nodeId={activePage.rootNodeId} />
          </div>
        </div>
      </div>

      {/* Breadcrumb / Path Overlay at bottom */}
      <SelectionOverlay />
    </main>
  );
};
