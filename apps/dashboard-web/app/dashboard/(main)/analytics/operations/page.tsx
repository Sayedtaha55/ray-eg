'use client';

import { Workflow } from 'lucide-react';
import AnalyticsPlaceholder from '@/components/analytics/AnalyticsPlaceholder';

/* تحليلات العمليات — هيكل مبدئي (كفاءة التشغيل: أوقات الذروة، أداء الكاشير، دورة الطلب) */

export default function OperationsAnalyticsPage() {
  return (
    <AnalyticsPlaceholder
      title="تحليلات العمليات"
      description="كفاءة التشغيل — أوقات الذروة، أداء الكاشير، ودورة الطلب من الاستلام للتسليم"
      icon={Workflow}
      accent="text-indigo-500"
      bullets={[
        'أوقات الذروة',
        'متوسط وقت تجهيز الطلب',
        'أداء الفروع/الورديات',
        'العمليات الملغاة والمردودة',
      ]}
      related={[
        { label: 'تقارير الكاشير', href: '/dashboard/pos/reports' },
        { label: 'الورديات', href: '/dashboard/pos/shifts' },
        { label: 'الطلبات', href: '/dashboard/sales' },
      ]}
    />
  );
}
