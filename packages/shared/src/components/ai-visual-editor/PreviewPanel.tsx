import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Undo2, Redo2, History, Eye, RotateCcw } from 'lucide-react';
import type { AiVisualChange, HistoryEntry } from './types';
import { getComponentFromRegistry } from './ComponentRegistry';

interface PreviewPanelProps {
  open: boolean;
  pendingChange: AiVisualChange | null;
  beforeDescription: string;
  afterDescription: string;
  onApply: () => void;
  onCancel: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  open,
  pendingChange,
  beforeDescription,
  afterDescription,
  onApply,
  onCancel,
}) => {
  if (!open || !pendingChange) return null;

  const registryEntry = getComponentFromRegistry(pendingChange.component);
  const changes = pendingChange.changes;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        dir="rtl"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-[500px] max-w-[90vw] rounded-2xl bg-white shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-3 bg-gradient-to-l from-cyan-500 to-violet-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-black">معاينة التعديلات</span>
            </div>
            <button onClick={onCancel} className="p-1 rounded-lg hover:bg-white/20">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Before / After */}
          <div className="grid grid-cols-2 gap-3 p-4">
            {/* Before */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400">قبل</span>
              </div>
              <div className="p-3 space-y-1.5 min-h-[120px]">
                <p className="text-[11px] text-slate-500">{beforeDescription}</p>
              </div>
            </div>

            {/* After */}
            <div className="rounded-xl border-2 border-cyan-300 overflow-hidden">
              <div className="px-3 py-2 bg-cyan-50 border-b border-cyan-100">
                <span className="text-[10px] font-bold text-cyan-600">بعد</span>
              </div>
              <div className="p-3 space-y-1.5 min-h-[120px]">
                <p className="text-[11px] text-slate-700 font-medium">{afterDescription}</p>
              </div>
            </div>
          </div>

          {/* Changes detail */}
          <div className="px-4 pb-3">
            <p className="text-[10px] font-bold text-slate-400 mb-1.5">التغييرات:</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(changes).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold">{key}:</span>
                  <span className="text-[10px] text-cyan-600 font-mono font-bold">
                    {typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}
                  </span>
                </div>
              ))}
              {pendingChange.contentChanges && Object.entries(pendingChange.contentChanges).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 border border-violet-100">
                  <span className="text-[9px] text-violet-400 font-bold">{key}:</span>
                  <span className="text-[10px] text-violet-600 font-bold">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-t border-slate-100">
            <button
              onClick={onApply}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-white text-sm font-bold hover:from-cyan-500 hover:to-emerald-600 transition-all shadow-md"
            >
              <Check className="w-4 h-4" />
              تطبيق
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PreviewPanel;

// ─── History System Hook ──────────────────────────────────────

export function useHistory<T extends HistoryEntry>() {
  const [history, setHistory] = useState<T[]>([]);
  const [index, setIndex] = useState(-1);
  const maxHistory = useRef(50);

  const push = useCallback((entry: T) => {
    setHistory((prev) => {
      const truncated = prev.slice(0, index + 1);
      const next = [...truncated, entry];
      if (next.length > maxHistory.current) next.shift();
      setIndex(next.length - 1);
      return next;
    });
  }, [index]);

  const undo = useCallback((): T | null => {
    if (index <= 0) return null;
    const newIndex = index - 1;
    setIndex(newIndex);
    return history[newIndex] || null;
  }, [history, index]);

  const redo = useCallback((): T | null => {
    if (index >= history.length - 1) return null;
    const newIndex = index + 1;
    setIndex(newIndex);
    return history[newIndex] || null;
  }, [history, index]);

  const clear = useCallback(() => {
    setHistory([]);
    setIndex(-1);
  }, []);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;
  const current = history[index] || null;

  return { history, index, current, push, undo, redo, clear, canUndo, canRedo };
}

// ─── History Toolbar Component ────────────────────────────────

interface HistoryToolbarProps {
  history: HistoryEntry[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export const HistoryToolbar: React.FC<HistoryToolbarProps> = ({
  history,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (history.length === 0) return null;

  return (
    <div className="fixed bottom-12 left-3 z-[100000] flex flex-col gap-1" dir="rtl">
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-30"
          title="تراجع"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-30"
          title="إعادة"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-600" />
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-slate-700 transition-colors text-[10px] font-bold"
        >
          <History className="w-3 h-3" />
          {history.length}
        </button>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-red-500/30 transition-colors"
          title="مسح السجل"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="rounded-xl bg-slate-900/95 backdrop-blur-md text-white shadow-2xl border border-slate-700 overflow-hidden max-h-[300px] overflow-y-auto"
          >
            {history.map((entry, i) => (
              <div
                key={entry.id}
                className={`px-3 py-2 border-b border-slate-700/50 last:border-0 ${
                  i === history.length - 1 ? 'bg-cyan-500/10' : ''
                }`}
              >
                <p className="text-[10px] font-bold text-cyan-300">{entry.componentName}</p>
                <p className="text-[9px] text-slate-400">{entry.description}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
