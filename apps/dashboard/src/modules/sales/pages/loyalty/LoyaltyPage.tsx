import React, { useState, useEffect, useCallback } from 'react';
import { Gift, Plus, Search, Trash2, Loader2, X, Star, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type LoyaltyMember = {
  id: string;
  customerName: string;
  phone: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  joinedAt: string;
};

const TIER_CONFIG: Record<string, { ar: string; en: string; color: string; bg: string; icon: React.ReactNode }> = {
  bronze: { ar: 'برونزي', en: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-100', icon: <Award size={14} /> },
  silver: { ar: 'فضي', en: 'Silver', color: 'text-slate-600', bg: 'bg-slate-200', icon: <Award size={14} /> },
  gold: { ar: 'ذهبي', en: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <Star size={14} /> },
  platinum: { ar: 'بلاتيني', en: 'Platinum', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Star size={14} /> },
};

const LoyaltyPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getShopCustomers?.(shopId);
      const customers = Array.isArray(res) ? res : (res as any)?.data || [];
      setMembers(customers.map((c: any) => ({
        id: String(c.id),
        customerName: c.name || c.customerName || '---',
        phone: c.phone || c.phoneNumber || '---',
        points: Number(c.loyaltyPoints || c.points || 0),
        tier: (c.tier || 'bronze') as any,
        totalSpent: Number(c.totalSpent || c.totalOrders || 0),
        joinedAt: c.createdAt || new Date().toISOString(),
      })));
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  const filtered = members.filter(m =>
    m.customerName.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search)
  );

  const totalPoints = members.reduce((s, m) => s + m.points, 0);
  const stats = [
    { label: isArabic ? 'إجمالي الأعضاء' : 'Total Members', value: members.length, icon: <Gift size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'إجمالي النقاط' : 'Total Points', value: totalPoints.toLocaleString(), icon: <Star size={20} />, color: 'bg-yellow-50 text-yellow-600' },
    { label: isArabic ? 'أعضاء ذهبيين' : 'Gold Members', value: members.filter(m => m.tier === 'gold').length, icon: <Award size={20} />, color: 'bg-amber-50 text-amber-600' },
    { label: isArabic ? 'أعضاء بلاتيني' : 'Platinum', value: members.filter(m => m.tier === 'platinum').length, icon: <Star size={20} />, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'نقاط الولاء' : 'Loyalty Points'}</h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'برنامج نقاط الولاء للعملاء' : 'Customer loyalty points program'}</p>
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Gift size={64} className="mx-auto mb-4 text-slate-200" />
          <p className="font-black text-xl text-slate-300 mb-2">{isArabic ? 'لا يوجد أعضاء بعد' : 'No members yet'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b border-slate-100">
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العميل' : 'Customer'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الهاتف' : 'Phone'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'النقاط' : 'Points'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المستوى' : 'Tier'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'إجمالي الإنفاق' : 'Total Spent'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const tier = TIER_CONFIG[m.tier] || TIER_CONFIG.bronze;
                return (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-bold">{m.customerName}</td>
                    <td className="py-3 text-slate-500">{m.phone}</td>
                    <td className="py-3 font-bold text-yellow-600">{m.points.toLocaleString()}</td>
                    <td className="py-3"><span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${tier.bg} ${tier.color} w-fit`}>{tier.icon} {isArabic ? tier.ar : tier.en}</span></td>
                    <td className="py-3 font-medium">{t('business.reports.currency')} {m.totalSpent.toLocaleString()}</td>
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

export default LoyaltyPage;
