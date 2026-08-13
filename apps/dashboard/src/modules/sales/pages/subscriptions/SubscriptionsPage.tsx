import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  Repeat,
  CheckCircle2,
  XCircle,
  Ban,
  DollarSign,
  CalendarClock,
  Plus,
  Eye,
  Download,
  Printer,
  RefreshCw,
  BookOpen,
  Search as SearchIcon,
  X,
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

type Subscription = {
  id: string;
  customerName: string;
  customerPhone?: string;
  planName: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  autoRenew: boolean;
  startedAt: string;
  endsAt: string;
  nextBilling: string;
};

const FREQ_LABELS: Record<string, { ar: string; en: string }> = {
  daily: { ar: 'يومي', en: 'Daily' },
  weekly: { ar: 'أسبوعي', en: 'Weekly' },
  monthly: { ar: 'شهري', en: 'Monthly' },
  yearly: { ar: 'سنوي', en: 'Yearly' },
};

const STATUS_META: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'text-green-600', bg: 'bg-green-50' },
  paused: { ar: 'متوقف مؤقتاً', en: 'Paused', color: 'text-amber-600', bg: 'bg-amber-50' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50' },
  expired: { ar: 'منتهي', en: 'Expired', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const getStatusMeta = (status: string, isArabic: boolean) => {
  const meta = STATUS_META[status] || STATUS_META.active;
  return { label: isArabic ? meta.ar : meta.en, color: meta.color, bg: meta.bg };
};

const SubscriptionsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getShopCustomers?.(shopId);
      const customers = Array.isArray(res) ? res : (res as any)?.data || [];
      setSubs(customers.filter((c: any) => c.hasSubscription).map((c: any) => ({
        id: String(c.id),
        customerName: c.name || c.customerName || '---',
        customerPhone: c.phone || c.phoneNumber,
        planName: c.subscriptionPlan || (isArabic ? 'الباقة الأساسية' : 'Basic Plan'),
        amount: Number(c.subscriptionAmount || 99),
        frequency: c.subscriptionFrequency || 'monthly',
        status: c.subscriptionStatus || 'active',
        autoRenew: c.autoRenew !== false,
        startedAt: c.createdAt || new Date().toISOString(),
        endsAt: c.subscriptionEndDate || new Date(Date.now() + 30 * 86400000).toISOString(),
        nextBilling: c.nextBillingDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      })));
    } catch {
      setSubs([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, isArabic]);

  useEffect(() => { loadSubs(); }, [loadSubs]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const total = subs.length;
    const active = subs.filter(s => s.status === 'active').length;
    const expired = subs.filter(s => s.status === 'expired').length;
    const cancelled = subs.filter(s => s.status === 'cancelled').length;
    const monthlyRevenue = subs.filter(s => s.status === 'active').reduce((sum, s) => sum + s.amount, 0);
    const upcomingRenewals = subs.filter(s => {
      if (s.status !== 'active' || !s.autoRenew) return false;
      const d = new Date(s.nextBilling);
      const week = new Date(); week.setDate(week.getDate() + 7);
      return d <= week;
    }).length;
    return { total, active, expired, cancelled, monthlyRevenue, upcomingRenewals };
  }, [subs]);

  const statCards: StatCard[] = [
    { label: isArabic ? 'إجمالي الاشتراكات' : 'Total Subscriptions', value: stats.total, icon: Repeat, color: 'text-slate-700', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'اشتراك' : 'subs', direction: 'neutral' } },
    { label: isArabic ? 'نشطة' : 'Active', value: stats.active, icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%', direction: 'up' } },
    { label: isArabic ? 'منتهية' : 'Expired', value: stats.expired, icon: XCircle, color: 'text-slate-600', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'تحتاج تجديد' : 'need renewal', direction: 'down' } },
    { label: isArabic ? 'ملغاة' : 'Cancelled', value: stats.cancelled, icon: Ban, color: 'text-red-600', bgColor: 'bg-red-50', trend: { value: isArabic ? 'إلغاء' : 'cancelled', direction: 'down' } },
    { label: isArabic ? 'الإيراد الشهري' : 'Monthly Revenue', value: `${t('business.pos.egp')} ${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: isArabic ? 'شهرياً' : 'recurring', direction: 'up' } },
    { label: isArabic ? 'التجديد القادم' : 'Upcoming Renewals', value: stats.upcomingRenewals, icon: CalendarClock, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'هذا الأسبوع' : 'this week', direction: 'neutral' } },
  ];

  /* ---- Status Filters ---- */
  const statusFilters: StatusFilter[] = [
    { key: 'all', label: isArabic ? 'الكل' : 'ALL', count: stats.total, color: '', activeColor: 'bg-slate-900 text-white' },
    { key: 'active', label: isArabic ? 'نشطة' : 'Active', count: stats.active, color: '', activeColor: 'bg-green-50 text-green-600' },
    { key: 'paused', label: isArabic ? 'متوقفة' : 'Paused', count: subs.filter(s => s.status === 'paused').length, color: '', activeColor: 'bg-amber-50 text-amber-600' },
    { key: 'expired', label: isArabic ? 'منتهية' : 'Expired', count: stats.expired, color: '', activeColor: 'bg-slate-100 text-slate-600' },
    { key: 'cancelled', label: isArabic ? 'ملغاة' : 'Cancelled', count: stats.cancelled, color: '', activeColor: 'bg-red-50 text-red-600' },
  ];

  /* ---- Filtered Subs ---- */
  const filteredSubs = useMemo(() => {
    let result = subs;
    if (filter !== 'all') result = result.filter(s => s.status === filter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(s =>
        s.customerName.toLowerCase().includes(q) ||
        (s.customerPhone || '').includes(q) ||
        s.planName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [subs, filter, debouncedSearch]);

  /* ---- Table Columns ---- */
  const columns: TableColumn[] = [
    { key: 'customer', label: isArabic ? 'العميل' : 'Customer' },
    { key: 'plan', label: isArabic ? 'الباقة' : 'Plan' },
    { key: 'start', label: isArabic ? 'تاريخ البدء' : 'Start' },
    { key: 'end', label: isArabic ? 'تاريخ الانتهاء' : 'End' },
    { key: 'autoRenew', label: isArabic ? 'تجديد تلقائي' : 'Auto Renew' },
    { key: 'status', label: isArabic ? 'الحالة' : 'Status' },
    { key: 'actions', label: isArabic ? 'إجراءات' : 'Actions', align: 'center' as const },
  ];

  /* ---- Toolbar Actions ---- */
  const toolbarActions: ToolbarAction[] = [
    { label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} },
    { label: isArabic ? 'طباعة' : 'Print', icon: Printer, onClick: () => {} },
    { label: isArabic ? 'تحديث' : 'Refresh', icon: RefreshCw, onClick: () => loadSubs() },
  ];

  /* ---- Advanced Filters ---- */
  const advancedFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <FilterField label={isArabic ? 'العميل' : 'Customer'}><FilterInput placeholder={isArabic ? 'اسم العميل' : 'Customer name'} /></FilterField>
      <FilterField label={isArabic ? 'الباقة' : 'Plan'}><FilterInput placeholder={isArabic ? 'اسم الباقة' : 'Plan name'} /></FilterField>
      <FilterField label={isArabic ? 'تاريخ البدء' : 'Start Date'}><FilterInput type="date" /></FilterField>
      <FilterField label={isArabic ? 'تاريخ الانتهاء' : 'End Date'}><FilterInput type="date" /></FilterField>
    </div>
  );

  /* ---- Guide ---- */
  const guide: SalesGuideData = {
    purpose: isArabic ? 'إدارة اشتراكات العملاء المتكررة. تابع حالة كل اشتراك من تفعيله حتى انتهائه أو تجديده.' : 'Manage recurring customer subscriptions. Track each subscription from activation to expiration or renewal.',
    whenToUse: isArabic ? 'عند إدارة اشتراكات العملاء. لمتابعة التجديدات والاشتراكات المنتهية.' : 'When managing customer subscriptions. To track renewals and expired subscriptions.',
    whatsInside: isArabic
      ? ['لوحة إحصائيات (إجمالي، نشط، متوقف، منتهي، إيراد شهري)', 'فلاتر الحالة', 'بحث بالعميل أو الباقة', 'جدول احترافي بكل التفاصيل', 'بطاقات موبايل متجاوبة', 'زر اشتراك جديد']
      : ['Dashboard stats (total, active, paused, expired, monthly revenue)', 'Status filters', 'Search by customer or plan', 'Professional table with details', 'Responsive mobile cards', 'New subscription button'],
    steps: isArabic
      ? [
          { title: 'اضغط "اشتراك جديد"', description: 'لفتح نافذة إنشاء اشتراك' },
          { title: 'أدخل بيانات الاشتراك', description: 'العميل، الباقة، المبلغ، دورة التجديد' },
          { title: 'استخدم الفلاتر', description: 'لتصنيف الاشتراكات حسب الحالة' },
          { title: 'اضغط على أيقونة العين', description: 'لعرض تفاصيل الاشتراك' },
          { title: 'تابع التجديدات القادمة', description: 'قبل انتهاء الاشتراك' },
        ]
      : [
          { title: 'Click "New Subscription"', description: 'To open the create subscription dialog' },
          { title: 'Enter subscription details', description: 'Customer, plan, amount, billing cycle' },
          { title: 'Use filters', description: 'To categorize subscriptions by status' },
          { title: 'Click the eye icon', description: 'To view subscription details' },
          { title: 'Monitor upcoming renewals', description: 'Before subscription expiration' },
        ],
    bestPractices: isArabic
      ? ['تابع التجديدات القادمة قبل انتهاء الاشتراك', 'اعرض خطط تجديد للعملاء المنتهية اشتراكاتهم', 'راقب الإيراد الشهري شهرياً', 'تواصل مع العملاء المتوقفين لإعادة تفعيلهم']
      : ['Monitor upcoming renewals before expiration', 'Offer renewal plans to customers with expired subscriptions', 'Track monthly revenue month over month', 'Contact paused customers to reactivate'],
    tips: isArabic
      ? ['الإيراد الشهري يقيس إجمالي قيمة الاشتراكات النشطة', 'راقب التغيرات شهراً بشهر', 'الاشتراكات المتوقفة فرصة لإعادة التفعيل']
      : ['Monthly revenue measures total value of active subscriptions', 'Track changes month over month', 'Paused subscriptions are reactivation opportunities'],
    shortcuts: isArabic
      ? ['استخدم البحث للعثور سريعاً على اشتراك بالعميل أو الباقة', 'الفلاتر تساعد في تركيز القائمة', 'اضغط ESC لإغلاق النوافذ']
      : ['Use search to quickly find a subscription by customer or plan', 'Filters help focus the list', 'Press ESC to close dialogs'],
    relatedLinks: [
      { label: isArabic ? 'الطلبات' : 'Orders', onClick: () => {} },
      { label: isArabic ? 'ولاء العملاء' : 'Loyalty', onClick: () => {} },
    ],
  };

  const isEmpty = filteredSubs.length === 0 && !debouncedSearch && filter === 'all';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(locale);
  };

  return (
    <SalesPageShell>
      <SalesPageHeader
        icon={Repeat}
        title={isArabic ? 'الاشتراكات' : 'Subscriptions'}
        subtitle={isArabic ? 'إدارة اشتراكات العملاء المتكررة ومتابعة حالتها' : 'Manage recurring customer subscriptions and track their status'}
        guide={guide}
        primaryAction={{ label: isArabic ? 'اشتراك جديد' : 'New Subscription', icon: Plus, onClick: () => setShowCreateModal(true) }}
      />

      <SalesStatsGrid stats={statCards} />

      <SalesStatusFilters filters={statusFilters} active={filter} onChange={setFilter} />

      <SalesToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isArabic ? 'بحث بالعميل أو الباقة...' : 'Search by customer or plan...'}
        actions={toolbarActions}
        advancedFilters={advancedFilters}
      />

      {loading ? (
        <SalesLoading />
      ) : isEmpty ? (
        <SalesEmptyState
          emoji="🔄"
          icon={Repeat}
          title={isArabic ? 'لا توجد اشتراكات بعد' : 'No subscriptions yet'}
          description={isArabic ? 'عند تفعيل عملائك لاشتراكات متكررة، ستظهر هنا مع إمكانية متابعة حالتها وتجديدها.' : 'When customers activate recurring subscriptions, they will appear here with full tracking and renewal options.'}
          primaryAction={{ label: isArabic ? 'إنشاء اشتراك' : 'Create Subscription', icon: Plus, onClick: () => setShowCreateModal(true) }}
          secondaryActions={[
            { label: isArabic ? 'دليل الاستخدام' : 'User Guide', icon: BookOpen, onClick: () => {} },
          ]}
        />
      ) : filteredSubs.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">{isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results'}</p>
        </div>
      ) : (
        <>
          <SalesTable columns={columns}>
            {filteredSubs.map((s) => {
              const st = getStatusMeta(s.status, isArabic);
              return (
                <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm">
                    <div className="font-semibold text-slate-900">{s.customerName}</div>
                    {s.customerPhone && <div className="text-xs text-slate-400">{s.customerPhone}</div>}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="font-semibold text-slate-900">{s.planName}</div>
                    <div className="text-xs text-slate-400">{t('business.pos.egp')} {s.amount.toLocaleString()} / {isArabic ? FREQ_LABELS[s.frequency]?.ar : FREQ_LABELS[s.frequency]?.en}</div>
                  </td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{formatDate(s.startedAt)}</td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{formatDate(s.endsAt)}</td>
                  <td className="p-4">
                    {s.autoRenew ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                        <CheckCircle2 size={14} /> {isArabic ? 'نعم' : 'Yes'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                        <X size={14} /> {isArabic ? 'لا' : 'No'}
                      </span>
                    )}
                  </td>
                  <td className="p-4"><SalesStatusBadge label={st.label} color={st.color} bg={st.bg} /></td>
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
            {filteredSubs.map((s) => {
              const st = getStatusMeta(s.status, isArabic);
              return (
                <div key={s.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm">{s.customerName}</div>
                      <div className="text-slate-500 font-medium text-xs mt-1">{s.planName}</div>
                    </div>
                    <SalesStatusBadge label={st.label} color={st.color} bg={st.bg} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'المبلغ' : 'Amount'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {s.amount.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'التجديد' : 'Auto Renew'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{s.autoRenew ? (isArabic ? 'نعم' : 'Yes') : (isArabic ? 'لا' : 'No')}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mt-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'البدء' : 'Start'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{formatDate(s.startedAt)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الانتهاء' : 'End'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{formatDate(s.endsAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3">
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

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold">{isArabic ? 'اشتراك جديد' : 'New Subscription'}</h4>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'اسم الباقة' : 'Plan name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="number" placeholder={isArabic ? 'المبلغ' : 'Amount'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
                <option>{isArabic ? 'شهري' : 'Monthly'}</option>
                <option>{isArabic ? 'سنوي' : 'Yearly'}</option>
                <option>{isArabic ? 'أسبوعي' : 'Weekly'}</option>
                <option>{isArabic ? 'يومي' : 'Daily'}</option>
              </select>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input type="checkbox" defaultChecked className="rounded" /> {isArabic ? 'تجديد تلقائي' : 'Auto Renew'}
              </label>
              <button onClick={() => setShowCreateModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      <SalesHelpfulSection
        tips={isArabic
          ? ['الإيراد الشهري يقيس إجمالي قيمة الاشتراكات النشطة', 'راقب التغيرات شهراً بشهر', 'الاشتراكات المتوقفة فرصة لإعادة التفعيل']
          : ['Monthly revenue measures total value of active subscriptions', 'Track changes month over month', 'Paused subscriptions are reactivation opportunities']
        }
        documentation={[
          { label: isArabic ? 'دليل الاشتراكات' : 'Subscriptions Guide', onClick: () => {} },
          { label: isArabic ? 'إعداد خطط التجديد' : 'Setting Up Renewal Plans', onClick: () => {} },
        ]}
        nextSteps={[
          { label: isArabic ? 'إنشاء اشتراك جديد' : 'Create New Subscription', description: isArabic ? 'أضف اشتراك متكرر لعميل' : 'Add a recurring subscription for a customer', onClick: () => setShowCreateModal(true) },
          { label: isArabic ? 'متابعة التجديدات' : 'Follow Up Renewals', description: isArabic ? 'تواصل مع العملاء قبل انتهاء الاشتراك' : 'Contact customers before expiration', onClick: () => {} },
        ]}
      />
    </SalesPageShell>
  );
};

export default SubscriptionsPage;
