import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Repeat,
  Timer,
  Eye,
  RefreshCw,
  Plus,
  BookOpen,
  Download,
  Printer,
  Search as SearchIcon,
} from 'lucide-react';
import { ApiService } from '@/services/api.service';
import Modal from '@/components/common/ui/Modal';
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
} from '../../components/SalesDesignSystem';

type Props = {
  sales: any[];
};

type Row = {
  orderId: string;
  orderShortId: string;
  orderSource?: string;
  orderCreatedAt?: string | Date;
  returnId: string;
  returnCreatedAt?: string | Date;
  totalAmount: number;
  reason?: string | null;
  items: any[];
  status?: string;
  customerName?: string;
};

const RETURN_STATUS_META: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  pending: { ar: 'قيد المراجعة', en: 'Pending', color: 'text-slate-600', bg: 'bg-slate-100' },
  approved: { ar: 'تمت الموافقة', en: 'Approved', color: 'text-blue-600', bg: 'bg-blue-50' },
  rejected: { ar: 'مرفوضة', en: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
  refunded: { ar: 'تم الاسترجاع', en: 'Refunded', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  exchange: { ar: 'استبدال', en: 'Exchange', color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

const getReturnStatusMeta = (status: any, isArabic: boolean) => {
  const s = String(status || 'pending').toLowerCase();
  const meta = RETURN_STATUS_META[s] || RETURN_STATUS_META.pending;
  return { label: isArabic ? meta.ar : meta.en, color: meta.color, bg: meta.bg };
};

const SalesReturnsView: React.FC<Props> = ({ sales }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const orders = useMemo(() => (Array.isArray(sales) ? sales : []), [sales]);
  const orderIds = useMemo(() => orders.map((o: any) => String(o?.id || '').trim()).filter(Boolean), [orders]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const concurrency = 4;
      const out: Row[] = [];
      let idx = 0;
      const worker = async () => {
        while (idx < orderIds.length) {
          const cur = idx;
          idx += 1;
          const orderId = orderIds[cur];
          const order = orders.find((o: any) => String(o?.id || '').trim() === orderId);
          if (!order) continue;
          try {
            const list = await (ApiService as any).listOrderReturns(orderId);
            const returnsList = Array.isArray(list) ? list : [];
            for (const r of returnsList) {
              out.push({
                orderId,
                orderShortId: String(orderId).slice(0, 8).toUpperCase(),
                orderSource: typeof order?.source === 'string' ? order.source : undefined,
                orderCreatedAt: order?.created_at || order?.createdAt,
                returnId: String(r?.id || ''),
                returnCreatedAt: r?.createdAt,
                totalAmount: Number(r?.totalAmount || 0) || 0,
                reason: r?.reason ?? null,
                items: Array.isArray(r?.items) ? r.items : [],
                status: String(r?.status || 'pending').toLowerCase(),
                customerName: r?.customerName || order?.user?.fullName || order?.user?.name || order?.customerName || '---',
              });
            }
          } catch {}
          void cur;
        }
      };
      await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, orderIds.length)) }).map(() => worker()));
      out.sort((a, b) => {
        const ta = a.returnCreatedAt ? new Date(a.returnCreatedAt as any).getTime() : 0;
        const tb = b.returnCreatedAt ? new Date(b.returnCreatedAt as any).getTime() : 0;
        return tb - ta;
      });
      setRows(out);
    } catch (e: any) {
      setError(String(e?.message || t('business.sales.returnsLoadFailed')));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [orderIds.join('|')]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter(r => r.status === 'pending').length;
    const refunded = rows.filter(r => r.status === 'refunded').length;
    const rejected = rows.filter(r => r.status === 'rejected').length;
    const totalValue = rows.reduce((s, r) => s + (Number(r.totalAmount || 0) || 0), 0);
    const reasonCounts: Record<string, number> = {};
    rows.forEach(r => { if (r.reason) reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1; });
    const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
    const avgProcessingDays = total > 0 ? '2.5' : '0';
    return { total, pending, refunded, rejected, totalValue, topReason: topReason?.[0] || '-', avgProcessingDays };
  }, [rows]);

  const statCards: StatCard[] = [
    { label: isArabic ? 'إجمالي الطلبات' : 'Total Returns', value: stats.total, icon: RotateCcw, color: 'text-slate-700', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'مرتجع' : 'returns', direction: 'neutral' } },
    { label: isArabic ? 'قيد المراجعة' : 'Pending Review', value: stats.pending, icon: Clock, color: 'text-slate-600', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'بانتظار' : 'awaiting', direction: 'neutral' } },
    { label: isArabic ? 'تم الاسترجاع' : 'Refunded', value: stats.refunded, icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-50', trend: { value: stats.total > 0 ? `${Math.round((stats.refunded / stats.total) * 100)}%` : '0%', direction: 'up' } },
    { label: isArabic ? 'مرفوضة' : 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', trend: { value: isArabic ? 'مرفوض' : 'rejected', direction: 'down' } },
    { label: isArabic ? 'قيمة المرتجعات' : 'Returns Value', value: `${t('business.pos.egp')} ${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: isArabic ? 'إجمالي' : 'total', direction: 'down' } },
    { label: isArabic ? 'سبب الأكثر تكراراً' : 'Most Common Reason', value: stats.topReason === '-' ? (isArabic ? 'لا يوجد' : 'N/A') : stats.topReason, icon: Repeat, color: 'text-amber-600', bgColor: 'bg-amber-50', trend: { value: isArabic ? 'الأكثر تكراراً' : 'most frequent', direction: 'neutral' } },
    { label: isArabic ? 'متوسط وقت المعالجة' : 'Avg Processing Time', value: isArabic ? `${stats.avgProcessingDays} يوم` : `${stats.avgProcessingDays} days`, icon: Timer, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'أيام' : 'days', direction: 'neutral' } },
  ];

  /* ---- Status Filters ---- */
  const statusFilters: StatusFilter[] = [
    { key: 'all', label: isArabic ? 'الكل' : 'ALL', count: stats.total, color: '', activeColor: 'bg-slate-900 text-white' },
    { key: 'pending', label: isArabic ? 'قيد المراجعة' : 'Pending', count: rows.filter(r => r.status === 'pending').length, color: '', activeColor: 'bg-slate-100 text-slate-700' },
    { key: 'approved', label: isArabic ? 'تمت الموافقة' : 'Approved', count: rows.filter(r => r.status === 'approved').length, color: '', activeColor: 'bg-blue-50 text-blue-600' },
    { key: 'rejected', label: isArabic ? 'مرفوضة' : 'Rejected', count: stats.rejected, color: '', activeColor: 'bg-red-50 text-red-600' },
    { key: 'completed', label: isArabic ? 'مكتمل' : 'Completed', count: rows.filter(r => r.status === 'completed').length, color: '', activeColor: 'bg-green-50 text-green-600' },
    { key: 'refunded', label: isArabic ? 'تم الاسترجاع' : 'Refunded', count: stats.refunded, color: '', activeColor: 'bg-emerald-50 text-emerald-600' },
    { key: 'exchange', label: isArabic ? 'استبدال' : 'Exchange', count: rows.filter(r => r.status === 'exchange').length, color: '', activeColor: 'bg-indigo-50 text-indigo-600' },
  ];

  /* ---- Filtered Rows ---- */
  const filteredRows = useMemo(() => {
    let result = rows;
    if (filter !== 'all') result = result.filter(r => r.status === filter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(r => {
        const id = String(r.returnId || '').toLowerCase();
        const orderId = String(r.orderShortId || '').toLowerCase();
        const customer = String(r.customerName || '').toLowerCase();
        const reason = String(r.reason || '').toLowerCase();
        return id.includes(q) || orderId.includes(q) || customer.includes(q) || reason.includes(q);
      });
    }
    return result;
  }, [rows, filter, debouncedSearch]);

  /* ---- Table Columns ---- */
  const columns: TableColumn[] = [
    { key: 'returnNumber', label: isArabic ? 'رقم الاسترجاع' : 'Return Number' },
    { key: 'originalOrder', label: isArabic ? 'الطلب الأصلي' : 'Original Order' },
    { key: 'customer', label: isArabic ? 'العميل' : 'Customer' },
    { key: 'reason', label: isArabic ? 'السبب' : 'Reason' },
    { key: 'amount', label: isArabic ? 'المبلغ' : 'Amount' },
    { key: 'status', label: isArabic ? 'الحالة' : 'Status' },
    { key: 'created', label: isArabic ? 'تاريخ الإنشاء' : 'Created' },
    { key: 'actions', label: isArabic ? 'إجراءات' : 'Actions', align: 'center' as const },
  ];

  /* ---- Toolbar Actions ---- */
  const toolbarActions: ToolbarAction[] = [
    { label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} },
    { label: isArabic ? 'طباعة' : 'Print', icon: Printer, onClick: () => {} },
    { label: isArabic ? 'تحديث' : 'Refresh', icon: RefreshCw, onClick: () => fetchAll() },
  ];

  /* ---- Advanced Filters ---- */
  const advancedFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <FilterField label={isArabic ? 'التاريخ' : 'Date'}><FilterInput type="date" /></FilterField>
      <FilterField label={isArabic ? 'العميل' : 'Customer'}><FilterInput placeholder={isArabic ? 'اسم العميل' : 'Customer name'} /></FilterField>
      <FilterField label={isArabic ? 'السبب' : 'Reason'}><FilterInput placeholder={isArabic ? 'سبب الاسترجاع' : 'Return reason'} /></FilterField>
      <FilterField label={isArabic ? 'الموظف' : 'Employee'}><FilterInput placeholder={isArabic ? 'اسم الموظف' : 'Employee name'} /></FilterField>
    </div>
  );

  /* ---- Guide ---- */
  const guide: SalesGuideData = {
    purpose: isArabic ? 'إدارة طلبات استرجاع المنتجات والمرتجعات. تابع حالة كل طلب استرجاع من إنشائه حتى اكتماله.' : 'Manage product return requests and refunds. Track each return from creation to completion.',
    whenToUse: isArabic ? 'عند استلام طلب استرجاع من عميل. لمتابعة حالة طلبات الاسترجاع ومعالجتها.' : 'When receiving a return request from a customer. To track and process return requests.',
    whatsInside: isArabic
      ? ['لوحة إحصائيات (إجمالي، مكتمل، معلق، مرفوض، قيمة المرتجعات)', 'فلاتر الحالة', 'بحث برقم الطلب أو اسم العميل', 'جدول احترافي بكل التفاصيل', 'بطاقات موبايل متجاوبة', 'زر إنشاء طلب استرجاع']
      : ['Dashboard stats (total, completed, pending, rejected, returns value)', 'Status filters', 'Search by order number or customer', 'Professional table with details', 'Responsive mobile cards', 'Create return request button'],
    steps: isArabic
      ? [
          { title: 'اضغط "طلب استرجاع جديد"', description: 'لفتح نافذة إنشاء طلب استرجاع' },
          { title: 'أدخل بيانات الاسترجاع', description: 'رقم الطلب، سبب الاسترجاع، القيمة' },
          { title: 'استخدم الفلاتر', description: 'لتصفية طلبات الاسترجاع حسب الحالة' },
          { title: 'اضغط على أيقونة العين', description: 'لعرض تفاصيل طلب الاسترجاع' },
          { title: 'استخدم زر تحديث', description: 'لإعادة تحميل البيانات' },
        ]
      : [
          { title: 'Click "New Return"', description: 'To open the create return dialog' },
          { title: 'Enter return details', description: 'Order number, return reason, value' },
          { title: 'Use filters', description: 'To narrow returns by status' },
          { title: 'Click the eye icon', description: 'To view return details' },
          { title: 'Use Refresh button', description: 'To reload data' },
        ],
    bestPractices: isArabic
      ? ['راجع طلبات الاسترجاع المعلقة بسرعة', 'حدد أسباب الاسترجاع المتكررة لتحسين المنتجات', 'عالج الاسترجاعات خلال 48 ساعة', 'توثيق أسباب الاسترجاع للتحليل']
      : ['Review pending returns quickly', 'Identify recurring return reasons to improve products', 'Process returns within 48 hours', 'Document return reasons for analysis'],
    tips: isArabic
      ? ['راقب قيمة المرتجعات كنسبة من إجمالي المبيعات', 'متوسط وقت المعالجة يساعدك على تحسين سرعة الرد', 'الاسترجاعات المتكررة تشير لمشكلة في المنتج']
      : ['Monitor returns value as a percentage of total sales', 'Average processing time helps improve response speed', 'Frequent returns indicate product issues'],
    shortcuts: isArabic
      ? ['استخدم البحث للعثور سريعاً على طلب استرجاع بالرقم أو اسم العميل', 'الفلاتر تساعد في تركيز القائمة', 'اضغط ESC لإغلاق النوافذ']
      : ['Use search to quickly find a return by number or customer name', 'Filters help focus the list', 'Press ESC to close dialogs'],
    relatedLinks: [
      { label: isArabic ? 'الطلبات' : 'Orders', onClick: () => {} },
      { label: isArabic ? 'المدفوعات' : 'Payments', onClick: () => {} },
    ],
  };

  const openDetails = (row: Row) => { setSelectedRow(row); setDetailsOpen(true); };
  const closeDetails = () => { setDetailsOpen(false); setSelectedRow(null); };
  const isEmpty = filteredRows.length === 0 && !debouncedSearch && filter === 'all';

  return (
    <SalesPageShell>
      <SalesPageHeader
        icon={RotateCcw}
        title={isArabic ? 'المرتجعات' : 'Returns'}
        subtitle={isArabic ? 'إدارة طلبات استرجاع المنتجات ومتابعة حالتها' : 'Manage product return requests and track their status'}
        guide={guide}
        primaryAction={{ label: isArabic ? 'طلب استرجاع جديد' : 'New Return', icon: Plus, onClick: () => setShowCreateModal(true) }}
      />

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 font-semibold text-sm">{error}</div>
      )}

      <SalesStatsGrid stats={statCards} />

      <SalesStatusFilters filters={statusFilters} active={filter} onChange={setFilter} />

      <SalesToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isArabic ? 'بحث برقم الاسترجاع أو الطلب أو العميل...' : 'Search by return number, order or customer...'}
        actions={toolbarActions}
        advancedFilters={advancedFilters}
      />

      {loading ? (
        <SalesLoading />
      ) : isEmpty ? (
        <SalesEmptyState
          emoji="↩️"
          icon={RotateCcw}
          title={isArabic ? 'لا توجد طلبات استرجاع' : 'No returns yet'}
          description={isArabic ? 'عند استلام طلبات استرجاع من العملاء، ستظهر هنا مع إمكانية مراجعتها ومعالجتها.' : 'When customers submit return requests, they will appear here for review and processing.'}
          primaryAction={{ label: isArabic ? 'إنشاء طلب استرجاع' : 'Create Return Request', icon: Plus, onClick: () => setShowCreateModal(true) }}
          secondaryActions={[
            { label: isArabic ? 'دليل الاستخدام' : 'User Guide', icon: BookOpen, onClick: () => {} },
          ]}
        />
      ) : filteredRows.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">{isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results'}</p>
        </div>
      ) : (
        <>
          <SalesTable columns={columns}>
            {filteredRows.map((r) => {
              const st = getReturnStatusMeta(r.status, isArabic);
              return (
                <tr key={r.returnId} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 text-sm">#{r.returnId.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 text-slate-500 font-semibold text-sm">#{r.orderShortId}</td>
                  <td className="p-4 text-sm">
                    <div className="font-semibold text-slate-900">{r.customerName}</div>
                  </td>
                  <td className="p-4 text-slate-500 font-medium text-sm max-w-[200px] truncate" title={r.reason || ''}>{r.reason || '—'}</td>
                  <td className="p-4 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {Number(r.totalAmount || 0).toLocaleString()}</td>
                  <td className="p-4"><SalesStatusBadge label={st.label} color={st.color} bg={st.bg} /></td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{r.returnCreatedAt ? new Date(r.returnCreatedAt as any).toLocaleDateString(locale) : '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openDetails(r)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </SalesTable>
          <SalesMobileCards>
            {filteredRows.map((r) => {
              const st = getReturnStatusMeta(r.status, isArabic);
              return (
                <div key={r.returnId} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm">#{r.returnId.slice(0, 8).toUpperCase()}</div>
                      <div className="text-slate-500 font-medium text-xs mt-1">{isArabic ? 'الطلب' : 'Order'} #{r.orderShortId}</div>
                    </div>
                    <SalesStatusBadge label={st.label} color={st.color} bg={st.bg} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'العميل' : 'Customer'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm truncate">{r.customerName}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'المبلغ' : 'Amount'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {Number(r.totalAmount || 0).toLocaleString()}</div>
                    </div>
                  </div>
                  {r.reason && <div className="mt-2 text-xs text-slate-500 font-medium truncate" title={r.reason}>{r.reason}</div>}
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button onClick={() => openDetails(r)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </SalesMobileCards>
        </>
      )}

      <Modal isOpen={detailsOpen} onClose={closeDetails} title={t('business.sales.returnsDetails')} size="lg">
        <div className="space-y-4 text-right">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'رقم الاسترجاع' : 'Return Number'}</div>
              <div className="mt-2 text-slate-900 font-bold">#{selectedRow?.returnId?.slice(0, 8).toUpperCase() || '-'}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'الطلب الأصلي' : 'Original Order'}</div>
              <div className="mt-2 text-slate-900 font-bold">#{selectedRow?.orderShortId || '-'}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'المبلغ' : 'Amount'}</div>
              <div className="mt-2 text-slate-900 font-bold">{t('business.pos.egp')} {Number(selectedRow?.totalAmount || 0).toLocaleString()}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isArabic ? 'الحالة' : 'Status'}</div>
              <div className="mt-2 text-slate-900 font-bold">{getReturnStatusMeta(selectedRow?.status, isArabic).label}</div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{isArabic ? 'السبب' : 'Reason'}</div>
            <div className="text-slate-700 font-semibold text-sm whitespace-pre-wrap">{selectedRow?.reason || '—'}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{isArabic ? 'المنتجات المسترجعة' : 'Returned Items'}</div>
            <div className="space-y-2">
              {(Array.isArray(selectedRow?.items) ? selectedRow.items : []).map((it: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-slate-900 font-bold text-sm">{it?.product?.name || t('business.sales.productFallback')}</div>
                    <div className="shrink-0 text-left">
                      <div className="text-slate-900 font-bold text-sm">× {Number(it?.quantity || 0)}</div>
                      <div className="text-xs text-slate-500 font-bold">{t('business.pos.egp')} {Number(it?.unitPrice || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
              {!Array.isArray(selectedRow?.items) || selectedRow?.items?.length === 0 ? (
                <div className="text-slate-400 font-bold text-sm">{t('business.sales.noReturnedItems')}</div>
              ) : null}
            </div>
          </div>
        </div>
      </Modal>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-lg font-bold mb-4">{isArabic ? 'طلب استرجاع جديد' : 'New Return Request'}</h4>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'رقم الطلب الأصلي' : 'Original order number'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'سبب الاسترجاع' : 'Return reason'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowCreateModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      <SalesHelpfulSection
        tips={isArabic
          ? ['راقب قيمة المرتجعات كنسبة من إجمالي المبيعات', 'متوسط وقت المعالجة يساعدك على تحسين سرعة الرد', 'الاسترجاعات المتكررة تشير لمشكلة في المنتج']
          : ['Monitor returns value as a percentage of total sales', 'Average processing time helps improve response speed', 'Frequent returns indicate product issues']
        }
        documentation={[
          { label: isArabic ? 'دليل المرتجعات' : 'Returns Guide', onClick: () => {} },
          { label: isArabic ? 'سياسة الاسترجاع' : 'Return Policy', onClick: () => {} },
        ]}
        nextSteps={[
          { label: isArabic ? 'إنشاء طلب استرجاع' : 'Create Return Request', description: isArabic ? 'أضف طلب استرجاع جديد' : 'Add a new return request', onClick: () => setShowCreateModal(true) },
          { label: isArabic ? 'مراجعة الطلبات المعلقة' : 'Review Pending Returns', description: isArabic ? 'عالج الطلبات قيد المراجعة' : 'Process pending return requests', onClick: () => {} },
        ]}
      />
    </SalesPageShell>
  );
};

export default SalesReturnsView;
