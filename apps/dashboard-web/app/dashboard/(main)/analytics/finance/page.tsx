'use client';

import { Landmark } from 'lucide-react';
import AnalyticsPlaceholder from '@/components/analytics/AnalyticsPlaceholder';

/* تقارير المالية — هيكل مبدئي (الإيرادات والمصروفات والأرباح والتدفق النقدي) */

export default function FinanceAnalyticsPage() {
  return (
    <AnalyticsPlaceholder
      title="تقارير المالية"
      description="الإيرادات والمصروفات والأرباح والتدفق النقدي في مكان واحد"
      icon={Landmark}
      accent="text-teal-500"
      bullets={['الإيرادات مقابل المصروفات', 'صافي الربح', 'التدفق النقدي', 'تقارير الضرائب']}
      related={[
        { label: 'الإيرادات', href: '/dashboard/finance/revenue' },
        { label: 'الفواتير', href: '/dashboard/finance' },
        { label: 'أداء المبيعات', href: '/dashboard/analytics/sales-performance' },
      ]}
    />
  );
}
