'use client';

import PagePlaceholder from '@/components/PagePlaceholder';
import { ShieldCheck } from 'lucide-react';

export default function PermissionsPage() {
  return (
    <PagePlaceholder
      icon={ShieldCheck}
      title="الصلاحيات"
      description="إدارة صلاحيات الموظفين والأدوار والوصول للوحات والأقسام."
      features={[
        'إنشاء أدوار مخصصة (مدير، كاشير، مخزني)',
        'تحديد صلاحيات لكل دور على مستوى الصفحة',
        'تحكم في الوصول للأقسام والميزات',
        'سجل عمليات الدخول والتعديلات',
        'صلاحيات فرعية لكل وحدة (عرض/تعديل/حذف)',
      ]}
    />
  );
}
