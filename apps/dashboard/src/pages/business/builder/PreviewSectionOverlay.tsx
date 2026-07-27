import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, Layers, Eye, X } from 'lucide-react';
import { inspectElement, isInteractiveElement } from '@/components/ai-visual-editor/domInspector';
import { getComponentFromRegistry } from '@/components/ai-visual-editor/ComponentRegistry';
import type { ElementInspectionData } from '@/components/ai-visual-editor/types';

interface PreviewSectionOverlayProps {
  containerSelector?: string;
  isBookingActivity?: boolean;
  active: boolean;
}

interface BoxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const PreviewSectionOverlay: React.FC<PreviewSectionOverlayProps> = ({
  containerSelector = '.preview-scroll-container',
  active,
}) => {
  const [hoverBox, setHoverBox] = useState<BoxRect | null>(null);
  const [hoveredData, setHoveredData] = useState<ElementInspectionData | null>(null);
  const [selectedBox, setSelectedBox] = useState<BoxRect | null>(null);
  const [selectedData, setSelectedData] = useState<ElementInspectionData | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerEl = useRef<HTMLElement | null>(null);
  const lastInspectEl = useRef<HTMLElement | null>(null);

  // ─── Find the preview container ─────────────────────────────

  useEffect(() => {
    if (!active) return;
    const find = () => {
      const el = document.querySelector(containerSelector) as HTMLElement | null;
      if (el) {
        containerEl.current = el;
        return true;
      }
      return false;
    };
    if (!find()) {
      const interval = setInterval(() => {
        if (find()) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [active, containerSelector]);

  // ─── Mouse move: highlight ANY element under cursor ─────────

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!active || !containerEl.current) return;

      const target = e.target as HTMLElement;
      if (!target) return;
      if (overlayRef.current?.contains(target)) return;
      if (!containerEl.current.contains(target)) {
        setHoverBox(null);
        setHoveredData(null);
        return;
      }
      if (isInteractiveElement(target)) return;

      const rect = target.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) return;

      setHoverBox({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });

      // Throttled inspection
      if (target !== lastInspectEl.current) {
        lastInspectEl.current = target;
        const data = inspectElement(target);
        setHoveredData(data);
      }
    },
    [active],
  );

  // ─── Click: select element ──────────────────────────────────

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!active || !containerEl.current) return;

      const target = e.target as HTMLElement;
      if (!target || overlayRef.current?.contains(target)) return;
      if (!containerEl.current.contains(target)) return;
      if (isInteractiveElement(target)) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = target.getBoundingClientRect();
      const data = inspectElement(target);

      setSelectedBox({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
      setSelectedData(data);

      // Dispatch new element-level event
      window.dispatchEvent(
        new CustomEvent('builder-ai-element-select', {
          detail: {
            inspection: data,
            sectionId: data.componentName,
            sectionLabel: getComponentFromRegistry(data.componentName)?.labelAr || data.componentName,
          },
        })
      );

      // Backward compat event
      window.dispatchEvent(
        new CustomEvent('builder-ai-section-select', {
          detail: {
            sectionId: data.componentName,
            sectionLabel: getComponentFromRegistry(data.componentName)?.labelAr || data.componentName,
          },
        })
      );
    },
    [active],
  );

  // ─── Attach / detach listeners ──────────────────────────────

  useEffect(() => {
    if (!active) {
      setHoverBox(null);
      setHoveredData(null);
      setSelectedBox(null);
      setSelectedData(null);
      return;
    }

    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, [active, handleMouseMove, handleClick]);

  // ─── Clear selection on escape ──────────────────────────────

  useEffect(() => {
    if (!active) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBox(null);
        setSelectedData(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [active]);

  // ─── Update selected box position on scroll/resize ──────────

  useEffect(() => {
    if (!active || !selectedData) return;
    const updatePos = () => {
      const el = document.elementFromPoint(
        selectedBox!.x + selectedBox!.w / 2,
        selectedBox!.y + selectedBox!.h / 2,
      ) as HTMLElement | null;
      if (el && containerEl.current?.contains(el)) {
        const rect = el.getBoundingClientRect();
        setSelectedBox({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
      }
    };
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [active, selectedData, selectedBox]);

  if (!active) return null;

  const hoveredRegistry = hoveredData ? getComponentFromRegistry(hoveredData.componentName) : null;
  const selectedRegistry = selectedData ? getComponentFromRegistry(selectedData.componentName) : null;

  return (
    <>
      {/* Hover highlight — follows cursor, NO fixed boxes */}
      <AnimatePresence>
        {hoverBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'fixed',
              left: hoverBox.x,
              top: hoverBox.y,
              width: hoverBox.w,
              height: hoverBox.h,
              pointerEvents: 'none',
              zIndex: 99998,
            }}
            className="border-2 border-cyan-400 bg-cyan-400/5 rounded-md"
          >
            {hoveredData && (
              <div
                style={{ position: 'absolute', top: -22, left: 0 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-500 text-white text-[10px] font-bold whitespace-nowrap shadow-lg"
              >
                <Layers className="w-2.5 h-2.5" />
                {hoveredData.componentName}
                {hoveredRegistry && (
                  <span className="opacity-70">· {hoveredRegistry.labelAr}</span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected element — persistent highlight */}
      <AnimatePresence>
        {selectedBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              left: selectedBox.x,
              top: selectedBox.y,
              width: selectedBox.w,
              height: selectedBox.h,
              pointerEvents: 'none',
              zIndex: 99997,
            }}
            className="border-2 border-violet-500 bg-violet-500/5 rounded-md"
          >
            {selectedData && (
              <div
                style={{ position: 'absolute', top: -22, left: 0 }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-violet-500 text-white text-[10px] font-bold whitespace-nowrap shadow-lg"
              >
                <MousePointer2 className="w-2.5 h-2.5" />
                {selectedData.componentName}
                {selectedRegistry && (
                  <span className="opacity-70">· {selectedRegistry.labelAr}</span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedBox(null); setSelectedData(null); }}
                  className="ml-1 hover:bg-white/20 rounded p-0.5"
                  style={{ pointerEvents: 'auto' }}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar — Edit Mode indicator */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        style={{ position: 'fixed', top: 6, left: '50%', transform: 'translateX(-50%)', zIndex: 99999 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700"
        dir="rtl"
      >
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-[11px] font-bold">
          {hoveredData
            ? `${hoveredData.componentName} — ${Math.round(hoveredData.boundingRect.width)}×${Math.round(hoveredData.boundingRect.height)}`
            : 'اضغط على أي عنصر لتحديده'}
        </span>
      </motion.div>

      {/* Bottom info bar */}
      {hoveredData && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          style={{ position: 'fixed', bottom: 6, left: '50%', transform: 'translateX(-50%)', zIndex: 99999 }}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700 max-w-[90vw]"
          dir="rtl"
        >
          <div className="flex items-center gap-1 text-[9px]">
            <Eye className="w-2.5 h-2.5 text-cyan-400" />
            <span className="text-slate-400">DOM:</span>
            <span className="font-mono text-cyan-300 truncate max-w-[180px]">
              {hoveredData.domPath}
            </span>
          </div>
          <div className="w-px h-3 bg-slate-600" />
          <div className="flex items-center gap-1 text-[9px]">
            <span className="text-slate-400">النص:</span>
            <span className="text-emerald-300 truncate max-w-[120px]">
              {hoveredData.textContent?.slice(0, 40) || '—'}
            </span>
          </div>
          {hoveredData.computedStyles.color && (
            <>
              <div className="w-px h-3 bg-slate-600" />
              <div className="flex items-center gap-1 text-[9px]">
                <div
                  className="w-2.5 h-2.5 rounded border border-slate-600"
                  style={{ backgroundColor: hoveredData.computedStyles.color }}
                />
                <div
                  className="w-2.5 h-2.5 rounded border border-slate-600"
                  style={{ backgroundColor: hoveredData.computedStyles.backgroundColor }}
                />
              </div>
            </>
          )}
        </motion.div>
      )}
    </>
  );
};

export default PreviewSectionOverlay;
