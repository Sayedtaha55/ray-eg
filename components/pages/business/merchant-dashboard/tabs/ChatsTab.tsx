import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string };

const ChatsTab: React.FC<Props> = ({ shopId }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

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
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !selectedChat) return;
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
    <div className="bg-white rounded-[2rem] sm:rounded-[3rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm h-[700px] flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-l border-slate-100 flex flex-col">
        <div className="p-4 sm:p-6 md:p-8 border-b border-slate-50">
          <h3 className="text-xl font-black">الرسائل الواردة</h3>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {chats.length === 0 ? (
            <div className="p-6 sm:p-8 md:p-10 text-center text-slate-300 font-bold">لا يوجد محادثات حالياً.</div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.userId}
                onClick={() => {
                  setSelectedChat(chat);
                  loadMessages(chat.userId);
                }}
                className={`w-full p-4 sm:p-5 md:p-6 text-right flex items-center gap-3 sm:gap-4 flex-row-reverse border-b border-slate-50 transition-all ${
                  selectedChat?.userId === chat.userId ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-black text-slate-500">
                  {chat.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black truncate">{chat.userName}</p>
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
            <header className="p-4 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-10">
              <div className="flex items-center gap-3 sm:gap-4 flex-row-reverse">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                  {selectedChat.userName.charAt(0)}
                </div>
                <div className="text-right">
                  <p className="font-black">{selectedChat.userName}</p>
                  <p className="text-[10px] text-slate-400 font-black">عميل المنصة</p>
                </div>
              </div>
            </header>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 space-y-4 sm:space-y-6 no-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] p-4 sm:p-5 rounded-[1.25rem] sm:rounded-[2rem] text-sm font-bold shadow-sm ${m.role === 'customer' ? 'bg-white text-slate-700' : 'bg-[#00E5FF] text-slate-900'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 sm:p-6 md:p-8 bg-white border-t border-slate-100 flex gap-3 sm:gap-4">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اكتب ردك هنا..."
                className="flex-1 bg-slate-50 rounded-2xl py-3 sm:py-4 px-4 sm:px-8 font-bold outline-none border-none text-right"
              />
              <button onClick={handleSend} className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-black transition-all">
                <Send className="rotate-180 sm:w-6 sm:h-6" size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <MessageCircle size={56} className="mb-6 opacity-10 sm:w-20 sm:h-20" />
            <p className="text-xl sm:text-2xl font-black">اختر محادثة للرد عليها</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsTab;
