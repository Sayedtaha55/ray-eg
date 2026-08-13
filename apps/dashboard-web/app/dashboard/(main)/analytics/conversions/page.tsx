'use client';

import PagePlaceholder from '@/components/PagePlaceholder';
import { Target } from 'lucide-react';

export default function ConversionsPage() {
  return (
    <PagePlaceholder
      icon={Target}
      title="التحويلات"
      description="تتبع معدلات التحويل: من زائر إلى عميل، من سلة إلى طلب، من طلب إلى دفع."
      features={[
        'معدل تحويل الزوار إلى عملاء',
        'معدل تحويل السلات إلى طلبات',
        'معدل إتمام الدفع',
        'تتبع مسار التحويل (Funnel)',
        'تحليل نقاط التسرب في رحلة العميل',
      ]}
    />
  );
}
