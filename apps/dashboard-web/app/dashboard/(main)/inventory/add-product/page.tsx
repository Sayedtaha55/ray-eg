'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/hooks/useShop';
import { Loader2 } from 'lucide-react';

const CATEGORY_TO_ACTIVITY: Record<string, string> = {
  RESTAURANT: 'restaurant',
  RETAIL: 'retail',
  CAFE: 'cafe',
  PHARMACY: 'pharmacy',
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  FASHION: 'clothing',
  GROCERY: 'grocery',
  FOOD: 'grocery',
  BEAUTY: 'beauty',
  FURNITURE: 'retail',
  SERVICE: 'retail',
};

export default function AddProductPage() {
  const { shop } = useShop();
  const router = useRouter();

  useEffect(() => {
    const shopCategory = shop?.category?.toUpperCase() || 'RETAIL';
    const activityId = CATEGORY_TO_ACTIVITY[shopCategory] || 'retail';
    router.replace(`/dashboard/inventory/add-product/${activityId}`);
  }, [shop, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-slate-300" size={32} />
    </div>
  );
}
