'use client';

import PagePlaceholder from '@/components/PagePlaceholder';
import { PackageSearch } from 'lucide-react';

export default function ProductPerformancePage() {
  return (
    <PagePlaceholder
      icon={PackageSearch}
      title="أداء المنتجات"
      description="تحليل أداء المنتجات: الأكثر مبيعاً، الأقل مبيعاً، معدلات العرض والطلب."
      features={[
        'المنتجات الأكثر مبيعاً',
        'المنتجات الأقل مبيعاً',
        'معدل دوران المخزون لكل منتج',
        'تحليل الربحية لكل منتج',
        'تقارير أداء حسب الفئة',
      ]}
    />
  );
}
