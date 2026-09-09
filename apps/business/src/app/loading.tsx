import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="w-10 h-10 text-[#00E5FF] animate-spin" />
      <p className="text-slate-500 font-semibold text-sm">جاري التحميل...</p>
    </div>
  );
}

