import React from 'react';
import { Palette } from 'lucide-react';
import type { BookingActivityType } from '../config';

type Props = {
  activityType: BookingActivityType;
  shop?: any;
};

/**
 * Placeholder Design Page
 * This page is shown when the user navigates to the "design" tab.
 * It can be expanded later with actual design configuration UI.
 */
const BookingDesignPage: React.FC<Props> = ({ activityType }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4" dir="rtl">
      <Palette className="w-16 h-16 text-cyan-500" />
      <h2 className="text-2xl font-black text-slate-900">
        إعدادات التصميم للـ {activityType}
      </h2>
      <p className="text-slate-500">
        الصفحة تحت الإنشاء. يمكنك إضافة مكونات تصميم الحجز هنا في المستقبل.
      </p>
    </div>
  );
};

export default BookingDesignPage;
