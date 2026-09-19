'use client';

import { SiteRenderer } from '@ray-eg/shared/builder';
import type { SiteProduct, SiteShopContext, Website } from '@ray-eg/shared/builder';
import { useCart } from '@/lib/cart';
import { playCartSound } from '@/lib/sounds';

interface SiteCartBridgeProps {
  website: Website;
  shop: SiteShopContext;
  products: SiteProduct[];
}

/**
 * Renders a published builder site wired into the marketplace unified cart:
 * "أضف للسلة" buttons on the site push into the same cart/drawer/checkout
 * flow as the rest of the marketplace, and the mobile footer cart button
 * opens the shared drawer.
 */
export function SiteCartBridge({ website, shop, products }: SiteCartBridgeProps) {
  const { addItem, setCartOpen, totalItems } = useCart();

  return (
    <SiteRenderer
      website={website}
      shop={shop}
      products={products}
      cartCount={totalItems}
      onAddToCart={(p) => {
        addItem({
          id: p.id,
          shopId: shop.id,
          shopName: shop.name,
          shopSlug: shop.slug,
          name: p.title,
          price: typeof p.price === 'string' ? parseFloat(p.price) || 0 : p.price,
          imageUrl: p.image,
          isAvailable: p.isAvailable !== false,
        });
        playCartSound();
        setCartOpen(true);
      }}
      onOpenCart={() => setCartOpen(true)}
    />
  );
}
