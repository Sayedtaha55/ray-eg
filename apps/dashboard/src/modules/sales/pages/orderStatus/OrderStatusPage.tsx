import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  ChefHat,
  XCircle,
  Ban,
  RotateCcw,
  AlertTriangle,
  Eye,
  Download,
  Printer,
  RefreshCw,
  Search as SearchIcon,
  X,
  TrendingUp,
  Timer,
  GitBranch,
  type LucideIcon,
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

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'shipping' | 'delivered' | 'cancelled' | 'rejected' | 'refunded' | 'delayed';

type TimelineEvent = {
  status: OrderStatus;
  timestamp: string;
  note?: string;
};

type OrderStatusItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  employeeName?: string;
  branchName?: string;
  status: OrderStatus;
  items: number;
  total: number;
  date: string;
  updatedAt: string;
  timeline: TimelineEvent[];
};

const STATUS_META: Record<OrderStatus, { ar: string; en: string; color: string; bg: string; icon: LucideIcon }> = {
  pending:    { ar: 'قيد الانتظار', en: 'Pending',    color: 'text-amber-600',   bg: 'bg-amber-50',   icon: Clock },
  confirmed:  { ar: 'مؤكد',         en: 'Confirmed',  color: 'text-blue-600',    bg: 'bg-blue-50',    icon: CheckCircle2 },
  preparing:  { ar: 'قيد التحضير',   en: 'Preparing',  color: 'text-purple-600',  bg: 'bg-purple-50',  icon: ChefHat },
  ready:      { ar: 'جاهز',         en: 'Ready',      color: 'text-teal-600',    bg: 'bg-teal-50',    icon: Package },
  shipping:   { ar: 'قيد الشحن',     en: 'Shipping',   color: 'text-indigo-600',  bg: 'bg-indigo-50',  icon: Truck },
  delivered:  { ar: 'تم التوصيل',    en: 'Delivered',  color: 'text-green-600',   bg: 'bg-green-50',   icon: CheckCircle2 },
  cancelled:  { ar: 'ملغي',         en: 'Cancelled',  color: 'text-red-600',     bg: 'bg-red-50',     icon: Ban },
  rejected:   { ar: 'مرفوض',        en: 'Rejected',   color: 'text-rose-600',    bg: 'bg-rose-50',    icon: XCircle },
  refunded:   { ar: 'مسترجع',       en: 'Refunded',   color: 'text-orange-600',  bg: 'bg-orange-50',  icon: RotateCcw },
  delayed:    { ar: 'متأخر',        en: 'Delayed',    color: 'text-yellow-700',  bg: 'bg-yellow-50',  icon: AlertTriangle },
};

const FLOW_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'shipping', 'delivered'];

const getStatusMeta = (status: string, isArabic: boolean) => {
  const meta = STATUS_META[status as OrderStatus] || STATUS_META.pending;
  return { label: isArabic ? meta.ar : meta.en, color: meta.color, bg: meta.bg, icon: meta.icon };
};

const OrderStatusPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const [orders, setOrders] = useState<OrderStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderStatusItem | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAllOrders({ shopId });
      const data = Array.isArray(res) ? res : (res as any)?.data || [];
      setOrders(data.map((o: any) => {
        const status = (o.status || o.orderStatus || 'pending') as OrderStatus;
        const createdAt = o.createdAt || new Date().toISOString();
        const updatedAt = o.updatedAt || createdAt;
        return {
          id: String(o.id),
          orderNumber: o.orderNumber || `#${o.id}`,
          customerName: o.customerName || o.customer?.name || '---',
          employeeName: o.employeeName || o.staffName,
          branchName: o.branchName || o.branch?.name,
          status,
          items: o.items?.length || 0,
          total: Number(o.total || o.totalAmount || 0),
          date: createdAt,
          updatedAt,
          timeline: o.timeline || [
            { status: 'pending' as OrderStatus, timestamp: createdAt },
            ...(status !== 'pending' ? [{ status, timestamp: updatedAt }] : []),
          ],
        };
      }));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const counts = {} as Record<string, number>;
    for (const key of Object.keys(STATUS_META)) counts[key] = 0;
    for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1;
    const delivered = orders.filter(o => o.status === 'delivered');
    const avgProcessingMs = delivered.length > 0
      ? delivered.reduce((sum, o) => sum + (new Date(o.updatedAt).getTime() - new Date(o.date).getTime()), 0) / delivered.length
      : 0;
    const avgProcessingHours = Math.round(avgProcessingMs / (1000 * 60 * 60));
    return { counts, total: orders.length, avgProcessingHours };
  }, [orders]);

  const statCards: StatCard[] = [
    { label: isArabic ? 'إجمالي الطلبات' : 'Total Orders', value: stats.total, icon: ClipboardList, color: 'text-slate-700', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'طلب' : 'orders', direction: 'neutral' } },
    { label: isArabic ? 'قيد الانتظار' : 'Pending', value: stats.counts.pending || 0, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', trend: { value: isArabic ? 'بانتظار' : 'awaiting', direction: 'neutral' } },
    { label: isArabic ? 'قيد التحضير' : 'Preparing', value: stats.counts.preparing || 0, icon: ChefHat, color: 'text-purple-600', bgColor: 'bg-purple-50', trend: { value: isArabic ? 'قيد التحضير' : 'in progress', direction: 'neutral' } },
    { label: isArabic ? 'قيد الشحن' : 'Shipping', value: stats.counts.shipping || 0, icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-50', trend: { value: isArabic ? 'في الطريق' : 'in transit', direction: 'neutral' } },
    { label: isArabic ? 'تم التوصيل' : 'Delivered', value: stats.counts.delivered || 0, icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: stats.total > 0 ? `${Math.round(((stats.counts.delivered || 0) / stats.total) * 100)}%` : '0%', direction: 'up' } },
    { label: isArabic ? 'ملغي/مرفوض' : 'Cancelled/Rejected', value: (stats.counts.cancelled || 0) + (stats.counts.rejected || 0), icon: Ban, color: 'text-red-600', bgColor: 'bg-red-50', trend: { value: isArabic ? 'إلغاء' : 'cancelled', direction: 'down' } },
    { label: isArabic ? 'متأخر' : 'Delayed', value: stats.counts.delayed || 0, icon: AlertTriangle, color: 'text-yellow-700', bgColor: 'bg-yellow-50', trend: { value: isArabic ? 'تحتاج اهتمام' : 'needs attention', direction: 'down' } },
    { label: isArabic ? 'متوسط المعالجة' : 'Avg Processing', value: `${stats.avgProcessingHours}h`, icon: Timer, color: 'text-slate-600', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'ساعة' : 'hours', direction: 'neutral' } },
  ];

  /* ---- Status Filters ---- */
  const statusFilters: StatusFilter[] = [
    { key: 'all', label: isArabic ? 'الكل' : 'ALL', count: stats.total, color: '', activeColor: 'bg-slate-900 text-white' },
    ...Object.entries(STATUS_META).map(([key, meta]) => ({
      key,
      label: isArabic ? meta.ar : meta.en,
      count: stats.counts[key] || 0,
      color: '',
      activeColor: `${meta.bg} ${meta.color}`,
    })),
  ];

  /* ---- Filtered Orders ---- */
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filter !== 'all') result = result.filter(o => o.status === filter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.employeeName || '').toLowerCase().includes(q) ||
        (o.branchName || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, filter, debouncedSearch]);

  /* ---- Table Columns ---- */
  const columns: TableColumn[] = [
    { key: 'order', label: isArabic ? 'رقم الطلب' : 'Order #' },
    { key: 'customer', label: isArabic ? 'العميل' : 'Customer' },
    { key: 'employee', label: isArabic ? 'الموظف' : 'Employee' },
    { key: 'branch', label: isArabic ? 'الفرع' : 'Branch' },
    { key: 'items', label: isArabic ? 'العناصر' : 'Items' },
    { key: 'total', label: isArabic ? 'الإجمالي' : 'Total' },
    { key: 'status', label: isArabic ? 'الحالة' : 'Status' },
    { key: 'date', label: isArabic ? 'التاريخ' : 'Date' },
    { key: 'actions', label: isArabic ? 'إجراءات' : 'Actions', align: 'center' as const },
  ];

  /* ---- Toolbar Actions ---- */
  const toolbarActions: ToolbarAction[] = [
    { label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} },
    { label: isArabic ? 'طباعة' : 'Print', icon: Printer, onClick: () => {} },
    { label: isArabic ? 'تحديث' : 'Refresh', icon: RefreshCw, onClick: () => loadOrders() },
  ];

  /* ---- Advanced Filters ---- */
  const advancedFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <FilterField label={isArabic ? 'الموظف' : 'Employee'}><FilterInput placeholder={isArabic ? 'اسم الموظف' : 'Employee name'} /></FilterField>
      <FilterField label={isArabic ? 'الفرع' : 'Branch'}><FilterInput placeholder={isArabic ? 'اسم الفرع' : 'Branch name'} /></FilterField>
      <FilterField label={isArabic ? 'التاريخ' : 'Date'}><FilterInput type="date" /></FilterField>
      <FilterField label={isArabic ? 'العميل' : 'Customer'}><FilterInput placeholder={isArabic ? 'اسم العميل' : 'Customer name'} /></FilterField>
    </div>
  );

  /* ---- Guide ---- */
  const guide: SalesGuideData = {
    purpose: isArabic
      ? 'تتبع حالة جميع الطلبات من لحظة إنشائها حتى التوصيل. راقب كل مرحلة واكتشف الطلبات المتأخرة أو المعلقة.'
      : 'Track all orders from creation to delivery. Monitor each stage and identify delayed or stuck orders.',
    whenToUse: isArabic
      ? 'استخدم هذه الصفحة يومياً لمتابعة الطلبات الجارية. عند تأخر طلب أو الحاجة لتحديث حالته.'
      : 'Use this page daily to monitor active orders. When an order is delayed or needs status update.',
    whatsInside: isArabic
      ? ['لوحة إحصائيات بكل الحالات (10 حالات)', 'مخطط بصري لتدفق الطلب', 'جدول احترافي بكل التفاصيل', 'فلاتر متقدمة (موظف، فرع، تاريخ، عميل)', 'خط زمني لكل طلب', 'متوسط وقت المعالجة']
      : ['Dashboard with all 10 statuses', 'Visual order flow diagram', 'Professional table with details', 'Advanced filters (employee, branch, date, customer)', 'Timeline for each order', 'Average processing time'],
    steps: isArabic
      ? [
          { title: 'افحص لوحة الإحصائيات', description: 'ابدأ بمراجعة أعداد الطلبات في كل حالة' },
          { title: 'استخدم الفلاتر', description: 'اختر حالة معينة أو ابحث بالعميل أو الموظف' },
          { title: 'راجع الطلبات المتأخرة', description: 'افحص الطلبات في حالة "متأخر"' },
          { title: 'اضغط على أيقونة العين', description: 'لعرض الخط الزمني الكامل للطلب' },
          { title: 'تابع التدفق البصري', description: 'تحقق من تقدم الطلب عبر المراحل' },
        ]
      : [
          { title: 'Check the dashboard', description: 'Start by reviewing order counts per status' },
          { title: 'Use filters', description: 'Select a specific status or search by customer/employee' },
          { title: 'Review delayed orders', description: 'Check orders in "Delayed" status' },
          { title: 'Click the eye icon', description: 'To view the full timeline of an order' },
          { title: 'Follow the visual flow', description: 'Verify order progress through stages' },
        ],
    bestPractices: isArabic
      ? ['راجع الطلبات المعلقة كل صباح', 'حدّث الحالات فور تغيرها', 'تابع الطلبات المتأخرة أولاً', 'استخدم الفلاتر للتركيز']
      : ['Review pending orders every morning', 'Update statuses as soon as they change', 'Prioritize delayed orders first', 'Use filters to focus'],
    tips: isArabic
      ? ['الطلبات المتأخرة تحتاج اهتمام فوري', 'متوسط المعالجة يساعدك على تحسين الكفاءة', 'الخط الزمني يكشف نقاط الاختناق']
      : ['Delayed orders need immediate attention', 'Average processing time helps improve efficiency', 'Timeline reveals bottlenecks'],
    shortcuts: isArabic
      ? ['اضغط على أي حالة لتصفية القائمة', 'استخدم البحث للعثور سريعاً على طلب', 'الفلاتر المتقدمة للبحث الدقيق']
      : ['Click any status to filter the list', 'Use search to quickly find an order', 'Advanced filters for precise search'],
    relatedLinks: [
      { label: isArabic ? 'الطلبات' : 'Orders', onClick: () => {} },
      { label: isArabic ? 'المدفوعات' : 'Payments', onClick: () => {} },
      { label: isArabic ? 'المرتجعات' : 'Returns', onClick: () => {} },
    ],
  };

  const isEmpty = filteredOrders.length === 0 && !debouncedSearch && filter === 'all';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(locale);
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString(locale);
  };

  /* ---- Visual Order Flow ---- */
  const renderOrderFlow = (currentStatus: OrderStatus) => {
    const currentIdx = FLOW_STEPS.indexOf(currentStatus);
    const isCancelledFlow = ['cancelled', 'rejected', 'refunded', 'delayed'].includes(currentStatus);

    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-2 no-scrollbar">
        {FLOW_STEPS.map((step, idx) => {
          const meta = STATUS_META[step];
          const isDone = !isCancelledFlow && idx <= currentIdx;
          const isCurrent = !isCancelledFlow && idx === currentIdx;
          const Icon = meta.icon;
          return (
            <React.Fragment key={step}>
              <div className={`flex flex-col items-center gap-1 shrink-0 ${isCurrent ? 'scale-110' : ''} transition-transform`}>
                <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all ${
                  isDone ? 'bg-slate-900 border-slate-900 text-white' : isCurrent ? 'bg-white border-slate-900 text-slate-900' : 'bg-white border-slate-200 text-slate-300'
                }`}>
                  <Icon size={16} />
                </div>
                <span className={`text-[9px] font-semibold whitespace-nowrap ${isDone || isCurrent ? 'text-slate-700' : 'text-slate-300'}`}>
                  {isArabic ? meta.ar : meta.en}
                </span>
              </div>
              {idx < FLOW_STEPS.length - 1 && (
                <div className={`h-0.5 w-4 sm:w-6 shrink-0 ${isDone ? 'bg-slate-900' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
        {isCancelledFlow && (
          <div className="flex flex-col items-center gap-1 shrink-0 ml-2">
            <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${STATUS_META[currentStatus].bg} ${STATUS_META[currentStatus].color} border-current`}>
              {React.createElement(STATUS_META[currentStatus].icon, { size: 16 })}
            </div>
            <span className={`text-[9px] font-semibold whitespace-nowrap ${STATUS_META[currentStatus].color}`}>
              {isArabic ? STATUS_META[currentStatus].ar : STATUS_META[currentStatus].en}
            </span>
          </div>
        )}
      </div>
    );
  };

  /* ---- Timeline Modal ---- */
  const renderTimeline = (order: OrderStatusItem) => {
    const sortedTimeline = [...order.timeline].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedOrder(null)}>
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold">{isArabic ? 'الخط الزمني للطلب' : 'Order Timeline'}</h4>
              <p className="text-sm text-slate-400 font-medium mt-0.5">{order.orderNumber} · {order.customerName}</p>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
              <X size={20} />
            </button>
          </div>

          {/* Order Flow Visual */}
          <div className="mb-5 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <div className="text-xs font-semibold text-slate-500 mb-3">{isArabic ? 'تدفق الطلب' : 'Order Flow'}</div>
            {renderOrderFlow(order.status)}
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {sortedTimeline.map((event, idx) => {
              const meta = getStatusMeta(event.status, isArabic);
              const Icon = meta.icon;
              const isLast = idx === sortedTimeline.length - 1;
              return (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${meta.bg} ${meta.color} shrink-0`}>
                      <Icon size={14} />
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                  </div>
                  <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                    <div className="font-semibold text-slate-900 text-sm">{meta.label}</div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5">{formatDateTime(event.timestamp)}</div>
                    {event.note && <div className="text-xs text-slate-500 mt-1 leading-relaxed">{event.note}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Details */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الإجمالي' : 'Total'}</div>
              <div className="mt-1 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {order.total.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-500">{isArabic ? 'العناصر' : 'Items'}</div>
              <div className="mt-1 font-bold text-slate-900 text-sm">{order.items}</div>
            </div>
            {order.employeeName && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الموظف' : 'Employee'}</div>
                <div className="mt-1 font-bold text-slate-900 text-sm">{order.employeeName}</div>
              </div>
            )}
            {order.branchName && (
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الفرع' : 'Branch'}</div>
                <div className="mt-1 font-bold text-slate-900 text-sm">{order.branchName}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <SalesPageShell>
      <SalesPageHeader
        icon={ClipboardList}
        title={isArabic ? 'حالة الطلب' : 'Order Status'}
        subtitle={isArabic ? 'تتبع حالة جميع الطلبات من الإنشاء حتى التوصيل' : 'Track all orders from creation to delivery'}
        guide={guide}
        primaryAction={{ label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} }}
        secondaryActions={[
          { label: isArabic ? 'طباعة' : 'Print', icon: Printer, onClick: () => {} },
          { label: isArabic ? 'تحديث' : 'Refresh', icon: RefreshCw, onClick: () => loadOrders() },
        ]}
      />

      <SalesStatsGrid stats={statCards} />

      {/* Visual Order Flow Legend */}
      <div className="mb-6 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch size={16} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">{isArabic ? 'تدفق الطلب' : 'Order Flow'}</span>
        </div>
        {renderOrderFlow('delivered')}
      </div>

      {/* Status Distribution Bar Chart */}
      <div className="mb-6 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">{isArabic ? 'توزيع الحالات' : 'Status Distribution'}</span>
        </div>
        <div className="space-y-2">
          {Object.entries(STATUS_META).map(([key, meta]) => {
            const count = stats.counts[key] || 0;
            const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 w-20 sm:w-24 shrink-0 truncate">{isArabic ? meta.ar : meta.en}</span>
                <div className="flex-1 h-6 rounded-lg bg-slate-50 overflow-hidden">
                  <div
                    className={`h-full ${meta.bg} rounded-lg transition-all duration-500`}
                    style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 w-8 text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <SalesStatusFilters filters={statusFilters} active={filter} onChange={setFilter} />

      <SalesToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isArabic ? 'بحث برقم الطلب أو العميل أو الموظف...' : 'Search by order, customer or employee...'}
        actions={toolbarActions}
        advancedFilters={advancedFilters}
      />

      {loading ? (
        <SalesLoading />
      ) : isEmpty ? (
        <SalesEmptyState
          emoji="📋"
          icon={ClipboardList}
          title={isArabic ? 'لا توجد طلبات' : 'No orders found'}
          description={isArabic ? 'عند استلام طلبات جديدة، ستظهر هنا مع تتبع كامل لحالتها وخطها الزمني.' : 'When new orders come in, they will appear here with full status tracking and timeline.'}
          primaryAction={{ label: isArabic ? 'تحديث' : 'Refresh', icon: RefreshCw, onClick: () => loadOrders() }}
          secondaryActions={[
            { label: isArabic ? 'دليل الاستخدام' : 'User Guide', icon: Eye, onClick: () => {} },
          ]}
        />
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">{isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results'}</p>
        </div>
      ) : (
        <>
          <SalesTable columns={columns}>
            {filteredOrders.map((o) => {
              const st = getStatusMeta(o.status, isArabic);
              return (
                <tr key={o.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 text-sm">{o.orderNumber}</td>
                  <td className="p-4 text-sm"><div className="font-semibold text-slate-900">{o.customerName}</div></td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{o.employeeName || '—'}</td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{o.branchName || '—'}</td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{o.items}</td>
                  <td className="p-4 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {o.total.toLocaleString()}</td>
                  <td className="p-4"><SalesStatusBadge label={st.label} color={st.color} bg={st.bg} /></td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{formatDate(o.date)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedOrder(o)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </SalesTable>
          <SalesMobileCards>
            {filteredOrders.map((o) => {
              const st = getStatusMeta(o.status, isArabic);
              return (
                <div key={o.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm">{o.orderNumber}</div>
                      <div className="text-slate-500 font-medium text-xs mt-1">{o.customerName}</div>
                    </div>
                    <SalesStatusBadge label={st.label} color={st.color} bg={st.bg} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الإجمالي' : 'Total'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {o.total.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'العناصر' : 'Items'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{o.items}</div>
                    </div>
                  </div>
                  {(o.employeeName || o.branchName) && (
                    <div className="grid grid-cols-2 gap-2.5 mt-2">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الموظف' : 'Employee'}</div>
                        <div className="mt-1 font-bold text-slate-900 text-sm">{o.employeeName || '—'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الفرع' : 'Branch'}</div>
                        <div className="mt-1 font-bold text-slate-900 text-sm">{o.branchName || '—'}</div>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 mb-3">
                    {renderOrderFlow(o.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">{formatDate(o.date)}</span>
                    <button onClick={() => setSelectedOrder(o)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </SalesMobileCards>
        </>
      )}

      {selectedOrder && renderTimeline(selectedOrder)}

      <SalesHelpfulSection
        tips={isArabic
          ? ['الطلبات المتأخرة تحتاج اهتمام فوري', 'متوسط المعالجة يساعدك على تحسين الكفاءة', 'الخط الزمني يكشف نقاط الاختناق']
          : ['Delayed orders need immediate attention', 'Average processing time helps improve efficiency', 'Timeline reveals bottlenecks']
        }
        documentation={[
          { label: isArabic ? 'دليل حالة الطلب' : 'Order Status Guide', onClick: () => {} },
          { label: isArabic ? 'إدارة التأخيرات' : 'Managing Delays', onClick: () => {} },
        ]}
        nextSteps={[
          { label: isArabic ? 'مراجعة الطلبات المتأخرة' : 'Review Delayed Orders', description: isArabic ? 'افحص الطلبات في حالة متأخر' : 'Check orders in delayed status', onClick: () => setFilter('delayed') },
          { label: isArabic ? 'تحديث البيانات' : 'Refresh Data', description: isArabic ? 'أعد تحميل الطلبات' : 'Reload orders from server', onClick: () => loadOrders() },
        ]}
      />
    </SalesPageShell>
  );
};

export default OrderStatusPage;
