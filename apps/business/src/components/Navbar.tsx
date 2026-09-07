'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { businessBrand } from '@/lib/brand';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dark = scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        dark
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center overflow-hidden">
            <Image src={businessBrand.logo} alt={businessBrand.name} width={28} height={28} className="w-6 h-6 object-contain" />
          </div>
          <span className="text-slate-900 font-black text-lg transition-colors">{businessBrand.name}</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/new" className="inline-flex items-center gap-1 text-sm font-black text-cyan-600 hover:text-cyan-500 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            جديد
          </Link>
          <Link href="/#features" className="text-sm font-semibold text-slate-600 hover:text-cyan-600 transition-colors">المميزات</Link>
          <Link href="/#themes" className="text-sm font-semibold text-slate-600 hover:text-cyan-600 transition-colors">الثيمات</Link>
          <Link href="/#industries" className="text-sm font-semibold text-slate-600 hover:text-cyan-600 transition-colors">الأنشطة</Link>
          <Link href="/#faq" className="text-sm font-semibold text-slate-600 hover:text-cyan-600 transition-colors">الأسئلة الشائعة</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-600 hover:text-cyan-600 transition-colors"
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
