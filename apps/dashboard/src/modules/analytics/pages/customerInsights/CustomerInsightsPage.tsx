import React from 'react';
import { Users, UserPlus, UserCheck, Heart, MapPin, Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

const CustomerInsightsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const segments = [
    { label: isArabic ? 'عملاء جدد' : 'New Customers', value: 234, percentage: 27, color: 'bg-blue-500' },
    { label: isArabic ? 'عملاء عائدون' : 'Returning', value: 412, percentage: 48, color: 'bg-green-500' },
    { label: isArabic ? 'عملاء VIP' : 'VIP', value: 86, percentage: 10, color: 'bg-amber-500' },
    { label: isArabic ? 'غير نشطين' : 'Inactive', value: 124, percentage: 15, color: 'bg-slate-400' },
  ];

  const demographics = [
    { age: '18-24', count: 180, percentage: 21 },
    { age: '25-34', count: 340, percentage: 40 },
    { age: '35-44', count: 210, percentage: 25 },
    { age: '45-54', count: 90, percentage: 10 },
    { age: '55+', count: 36, percentage: 4 },
  ];

  const topLocations = [
    { city: isArabic ? 'القاهرة' : 'Cairo', customers: 320, percentage: 37 },
    { city: isArabic ? 'الإسكندرية' : 'Alexandria', customers: 180, percentage: 21 },
    { city: isArabic ? 'الجيزة' : 'Giza', customers: 150, percentage: 17 },
    { city: isArabic ? 'المنصورة' : 'Mansoura', customers: 90, percentage: 10 },
    { city: isArabic ? 'أخرى' : 'Other', customers: 116, percentage: 15 },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'رؤى العملاء' : 'Customer Insights'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تحليل سلوك العملاء' : 'Customer behavior analysis'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي العملاء' : 'Total Customers', value: '856', color: 'bg-blue-50 text-blue-600', icon: <Users size={20} /> },
          { label: isArabic ? 'عملاء جدد' : 'New This Month', value: '234', color: 'bg-green-50 text-green-600', icon: <UserPlus size={20} /> },
          { label: isArabic ? 'عملاء نشطون' : 'Active', value: '732', color: 'bg-purple-50 text-purple-600', icon: <UserCheck size={20} /> },
          { label: isArabic ? 'معدل الاحتفاظ' : 'Retention Rate', value: '85%', color: 'bg-amber-50 text-amber-600', icon: <Heart size={20} /> },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-4 flex items-center gap-2"><Users size={16} /> {isArabic ? 'شرائح العملاء' : 'Customer Segments'}</h4>
          <div className="space-y-3">
            {segments.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1"><span className="text-sm font-bold">{s.label}</span><span className="text-sm text-slate-500">{s.value} ({s.percentage}%)</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.percentage}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-4 flex items-center gap-2"><Clock size={16} /> {isArabic ? 'الأعمار' : 'Age Groups'}</h4>
          <div className="space-y-3">
            {demographics.map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1"><span className="text-sm font-bold">{d.age}</span><span className="text-sm text-slate-500">{d.count} ({d.percentage}%)</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600" style={{ width: `${d.percentage}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-slate-100">
        <h4 className="font-black mb-4 flex items-center gap-2"><MapPin size={16} /> {isArabic ? 'أفضل المواقع' : 'Top Locations'}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {topLocations.map((loc, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 text-center">
              <p className="text-xs text-slate-400 font-bold">{loc.city}</p>
              <p className="text-xl font-black">{loc.customers}</p>
              <p className="text-xs text-slate-400">{loc.percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerInsightsPage;
