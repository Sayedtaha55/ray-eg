'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User, ShoppingBag, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart';

export function MobileFooter() {
  const pathname = usePathname();
  const { totalItems, setCartOpen } = useCart();

  const navItems = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/dalil', icon: Search, label: 'الدليل' },
    { href: '/wishlist', icon: Heart, label: 'المفضلة' },
    { href: '/notifications', icon: Bell, label: 'الإشعارات' },
    { href: '/profile', icon: User, label: 'حسابي' },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-[100]">
      <div className="flex items-center justify-around py-2">
        {navItems.slice(0, 2).map((item) => {
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

        {/* Cart center button */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-brand-cyan"
        >
          <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center -mt-6 shadow-lg">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          {totalItems > 0 && (
            <span className="absolute top-0 right-2 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
          <span className="text-[10px] font-semibold">السلة</span>
        </button>

        {navItems.slice(2).map((item) => {
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
