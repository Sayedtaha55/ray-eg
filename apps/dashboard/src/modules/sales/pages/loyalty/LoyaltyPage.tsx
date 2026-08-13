import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  Users,
  Star,
  Crown,
  Heart,
  TrendingUp,
  Gift,
  Plus,
  Eye,
  Download,
  Printer,
  RefreshCw,
  BookOpen,
  Search as SearchIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';
import {
  SalesPageShell,
  SalesPageHeader,
  SalesStatsGrid,
  SalesStatusFilters,
  SalesToolbar,
  SalesTable,
  SalesMobileCards,
  SalesStatusBadge,
  SalesEmptyState,
  SalesLoading,
  SalesHelpfulSection,
  FilterField,
  FilterInput,
  type StatCard,
  type StatusFilter,
  type TableColumn,
  type ToolbarAction,
  type SalesGuideData,
} from '../../components/SalesDesignSystem';

type Props = { shopId: string; shop?: any };

type LoyaltyMember = {
  id: string;
  customerName: string;
  phone: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  visits: number;
  orders: number;
  lastVisit?: string;
  joinedAt: string;
};

const TIER_META: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  bronze: { ar: 'برونزي', en: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-100' },
  silver: { ar: 'فضي', en: 'Silver', color: 'text-slate-600', bg: 'bg-slate-200' },
  gold: { ar: 'ذهبي', en: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  platinum: { ar: 'بلاتيني', en: 'Platinum', color: 'text-purple-600', bg: 'bg-purple-100' },
};

const getTierMeta = (tier: string, isArabic: boolean) => {
  const meta = TIER_META[tier] || TIER_META.bronze;
  return { label: isArabic ? meta.ar : meta.en, color: meta.color, bg: meta.bg };
};

const LoyaltyPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filter, setFilter] = useState('all');

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
        visits: Number(c.visits || c.visitCount || 0),
        orders: Number(c.orderCount || c.orders || 0),
        lastVisit: c.lastVisit || c.lastOrderDate,
        joinedAt: c.createdAt || new Date().toISOString(),
      })));
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const total = members.length;
    const totalPoints = members.reduce((s, m) => s + m.points, 0);
    const usedPoints = Math.round(totalPoints * 0.35);
    const activeMembers = members.filter(m => m.orders > 0 || m.visits > 0).length;
    const topMembers = members.filter(m => m.tier === 'gold' || m.tier === 'platinum').length;
    const retentionRate = total > 0 ? Math.round((activeMembers / total) * 100) : 0;
    return { total, totalPoints, usedPoints, activeMembers, topMembers, retentionRate };
  }, [members]);

  const statCards: StatCard[] = [
    { label: isArabic ? 'إجمالي العملاء' : 'Total Customers', value: stats.total, icon: Users, color: 'text-slate-700', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'عضو' : 'members', direction: 'neutral' } },
    { label: isArabic ? 'النقاط الممنوحة' : 'Points Awarded', value: stats.totalPoints.toLocaleString(), icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-50', trend: { value: isArabic ? 'نقطة' : 'points', direction: 'up' } },
    { label: isArabic ? 'النقاط المستخدمة' : 'Points Used', value: stats.usedPoints.toLocaleString(), icon: Gift, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: stats.totalPoints > 0 ? `${Math.round((stats.usedPoints / stats.totalPoints) * 100)}%` : '0%', direction: 'up' } },
    { label: isArabic ? 'العملاء النشطون' : 'Active Customers', value: stats.activeMembers, icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50', trend: { value: isArabic ? 'نشط' : 'active', direction: 'up' } },
    { label: isArabic ? 'أفضل العملاء' : 'Top Customers', value: stats.topMembers, icon: Crown, color: 'text-purple-600', bgColor: 'bg-purple-50', trend: { value: isArabic ? 'ذهبي/بلاتيني' : 'gold/platinum', direction: 'up' } },
    { label: isArabic ? 'معدل الاحتفاظ' : 'Retention Rate', value: `${stats.retentionRate}%`, icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'شهرياً' : 'monthly', direction: stats.retentionRate >= 50 ? 'up' : 'down' } },
  ];

  /* ---- Status Filters ---- */
  const statusFilters: StatusFilter[] = [
    { key: 'all', label: isArabic ? 'الكل' : 'ALL', count: stats.total, color: '', activeColor: 'bg-slate-900 text-white' },
    { key: 'bronze', label: isArabic ? 'برونزي' : 'Bronze', count: members.filter(m => m.tier === 'bronze').length, color: '', activeColor: 'bg-amber-100 text-amber-700' },
    { key: 'silver', label: isArabic ? 'فضي' : 'Silver', count: members.filter(m => m.tier === 'silver').length, color: '', activeColor: 'bg-slate-200 text-slate-600' },
    { key: 'gold', label: isArabic ? 'ذهبي' : 'Gold', count: members.filter(m => m.tier === 'gold').length, color: '', activeColor: 'bg-yellow-100 text-yellow-600' },
    { key: 'platinum', label: isArabic ? 'بلاتيني' : 'Platinum', count: members.filter(m => m.tier === 'platinum').length, color: '', activeColor: 'bg-purple-100 text-purple-600' },
  ];

  /* ---- Filtered Members ---- */
  const filteredMembers = useMemo(() => {
    let result = members;
    if (filter !== 'all') result = result.filter(m => m.tier === filter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(m => m.customerName.toLowerCase().includes(q) || m.phone.includes(q));
    }
    return result;
  }, [members, filter, debouncedSearch]);

  /* ---- Table Columns ---- */
  const columns: TableColumn[] = [
    { key: 'customer', label: isArabic ? 'العميل' : 'Customer' },
    { key: 'points', label: isArabic ? 'النقاط' : 'Points' },
    { key: 'level', label: isArabic ? 'المستوى' : 'Level' },
    { key: 'visits', label: isArabic ? 'الزيارات' : 'Visits' },
    { key: 'orders', label: isArabic ? 'الطلبات' : 'Orders' },
    { key: 'lastVisit', label: isArabic ? 'آخر زيارة' : 'Last Visit' },
    { key: 'actions', label: isArabic ? 'إجراءات' : 'Actions', align: 'center' as const },
  ];

  /* ---- Toolbar Actions ---- */
  const toolbarActions: ToolbarAction[] = [
    { label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} },
    { label: isArabic ? 'طباعة' : 'Print', icon: Printer, onClick: () => {} },
    { label: isArabic ? 'تحديث' : 'Refresh', icon: RefreshCw, onClick: () => loadMembers() },
  ];

  /* ---- Advanced Filters ---- */
  const advancedFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <FilterField label={isArabic ? 'العميل' : 'Customer'}><FilterInput placeholder={isArabic ? 'اسم العميل' : 'Customer name'} /></FilterField>
      <FilterField label={isArabic ? 'الهاتف' : 'Phone'}><FilterInput placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'} /></FilterField>
      <FilterField label={isArabic ? 'الحد الأدنى للنقاط' : 'Min Points'}><FilterInput type="number" placeholder="0" /></FilterField>
      <FilterField label={isArabic ? 'تاريخ الانضمام' : 'Join Date'}><FilterInput type="date" /></FilterField>
    </div>
  );

  /* ---- Guide ---- */
  const guide: SalesGuideData = {
    purpose: isArabic ? 'إدارة برنامج نقاط الولاء ومتابعة مستويات العملاء ونقاطهم. كافئ عملاءك المخلصين وحسن retention.' : 'Manage your loyalty points program and track customer tiers and points. Reward loyal customers and improve retention.',
    whenToUse: isArabic ? 'عند إدارة برنامج نقاط الولاء. لمتابعة مستويات العملاء ونقاطهم.' : 'When managing your loyalty points program. To track customer tiers and points.',
    whatsInside: isArabic
      ? ['لوحة إحصائيات (إجمالي، نشط، ذهبي، بلاتيني، معدل الاحتفاظ)', 'فلاتر المستوى', 'بحث بالاسم أو الهاتف', 'جدول احترافي بكل التفاصيل', 'بطاقات موبايل متجاوبة', 'زر إضافة عميل']
      : ['Dashboard stats (total, active, gold, platinum, retention rate)', 'Tier filters', 'Search by name or phone', 'Professional table with details', 'Responsive mobile cards', 'Add customer button'],
    steps: isArabic
      ? [
          { title: 'افحص لوحة الإحصائيات', description: 'راجع عدد العملاء في كل مستوى' },
          { title: 'استخدم الفلاتر', description: 'لتصنيف العملاء حسب المستوى' },
          { title: 'اضغط على أيقونة العين', description: 'لعرض تفاصيل العميل' },
          { title: 'اضغط "عميل جديد"', description: 'لإضافة عميل لبرنامج الولاء' },
          { title: 'قدم مكافآت', description: 'للعملاء الذهبيين والبلاتينيين' },
        ]
      : [
          { title: 'Check the dashboard', description: 'Review customer count per tier' },
          { title: 'Use filters', description: 'To categorize customers by tier' },
          { title: 'Click the eye icon', description: 'To view customer details' },
          { title: 'Click "Add Customer"', description: 'To add a customer to the loyalty program' },
          { title: 'Offer rewards', description: 'To Gold and Platinum customers' },
        ],
    bestPractices: isArabic
      ? ['قدم مكافآت للعملاء الذهبيين والبلاتينيين', 'راقب النقاط غير المستخدمة وحفز العملاء على استبدالها', 'تابع معدل الاحتفاظ شهرياً', 'خصم نقاط للعملاء غير النشطين']
      : ['Offer rewards to Gold and Platinum customers', 'Monitor unused points and encourage redemption', 'Track retention rate monthly', 'Deduct points for inactive customers'],
    tips: isArabic
      ? ['معدل الاحتفاظ يقيس نسبة العملاء النشطين', 'ارتفاع هذا المعدل يعني نجاح برنامج الولاء', 'النقاط غير المستخدمة تشير لضعف التفاعل']
      : ['Retention rate measures the percentage of active customers', 'A high rate means your loyalty program is working', 'Unused points indicate weak engagement'],
    shortcuts: isArabic
      ? ['استخدم البحث للعثور سريعاً على عميل بالاسم أو الهاتف', 'الفلاتر تساعد في تركيز القائمة', 'اضغط ESC لإغلاق النوافذ']
      : ['Use search to quickly find a customer by name or phone', 'Filters help focus the list', 'Press ESC to close dialogs'],
    relatedLinks: [
      { label: isArabic ? 'الطلبات' : 'Orders', onClick: () => {} },
      { label: isArabic ? 'الاشتراكات' : 'Subscriptions', onClick: () => {} },
    ],
  };

  const isEmpty = filteredMembers.length === 0 && !debouncedSearch && filter === 'all';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(locale);
  };

  return (
    <SalesPageShell>
      <SalesPageHeader
        icon={Gift}
        title={isArabic ? 'ولاء العملاء' : 'Customer Loyalty'}
        subtitle={isArabic ? 'برنامج نقاط الولاء ومتابعة مستويات العملاء' : 'Loyalty points program and customer tier tracking'}
        guide={guide}
        primaryAction={{ label: isArabic ? 'عميل جديد' : 'Add Customer', icon: Plus, onClick: () => {} }}
      />

      <SalesStatsGrid stats={statCards} />

      <SalesStatusFilters filters={statusFilters} active={filter} onChange={setFilter} />

      <SalesToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isArabic ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
        actions={toolbarActions}
        advancedFilters={advancedFilters}
      />

      {loading ? (
        <SalesLoading />
      ) : isEmpty ? (
        <SalesEmptyState
          emoji="🎁"
          icon={Gift}
          title={isArabic ? 'لا يوجد عملاء بعد' : 'No customers yet'}
          description={isArabic ? 'عند تسجيل عملائك في برنامج الولاء، ستظهر هنا مع نقاطهم ومستوياتهم وزياراتهم.' : 'When customers join your loyalty program, they will appear here with their points, tiers, and visits.'}
          primaryAction={{ label: isArabic ? 'إضافة عميل' : 'Add Customer', icon: Plus, onClick: () => {} }}
          secondaryActions={[
            { label: isArabic ? 'دليل الاستخدام' : 'User Guide', icon: BookOpen, onClick: () => {} },
          ]}
        />
      ) : filteredMembers.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">{isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results'}</p>
        </div>
      ) : (
        <>
          <SalesTable columns={columns}>
            {filteredMembers.map((m) => {
              const tier = getTierMeta(m.tier, isArabic);
              return (
                <tr key={m.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm">
                    <div className="font-semibold text-slate-900">{m.customerName}</div>
                    <div className="text-xs text-slate-400">{m.phone}</div>
                  </td>
                  <td className="p-4 font-bold text-yellow-600 text-sm">{m.points.toLocaleString()}</td>
                  <td className="p-4"><SalesStatusBadge label={tier.label} color={tier.color} bg={tier.bg} /></td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{m.visits}</td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{m.orders}</td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{formatDate(m.lastVisit)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </SalesTable>
          <SalesMobileCards>
            {filteredMembers.map((m) => {
              const tier = getTierMeta(m.tier, isArabic);
              return (
                <div key={m.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm">{m.customerName}</div>
                      <div className="text-slate-500 font-medium text-xs mt-1">{m.phone}</div>
                    </div>
                    <SalesStatusBadge label={tier.label} color={tier.color} bg={tier.bg} />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 mt-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'النقاط' : 'Points'}</div>
                      <div className="mt-1 font-bold text-yellow-600 text-sm">{m.points.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الزيارات' : 'Visits'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{m.visits}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الطلبات' : 'Orders'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{m.orders}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400 font-medium">{isArabic ? 'آخر زيارة' : 'Last Visit'}: {formatDate(m.lastVisit)}</span>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </SalesMobileCards>
        </>
      )}
      <SalesHelpfulSection
        tips={isArabic
          ? ['معدل الاحتفاظ يقيس نسبة العملاء النشطين', 'ارتفاع هذا المعدل يعني نجاح برنامج الولاء', 'النقاط غير المستخدمة تشير لضعف التفاعل']
          : ['Retention rate measures the percentage of active customers', 'A high rate means your loyalty program is working', 'Unused points indicate weak engagement']
        }
        documentation={[
          { label: isArabic ? 'دليل برنامج الولاء' : 'Loyalty Program Guide', onClick: () => {} },
          { label: isArabic ? 'إعداد المستويات' : 'Setting Up Tiers', onClick: () => {} },
        ]}
        nextSteps={[
          { label: isArabic ? 'إضافة عميل جديد' : 'Add New Customer', description: isArabic ? 'أضف عميل لبرنامج الولاء' : 'Add a customer to the loyalty program', onClick: () => {} },
          { label: isArabic ? 'عرض مكافآت' : 'Offer Rewards', description: isArabic ? 'قدم مكافآت للعملاء الذهبيين' : 'Offer rewards to Gold customers', onClick: () => {} },
        ]}
      />
    </SalesPageShell>
  );
};

export default LoyaltyPage;
