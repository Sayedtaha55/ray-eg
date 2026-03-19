import React from 'react';

const ClinicSettingsPage: React.FC = () => {
  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 md:p-8">
      <div className="text-lg font-black text-slate-900">الإعدادات</div>
      <div className="mt-2 text-sm font-bold text-slate-500">هنا هنضيف إعدادات العيادة (مواعيد العمل، الأطباء، موارد الحجز، إلخ).</div>
    </div>
  );
};

export default ClinicSettingsPage;
