'use client';

import { Banknote } from 'lucide-react';
import AnalyticsPlaceholder from '@/components/analytics/AnalyticsPlaceholder';

/* تقارير المدفوعات — هيكل مبدئي (طرق الدفع والتحصيلات والمعاملات) */

export default function PaymentsAnalyticsPage() {
  return (
    <AnalyticsPlaceholder
      title="تقارير المدفوعات"
      description="طرق الدفع والتحصيلات والمعاملات — اتبع كل جنيه دخل وخرج"
      icon={Banknote}
      accent="text-emerald-500"
      bullets={[
        'توزيع طرق الدفع',
        'المعاملات الناجحة/الفاشلة',
        'التحصيلات والمتأخرات',
        'تسويات المدفوعات',
      ]}
      related={[
        { label: 'المدفوعات والتحصيلات', href: '/dashboard/sales/payments' },
        { label: 'تقارير المالية', href: '/dashboard/analytics/finance' },
      ]}
    />
  );
}
