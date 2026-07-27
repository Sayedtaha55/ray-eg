import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, X, Eye, Layers } from 'lucide-react';
import type { ElementInspectionData } from './types';
import { inspectElement, isInteractiveElement } from './domInspector';
import { getComponentFromRegistry } from './ComponentRegistry';

interface EditModeOverlayProps {
  active: boolean;
  onElementSelect: (data: ElementInspectionData, element: HTMLElement) => void;
  onExit: () => void;
}

const EditModeOverlay: React.FC<EditModeOverlayProps> = ({
  active,
  onElementSelect,
  onExit,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const [hoveredData, setHoveredData] = useState<ElementInspectionData | null>(null);
  const [overlayRect, setOverlayRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // ─── Handle mouse move to highlight elements ────────────────

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!active) return;

      // Ignore overlay itself
      const target = e.target as HTMLElement;
      if (!target || target === overlayRef.current) return;
      if (overlayRef.current?.contains(target)) return;

      // Skip interactive elements
      if (isInteractiveElement(target)) return;

      // Skip tiny elements
      const rect = target.getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20) return;

      setHoveredEl(target);
      setOverlayRect({
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
      });
    },
    [active],
  );

  // ─── Handle click to select element ──────────────────────────

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!active) return;
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      if (!target || overlayRef.current?.contains(target)) return;
      if (isInteractiveElement(target)) return;

      const data = inspectElement(target);
      setHoveredData(data);
      onElementSelect(data, target);
    },
    [active, onElementSelect],
  );

  // ─── Attach/detach listeners ────────────────────────────────

  useEffect(() => {
    if (!active) {
      setHoveredEl(null);
      setOverlayRect(null);
      return;
    }

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);

    // Disable pointer events on overlay so it doesn't block
    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, [active, handleMouseMove, handleClick]);

  // ─── Update hovered data on hover change ────────────────────

  useEffect(() => {
    if (hoveredEl && active) {
      const data = inspectElement(hoveredEl);
      setHoveredData(data);
    }
  }, [hoveredEl, active]);

  if (!active) return null;

  const registryEntry = hoveredData ? getComponentFromRegistry(hoveredData.componentName) : null;

  return (
    <>
      {/* Highlight overlay */}
      <AnimatePresence>
        {overlayRect && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              left: overlayRect.x,
              top: overlayRect.y,
              width: overlayRect.w,
              height: overlayRect.h,
              pointerEvents: 'none',
              zIndex: 99998,
            }}
            className="border-2 border-cyan-400 bg-cyan-400/5 rounded-lg"
          >
            {/* Label badge */}
            {hoveredData && (
              <div
                style={{ position: 'absolute', top: -28, left: 0 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-cyan-500 text-white text-[10px] font-bold whitespace-nowrap shadow-lg"
              >
                <Layers className="w-3 h-3" />
                {hoveredData.componentName}
                {registryEntry && (
                  <span className="opacity-70">
                    · {registryEntry.labelAr}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar — Edit Mode indicator */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 99999 }}
        className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold">
            {hoveredData ? (
              <span className="flex items-center gap-1.5">
                <MousePointer2 className="w-3 h-3 text-cyan-400" />
                {hoveredData.componentName}
              </span>
            ) : (
              'Edit Mode — اضغط على أي عنصر'
            )}
          </span>
        </div>

        <div className="w-px h-4 bg-slate-600" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-700 hover:bg-red-500/80 transition-colors text-[11px] font-bold"
        >
          <X className="w-3 h-3" />
          خروج
        </button>
      </motion.div>

      {/* Bottom info bar */}
      {hoveredData && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          style={{ position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 99999 }}
          className="flex items-center gap-4 px-4 py-2 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700 max-w-[90vw]"
        >
          <div className="flex items-center gap-1.5 text-[10px]">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">DOM:</span>
            <span className="font-mono text-cyan-300 truncate max-w-[200px]">
              {hoveredData.domPath}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-600" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-slate-400">Size:</span>
            <span className="font-mono text-emerald-300">
              {Math.round(hoveredData.boundingRect.width)}×{Math.round(hoveredData.boundingRect.height)}
            </span>
          </div>
          {hoveredData.computedStyles.color && (
            <>
              <div className="w-px h-4 bg-slate-600" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-400">Color:</span>
                <div
                  className="w-3 h-3 rounded border border-slate-600"
                  style={{ backgroundColor: hoveredData.computedStyles.color }}
                />
              </div>
            </>
          )}
        </motion.div>
      )}
    </>
  );
};

export default EditModeOverlay;
