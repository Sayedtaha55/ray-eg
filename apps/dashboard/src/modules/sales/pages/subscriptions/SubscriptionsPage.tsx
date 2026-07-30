import React, { useState, useEffect, useCallback } from 'react';
import { Repeat, Plus, Search, Trash2, Loader2, X, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type Subscription = {
  id: string;
  customerName: string;
  planName: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  nextBilling: string;
  startedAt: string;
};

const FREQ_LABELS: Record<string, { ar: string; en: string }> = {
  daily: { ar: 'يومي', en: 'Daily' },
  weekly: { ar: 'أسبوعي', en: 'Weekly' },
  monthly: { ar: 'شهري', en: 'Monthly' },
  yearly: { ar: 'سنوي', en: 'Yearly' },
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'text-green-600', bg: 'bg-green-100' },
  paused: { ar: 'متوقف', en: 'Paused', color: 'text-amber-600', bg: 'bg-amber-100' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'text-red-600', bg: 'bg-red-100' },
  expired: { ar: 'منتهي', en: 'Expired', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const SubscriptionsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getShopCustomers?.(shopId);
      const customers = Array.isArray(res) ? res : (res as any)?.data || [];
      setSubs(customers.filter((c: any) => c.hasSubscription).map((c: any) => ({
        id: String(c.id),
        customerName: c.name || '---',
        planName: c.subscriptionPlan || (isArabic ? 'الباقة الأساسية' : 'Basic Plan'),
        amount: Number(c.subscriptionAmount || 99),
        frequency: c.subscriptionFrequency || 'monthly',
        status: c.subscriptionStatus || 'active',
        nextBilling: c.nextBillingDate || new Date(Date.now() + 30 * 86400000).toISOString(),
        startedAt: c.createdAt || new Date().toISOString(),
      })));
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, isArabic]);

  useEffect(() => { loadSubs(); }, [loadSubs]);

  const filtered = subs.filter(s => s.customerName.toLowerCase().includes(search.toLowerCase()));
  const totalRevenue = subs.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0);

  const stats = [
    { label: isArabic ? 'إجمالي الاشتراكات' : 'Total Subscriptions', value: subs.length, icon: <Repeat size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'نشطة' : 'Active', value: subs.filter(s => s.status === 'active').length, icon: <Repeat size={20} />, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'متوقفة' : 'Paused', value: subs.filter(s => s.status === 'paused').length, icon: <Repeat size={20} />, color: 'bg-amber-50 text-amber-600' },
    { label: isArabic ? 'الإيراد الشهري' : 'Monthly Revenue', value: `${t('business.reports.currency')} ${totalRevenue.toLocaleString()}`, icon: <Repeat size={20} />, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الاشتراكات' : 'Subscriptions'}</h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة اشتراكات العملاء المتكررة' : 'Manage recurring customer subscriptions'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Repeat size={64} className="mx-auto mb-4 text-slate-200" />
          <p className="font-black text-xl text-slate-300 mb-2">{isArabic ? 'لا توجد اشتراكات' : 'No subscriptions yet'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b border-slate-100">
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العميل' : 'Customer'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الباقة' : 'Plan'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المبلغ' : 'Amount'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'التكرار' : 'Frequency'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الفاتورة القادمة' : 'Next Billing'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const st = STATUS_STYLES[s.status] || STATUS_STYLES.active;
                const freq = FREQ_LABELS[s.frequency] || FREQ_LABELS.monthly;
                return (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-bold">{s.customerName}</td>
                    <td className="py-3 text-slate-500">{s.planName}</td>
                    <td className="py-3 font-bold">{t('business.reports.currency')} {s.amount.toLocaleString()}</td>
                    <td className="py-3 text-slate-500">{isArabic ? freq.ar : freq.en}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span></td>
                    <td className="py-3 text-slate-500"><span className="flex items-center gap-1"><Calendar size={12} /> {new Date(s.nextBilling).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
