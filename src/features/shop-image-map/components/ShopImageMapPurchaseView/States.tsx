import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = memo(({ message = 'جاري التحميل...' }: LoadingStateProps) => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
      <span className="font-black text-slate-600">{message}</span>
    </div>
  </div>
));

interface ErrorStateProps {
  message: string;
  onBack: () => void;
}

export const ErrorState = memo(({ message, onBack }: ErrorStateProps) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-6 text-center animate-in fade-in zoom-in-95 duration-300">
    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-black text-2xl">!</div>
    </div>
    <div className="text-slate-600 font-black text-xl max-w-md leading-relaxed">{message}</div>
    <button 
      onClick={onBack} 
      className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-900/20 transition-all active:scale-95 hover:bg-black"
    >
      رجوع للمتجر
    </button>
  </div>
));
