import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, X, Sparkles, Loader2, Wand2,
  Type, Palette, Layout, Image as ImageIcon, Code2,
} from 'lucide-react';
import type { ElementInspectionData, AiVisualChange, AiSuggestion } from './types';
import { AI_SUGGESTIONS, getComponentFromRegistry } from './ComponentRegistry';
import { screenshotElement } from './domInspector';

interface AiAssistantPanelProps {
  open: boolean;
  inspection: ElementInspectionData | null;
  selectedElement: HTMLElement | null;
  onApplyChange: (change: AiVisualChange) => void;
  onClose: () => void;
  isProcessing?: boolean;
  aiReply?: string | null;
}

const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  open,
  inspection,
  selectedElement,
  onApplyChange,
  onClose,
  isProcessing,
  aiReply,
}) => {
  const [prompt, setPrompt] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Take screenshot when element is selected ───────────────

  useEffect(() => {
    if (open && selectedElement) {
      screenshotElement(selectedElement, 1).then(setScreenshot);
    } else {
      setScreenshot(null);
    }
  }, [open, selectedElement]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const registryEntry = inspection ? getComponentFromRegistry(inspection.componentName) : null;

  const handleSendPrompt = () => {
    if (!prompt.trim() || isProcessing) return;
    onApplyChange({
      component: (inspection?.componentName as any) || 'Custom',
      changes: {},
      contentChanges: {},
    });
    // The actual AI call is handled by the parent orchestrator
    // using the prompt text
  };

  const handleSuggestionClick = (suggestion: AiSuggestion) => {
    setActiveSuggestion(suggestion.id);
    const change: AiVisualChange = {
      component: (inspection?.componentName as any) || 'Custom',
      changes: {
        primaryColor: suggestion.preview.primaryColor,
        secondaryColor: suggestion.preview.secondaryColor,
        backgroundColor: suggestion.preview.backgroundColor,
        borderRadius: parseRadius(suggestion.preview.borderRadius),
        shadow: parseShadow(suggestion.preview.shadow),
        animation: suggestion.preview.animation as any,
      },
    };
    onApplyChange(change);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          dir="rtl"
          className="fixed top-0 right-0 h-full w-[380px] bg-white shadow-2xl z-[100000] flex flex-col border-l border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-l from-cyan-500 to-violet-500 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Wand2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-black">AI Visual Editor</p>
                <p className="text-[10px] opacity-80">محرر بصري بالذكاء الاصطناعي</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Component info card */}
            {inspection && registryEntry && (
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-1 rounded-lg bg-cyan-100 text-cyan-700 text-[10px] font-black">
                    {inspection.componentName}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">
                    {registryEntry.labelAr}
                  </span>
                </div>

                {/* Screenshot */}
                {screenshot && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 mb-2">
                    <img src={screenshot} alt="Screenshot" className="w-full" />
                  </div>
                )}

                {/* Element details */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <DetailItem icon="type" label="الخط" value={inspection.computedStyles.fontFamily?.split(',')[0] || '—'} />
                  <DetailItem icon="palette" label="اللون" value={inspection.computedStyles.color} />
                  <DetailItem icon="palette" label="الخلفية" value={inspection.computedStyles.backgroundColor} />
                  <DetailItem icon="layout" label="الحجم" value={`${Math.round(inspection.boundingRect.width)}×${Math.round(inspection.boundingRect.height)}`} />
                  <DetailItem icon="layout" label="Padding" value={inspection.computedStyles.padding} />
                  <DetailItem icon="layout" label="Radius" value={inspection.computedStyles.borderRadius} />
                </div>

                {/* Text content */}
                {inspection.textContent && (
                  <div className="mt-2 px-2 py-1.5 rounded-lg bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold mb-0.5">المحتوى:</p>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{inspection.textContent}</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Suggestions */}
            <div className="px-4 py-3">
              <p className="text-[11px] font-black text-slate-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                اقتراحات سريعة
              </p>
              <div className="grid grid-cols-2 gap-2">
                {AI_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSuggestionClick(sug)}
                    disabled={isProcessing}
                    className={`relative p-2 rounded-xl border transition-all text-right disabled:opacity-50 ${
                      activeSuggestion === sug.id
                        ? 'border-cyan-400 bg-cyan-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: sug.preview.primaryColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: sug.preview.secondaryColor }}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-700">{sug.labelAr}</p>
                    <p className="text-[9px] text-slate-400 line-clamp-1">{sug.descriptionAr}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Reply */}
            {aiReply && (
              <div className="px-4 py-2">
                <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="text-[10px] font-bold text-cyan-700">رد الذكاء الاصطناعي</span>
                  </div>
                  <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{aiReply}</p>
                </div>
              </div>
            )}

            {/* Allowed changes info */}
            {registryEntry && (
              <div className="px-4 py-2">
                <p className="text-[10px] font-bold text-slate-400 mb-1">التعديلات المسموحة:</p>
                <div className="flex flex-wrap gap-1">
                  {registryEntry.allowedChanges.map((ch) => (
                    <span key={ch} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold text-slate-500">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="px-3 py-3 border-t border-slate-100 bg-white">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب تعليماتك للذكاء الاصطناعي... مثل: اجعل هذا القسم أكثر احترافية"
                disabled={isProcessing}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-200 transition-all disabled:opacity-50 resize-none"
              />
              <button
                onClick={handleSendPrompt}
                disabled={isProcessing || !prompt.trim()}
                className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-white flex items-center justify-center transition-all disabled:opacity-40 hover:from-cyan-500 hover:to-violet-600"
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 rotate-180" />
                )}
              </button>
            </div>
            <p className="text-[9px] text-slate-300 mt-1.5 text-center">
              الذكاء الاصطناعي يرجع JSON فقط — لا كود قابل للتنفيذ
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Helper components ────────────────────────────────────────

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const IconComponent = icon === 'type' ? Type : icon === 'palette' ? Palette : Layout;
  return (
    <div className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-white border border-slate-100">
      <IconComponent className="w-2.5 h-2.5 text-slate-400 shrink-0" />
      <span className="text-slate-400">{label}:</span>
      <span className="font-mono text-slate-600 truncate">{value}</span>
    </div>
  );
}

function parseRadius(value: string): any {
  const map: Record<string, string> = {
    '0px': 'none', '4px': 'sm', '8px': 'md', '12px': 'lg',
    '16px': 'xl', '20px': '2xl', '24px': '2xl', '9999px': 'full',
  };
  return map[value] || 'md';
}

function parseShadow(value: string): any {
  if (value === 'none' || !value) return 'none';
  if (value.includes('1px 2px')) return 'sm';
  if (value.includes('10px 15px') || value.includes('20px 25px')) return 'lg';
  return 'md';
}

export default AiAssistantPanel;
