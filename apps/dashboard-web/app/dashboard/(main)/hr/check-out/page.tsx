'use client';

import PagePlaceholder from '@/components/PagePlaceholder';
import { LogOut } from 'lucide-react';

export default function CheckOutPage() {
  return (
    <PagePlaceholder
      icon={LogOut}
      title="الانصراف"
      description="تتبع انصراف الموظفين وساعات العمل الفعلية وتسجيل الخروج."
      features={[
        'تسجيل انصراف الموظفين',
        'حساب ساعات العمل الفعلية',
        'تتبع الانصراف المتأخر والمبكر',
        'ربط الانصراف بنظام الحضور',
        'تقارير ساعات العمل اليومية والشهرية',
      ]}
    />
  );
}
