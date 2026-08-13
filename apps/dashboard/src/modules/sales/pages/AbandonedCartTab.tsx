import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import {
  ShoppingCart,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Mail,
  Send,
  BookOpen,
  Download,
  Printer,
  Search as SearchIcon,
  CheckCircle,
} from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';
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
} from '../components/SalesDesignSystem';

type Props = {
  shopId: string;
  shop?: any;
};

const RECOVERY_STATUS_META: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  abandoned: { ar: 'متروكة', en: 'Abandoned', color: 'text-red-600', bg: 'bg-red-50' },
  pending: { ar: 'بانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
  recovered: { ar: 'تم الاسترجاع', en: 'Recovered', color: 'text-green-600', bg: 'bg-green-50' },
  purchased: { ar: 'تم الشراء', en: 'Purchased', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

const getRecoveryStatusMeta = (status: any, isArabic: boolean) => {
  const s = String(status || 'abandoned').toLowerCase();
  const meta = RECOVERY_STATUS_META[s] || RECOVERY_STATUS_META.abandoned;
  return { label: isArabic ? meta.ar : meta.en, color: meta.color, bg: meta.bg };
};

const AbandonedCartTab: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';

  const isEnabled = (() => {
    const enabled = (shop as any)?.layoutConfig?.enabledModules;
    return Array.isArray(enabled) && enabled.includes('abandonedCart');
  })();

  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [list, setList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);

  const loadData = async () => {
    if (!shopId) return;
    setLoading(true);
    setError('');
    try {
      const [statsRes, listRes] = await Promise.all([
        (ApiService as any).getAbandonedCartStats({ shopId }),
        (ApiService as any).getAbandonedCarts({ shopId, page, limit: 20 }),
      ]);
      setStats(statsRes);
      setList(Array.isArray(listRes?.items) ? listRes.items : []);
      setTotal(Number(listRes?.total) || 0);
    } catch (e: any) {
      setError(String(e?.message || t('business.abandonedCart.loadError')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [shopId]);

  const handleMarkRecovered = async (id: string) => {
    try {
      await (ApiService as any).markCartEventRecovered(id);
      await loadData();
    } catch (e: any) {
      setError(String(e?.message || t('business.abandonedCart.recoverError')));
    }
  };

  const handleRequestUpgrade = async () => {
    setRequesting(true);
    try {
      await (ApiService as any).createMyModuleUpgradeRequest?.({ requestedModules: ['abandonedCart'] });
      setRequestSent(true);
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('already') || msg.includes('بالفعل')) setRequestSent(true);
    } finally {
      setRequesting(false);
    }
  };

  const formatMoney = (v: any) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return '0.00';
    return n.toFixed(2);
  };

  const formatDate = (dateStr: any) => {
    const d = new Date(String(dateStr));
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US');
  };

  /* ---- Stat Cards ---- */
  const statCards: StatCard[] = useMemo(() => {
    const cartCount = stats?.addedToCart ?? 0;
    const checkoutStarted = stats?.checkoutStarted ?? 0;
    const recovered = stats?.recovered ?? 0;
    const abandoned = stats?.abandoned ?? 0;
    const abandonmentRate = stats?.abandonmentRate ?? 0;
    const recoveryRate = stats?.recoveryRate ?? 0;
    const totalValue = list.reduce((s, r) => s + Number(r.unitPrice || 0) * Number(r.quantity || 1), 0);
    const purchased = list.filter((r: any) => String(r.event || '').toLowerCase() === 'purchased').length;

    return [
      { label: isArabic ? 'عدد السلات' : 'Total Carts', value: cartCount, icon: ShoppingCart, color: 'text-slate-700', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'سلة' : 'carts', direction: 'neutral' } },
      { label: isArabic ? 'بدأ الدفع' : 'Checkout Started', value: checkoutStarted, icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'بدأ' : 'started', direction: 'neutral' } },
      { label: isArabic ? 'تم الاسترجاع' : 'Recovered', value: recovered, icon: RotateCcw, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: `${recoveryRate}%`, direction: 'up' } },
      { label: isArabic ? 'تم الشراء' : 'Purchased', value: purchased, icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-50', trend: { value: isArabic ? 'مكتمل' : 'completed', direction: 'up' } },
      { label: isArabic ? 'معدل التحويل' : 'Conversion Rate', value: `${recoveryRate}%`, icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'تحويل' : 'conversion', direction: recoveryRate >= 30 ? 'up' : 'down' } },
      { label: isArabic ? 'معدل الترك' : 'Abandonment Rate', value: `${abandonmentRate}%`, icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-50', trend: { value: isArabic ? 'ترك' : 'abandonment', direction: 'down' } },
      { label: isArabic ? 'إجمالي القيمة' : 'Total Value', value: `${t('business.pos.egp')} ${formatMoney(totalValue)}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: isArabic ? 'إجمالي' : 'total', direction: 'neutral' } },
    ];
  }, [stats, list, isArabic, t]);

  /* ---- Status Filters ---- */
  const statusFilters: StatusFilter[] = [
    { key: 'all', label: isArabic ? 'الكل' : 'ALL', count: list.length, color: '', activeColor: 'bg-slate-900 text-white' },
    { key: 'today', label: isArabic ? 'اليوم' : 'Today', count: list.filter((r: any) => { const d = new Date(r.createdAt); const today = new Date(); return d.toDateString() === today.toDateString(); }).length, color: '', activeColor: 'bg-slate-100 text-slate-700' },
    { key: 'yesterday', label: isArabic ? 'أمس' : 'Yesterday', count: list.filter((r: any) => { const d = new Date(r.createdAt); const y = new Date(); y.setDate(y.getDate() - 1); return d.toDateString() === y.toDateString(); }).length, color: '', activeColor: 'bg-slate-100 text-slate-600' },
    { key: 'last7days', label: isArabic ? 'آخر ٧ أيام' : 'Last 7 Days', count: list.filter((r: any) => { const d = new Date(r.createdAt); const week = new Date(); week.setDate(week.getDate() - 7); return d >= week; }).length, color: '', activeColor: 'bg-blue-50 text-blue-600' },
    { key: 'recovered', label: isArabic ? 'تم الاسترجاع' : 'Recovered', count: list.filter((r: any) => r.isRecovered).length, color: '', activeColor: 'bg-green-50 text-green-600' },
    { key: 'abandoned', label: isArabic ? 'متروكة' : 'Abandoned', count: list.filter((r: any) => !r.isRecovered && String(r.event || '').toLowerCase() === 'abandoned').length, color: '', activeColor: 'bg-red-50 text-red-600' },
    { key: 'pending', label: isArabic ? 'بانتظار' : 'Pending', count: list.filter((r: any) => !r.isRecovered && String(r.event || '').toLowerCase() !== 'abandoned').length, color: '', activeColor: 'bg-amber-50 text-amber-600' },
  ];

  /* ---- Filtered List ---- */
  const filteredList = useMemo(() => {
    let result = list;
    if (filter !== 'all') {
      if (filter === 'today') {
        const today = new Date();
        result = result.filter((r: any) => new Date(r.createdAt).toDateString() === today.toDateString());
      } else if (filter === 'yesterday') {
        const y = new Date(); y.setDate(y.getDate() - 1);
        result = result.filter((r: any) => new Date(r.createdAt).toDateString() === y.toDateString());
      } else if (filter === 'last7days') {
        const week = new Date(); week.setDate(week.getDate() - 7);
        result = result.filter((r: any) => new Date(r.createdAt) >= week);
      } else if (filter === 'recovered') {
        result = result.filter((r: any) => r.isRecovered);
      } else if (filter === 'abandoned') {
        result = result.filter((r: any) => !r.isRecovered && String(r.event || '').toLowerCase() === 'abandoned');
      } else if (filter === 'pending') {
        result = result.filter((r: any) => !r.isRecovered && String(r.event || '').toLowerCase() !== 'abandoned');
      }
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((r: any) => {
        const name = String(r.customerName || '').toLowerCase();
        const phone = String(r.customerPhone || '').toLowerCase();
        const email = String(r.customerEmail || '').toLowerCase();
        const product = String(r.product?.name || '').toLowerCase();
        return name.includes(q) || phone.includes(q) || email.includes(q) || product.includes(q);
      });
    }
    return result;
  }, [list, filter, debouncedSearch]);

  /* ---- Table Columns ---- */
  const columns: TableColumn[] = [
    { key: 'customer', label: isArabic ? 'العميل' : 'Customer' },
    { key: 'products', label: isArabic ? 'المنتجات' : 'Products' },
    { key: 'cartValue', label: isArabic ? 'قيمة السلة' : 'Cart Value' },
    { key: 'lastActivity', label: isArabic ? 'آخر نشاط' : 'Last Activity' },
    { key: 'recoveryStatus', label: isArabic ? 'حالة الاسترجاع' : 'Recovery Status' },
    { key: 'actions', label: isArabic ? 'إجراءات' : 'Actions', align: 'center' as const },
  ];

  /* ---- Toolbar Actions ---- */
  const toolbarActions: ToolbarAction[] = [
    { label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} },
    { label: isArabic ? 'طباعة' : 'Print', icon: Printer, onClick: () => {} },
    { label: isArabic ? 'تحديث' : 'Refresh', icon: RefreshCw, onClick: () => loadData() },
  ];

  /* ---- Advanced Filters ---- */
  const advancedFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <FilterField label={isArabic ? 'العميل' : 'Customer'}><FilterInput placeholder={isArabic ? 'اسم العميل' : 'Customer name'} /></FilterField>
      <FilterField label={isArabic ? 'الهاتف' : 'Phone'}><FilterInput placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'} /></FilterField>
      <FilterField label={isArabic ? 'البريد' : 'Email'}><FilterInput placeholder={isArabic ? 'البريد الإلكتروني' : 'Email address'} /></FilterField>
      <FilterField label={isArabic ? 'المنتج' : 'Product'}><FilterInput placeholder={isArabic ? 'اسم المنتج' : 'Product name'} /></FilterField>
    </div>
  );

  /* ---- Guide ---- */
  const guide: SalesGuideData = {
    purpose: isArabic ? 'تتبع السلات المتروكة وإطلاق حملات استرجاع العملاء الذين لم يكملوا الشراء.' : 'Track abandoned carts and launch recovery campaigns to win back customers who did not complete checkout.',
    whenToUse: isArabic ? 'عند ملاحظة ترك العملاء للسلات بدون إكمال الشراء. لإطلاق حملات استرجاع العملاء.' : 'When noticing customers abandoning carts without completing checkout. To launch recovery campaigns.',
    whatsInside: isArabic
      ? ['لوحة إحصائيات (إجمالي، مسترجع، قيمة مفقودة، معدل الاسترجاع)', 'فلاتر زمنية (اليوم، أسبوع، شهر)', 'بحث بالاسم أو البريد أو الهاتف', 'جدول احترافي بكل التفاصيل', 'بطاقات موبايل متجاوبة', 'زر استرجاع السلة']
      : ['Dashboard stats (total, recovered, lost value, recovery rate)', 'Time filters (today, week, month)', 'Search by name, email or phone', 'Professional table with details', 'Responsive mobile cards', 'Recover cart button'],
    steps: isArabic
      ? [
          { title: 'افحص لوحة الإحصائيات', description: 'راجع عدد السلات المتروكة والقيمة المفقودة' },
          { title: 'استخدم الفلاتر الزمنية', description: 'لتصنيف السلات حسب فترة الترك' },
          { title: 'اضغط على "استرجاع"', description: 'لتحديد سلة كتم استرجاعها بنجاح' },
          { title: 'استخدم البحث', description: 'للعثور على عميل بالاسم أو الهاتف' },
          { title: 'أرسل رسائل تذكير', description: 'للعملاء خلال ساعة من ترك السلة' },
        ]
      : [
          { title: 'Check the dashboard', description: 'Review abandoned cart count and lost value' },
          { title: 'Use time filters', description: 'To categorize carts by abandonment period' },
          { title: 'Click "Recover"', description: 'To mark a cart as successfully recovered' },
          { title: 'Use search', description: 'To find a customer by name or phone' },
          { title: 'Send reminder messages', description: 'To customers within an hour of abandonment' },
        ],
    bestPractices: isArabic
      ? ['أرسل رسائل تذكير خلال ساعة من ترك السلة', 'قدم خصومات خاصة لزيادة التحويل', 'تابع معدل الترك أسبوعياً', 'السلات ذات القيمة العالية تستحق متابعة شخصية']
      : ['Send reminder messages within an hour of abandonment', 'Offer special discounts to increase conversion rate', 'Monitor abandonment rate weekly', 'High-value carts deserve personal follow-up'],
    tips: isArabic
      ? ['راقب معدل الترك أسبوعياً', 'السلات ذات القيمة العالية تستحق متابعة شخصية', 'الخصومات تزيد معدل الاسترجاع بشكل كبير']
      : ['Monitor abandonment rate weekly', 'High-value carts deserve personal follow-up', 'Discounts significantly increase recovery rate'],
    shortcuts: isArabic
      ? ['استخدم فلتر "اليوم" لمعرفة السلات الحديثة', 'البحث بالبريد الإلكتروني سريع ومباشر', 'اضغط ESC لإغلاق النوافذ']
      : ['Use the "Today" filter for recent carts', 'Search by email is fast and direct', 'Press ESC to close dialogs'],
    relatedLinks: [
      { label: isArabic ? 'الطلبات' : 'Orders', onClick: () => {} },
      { label: isArabic ? 'العملاء' : 'Customers', onClick: () => {} },
    ],
  };

  if (!isEnabled) {
    return (
      <SalesPageShell>
        <SalesPageHeader
          icon={ShoppingCart}
          title={isArabic ? 'السلات المتروكة' : 'Abandoned Carts'}
          subtitle={isArabic ? 'تتبع السلات المتروكة واسترجع العملاء' : 'Track abandoned carts and recover customers'}
          guide={guide}
        />
        <div className="flex flex-col items-center justify-center min-h-[320px] gap-4" dir={isArabic ? 'rtl' : 'ltr'}>
          <ShoppingCart size={48} className="text-slate-300" />
          <h2 className="text-xl font-bold text-slate-900">{t('business.abandonedCart.tabTitle')}</h2>
          <p className="text-sm font-semibold text-slate-500 text-center max-w-md">{t('business.abandonedCart.upgradeRequired')}</p>
          {requestSent ? (
            <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle size={18} className="text-emerald-600" />
              <span className="font-semibold text-emerald-700 text-sm">{t('business.abandonedCart.requestSentMsg')}</span>
            </div>
          ) : (
            <button type="button" onClick={handleRequestUpgrade} disabled={requesting} className="px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-black transition-all disabled:opacity-60">
              {requesting ? t('common.loading') : t('business.abandonedCart.requestUpgrade')}
            </button>
          )}
        </div>
      </SalesPageShell>
    );
  }

  const isEmpty = filteredList.length === 0 && !debouncedSearch && filter === 'all';

  return (
    <SalesPageShell>
      <SalesPageHeader
        icon={ShoppingCart}
        title={isArabic ? 'السلات المتروكة' : 'Abandoned Carts'}
        subtitle={isArabic ? 'تتبع السلات المتروكة وأطلق حملات الاسترجاع' : 'Track abandoned carts and launch recovery campaigns'}
        guide={guide}
      />

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 font-semibold text-sm">{error}</div>
      )}

      <SalesStatsGrid stats={statCards} />

      <SalesStatusFilters filters={statusFilters} active={filter} onChange={setFilter} />

      <SalesToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isArabic ? 'بحث بالعميل أو الهاتف أو البريد أو المنتج...' : 'Search by customer, phone, email or product...'}
        actions={toolbarActions}
        advancedFilters={advancedFilters}
      />

      {loading ? (
        <SalesLoading />
      ) : isEmpty ? (
        <SalesEmptyState
          emoji="🛒"
          icon={ShoppingCart}
          title={isArabic ? 'لا توجد سلات متروكة' : 'No abandoned carts'}
          description={isArabic ? 'عند ترك العملاء لسلاتهم دون إكمال الشراء، ستظهر هنا مع إمكانية إطلاق حملات استرجاع.' : 'When customers leave their carts without completing checkout, they will appear here with recovery campaign options.'}
          primaryAction={{ label: isArabic ? 'تشغيل حملات الاسترجاع' : 'Launch Recovery Campaigns', icon: Send, onClick: () => {} }}
          secondaryActions={[
            { label: isArabic ? 'إرسال رسالة' : 'Send Message', icon: Mail, onClick: () => {} },
            { label: isArabic ? 'تعرف على السلات المتروكة' : 'Learn About Abandoned Carts', icon: BookOpen, onClick: () => {} },
          ]}
        />
      ) : filteredList.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">{isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results'}</p>
        </div>
      ) : (
        <>
          <SalesTable columns={columns}>
            {filteredList.map((row: any) => {
              const st = getRecoveryStatusMeta(row.isRecovered ? 'recovered' : (row.event || 'abandoned'), isArabic);
              const cartValue = Number(row.unitPrice || 0) * Number(row.quantity || 1);
              return (
                <tr key={row.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm">
                    <div className="font-semibold text-slate-900">{row.customerName || '-'}</div>
                    {row.customerPhone && <div className="text-xs text-slate-400">{row.customerPhone}</div>}
                    {row.customerEmail && <div className="text-xs text-slate-400">{row.customerEmail}</div>}
                  </td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{row.product?.name || '-'}</td>
                  <td className="p-4 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {formatMoney(cartValue)}</td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{formatDate(row.createdAt)}</td>
                  <td className="p-4"><SalesStatusBadge label={st.label} color={st.color} bg={st.bg} /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {!row.isRecovered ? (
                        <button onClick={() => handleMarkRecovered(row.id)} className="px-3 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 transition-colors">
                          {isArabic ? 'استرجاع' : 'Recover'}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold text-xs">
                          <CheckCircle size={14} />
                          {isArabic ? 'تم' : 'Done'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </SalesTable>
          <SalesMobileCards>
            {filteredList.map((row: any) => {
              const st = getRecoveryStatusMeta(row.isRecovered ? 'recovered' : (row.event || 'abandoned'), isArabic);
              const cartValue = Number(row.unitPrice || 0) * Number(row.quantity || 1);
              return (
                <div key={row.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm">{row.customerName || '-'}</div>
                      <div className="text-slate-500 font-medium text-xs mt-1">{row.product?.name || '-'}</div>
                    </div>
                    <SalesStatusBadge label={st.label} color={st.color} bg={st.bg} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'قيمة السلة' : 'Cart Value'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {formatMoney(cartValue)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'آخر نشاط' : 'Last Activity'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{formatDate(row.createdAt)}</div>
                    </div>
                  </div>
                  {(row.customerPhone || row.customerEmail) && (
                    <div className="mt-2 text-xs text-slate-400 font-medium">{row.customerPhone}{row.customerPhone && row.customerEmail ? ' | ' : ''}{row.customerEmail}</div>
                  )}
                  <div className="flex items-center justify-end gap-2 mt-3">
                    {!row.isRecovered ? (
                      <button onClick={() => handleMarkRecovered(row.id)} className="px-3 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 transition-colors">
                        {isArabic ? 'استرجاع' : 'Recover'}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 font-semibold text-xs">
                        <CheckCircle size={14} />
                        {isArabic ? 'تم' : 'Done'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </SalesMobileCards>
        </>
      )}
      <SalesHelpfulSection
        tips={isArabic
          ? ['راقب معدل الترك أسبوعياً', 'السلات ذات القيمة العالية تستحق متابعة شخصية', 'الخصومات تزيد معدل الاسترجاع بشكل كبير']
          : ['Monitor abandonment rate weekly', 'High-value carts deserve personal follow-up', 'Discounts significantly increase recovery rate']
        }
        documentation={[
          { label: isArabic ? 'دليل السلات المتروكة' : 'Abandoned Carts Guide', onClick: () => {} },
          { label: isArabic ? 'حملات الاسترجاع' : 'Recovery Campaigns', onClick: () => {} },
        ]}
        nextSteps={[
          { label: isArabic ? 'إرسال رسالة تذكير' : 'Send Reminder', description: isArabic ? 'أرسل رسالة لعميل ترك سلته' : 'Send a message to a customer who abandoned their cart', onClick: () => {} },
          { label: isArabic ? 'تحديث البيانات' : 'Refresh Data', description: isArabic ? 'أعد تحميل السلات المتروكة' : 'Reload abandoned carts data', onClick: () => loadData() },
        ]}
      />
    </SalesPageShell>
  );
};

export default AbandonedCartTab;
