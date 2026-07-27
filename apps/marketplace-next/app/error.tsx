'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-4xl flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl md:text-3xl font-black mb-3">حدث خطأ ما</h2>
      <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 max-w-md">
        نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو العودة لاحقاً
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-gradient text-white font-black hover:shadow-glow-cyan transition-all"
      >
        <RotateCcw className="w-5 h-5" />
        إعادة المحاولة
      </button>
    </div>
  );
}
