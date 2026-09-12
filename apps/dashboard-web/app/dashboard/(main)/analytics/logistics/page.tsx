'use client';

import { Truck } from 'lucide-react';
import AnalyticsPlaceholder from '@/components/analytics/AnalyticsPlaceholder';

/* تقارير اللوجستيات — هيكل مبدئي (الشحن والتوصيل والمخازن) */

export default function LogisticsAnalyticsPage() {
  return (
    <AnalyticsPlaceholder
      title="تقارير اللوجستيات"
      description="الشحن والتوصيل والمخازن — تابع الشحنات واداء مناطق التوصيل وكلفتها"
      icon={Truck}
      accent="text-amber-500"
      bullets={['حالات الشحنات', 'أوقات التوصيل', 'أداء مناطق التوصيل', 'تكاليف الشحن']}
      related={[
        { label: 'الطلبات', href: '/dashboard/sales' },
        { label: 'تقارير المخزون', href: '/dashboard/analytics/inventory' },
      ]}
    />
  );
}
