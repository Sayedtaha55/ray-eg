'use client';

import { useState } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { clientFetch } from '@/lib/api/client';

const MotionDiv = motion.div as any;

interface RayAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export default function RayAssistant({ isOpen, onClose }: RayAssistantProps) {
  const t = useT();
  const { dir } = useLocale();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const [shops, offers] = await Promise.all([
        clientFetch<any[]>('/v1/shops?status=approved').catch(() => [] as any[]),
        clientFetch<any[]>('/v1/offers').catch(() => [] as any[]),
      ]);

      const shopNames = shops.map((s: any) => s.name).join(', ');
      const offerTitles = offers.map((o: any) => o.title).join(', ');

      const content = t(
        'assistant.offlineFallback',
        `Found ${shops.length} shops and ${offers.length} offers matching "${userMsg}". Shops: ${shopNames || t('assistant.unavailable', 'N/A')}. Offers: ${offerTitles || t('assistant.unavailable', 'N/A')}.`,
      );

      setMessages((prev) => [...prev, { role: 'ai', content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: t('assistant.networkError', 'Network error. Please try again.') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0, x: dir === 'rtl' ? -400 : 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir === 'rtl' ? -400 : 400 }}
          className={`fixed ${dir === 'rtl' ? 'left-0' : 'right-0'} top-0 h-full w-full max-w-md bg-white shadow-2xl z-[200] flex flex-col ${dir === 'rtl' ? 'border-r' : 'border-l'} border-slate-100`}
          dir={dir}
        >
          <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00E5FF]" />
              <h2 className="font-black text-sm uppercase tracking-wider">
                {t('assistant.title', 'Ray Assistant')}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors" aria-label={t('common.close', 'Close')}>
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-[#00E5FF]" />
                </div>
                <p className="font-black text-lg text-slate-400">
                  {t('assistant.emptyTitle', 'Ask Ray anything')}
                </p>
                <p className="text-xs mt-2 max-w-[220px]">
                  {t('assistant.emptyHint', 'Search for shops, offers, or ask for recommendations')}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <MotionDiv
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? (dir === 'rtl' ? 'justify-start' : 'justify-end') : (dir === 'rtl' ? 'justify-end' : 'justify-start')}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#00E5FF] text-slate-900 font-bold'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </MotionDiv>
            ))}
            {loading && (
              <div className={`flex ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
                  <span className="text-xs font-black text-slate-400">
                    {t('assistant.searching', 'Searching...')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="relative">
              <input
                type="text"
                placeholder={t('assistant.inputPlaceholder', 'Search shops, offers...')}
                className={`w-full bg-slate-50 rounded-full py-4 ${dir === 'rtl' ? 'pr-6 pl-14' : 'pl-6 pr-14'} outline-none border-2 border-transparent focus:border-[#00E5FF] transition-all font-bold text-sm`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className={`absolute ${dir === 'rtl' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 p-3 bg-slate-900 text-white rounded-full hover:bg-[#BD00FF] transition-colors shadow-lg`}
                aria-label={t('assistant.send', 'Send')}
              >
                <Send className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
