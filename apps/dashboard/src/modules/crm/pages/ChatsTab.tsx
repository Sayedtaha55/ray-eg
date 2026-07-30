import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';
import { useRealtime } from '@/hooks/useRealtime';
import { getStoredToken } from '@/services/authStorage';

type Props = { shopId: string };

const ChatsTab: React.FC<Props> = ({ shopId }) => {
  const { t } = useTranslation();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState<{ userId: string; name: string } | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number | null>(null);

  const selectedChatRef = useRef<any>(null);
  const loadChatsInFlightRef = useRef(false);
  const loadChatsTimerRef = useRef<number | null>(null);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const loadChats = useCallback(async () => {
    if (!shopId) return;
    if (loadChatsInFlightRef.current) return;
    loadChatsInFlightRef.current = true;
    try {
      const data = await ApiService.getMerchantChats(shopId);
      setChats(data || []);
    } catch {
      setChats([]);
    } finally {
      loadChatsInFlightRef.current = false;
    }
  }, [shopId]);

  const scheduleLoadChats = useCallback(() => {
    if (loadChatsTimerRef.current) {
      window.clearTimeout(loadChatsTimerRef.current);
    }
    loadChatsTimerRef.current = window.setTimeout(() => {
      loadChats();
    }, 400);
  }, [loadChats]);

  const loadMessages = useCallback(async (userId: string) => {
    if (!shopId) return;
    try {
      const data = await ApiService.getMessages(shopId, userId);
      setMessages(data || []);
    } catch {
      setMessages([]);
    }
  }, [shopId]);

  useEffect(() => {
    loadChats();

    const sub = ApiService.subscribeToMessages(shopId, (newMsg) => {
      const current = selectedChatRef.current;
      if (current && newMsg.userId === current.userId) {
        setMessages((prev) => [...prev, newMsg]);
      }
      scheduleLoadChats();
    });

    return () => {
      if (loadChatsTimerRef.current) {
        window.clearTimeout(loadChatsTimerRef.current);
      }
      sub.unsubscribe();
    };
  }, [shopId, loadChats, scheduleLoadChats]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typingUser]);

  const { sendTyping, joinPresence, leavePresence } = useRealtime({
    token: getStoredToken(),
    enabled: !!shopId,
    onTyping: (data) => {
      if (data.shopId !== shopId) return;
      if (data.isTyping) {
        setTypingUser({ userId: data.userId, name: data.name });
      } else {
        setTypingUser(null);
      }
    },
    onPresenceUpdate: (data) => {
      if (data.shopId !== shopId) return;
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.online) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    },
    onMessage: () => {
      scheduleLoadChats();
    },
  });

  useEffect(() => {
    if (shopId) {
      joinPresence(shopId);
      return () => {
        leavePresence(shopId);
      };
    }
  }, [shopId, joinPresence, leavePresence]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (shopId) {
      sendTyping(shopId, true);
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      typingTimerRef.current = window.setTimeout(() => {
        sendTyping(shopId, false);
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;
    if (shopId) sendTyping(shopId, false);
    const user = JSON.parse(localStorage.getItem('ray_user') || '{}');
    await ApiService.sendMessage({
      shopId,
      userId: selectedChat.userId,
      senderId: user.id,
      senderName: user.name,
      text: inputText,
      role: 'merchant',
    });
    setInputText('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-[700px] flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-l border-slate-200 flex flex-col">
        <div className="p-4 sm:p-6 md:p-8 border-b border-slate-200">
          <h3 className="text-xl font-bold">{t('business.chats.incomingMessages')}</h3>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {chats.length === 0 ? (
            <div className="p-6 sm:p-8 md:p-10 text-center text-slate-300 font-semibold">{t('business.chats.noChats')}</div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.userId}
                onClick={() => {
                  setSelectedChat(chat);
                  loadMessages(chat.userId);
                }}
                className={`w-full p-4 sm:p-5 md:p-6 text-right flex items-center gap-3 sm:gap-4 flex-row-reverse border-b border-slate-200 transition-all ${
                  selectedChat?.userId === chat.userId ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-500">
                  {chat.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{chat.userName}</p>
                  <p className={`text-xs truncate ${selectedChat?.userId === chat.userId ? 'text-slate-400' : 'text-slate-500'}`}>{chat.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
        {selectedChat ? (
          <>
            <header className="p-4 sm:p-6 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-10">
              <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                  {selectedChat.userName.charAt(0)}
                </div>
                <div className="text-right">
                  <p className="font-bold flex items-center gap-2 flex-row-reverse">
                    {selectedChat.userName}
                    {onlineUsers.has(selectedChat.userId) && (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold">
                    {typingUser?.userId === selectedChat.userId
                      ? t('business.chats.typing', { defaultValue: 'يكتب...' })
                      : t('business.chats.platformCustomer')}
                  </p>
                </div>
              </div>
            </header>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 space-y-4 sm:space-y-6 no-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] p-4 sm:p-5 rounded-lg text-sm font-semibold shadow-sm ${m.role === 'customer' ? 'bg-white text-slate-700' : 'bg-cyan-500 text-slate-900'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 sm:p-6 md:p-8 bg-white border-t border-slate-200 flex gap-3 sm:gap-4">
              <input
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('business.chats.writeReply')}
                className="flex-1 bg-slate-50 rounded-lg py-3 sm:py-4 px-4 sm:px-8 font-semibold outline-none border-none text-right"
              />
              <button onClick={handleSend} className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-xl hover:bg-black transition-all">
                <Send className="rotate-180 sm:w-6 sm:h-6" size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <MessageCircle size={56} className="mb-6 opacity-10 sm:w-20 sm:h-20" />
            <p className="text-xl sm:text-2xl font-bold">{t('business.chats.selectChatToReply')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsTab;
