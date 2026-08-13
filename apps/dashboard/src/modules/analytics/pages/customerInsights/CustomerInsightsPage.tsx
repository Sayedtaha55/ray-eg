import React, { useEffect, useState } from 'react';
import { Users, UserPlus, UserCheck, Heart, MapPin, Clock, TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

const CustomerInsightsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [segments, setSegments] = useState([
    { label: isArabic ? 'عملاء جدد' : 'New Customers', value: 0, percentage: 0, color: 'bg-blue-500' },
    { label: isArabic ? 'عملاء عائدون' : 'Returning', value: 0, percentage: 0, color: 'bg-green-500' },
    { label: isArabic ? 'عملاء VIP' : 'VIP', value: 0, percentage: 0, color: 'bg-amber-500' },
    { label: isArabic ? 'غير نشطين' : 'Inactive', value: 0, percentage: 0, color: 'bg-slate-400' },
  ]);
  const [demographics] = useState([
    { age: '18-24', count: 0, percentage: 0 },
    { age: '25-34', count: 0, percentage: 0 },
    { age: '35-44', count: 0, percentage: 0 },
    { age: '45-54', count: 0, percentage: 0 },
    { age: '55+', count: 0, percentage: 0 },
  ]);
  const [topLocations] = useState([
    { city: isArabic ? 'القاهرة' : 'Cairo', customers: 0, percentage: 0 },
    { city: isArabic ? 'الإسكندرية' : 'Alexandria', customers: 0, percentage: 0 },
    { city: isArabic ? 'الجيزة' : 'Giza', customers: 0, percentage: 0 },
    { city: isArabic ? 'المنصورة' : 'Mansoura', customers: 0, percentage: 0 },
    { city: isArabic ? 'أخرى' : 'Other', customers: 0, percentage: 0 },
  ]);
  const [totalCustomers, setTotalCustomers] = useState('0');
  const [newCustomers, setNewCustomers] = useState('0');
  const [retention, setRetention] = useState('0%');

  useEffect(() => {
    const sid = String(shopId || '').trim();
    if (!sid) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res: any = await ApiService.getCustomerInsights(sid, { period: '30d' });
        if (cancelled || !res) return;
        const data = res.data ?? res;
        const total = Number(data?.total_customers ?? data?.totalCustomers ?? 0);
        const newC = Number(data?.new_customers ?? data?.newCustomers ?? 0);
        const ret = Number(data?.returning_customers ?? data?.returningCustomers ?? 0);
        setTotalCustomers(String(total));
        setNewCustomers(String(newC));
        setRetention(total > 0 ? `${Math.round((ret / total) * 100)}%` : '0%');
        if (Array.isArray(data?.segments)) {
          const colorMap: Record<string, string> = {
            New: 'bg-blue-500',
            Returning: 'bg-green-500',
            VIP: 'bg-amber-500',
            Inactive: 'bg-slate-400',
          };
          setSegments(
            data.segments.map((s: any) => ({
              label: isArabic ? (s.segment_ar || s.segmentAr || s.segment) : s.segment,
              value: Number(s.count || 0),
              percentage: Number(s.percentage || 0),
              color: colorMap[s.segment] || 'bg-slate-400',
            })),
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load customer insights');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [shopId, isArabic]);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'رؤى العملاء' : 'Customer Insights'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تحليل سلوك العملاء' : 'Customer behavior analysis'}</p></div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي العملاء' : 'Total Customers', value: Number(totalCustomers).toLocaleString(), color: 'bg-blue-50 text-blue-600', icon: <Users size={20} /> },
          { label: isArabic ? 'عملاء جدد' : 'New This Month', value: Number(newCustomers).toLocaleString(), color: 'bg-green-50 text-green-600', icon: <UserPlus size={20} /> },
          { label: isArabic ? 'عملاء نشطون' : 'Active', value: Number(totalCustomers).toLocaleString(), color: 'bg-purple-50 text-purple-600', icon: <UserCheck size={20} /> },
          { label: isArabic ? 'معدل الاحتفاظ' : 'Retention Rate', value: retention, color: 'bg-amber-50 text-amber-600', icon: <Heart size={20} /> },
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
