'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileFooter() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/dalil', icon: Search, label: 'الدليل' },
    { href: '/offers', icon: ShoppingBag, label: 'العروض' },
    { href: '/profile/wishlist', icon: Heart, label: 'المفضلة' },
    { href: '/profile', icon: User, label: 'حسابي' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-[100]">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all',
                isActive
                  ? 'text-brand-cyan'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
