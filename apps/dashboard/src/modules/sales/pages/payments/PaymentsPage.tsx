import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  DollarSign,
  Plus,
  Eye,
  Download,
  Printer,
  RefreshCw,
  Upload,
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

type Payment = {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: 'cash' | 'card' | 'online' | 'wallet' | 'cod';
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
};

const METHOD_LABELS: Record<string, { ar: string; en: string }> = {
  cash: { ar: 'كاش', en: 'Cash' },
  card: { ar: 'بطاقة', en: 'Card' },
  online: { ar: 'أونلاين', en: 'Online' },
  wallet: { ar: 'محفظة', en: 'Wallet' },
  cod: { ar: 'دفع عند الاستلام', en: 'COD' },
};

const STATUS_META: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  paid: { ar: 'مدفوع', en: 'Paid', color: 'text-green-600', bg: 'bg-green-50' },
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
  failed: { ar: 'فشل', en: 'Failed', color: 'text-red-600', bg: 'bg-red-50' },
  refunded: { ar: 'مسترجع', en: 'Refunded', color: 'text-blue-600', bg: 'bg-blue-50' },
};

const getStatusMeta = (status: string, isArabic: boolean) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return { label: isArabic ? meta.ar : meta.en, color: meta.color, bg: meta.bg };
};

const PaymentsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAllOrders({ shopId });
      const orders = Array.isArray(res) ? res : (res as any)?.data || [];
      setPayments(orders.map((o: any) => ({
        id: String(o.id),
        invoiceNumber: o.invoiceNumber || `INV-${String(o.id).padStart(5, '0')}`,
        orderNumber: o.orderNumber || `#${o.id}`,
        customerName: o.customerName || o.customer?.name || '---',
        amount: Number(o.total || o.totalAmount || 0),
        method: o.paymentMethod || 'cod',
        status: o.paymentStatus || (o.isPaid ? 'paid' : 'pending'),
        date: o.createdAt || new Date().toISOString(),
      })));
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const total = payments.length;
    const paid = payments.filter(p => p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const refunded = payments.filter(p => p.status === 'refunded').length;
    const totalAmount = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const avgPayment = paid > 0 ? Math.round(totalAmount / paid) : 0;
    return { total, paid, pending, failed, refunded, totalAmount, avgPayment };
  }, [payments]);

  const statCards: StatCard[] = [
    { label: isArabic ? 'إجمالي المدفوعات' : 'Total Payments', value: stats.total, icon: CreditCard, color: 'text-slate-700', bgColor: 'bg-slate-100', trend: { value: isArabic ? `${stats.total} دفعة` : `${stats.total} payments`, direction: 'neutral' } },
    { label: isArabic ? 'ناجحة' : 'Successful', value: stats.paid, icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: stats.total > 0 ? `${Math.round((stats.paid / stats.total) * 100)}%` : '0%', direction: 'up' } },
    { label: isArabic ? 'قيد الانتظار' : 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', trend: { value: isArabic ? 'بانتظار' : 'awaiting', direction: 'neutral' } },
    { label: isArabic ? 'فاشلة' : 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', trend: { value: isArabic ? 'تحتاج متابعة' : 'needs attention', direction: 'down' } },
    { label: isArabic ? 'المسترجعات' : 'Refunds', value: stats.refunded, icon: RotateCcw, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'مراقبة' : 'monitor', direction: 'neutral' } },
    { label: isArabic ? 'متوسط الدفع' : 'Average Payment', value: `${t('business.pos.egp')} ${stats.avgPayment.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: isArabic ? 'لكل دفعة' : 'per payment', direction: 'up' } },
  ];

  /* ---- Status Filters ---- */
  const statusFilters: StatusFilter[] = [
    { key: 'all', label: isArabic ? 'الكل' : 'ALL', count: stats.total, color: '', activeColor: 'bg-slate-900 text-white' },
    { key: 'paid', label: isArabic ? 'مدفوع' : 'Paid', count: stats.paid, color: '', activeColor: 'bg-green-50 text-green-600' },
    { key: 'pending', label: isArabic ? 'قيد الانتظار' : 'Pending', count: stats.pending, color: '', activeColor: 'bg-amber-50 text-amber-600' },
    { key: 'failed', label: isArabic ? 'فشل' : 'Failed', count: stats.failed, color: '', activeColor: 'bg-red-50 text-red-600' },
    { key: 'refunded', label: isArabic ? 'مسترجع' : 'Refunded', count: stats.refunded, color: '', activeColor: 'bg-blue-50 text-blue-600' },
  ];

  /* ---- Filtered Payments ---- */
  const filteredPayments = useMemo(() => {
    let result = payments;
    if (filter !== 'all') result = result.filter(p => p.status === filter);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(p =>
        p.orderNumber.toLowerCase().includes(q) ||
        p.invoiceNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [payments, filter, debouncedSearch]);

  /* ---- Table Columns ---- */
  const columns: TableColumn[] = [
    { key: 'invoice', label: isArabic ? 'الفاتورة' : 'Invoice' },
    { key: 'order', label: isArabic ? 'الطلب' : 'Order' },
    { key: 'customer', label: isArabic ? 'العميل' : 'Customer' },
    { key: 'amount', label: isArabic ? 'المبلغ' : 'Amount' },
    { key: 'method', label: isArabic ? 'طريقة الدفع' : 'Method' },
    { key: 'status', label: isArabic ? 'الحالة' : 'Status' },
    { key: 'created', label: isArabic ? 'التاريخ' : 'Created' },
    { key: 'actions', label: isArabic ? 'إجراءات' : 'Actions', align: 'center' as const },
  ];

  /* ---- Toolbar Actions ---- */
  const toolbarActions: ToolbarAction[] = [
    { label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} },
    { label: isArabic ? 'طباعة' : 'Print', icon: Printer, onClick: () => {} },
    { label: isArabic ? 'تحديث' : 'Refresh', icon: RefreshCw, onClick: () => loadPayments() },
  ];

  /* ---- Advanced Filters ---- */
  const advancedFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <FilterField label={isArabic ? 'الفاتورة' : 'Invoice'}><FilterInput placeholder={isArabic ? 'رقم الفاتورة' : 'Invoice number'} /></FilterField>
      <FilterField label={isArabic ? 'العميل' : 'Customer'}><FilterInput placeholder={isArabic ? 'اسم العميل' : 'Customer name'} /></FilterField>
      <FilterField label={isArabic ? 'طريقة الدفع' : 'Method'}>
        <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-200">
          <option>{isArabic ? 'الكل' : 'All'}</option>
          <option>{isArabic ? 'كاش' : 'Cash'}</option>
          <option>{isArabic ? 'بطاقة' : 'Card'}</option>
          <option>{isArabic ? 'أونلاين' : 'Online'}</option>
        </select>
      </FilterField>
      <FilterField label={isArabic ? 'التاريخ' : 'Date'}><FilterInput type="date" /></FilterField>
    </div>
  );

  /* ---- Guide ---- */
  const guide: SalesGuideData = {
    purpose: isArabic ? 'تتبع جميع المدفوعات والمعاملات المالية. راقب المدفوعات الناجحة والفاشلة والمسترجعات.' : 'Track all payments and financial transactions. Monitor successful, failed, and refunded payments.',
    whenToUse: isArabic ? 'عند متابعة المدفوعات اليومية. لمراقبة المسترجعات والمدفوعات الفاشلة.' : 'When tracking daily payments. To monitor refunds and failed payments.',
    whatsInside: isArabic
      ? ['لوحة إحصائيات (إجمالي، ناجح، معلق، فاشل، مسترجع، متوسط الدفع)', 'فلاتر الحالة', 'بحث برقم الفاتورة أو العميل', 'جدول احترافي بكل التفاصيل', 'بطاقات موبايل متجاوبة', 'زر إنشاء دفعة جديدة', 'فلاتر متقدمة (فاتورة، عميل، طريقة، تاريخ)']
      : ['Dashboard stats (total, successful, pending, failed, refunded, avg payment)', 'Status filters', 'Search by invoice or customer', 'Professional table with details', 'Responsive mobile cards', 'Create new payment button', 'Advanced filters (invoice, customer, method, date)'],
    steps: isArabic
      ? [
          { title: 'افحص لوحة الإحصائيات', description: 'راجع إجمالي المدفوعات والمسترجعات' },
          { title: 'استخدم الفلاتر', description: 'لتصنيف المدفوعات حسب الحالة' },
          { title: 'اضغط على أيقونة العين', description: 'لعرض تفاصيل الدفعة' },
          { title: 'اضغط "دفعة جديدة"', description: 'لإنشاء دفعة جديدة' },
          { title: 'تابع المدفوعات الفاشلة', description: 'لإعادة المحاولة أو التواصل مع العميل' },
        ]
      : [
          { title: 'Check the dashboard', description: 'Review total payments and refunds' },
          { title: 'Use filters', description: 'To categorize payments by status' },
          { title: 'Click the eye icon', description: 'To view payment details' },
          { title: 'Click "New Payment"', description: 'To create a new payment' },
          { title: 'Monitor failed payments', description: 'To retry or contact the customer' },
        ],
    bestPractices: isArabic
      ? ['تابع المدفوعات الفاشلة بانتظام', 'تأكد من مطابقة المدفوعات مع الطلبات', 'راقب المسترجعات لتقليل الخسائر', 'استخدم الفلاتر المتقدمة للبحث الدقيق']
      : ['Monitor failed payments regularly', 'Ensure payments match with orders', 'Monitor refunds to minimize losses', 'Use advanced filters for precise search'],
    tips: isArabic
      ? ['متوسط الدفع يساعدك على فهم سلوك الإنفاق', 'راقب المسترجعات لتقليل الخسائر', 'المدفوعات المعلقة تحتاج متابعة فورية']
      : ['Average payment helps you understand spending behavior', 'Monitor refunds to minimize losses', 'Pending payments need immediate follow-up'],
    shortcuts: isArabic
      ? ['استخدم البحث للعثور سريعاً على دفعة برقم الفاتورة أو العميل', 'الفلاتر تساعد في التركيز', 'اضغط ESC لإغلاق النوافذ']
      : ['Use search to quickly find a payment by invoice number or customer', 'Filters help focus', 'Press ESC to close dialogs'],
    relatedLinks: [
      { label: isArabic ? 'الدفع الإلكتروني' : 'E-Payment', onClick: () => {} },
      { label: isArabic ? 'الطلبات' : 'Orders', onClick: () => {} },
    ],
  };

  const isEmpty = filteredPayments.length === 0 && !debouncedSearch && filter === 'all';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(locale);
  };

  return (
    <SalesPageShell>
      <SalesPageHeader
        icon={CreditCard}
        title={isArabic ? 'المدفوعات' : 'Payments'}
        subtitle={isArabic ? 'تتبع جميع المدفوعات والمعاملات المالية' : 'Track all payments and financial transactions'}
        guide={guide}
        primaryAction={{ label: isArabic ? 'دفعة جديدة' : 'New Payment', icon: Plus, onClick: () => setShowCreateModal(true) }}
      />

      <SalesStatsGrid stats={statCards} />

      <SalesStatusFilters filters={statusFilters} active={filter} onChange={setFilter} />

      <SalesToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isArabic ? 'بحث برقم الفاتورة أو الطلب أو العميل...' : 'Search by invoice, order or customer...'}
        actions={toolbarActions}
        advancedFilters={advancedFilters}
      />

      {loading ? (
        <SalesLoading />
      ) : isEmpty ? (
        <SalesEmptyState
          emoji="💰"
          icon={CreditCard}
          title={isArabic ? 'لا توجد مدفوعات' : 'No payments yet'}
          description={isArabic ? 'عند استقبال مدفوعات من العملاء، ستظهر هنا مع تفاصيل الفاتورة والطلب وطريقة الدفع والحالة.' : 'When you receive payments from customers, they will appear here with invoice details, order, method, and status.'}
          primaryAction={{ label: isArabic ? 'إنشاء دفعة' : 'Create Payment', icon: Plus, onClick: () => setShowCreateModal(true) }}
          secondaryActions={[
            { label: isArabic ? 'استيراد' : 'Import', icon: Upload, onClick: () => {} },
            { label: isArabic ? 'دليل الاستخدام' : 'User Guide', icon: BookOpen, onClick: () => {} },
          ]}
        />
      ) : filteredPayments.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">{isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results'}</p>
        </div>
      ) : (
        <>
          <SalesTable columns={columns}>
            {filteredPayments.map((p) => {
              const st = getStatusMeta(p.status, isArabic);
              const m = METHOD_LABELS[p.method] || METHOD_LABELS.cod;
              return (
                <tr key={p.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 text-sm">{p.invoiceNumber}</td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{p.orderNumber}</td>
                  <td className="p-4 text-sm">
                    <div className="font-semibold text-slate-900">{p.customerName}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {p.amount.toLocaleString()}</td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{isArabic ? m.ar : m.en}</td>
                  <td className="p-4"><SalesStatusBadge label={st.label} color={st.color} bg={st.bg} /></td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{formatDate(p.date)}</td>
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
            {filteredPayments.map((p) => {
              const st = getStatusMeta(p.status, isArabic);
              const m = METHOD_LABELS[p.method] || METHOD_LABELS.cod;
              return (
                <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm">{p.invoiceNumber}</div>
                      <div className="text-slate-500 font-medium text-xs mt-1">{p.orderNumber} · {p.customerName}</div>
                    </div>
                    <SalesStatusBadge label={st.label} color={st.color} bg={st.bg} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'المبلغ' : 'Amount'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {p.amount.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'طريقة الدفع' : 'Method'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{isArabic ? m.ar : m.en}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400 font-medium">{formatDate(p.date)}</span>
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
              <h4 className="text-lg font-bold">{isArabic ? 'دفعة جديدة' : 'New Payment'}</h4>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'رقم الفاتورة' : 'Invoice number'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'رقم الطلب' : 'Order number'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="number" placeholder={isArabic ? 'المبلغ' : 'Amount'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm">
                <option>{isArabic ? 'كاش' : 'Cash'}</option>
                <option>{isArabic ? 'بطاقة' : 'Card'}</option>
                <option>{isArabic ? 'أونلاين' : 'Online'}</option>
                <option>{isArabic ? 'محفظة' : 'Wallet'}</option>
              </select>
              <button onClick={() => setShowCreateModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      <SalesHelpfulSection
        tips={isArabic
          ? ['متوسط الدفع يساعدك على فهم سلوك الإنفاق', 'راقب المسترجعات لتقليل الخسائر', 'المدفوعات المعلقة تحتاج متابعة فورية']
          : ['Average payment helps you understand spending behavior', 'Monitor refunds to minimize losses', 'Pending payments need immediate follow-up']
        }
        documentation={[
          { label: isArabic ? 'دليل المدفوعات' : 'Payments Guide', onClick: () => {} },
          { label: isArabic ? 'إدارة المسترجعات' : 'Managing Refunds', onClick: () => {} },
        ]}
        nextSteps={[
          { label: isArabic ? 'إنشاء دفعة جديدة' : 'Create New Payment', description: isArabic ? 'أضف دفعة يدوية لعميل' : 'Add a manual payment for a customer', onClick: () => setShowCreateModal(true) },
          { label: isArabic ? 'مراجعة المدفوعات الفاشلة' : 'Review Failed Payments', description: isArabic ? 'أعد المحاولة أو تواصل مع العميل' : 'Retry or contact the customer', onClick: () => {} },
        ]}
      />
    </SalesPageShell>
  );
};

export default PaymentsPage;
