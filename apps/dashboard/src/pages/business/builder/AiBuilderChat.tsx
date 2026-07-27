import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X, MapPin, Wand2, Palette, Layout, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import { useDesignTokens, mergeDesignTokens } from '@/utils/designTokens';
import { DEFAULT_DESIGN_TOKENS } from '@/types/pageSchema';
import type { DesignTokens, PageSchema, BrandIdentity, StylePreset } from '@/types/pageSchema';
import type { ElementInspectionData } from '@/components/ai-visual-editor/types';

interface AiBuilderMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  applied?: boolean;
}

interface AiBuilderChatProps {
  shop?: any;
  config?: any;
  onSave?: () => void;
  onDesignTokensChange?: (tokens: DesignTokens) => void;
  onPageSchemaChange?: (schema: PageSchema) => void;
  onBrandIdentityChange?: (brand: Partial<BrandIdentity>) => void;
}

const QUICK_PROMPTS = [
  { icon: 'palette', text: 'غيّر اللون الأساسي إلى أزرق' },
  { icon: 'layout', text: 'أضف قسم الأسئلة الشائعة' },
  { icon: 'wand', text: 'اجعل التصميم داكن' },
  { icon: 'palette', text: 'اختر ثيم فاخر للمتجر' },
];

const STYLE_PRESETS: { id: StylePreset; labelAr: string; labelEn: string }[] = [
  { id: 'modern', labelAr: 'عصري', labelEn: 'Modern' },
  { id: 'luxury', labelAr: 'فاخر', labelEn: 'Luxury' },
  { id: 'minimal', labelAr: 'بسيط', labelEn: 'Minimal' },
  { id: 'glass', labelAr: 'زجاجي', labelEn: 'Glass' },
  { id: 'dark', labelAr: 'داكن', labelEn: 'Dark' },
  { id: 'elegant', labelAr: 'أنيق', labelEn: 'Elegant' },
  { id: 'corporate', labelAr: 'مؤسسي', labelEn: 'Corporate' },
  { id: 'playful', labelAr: 'مرح', labelEn: 'Playful' },
  { id: 'bold', labelAr: 'جريء', labelEn: 'Bold' },
];

const AiBuilderChat: React.FC<AiBuilderChatProps> = ({
  shop,
  config,
  onSave,
  onDesignTokensChange,
  onPageSchemaChange,
  onBrandIdentityChange,
}) => {
  const { i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [messages, setMessages] = useState<AiBuilderMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<{ id: string; label: string } | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<ElementInspectionData | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [designTokens, setDesignTokens] = useState<DesignTokens | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useDesignTokens(designTokens);

  const getActivityId = (): string => {
    return config?.businessActivityId || shop?.activityId || 'other';
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const autoResize = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    const handleSectionSelect = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sectionId && detail?.sectionLabel) {
        setSelectedSection({ id: detail.sectionId, label: detail.sectionLabel });
        if (inputRef.current) inputRef.current.focus();
      }
    };
    const handleElementSelect = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.inspection) {
        setSelectedInspection(detail.inspection as ElementInspectionData);
        setSelectedSection({ id: detail.sectionId, label: detail.sectionLabel });
        if (inputRef.current) inputRef.current.focus();
      }
    };
    window.addEventListener('builder-ai-section-select', handleSectionSelect);
    window.addEventListener('builder-ai-element-select', handleElementSelect);
    return () => {
      window.removeEventListener('builder-ai-section-select', handleSectionSelect);
      window.removeEventListener('builder-ai-element-select', handleElementSelect);
    };
  }, []);

  // ─── Generate Full Theme from Scratch ───────────────────────

  const handleGenerateTheme = async (stylePreset?: StylePreset) => {
    if (!shop?.id || isLoading) return;
    setIsLoading(true);
    setShowPresets(false);

    const presetLabel = stylePreset ? STYLE_PRESETS.find(s => s.id === stylePreset)?.labelAr : null;
    const userMsg: AiBuilderMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: stylePreset
        ? (isArabic ? `صمّم ثيم كامل بأسلوب ${presetLabel || stylePreset}` : `Generate a full theme with ${stylePreset} style`)
        : (isArabic ? 'صمّم ثيم كامل من الصفر' : 'Generate a full theme from scratch'),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await ApiService.aiGenerateTheme({
        shopId: shop.id,
        activityId: getActivityId(),
        shopName: shop.name || 'متجري',
        shopDescription: shop.description,
        stylePreset,
        locale: isArabic ? 'ar' : 'en',
      });

      const tokens = mergeDesignTokens(DEFAULT_DESIGN_TOKENS, result.designTokens);
      setDesignTokens(tokens);
      onDesignTokensChange?.(tokens);
      onPageSchemaChange?.(result.pageSchema);
      onBrandIdentityChange?.(result.brandIdentity);

      const replyText = isArabic
        ? `تم إنشاء ثيم كامل! ✨\n• الألوان: ${result.designTokens.colors?.primary} + ${result.designTokens.colors?.secondary}\n• الأقسام: ${result.pageSchema.sections?.length || 0} قسم\n• الأسلوب: ${result.brandIdentity?.stylePreset || 'تلقائي'}\nيمكنك تعديل أي جزء أو حفظ التصميم.`
        : `Full theme generated! ✨\n• Colors: ${result.designTokens.colors?.primary} + ${result.designTokens.colors?.secondary}\n• Sections: ${result.pageSchema.sections?.length || 0}\n• Style: ${result.brandIdentity?.stylePreset || 'auto'}\nYou can modify any part or save the design.`;

      setMessages((prev) => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
        applied: true,
      }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: isArabic ? `حدث خطأ: ${err.message || 'تعذر إنشاء الثيم'}` : `Error: ${err.message || 'Failed to generate theme'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Generate Brand Identity ────────────────────────────────

  const handleGenerateBrand = async () => {
    if (!shop?.id || isLoading) return;
    setIsLoading(true);

    const userMsg: AiBuilderMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: isArabic ? 'ولّد هوية بصرية للمتجر' : 'Generate brand identity',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const brand = await ApiService.aiGenerateBrand({
        shopId: shop.id,
        activityId: getActivityId(),
        shopName: shop.name || 'متجري',
        shopDescription: shop.description,
        locale: isArabic ? 'ar' : 'en',
      });

      onBrandIdentityChange?.(brand);

      const replyText = isArabic
        ? `تم توليد الهوية البصرية! 🎨\n• الاسم: ${brand.brandName || shop.name}\n• الشعار: ${brand.tagline || ''}\n• اللون الأساسي: ${brand.colors?.primary || ''}\n• الأسلوب: ${brand.stylePreset || 'تلقائي'}`
        : `Brand identity generated! 🎨\n• Name: ${brand.brandName || shop.name}\n• Tagline: ${brand.tagline || ''}\n• Primary: ${brand.colors?.primary || ''}\n• Style: ${brand.stylePreset || 'auto'}`;

      setMessages((prev) => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
        applied: true,
      }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: isArabic ? `حدث خطأ: ${err.message}` : `Error: ${err.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Chat-based Builder (iterative changes) ─────────────────

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading || !shop?.id) return;

    setInput('');

    const userMsg: AiBuilderMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // If we have element inspection data, use the visual editor endpoint
      if (selectedInspection && shop?.id) {
        const result = await ApiService.aiVisualEdit({
          shopId: shop.id,
          componentName: selectedInspection.componentName,
          elementInspection: selectedInspection,
          userPrompt: text,
          locale: isArabic ? 'ar' : 'en',
        });

        if (result.applied && result.change?.changes) {
          // Convert change to design token overrides
          const { changesToTokenOverrides } = await import('@/components/ai-visual-editor/ThemeTokenSystem');
          const tokenOverrides = changesToTokenOverrides(result.change.changes);
          if (Object.keys(tokenOverrides).length > 0) {
            const tokens = mergeDesignTokens(designTokens || DEFAULT_DESIGN_TOKENS, tokenOverrides);
            setDesignTokens(tokens);
            onDesignTokensChange?.(tokens);
          }
        }

        setMessages((prev) => [...prev, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.reply,
          timestamp: new Date(),
          applied: result.applied,
        }]);
      } else {
        // Fall back to regular builder chat
        const result = await ApiService.aiBuilderChat({
          shopId: shop.id,
          message: text,
          context: {
            locale: isArabic ? 'ar' : 'en',
            activityId: getActivityId(),
            selectedSectionId: selectedSection?.id,
          },
        });

        if (result.designTokens) {
          const tokens = mergeDesignTokens(designTokens || DEFAULT_DESIGN_TOKENS, result.designTokens);
          setDesignTokens(tokens);
          onDesignTokensChange?.(tokens);
        }

        if (result.pageSchema) {
          onPageSchemaChange?.(result.pageSchema as PageSchema);
        }

        if (result.brandIdentity) {
          onBrandIdentityChange?.(result.brandIdentity);
        }

        setMessages((prev) => [...prev, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.reply,
          timestamp: new Date(),
          applied: result.applied,
        }]);
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: isArabic ? `حدث خطأ: ${err.message || 'تعذر معالجة الطلب'}` : `Error: ${err.message || 'Failed to process'}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearSection = () => {
    setSelectedSection(null);
    setSelectedInspection(null);
  };

  const renderQuickPromptIcon = (icon: string) => {
    switch (icon) {
      case 'wand': return <Wand2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />;
      case 'palette': return <Palette className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
      case 'layout': return <Layout className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col h-full" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Selected element/section banner */}
      {selectedSection && (
        <div className="px-3 py-2 bg-cyan-50 border-b border-cyan-100 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Layers className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span className="text-[11px] font-black text-cyan-700 truncate">
                {isArabic ? 'عنصر محدد: ' : 'Selected: '} {selectedSection.label}
              </span>
            </div>
            <button
              onClick={handleClearSection}
              className="shrink-0 p-1 rounded-lg hover:bg-cyan-100 transition-colors"
              title={isArabic ? 'إلغاء التحديد' : 'Clear selection'}
            >
              <X className="w-3 h-3 text-cyan-600" />
            </button>
          </div>
          {selectedInspection && (
            <div className="flex flex-wrap gap-1 text-[9px]">
              {selectedInspection.computedStyles.color && (
                <span className="px-1.5 py-0.5 rounded bg-white border border-cyan-100 text-slate-500 font-mono">
                  color: {selectedInspection.computedStyles.color}
                </span>
              )}
              {selectedInspection.computedStyles.backgroundColor && (
                <span className="px-1.5 py-0.5 rounded bg-white border border-cyan-100 text-slate-500 font-mono">
                  bg: {selectedInspection.computedStyles.backgroundColor}
                </span>
              )}
              {selectedInspection.computedStyles.fontFamily && (
                <span className="px-1.5 py-0.5 rounded bg-white border border-cyan-100 text-slate-500 font-mono truncate max-w-[100px]">
                  font: {selectedInspection.computedStyles.fontFamily.split(',')[0]}
                </span>
              )}
              {selectedInspection.computedStyles.borderRadius && (
                <span className="px-1.5 py-0.5 rounded bg-white border border-cyan-100 text-slate-500 font-mono">
                  radius: {selectedInspection.computedStyles.borderRadius}
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded bg-white border border-cyan-100 text-slate-500 font-mono">
                {Math.round(selectedInspection.boundingRect.width)}×{Math.round(selectedInspection.boundingRect.height)}
              </span>
              {selectedInspection.textContent && (
                <span className="px-1.5 py-0.5 rounded bg-violet-50 border border-violet-100 text-violet-500 truncate max-w-[150px]">
                  "{selectedInspection.textContent.slice(0, 30)}"
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cyan-500" />
            </div>
            <div>
              <p className="font-black text-slate-700 text-sm">
                {selectedInspection
                  ? isArabic
                    ? `أنت الآن تعمل على: ${selectedInspection.componentName}`
                    : `You're now working on: ${selectedInspection.componentName}`
                  : selectedSection
                  ? isArabic
                    ? `أنت الآن تعمل على: ${selectedSection.label}`
                    : `You're now working on: ${selectedSection.label}`
                  : isArabic ? 'صمّم متجرك بالذكاء الاصطناعي' : 'Design your store with AI'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {selectedInspection
                  ? isArabic
                    ? 'اكتب تعليماتك لتعديل هذا العنصر، أو اضغط على عنصر آخر في المعاينة'
                    : 'Type your instructions to edit this element, or click another element in the preview'
                  : selectedSection
                  ? isArabic
                    ? 'اضغط على أي عنصر في المعاينة لتحديده، أو اكتب أمر التعديل'
                    : 'Click any element in the preview to select it, or type a command'
                    : isArabic
                      ? 'اضغط على أي عنصر في المعاينة لبدء التعديل، أو اكتب أمراً عاماً'
                      : 'Click any element in the preview to start editing, or type a general command'}
              </p>
            </div>

            {/* Generate Theme button */}
            <button
              onClick={() => handleGenerateTheme()}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-violet-600 transition-all shadow-md disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              {isArabic ? 'صمّم ثيم كامل من الصفر' : 'Generate Full Theme'}
            </button>

            {/* Style presets */}
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="text-xs text-slate-500 font-bold hover:text-cyan-600 transition-colors"
            >
              {isArabic ? 'اختر أسلوب محدد ↓' : 'Choose a style preset ↓'}
            </button>
            {showPresets && (
              <div className="grid grid-cols-3 gap-1.5 w-full">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleGenerateTheme(preset.id)}
                    disabled={isLoading}
                    className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition-colors disabled:opacity-50"
                  >
                    {isArabic ? preset.labelAr : preset.labelEn}
                  </button>
                ))}
              </div>
            )}

            {/* Generate Brand button */}
            <button
              onClick={handleGenerateBrand}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Palette className="w-4 h-4" />
              {isArabic ? 'ولّد هوية بصرية' : 'Generate Brand Identity'}
            </button>

            {/* Quick prompts */}
            <div className="flex flex-col gap-2 w-full mt-2">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.text)}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition-colors shadow-sm text-right flex items-center gap-2 disabled:opacity-50"
                >
                  {renderQuickPromptIcon(prompt.icon)}
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-white'
                  : 'bg-slate-800 text-white'
              }`}
            >
              {msg.role === 'assistant' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-white border border-slate-100 text-slate-700 shadow-sm'
                  : 'bg-cyan-500 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.applied && (
                <button
                  onClick={onSave}
                  className="mt-2 text-[11px] font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
                >
                  {isArabic ? '💾 حفظ التصميم' : '💾 Save design'}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                <span className="text-xs text-slate-400 font-bold">
                  {isArabic ? 'جارٍ التطبيق...' : 'Applying...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input — Dark Uiverse-style chat */}
      <div className="px-3 py-3 border-t border-slate-100 bg-white">
        <div className="relative max-w-full w-full rounded-2xl p-[1.5px] overflow-hidden bg-gradient-to-br from-[#7e7e7e] via-[#363636] to-[#363636]">
          {/* Glow spot */}
          <div className="absolute -top-2.5 -left-2.5 w-[30px] h-[30px] rounded-full blur-[1px] pointer-events-none"
               style={{ background: 'radial-gradient(ellipse at center, #ffffff, rgba(255,255,255,0.3), rgba(255,255,255,0.1), transparent)' }}
          />
          <div className="flex flex-col bg-black/50 rounded-[15px] w-full overflow-hidden">
            {/* Textarea row */}
            <div className="relative flex">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={selectedInspection
                  ? (isArabic ? `اكتب تعليمات لتعديل ${selectedInspection.componentName}...` : `Type a command for ${selectedInspection.componentName}...`)
                  : selectedSection
                  ? (isArabic ? `اكتب أمر تعديل لـ ${selectedSection.label}...` : `Type a command for ${selectedSection.label}...`)
                  : (isArabic ? 'اكتب أمر التصميم...' : 'Type a design command...')}
                disabled={isLoading}
                className="w-full min-h-[50px] max-h-[120px] bg-transparent border-none rounded-2xl text-white text-xs font-normal p-2.5 resize-none outline-none placeholder:text-white/90 focus:placeholder:text-[#363636] transition-all disabled:opacity-50 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#888] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[#555]"
              />
            </div>
            {/* Options row */}
            <div className="flex justify-between items-end p-2.5">
              {/* Add buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerateTheme()}
                  disabled={isLoading}
                  className="text-white/10 hover:text-white hover:-translate-y-1 transition-all duration-300 disabled:opacity-30"
                  title={isArabic ? 'توليد ثيم' : 'Generate theme'}
                >
                  <Wand2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGenerateBrand}
                  disabled={isLoading}
                  className="text-white/10 hover:text-white hover:-translate-y-1 transition-all duration-300 disabled:opacity-30"
                  title={isArabic ? 'هوية بصرية' : 'Brand identity'}
                >
                  <Palette className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setSelectedInspection(null); setSelectedSection(null); inputRef.current?.focus(); }}
                  disabled={isLoading}
                  className="text-white/10 hover:text-white hover:-translate-y-1 transition-all duration-300 disabled:opacity-30"
                  title={isArabic ? 'مسح التحديد' : 'Clear selection'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Submit button */}
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="p-0.5 rounded-[10px] bg-gradient-to-t from-[#292929] via-[#555555] to-[#292929] cursor-pointer border-none outline-none transition-all duration-150 active:scale-95 disabled:opacity-40"
                style={{ boxShadow: 'inset 0 6px 2px -4px rgba(255,255,255,0.5)' }}
              >
                <span className="w-[30px] h-[30px] p-1.5 bg-black/10 rounded-[10px] backdrop-blur-[3px] flex items-center justify-center">
                  <Send className={`w-4 h-4 text-[#8b8b8b] transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_5px_#fff] group-focus:text-white group-focus:drop-shadow-[0_0_5px_#fff] group-focus:scale-125 group-focus:rotate-45 ${isArabic ? 'rotate-180' : ''}`} />
                </span>
              </button>
            </div>
          </div>
        </div>
        {/* Quick tags */}
        <div className="flex flex-wrap gap-1 pt-2.5">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt.text)}
              disabled={isLoading}
              className="px-2 py-1 bg-[#1b1b1b] border-[1.5px] border-[#363636] rounded-[10px] text-white text-[10px] cursor-pointer select-none hover:border-[#555] transition-colors disabled:opacity-40"
            >
              {prompt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AiBuilderChat;
