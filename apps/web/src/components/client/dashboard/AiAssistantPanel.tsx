'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader2, Sparkles, Crown, Zap } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';

interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ type: string; payload: any; confirmed: boolean }>;
  timestamp: Date;
}

interface AiAssistantPanelProps {
  shopId: string;
  shop?: any;
  currentPage?: string;
  onActionExecuted?: () => void;
}

const QUICK_ACTIONS_FREE = [
  { key: 'ai.quickActions.changeColor', prompt: 'غيّر اللون الأساسي إلى أزرق' },
  { key: 'ai.quickActions.toggleReservations', prompt: 'فعّل نظام الحجوزات' },
  { key: 'ai.quickActions.shopStatus', prompt: 'إيه حالة المحل دلوقتي؟' },
];

const QUICK_ACTIONS_PRO = [
  { key: 'ai.quickActions.addSection', prompt: 'أضف قسم شهادات العملاء' },
  { key: 'ai.quickActions.suggestDesign', prompt: 'اقترح تصميم مناسب لمحلي' },
  { key: 'ai.quickActions.generateContent', prompt: 'اكتب وصف منتج مميز' },
];

const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  shopId,
  shop,
  currentPage,
  onActionExecuted,
}) => {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiTier = (shop?.aiTier || shop?.ai_tier || 'FREE').toUpperCase();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setInput('');

    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await clientFetch<any>('/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          shopId,
          context: {
            currentPage: currentPage || 'dashboard',
            locale: isArabic ? 'ar' : 'en',
          },
        }),
      });

      const assistantMsg: AiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply || t('ai.noResponse', 'لا يوجد رد'),
        actions: response.actions || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.actions?.some((a: any) => a.confirmed) && onActionExecuted) {
        onActionExecuted();
      }
    } catch (err: any) {
      const errorMsg: AiMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: err?.message || t('ai.errorOccurred', 'حدث خطأ'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
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

  const quickActions = aiTier === 'FREE' ? QUICK_ACTIONS_FREE : QUICK_ACTIONS_PRO;
  const tierLabel = aiTier === 'ENTERPRISE' ? t('ai.tierEnterprise', 'Enterprise') : aiTier === 'PRO' ? t('ai.tierPro', 'Pro') : t('ai.tierFree', 'مجاني');
  const TierIcon = aiTier === 'FREE' ? Zap : aiTier === 'PRO' ? Sparkles : Crown;

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-cyan-500/40 transition-shadow"
            title={t('ai.openAssistant', 'افتح المساعد')}
          >
            <Sparkles className="w-6 h-6" />
            {messages.length === 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-[9999] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden
              bottom-6 right-6 w-[calc(100vw-3rem)] sm:w-96
              h-[min(70vh,520px)]`}
            dir={dir}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-l from-cyan-500 to-cyan-600 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm leading-tight">{t('ai.assistantTitle', 'مساعد راي')}</h3>
                  <div className="flex items-center gap-1 text-[10px] opacity-80">
                    <TierIcon className="w-3 h-3" />
                    <span>{tierLabel}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/50">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-2">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-cyan-500" />
                  </div>
                  <div>
                    <p className="font-black text-slate-700 text-sm">{t('ai.welcomeTitle', 'أهلاً! أنا مساعدك')}</p>
                    <p className="text-xs text-slate-400 mt-1">{t('ai.welcomeSubtitle', 'اسألني أي شيء عن محلك')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {quickActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(action.prompt)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition-colors shadow-sm"
                      >
                        {t(action.key, action.key.split('.').pop() || '')}
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
                        ? 'bg-cyan-100 text-cyan-600'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'assistant'
                        ? 'bg-white border border-slate-100 text-slate-700 shadow-sm'
                        : 'bg-cyan-500 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.actions.map((action, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg ${
                              action.confirmed
                                ? 'bg-green-50 text-green-600'
                                : 'bg-red-50 text-red-500'
                            }`}
                          >
                            {action.confirmed ? (
                              <Zap className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            <span className="font-bold">{action.type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                      <span className="text-xs text-slate-400 font-bold">{t('ai.thinking', 'بفكر...')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('ai.inputPlaceholder', 'اكتب سؤالك...')}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-200 transition-all disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:hover:bg-cyan-500 shrink-0"
                >
                  <Send className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {aiTier === 'FREE' && (
                <p className="text-[10px] text-slate-300 mt-1.5 text-center">
                  {t('ai.freeTierHint', 'النسخة المجانية — ترقية لPro لمزيد من الميزات')}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistantPanel;
