import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import EditModeOverlay from './EditModeOverlay';
import AiAssistantPanel from './AiAssistantPanel';
import PreviewPanel, { HistoryToolbar, useHistory } from './PreviewPanel';
import { inspectElement } from './domInspector';
import { applyComponentOverrides, changesToTokenOverrides, snapshotTokensFromElement } from './ThemeTokenSystem';
import { getComponentFromRegistry } from './ComponentRegistry';
import { ApiService } from '@/services/api.service';
import { useDesignTokens } from '@/utils/designTokens';
import type {
  ElementInspectionData,
  AiVisualChange,
  HistoryEntry,
  VisualEditorState,
  EditModeState,
} from './types';
import type { DesignTokens } from '@/types/pageSchema';

// ─── Context ──────────────────────────────────────────────────

interface AiVisualEditorContextValue {
  editMode: boolean;
  enterEditMode: () => void;
  exitEditMode: () => void;
  toggleEditMode: () => void;
  isProcessing: boolean;
}

const AiVisualEditorContext = createContext<AiVisualEditorContextValue | null>(null);

export function useAiVisualEditor(): AiVisualEditorContextValue | null {
  return useContext(AiVisualEditorContext);
}

// ─── Provider Props ───────────────────────────────────────────

interface AiVisualEditorProviderProps {
  shopId?: string;
  locale?: string;
  designTokens?: DesignTokens | null;
  onTokensChange?: (tokens: Partial<DesignTokens>) => void;
  onSave?: () => void;
  children: ReactNode;
}

// ─── Provider Component ───────────────────────────────────────

export const AiVisualEditorProvider: React.FC<AiVisualEditorProviderProps> = ({
  shopId,
  locale = 'ar',
  designTokens,
  onTokensChange,
  onSave,
  children,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [mode, setMode] = useState<EditModeState>('idle');
  const [selectedInspection, setSelectedInspection] = useState<ElementInspectionData | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [pendingChange, setPendingChange] = useState<AiVisualChange | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [beforeSnapshot, setBeforeSnapshot] = useState<Partial<DesignTokens> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const historyHook = useHistory<HistoryEntry>();

  // Apply design tokens live
  useDesignTokens(designTokens || null);

  // ─── Enter / Exit Edit Mode ─────────────────────────────────

  const enterEditMode = useCallback(() => {
    setEditMode(true);
    setMode('inspecting');
  }, []);

  const exitEditMode = useCallback(() => {
    setEditMode(false);
    setMode('idle');
    setSelectedInspection(null);
    setSelectedElement(null);
    setPendingChange(null);
    setShowPanel(false);
    setShowPreview(false);
    setAiReply(null);
    elementRef.current = null;
  }, []);

  const toggleEditMode = useCallback(() => {
    if (editMode) exitEditMode();
    else enterEditMode();
  }, [editMode, enterEditMode, exitEditMode]);

  // ─── Element Selection ──────────────────────────────────────

  const handleElementSelect = useCallback(
    (data: ElementInspectionData, element: HTMLElement) => {
      // Only allow registered components
      if (!getComponentFromRegistry(data.componentName)) {
        // Try to find closest registered ancestor
        let parent = element.parentElement;
        while (parent && !getComponentFromRegistry(
          // Re-inspect parent
          inspectElement(parent).componentName
        )) {
          parent = parent.parentElement;
          if (!parent || parent === document.body) break;
        }
        if (parent) {
          const parentData = inspectElement(parent);
          setSelectedInspection(parentData);
          setSelectedElement(parent);
          elementRef.current = parent;
        } else {
          // No registered component found — still allow editing as Custom
          data.componentName = 'Custom';
          setSelectedInspection(data);
          setSelectedElement(element);
          elementRef.current = element;
        }
      } else {
        setSelectedInspection(data);
        setSelectedElement(element);
        elementRef.current = element;
      }

      // Snapshot current tokens for before/after
      if (elementRef.current) {
        setBeforeSnapshot(snapshotTokensFromElement(elementRef.current));
      }

      setMode('selected');
      setShowPanel(true);
      setAiReply(null);
    },
    [],
  );

  // ─── Apply Change (from suggestion or AI response) ──────────

  const handleApplyChange = useCallback(
    (change: AiVisualChange) => {
      if (!elementRef.current) return;

      // If change has no changes (initial prompt), send to AI
      if (!change.changes || Object.keys(change.changes).length === 0) {
        // This is a prompt-based request — handled by handleSendPrompt
        return;
      }

      // For suggestion clicks: apply directly with preview
      setPendingChange(change);
      setShowPreview(true);
    },
    [],
  );

  // ─── Send Prompt to AI ──────────────────────────────────────

  const handleSendPrompt = useCallback(
    async (prompt: string) => {
      if (!shopId || !selectedInspection || !prompt.trim()) return;

      setIsProcessing(true);
      setMode('ai-processing');
      setAiReply(null);

      try {
        const result = await ApiService.aiVisualEdit({
          shopId,
          componentName: selectedInspection.componentName,
          elementInspection: selectedInspection,
          userPrompt: prompt,
          locale,
        });

        if (result.applied && result.change) {
          const change: AiVisualChange = {
            component: result.change.component as any,
            changes: result.change.changes,
            contentChanges: result.change.contentChanges,
          };
          setPendingChange(change);
          setShowPreview(true);
          setAiReply(result.reply);
        } else {
          setAiReply(result.reply);
        }
      } catch (err: any) {
        setAiReply(
          locale === 'ar'
            ? `حدث خطأ: ${err.message || 'تعذر معالجة الطلب'}`
            : `Error: ${err.message || 'Failed to process'}`,
        );
      } finally {
        setIsProcessing(false);
        setMode('selected');
      }
    },
    [shopId, selectedInspection, locale],
  );

  // ─── Confirm Apply (from preview) ───────────────────────────

  const handleConfirmApply = useCallback(() => {
    if (!elementRef.current || !pendingChange) return;

    // Apply overrides to the element
    applyComponentOverrides(elementRef.current, pendingChange.changes);

    // Convert to token overrides and propagate up
    const tokenOverrides = changesToTokenOverrides(pendingChange.changes);
    if (onTokensChange) onTokensChange(tokenOverrides);

    // Push to history
    const entry: HistoryEntry = {
      id: `hist-${Date.now()}`,
      timestamp: Date.now(),
      componentName: pendingChange.component,
      description: aiReply || 'Visual change applied',
      beforeTokens: beforeSnapshot || {},
      afterTokens: tokenOverrides,
      beforeChange: null,
      afterChange: pendingChange,
    };
    historyHook.push(entry);

    // Reset
    setShowPreview(false);
    setPendingChange(null);
    setMode('selected');
  }, [pendingChange, beforeSnapshot, aiReply, onTokensChange, historyHook]);

  // ─── Cancel Preview ─────────────────────────────────────────

  const handleCancelPreview = useCallback(() => {
    setShowPreview(false);
    setPendingChange(null);
    setMode('selected');
  }, []);

  // ─── Undo / Redo ────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    const entry = historyHook.undo();
    if (entry && elementRef.current) {
      // Revert to before tokens
      const tokens = entry.beforeTokens;
      if (tokens.colors) {
        Object.entries(tokens.colors).forEach(([key, val]) => {
          if (val) elementRef.current!.style.setProperty(`--brand-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, val as string);
        });
      }
    }
  }, [historyHook]);

  const handleRedo = useCallback(() => {
    const entry = historyHook.redo();
    if (entry && elementRef.current && entry.afterChange) {
      applyComponentOverrides(elementRef.current, entry.afterChange.changes);
    }
  }, [historyHook]);

  // ─── Keyboard shortcuts ─────────────────────────────────────

  useEffect(() => {
    if (!editMode) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPreview) handleCancelPreview();
        else if (showPanel) { setShowPanel(false); setMode('inspecting'); }
        else exitEditMode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [editMode, showPreview, showPanel, handleCancelPreview, exitEditMode, handleUndo, handleRedo]);

  // ─── Context value ──────────────────────────────────────────

  const contextValue: AiVisualEditorContextValue = {
    editMode,
    enterEditMode,
    exitEditMode,
    toggleEditMode,
    isProcessing,
  };

  // ─── Build before/after descriptions ────────────────────────

  const beforeDesc = selectedInspection
    ? `${selectedInspection.componentName} — ${selectedInspection.computedStyles.color} / ${selectedInspection.computedStyles.backgroundColor} / ${selectedInspection.computedStyles.borderRadius}`
    : '';

  const afterDesc = pendingChange
    ? Object.entries(pendingChange.changes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ')
    : '';

  return (
    <AiVisualEditorContext.Provider value={contextValue}>
      {children}

      {/* Edit Mode Overlay */}
      <EditModeOverlay
        active={editMode}
        onElementSelect={handleElementSelect}
        onExit={exitEditMode}
      />

      {/* AI Assistant Panel */}
      <AiAssistantPanel
        open={showPanel && editMode}
        inspection={selectedInspection}
        selectedElement={selectedElement}
        onApplyChange={(change) => {
          if (change.changes && Object.keys(change.changes).length > 0) {
            handleApplyChange(change);
          }
        }}
        onClose={() => {
          setShowPanel(false);
          setMode('inspecting');
        }}
        isProcessing={isProcessing}
        aiReply={aiReply}
      />

      {/* Preview Panel */}
      <PreviewPanel
        open={showPreview}
        pendingChange={pendingChange}
        beforeDescription={beforeDesc}
        afterDescription={afterDesc}
        onApply={handleConfirmApply}
        onCancel={handleCancelPreview}
      />

      {/* History Toolbar */}
      {editMode && (
        <HistoryToolbar
          history={historyHook.history}
          canUndo={historyHook.canUndo}
          canRedo={historyHook.canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={historyHook.clear}
        />
      )}

      {/* Save button (floating) */}
      {editMode && historyHook.history.length > 0 && onSave && (
        <button
          onClick={onSave}
          className="fixed bottom-12 right-3 z-[100000] px-4 py-2.5 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-sm font-bold shadow-2xl hover:from-emerald-500 hover:to-cyan-600 transition-all flex items-center gap-2"
        >
          💾 حفظ
        </button>
      )}
    </AiVisualEditorContext.Provider>
  );
};

// ─── Toggle Button (can be placed anywhere) ───────────────────

interface EditModeToggleButtonProps {
  className?: string;
  label?: string;
  labelAr?: string;
}

export const EditModeToggleButton: React.FC<EditModeToggleButtonProps> = ({
  className = '',
  label = 'Visual Edit',
  labelAr = 'محرر بصري',
}) => {
  const ctx = useAiVisualEditor();
  if (!ctx) return null;

  return (
    <button
      onClick={ctx.toggleEditMode}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm transition-all ${
        ctx.editMode
          ? 'bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-lg'
          : 'bg-white border border-slate-200 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50'
      } ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${ctx.editMode ? 'bg-white animate-pulse' : 'bg-cyan-400'}`} />
      {labelAr}
    </button>
  );
};
