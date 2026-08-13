'use client';

import PagePlaceholder from '@/components/PagePlaceholder';
import { CalendarCheck } from 'lucide-react';

export default function ReservationsPage() {
  return (
    <PagePlaceholder
      icon={CalendarCheck}
      title="الحجوزات"
      description="إدارة جميع الحجوزات والمواعيد: قائمة الحجوزات، التأكيد، الإلغاء، والتقويم."
      features={[
        'قائمة بكل الحجوزات (قيد الانتظار / مؤكد / مكتمل / ملغي)',
        'تأكيد أو رفض الحجوزات',
        'عرض التقويم الشهري واليومي',
        'بحث وفلترة الحجوزات',
        'تصدير الحجوزات (PDF / Excel)',
        'ربط الحجوزات بالمواعيد والطاولات والغرف',
      ]}
    />
  );
}
