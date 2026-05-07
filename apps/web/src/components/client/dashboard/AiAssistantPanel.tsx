'use client';

import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useT } from '@/i18n/useT';

type Props = {
  shopId: string;
  shop: any;
  currentPage: string;
  onActionExecuted: () => void;
};

const AiAssistantPanel: React.FC<Props> = () => {
  const t = useT();
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-all">
        <Bot size={24} />
      </button>
    </div>
  );
};

export default AiAssistantPanel;
