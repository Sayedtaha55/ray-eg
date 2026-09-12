'use client';

import { Megaphone } from 'lucide-react';
import AnalyticsPlaceholder from '@/components/analytics/AnalyticsPlaceholder';

/* تحليلات التسويق — هيكل مبدئي (أداء الحملات والكوبونات والخصومات) */

export default function MarketingAnalyticsPage() {
  return (
    <AnalyticsPlaceholder
      title="تحليلات التسويق"
      description="أداء الحملات والكوبونات والخصومات — اعرف إعلانك اللي بيجيب بيع فعلًا"
      icon={Megaphone}
      accent="text-rose-500"
      bullets={['أداء الحملات', 'استخدام الكوبونات', 'قنوات الترافيك', 'معدل التحويل التسويقي']}
      related={[
        { label: 'الحملات', href: '/dashboard/marketing/campaigns' },
        { label: 'الكوبونات', href: '/dashboard/marketing/coupons' },
        { label: 'التحويلات', href: '/dashboard/analytics/conversions' },
      ]}
    />
  );
}
