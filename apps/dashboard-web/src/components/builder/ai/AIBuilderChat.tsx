'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: AIAction[];
  timestamp: Date;
}

interface AIAction {
  type: 'apply_design' | 'generate_content' | 'optimize_seo' | 'suggest_layout';
  label: string;
  payload: any;
}

interface AIBuilderChatProps {
  onAction: (action: AIAction) => void;
  activityType: 'COMMERCIAL' | 'RESERVATIONS' | 'HYBRID';
}

export default function AIBuilderChat({ onAction, activityType }: AIBuilderChatProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `مرحباً! أنا مساعدك الذكي لبناء ${activityType === 'COMMERCIAL' ? 'المتجر' : 'موقع الحجوزات'}. كيف يمكنني مساعدتك اليوم؟`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input, activityType);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string, type: string): AIChatMessage => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('لون') || lowerInput.includes('ألوان')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'يمكنني مساعدتك في اختيار الألوان المناسبة لموقعك. هل تريد اقتراحات بناءً على نشاطك التجاري؟',
        actions: [
          {
            type: 'apply_design',
            label: 'اقتراح ألوان احترافية',
            payload: { type: 'color_suggestions' },
          },
        ],
        timestamp: new Date(),
      };
    }

    if (lowerInput.includes('تصميم') || lowerInput.includes('تخطيط')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'يمكنني اقتراح تخطيط احترافي لموقعك. هل تريد تخطيطاً عصرياً أم كلاسيكياً؟',
        actions: [
          {
            type: 'suggest_layout',
            label: 'اقتراح تخطيط عصري',
            payload: { style: 'modern' },
          },
          {
            type: 'suggest_layout',
            label: 'اقتراح تخطيط كلاسيكي',
            payload: { style: 'classic' },
          },
        ],
        timestamp: new Date(),
      };
    }

    if (lowerInput.includes('محتوى') || lowerInput.includes('وصف')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'يمكنني مساعدتك في كتابة محتوى جذاب لمنتجاتك أو خدماتك. ما الذي تريد كتابته؟',
        actions: [
          {
            type: 'generate_content',
            label: 'كتابة وصف منتج',
            payload: { contentType: 'product_description' },
          },
          {
            type: 'generate_content',
            label: 'كتابة وصف خدمة',
            payload: { contentType: 'service_description' },
          },
        ],
        timestamp: new Date(),
      };
    }

    if (lowerInput.includes('seo') || lowerInput.includes('محركات بحث')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'يمكنني تحسين موقعك لمحركات البحث. هل تريد تحسين الصفحة الرئيسية أم صفحات المنتجات/الخدمات؟',
        actions: [
          {
            type: 'optimize_seo',
            label: 'تحسين SEO الصفحة الرئيسية',
            payload: { page: 'home' },
          },
        ],
        timestamp: new Date(),
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'فهمت طلبك. يمكنني مساعدتك في تصميم الموقع، كتابة المحتوى، تحسين SEO، وغيرها الكثير. هل يمكنك التوضيح أكثر؟',
      actions: [
        {
          type: 'apply_design',
          label: 'تصميم الموقع',
          payload: {},
        },
        {
          type: 'generate_content',
          label: 'كتابة المحتوى',
          payload: {},
        },
        {
          type: 'optimize_seo',
          label: 'تحسين SEO',
          payload: {},
        },
      ],
      timestamp: new Date(),
    };
  };

  const handleAction = (action: AIAction) => {
    onAction(action);
    
    // Add confirmation message
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `جاري تنفيذ: ${action.label}...`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF] flex items-center justify-center">
            <span className="text-white font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-bold text-sm">المساعد الذكي</h3>
            <p className="text-xs text-slate-500">متاح للمساعدة</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-3 ${
                message.role === 'user'
                  ? 'bg-brand-cyan text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleAction(action)}
                      className="w-full py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-cyan text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-4 py-2 rounded-xl bg-brand-gradient text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-cyan transition-all"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
}