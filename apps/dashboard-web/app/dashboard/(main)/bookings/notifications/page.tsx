'use client';

import PagePlaceholder from '@/components/PagePlaceholder';
import { Bell } from 'lucide-react';

export default function BookingsNotificationsPage() {
  return (
    <PagePlaceholder
      icon={Bell}
      title="إشعارات الحجوزات"
      description="تأكيدات الحجز، تذكيرات المواعيد، وإشعارات الإلغاء والتعديل."
      features={[
        'إشعارات تأكيد الحجز تلقائياً',
        'تذكيرات قبل الموعد بوقت محدد',
        'إشعارات الإلغاء والتعديل',
        'إشعارات الحجوزات الجديدة',
        'تنبيهات الحجوزات المتأخرة',
        'إعدادات قنوات الإشعار (SMS، إيميل، WhatsApp)',
      ]}
    />
  );
}
