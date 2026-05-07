'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

type Props = { shopId: string };

const ChatsTab: React.FC<Props> = ({ shopId }) => {
  const t = useT();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef<any>(null);
  const loadInFlight = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  const loadChats = useCallback(async () => {
    if (!shopId || loadInFlight.current) return;
    loadInFlight.current = true;
    try { const d = await clientFetch<any[]>(`/v1/chats?shopId=${shopId}`); setChats(d || []); }
    catch { setChats([]); } finally { loadInFlight.current = false; }
  }, [shopId]);

  const scheduleLoad = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => loadChats(), 400);
  }, [loadChats]);

  const loadMessages = useCallback(async (userId: string) => {
    try { const d = await clientFetch<any[]>(`/v1/chats/${shopId}/${userId}/messages`); setMessages(d || []); }
    catch { setMessages([]); }
  }, [shopId]);

  useEffect(() => { loadChats(); return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, [shopId, loadChats]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;
    try {
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ray_user') || '{}') : {};
      await clientFetch<any>('/v1/chats/send', { method: 'POST', body: JSON.stringify({ shopId, userId: selectedChat.userId, senderId: user.id, senderName: user.name, text: inputText, role: 'merchant' }) });
      setInputText(''); await loadMessages(selectedChat.userId);
    } catch {}
  };

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-[3rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm h-[700px] flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-l border-slate-100 flex flex-col">
        <div className="p-4 sm:p-6 md:p-8 border-b border-slate-50"><h3 className="text-xl font-black">{t('business.chats.incomingMessages', 'الرسائل الواردة')}</h3></div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {chats.length === 0 ? <div className="p-6 sm:p-8 md:p-10 text-center text-slate-300 font-bold">{t('business.chats.noChats', 'لا توجد محادثات')}</div> : chats.map(chat => (
            <button key={chat.userId} onClick={() => { setSelectedChat(chat); loadMessages(chat.userId); }} className={`w-full p-4 sm:p-5 md:p-6 text-right flex items-center gap-3 flex-row-reverse border-b border-slate-50 transition-all ${selectedChat?.userId === chat.userId ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}>
              <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-black text-slate-500">{String(chat.userName || '?').charAt(0)}</div>
              <div className="flex-1 min-w-0"><p className="font-black truncate">{chat.userName}</p><p className={`text-xs truncate ${selectedChat?.userId === chat.userId ? 'text-slate-400' : 'text-slate-500'}`}>{chat.lastMessage}</p></div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
        {selectedChat ? (
          <>
            <header className="p-4 sm:p-6 bg-white border-b border-slate-100 flex items-center px-4 sm:px-10"><div className="flex items-center gap-3 flex-row-reverse"><div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">{String(selectedChat.userName || '?').charAt(0)}</div><div className="text-right"><p className="font-black">{selectedChat.userName}</p><p className="text-[10px] text-slate-400 font-black">{t('business.chats.platformCustomer', 'عميل')}</p></div></div></header>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 space-y-4 no-scrollbar">
              {messages.map((m, i) => (<div key={i} className={`flex ${m.role === 'customer' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-4 rounded-[1.25rem] text-sm font-bold shadow-sm ${m.role === 'customer' ? 'bg-white text-slate-700' : 'bg-[#00E5FF] text-slate-900'}`}>{m.content}</div></div>))}
            </div>
            <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex gap-3">
              <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={t('business.chats.writeReply', 'اكتب رد...')} className="flex-1 bg-slate-50 rounded-2xl py-3 px-4 font-bold outline-none text-right" />
              <button onClick={handleSend} className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-black transition-all"><Send className="rotate-180" size={18} /></button>
            </div>
          </>
        ) : (<div className="flex-1 flex flex-col items-center justify-center text-slate-300"><MessageCircle size={56} className="mb-6 opacity-10" /><p className="text-xl font-black">{t('business.chats.selectChatToReply', 'اختر محادثة')}</p></div>)}
      </div>
    </div>
  );
};

export default ChatsTab;
