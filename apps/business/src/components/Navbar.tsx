'use client';

import Link from 'next/link';
import { Store } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-black text-lg">من مكانك</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-semibold text-white/60 hover:text-cyan-400 transition-colors">المميزات</Link>
          <Link href="/#themes" className="text-sm font-semibold text-white/60 hover:text-cyan-400 transition-colors">الثيمات</Link>
          <Link href="/#industries" className="text-sm font-semibold text-white/60 hover:text-cyan-400 transition-colors">الأنشطة</Link>
          <Link href="/#faq" className="text-sm font-semibold text-white/60 hover:text-cyan-400 transition-colors">الأسئلة الشائعة</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-white/60 hover:text-cyan-400 transition-colors"
          >
            دخول
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-900 text-sm font-black hover:bg-cyan-400 transition-all"
          >
            ابدأ مجاناً
          </Link>
        </div>
      </div>
    </nav>
  );
}
