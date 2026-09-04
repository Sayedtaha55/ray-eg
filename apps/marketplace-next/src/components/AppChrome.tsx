'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileFooter } from '@/components/MobileFooter';
import { ScrollProgress } from '@/components/ScrollProgress';
import { CartDrawer } from '@/components/CartDrawer';

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShop = pathname&&pathname.startsWith('/shop/');

  if (isShop) {
    return (
      <>
        <main className="min-h-screen">{children}</main>
        <CartDrawer />
      </>
    );
  }

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="min-h-screen pt-16 md:pt-20 pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileFooter />
      <CartDrawer />
    </>
  );
}
