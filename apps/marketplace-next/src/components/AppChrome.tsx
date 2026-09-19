'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileFooter } from '@/components/MobileFooter';
import { CartDrawer } from '@/components/CartDrawer';

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Merchant sites are fully independent: /shop/[slug] pages and published
  // /site/[slug] builder sites render their own header/footer — no market chrome.
  const isMerchantSite =
    !!pathname && (pathname.startsWith('/shop/') || pathname.startsWith('/site/'));

  if (isMerchantSite) {
    return (
      <>
        <main className="min-h-screen">{children}</main>
        <CartDrawer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-16 lg:pb-0">{children}</main>
      <Footer />
      <MobileFooter />
      <CartDrawer />
    </>
  );
}
