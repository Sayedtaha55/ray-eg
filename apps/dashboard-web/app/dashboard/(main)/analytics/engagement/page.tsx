'use client';

import { Heart } from 'lucide-react';
import AnalyticsPlaceholder from '@/components/analytics/AnalyticsPlaceholder';

/* تحليلات المشاركة — هيكل مبدئي (تفاعل العملاء مع المتجر والموقع) */

export default function EngagementAnalyticsPage() {
  return (
    <AnalyticsPlaceholder
      title="تحليلات المشاركة"
      description="تفاعل العملاء مع المتجر والموقع — مشاهدات المنتجات، الإعجابات، الحفظ للمفضلة، ومعدل التفاعل"
      icon={Heart}
      accent="text-fuchsia-500"
      bullets={[
        'مشاهدات المنتجات',
        'الإعجابات والحفظ',
        'معدل التفاعل اليومي',
        'أكثر المنتجات تفاعلًا',
      ]}
      related={[
        { label: 'الزوار', href: '/dashboard/analytics/visitors' },
        { label: 'التحويلات', href: '/dashboard/analytics/conversions' },
      ]}
    />
  );
}
