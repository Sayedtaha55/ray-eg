import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  FileText,
  DollarSign,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Plus,
  Upload,
  BookOpen,
  Download,
  Printer,
  Eye,
  Trash2,
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

type Quote = {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  items: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'pending';
  createdAt: string;
  validUntil: string;
  createdBy?: string;
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  sent: { ar: 'مرسلة', en: 'Sent', color: 'text-blue-600', bg: 'bg-blue-50' },
  accepted: { ar: 'مقبولة', en: 'Accepted', color: 'text-green-600', bg: 'bg-green-50' },
  rejected: { ar: 'مرفوضة', en: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
  expired: { ar: 'منتهية', en: 'Expired', color: 'text-amber-600', bg: 'bg-amber-50' },
  pending: { ar: 'بانتظار الرد', en: 'Pending', color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

const QuotesPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAllOrders({ shopId });
      const orders = Array.isArray(res) ? res : (res as any)?.data || [];
      setQuotes(orders.map((o: any) => ({
        id: String(o.id),
        quoteNumber: o.orderNumber || `Q-${o.id}`,
        customerName: o.customerName || o.customer?.name || '---',
        customerPhone: o.customerPhone || o.customer?.phone || '---',
        items: o.items?.length || 0,
        total: Number(o.total || o.totalAmount || 0),
        status: 'draft',
        createdAt: o.createdAt || new Date().toISOString(),
        validUntil: o.validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
        createdBy: o.createdBy || o.user?.name || '---',
      })));
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const total = quotes.length;
    const totalValue = quotes.reduce((s, q) => s + q.total, 0);
    const sent = quotes.filter(q => q.status === 'sent').length;
    const accepted = quotes.filter(q => q.status === 'accepted').length;
    const pending = quotes.filter(q => q.status === 'pending').length;
    const expired = quotes.filter(q => q.status === 'expired').length;
    const rejected = quotes.filter(q => q.status === 'rejected').length;
    const conversionRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    return { total, totalValue, sent, accepted, pending, expired, rejected, conversionRate };
  }, [quotes]);

  const statCards: StatCard[] = [
    { label: isArabic ? 'إجمالي العروض' : 'Total Quotes', value: stats.total, icon: FileText, color: 'text-slate-700', bgColor: 'bg-slate-100', trend: { value: isArabic ? 'عرض' : 'quotes', direction: 'neutral' } },
    { label: isArabic ? 'القيمة الإجمالية' : 'Total Value', value: `${t('business.pos.egp')} ${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: isArabic ? 'إجمالي' : 'total', direction: 'up' } },
    { label: isArabic ? 'تم الإرسال' : 'Sent', value: stats.sent, icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'مرسل' : 'sent', direction: 'neutral' } },
    { label: isArabic ? 'تمت الموافقة' : 'Accepted', value: stats.accepted, icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50', trend: { value: `${stats.conversionRate}%`, direction: 'up' } },
    { label: isArabic ? 'بانتظار الرد' : 'Pending', value: stats.pending, icon: Clock, color: 'text-indigo-600', bgColor: 'bg-indigo-50', trend: { value: isArabic ? 'بانتظار' : 'awaiting', direction: 'neutral' } },
    { label: isArabic ? 'منتهية' : 'Expired', value: stats.expired, icon: XCircle, color: 'text-amber-600', bgColor: 'bg-amber-50', trend: { value: isArabic ? 'منتهي' : 'expired', direction: 'down' } },
    { label: isArabic ? 'مرفوضة' : 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50', trend: { value: isArabic ? 'مرفوض' : 'rejected', direction: 'down' } },
    { label: isArabic ? 'معدل التحويل' : 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50', trend: { value: isArabic ? 'تحويل' : 'conversion', direction: stats.conversionRate >= 50 ? 'up' : 'down' } },
  ];

  /* ---- Status Filters ---- */
  const statusFilters: StatusFilter[] = [
    { key: 'all', label: isArabic ? 'الكل' : 'ALL', count: stats.total, color: '', activeColor: 'bg-slate-900 text-white' },
    { key: 'draft', label: isArabic ? 'مسودة' : 'Draft', count: quotes.filter(q => q.status === 'draft').length, color: '', activeColor: 'bg-slate-100 text-slate-700' },
    { key: 'sent', label: isArabic ? 'مرسلة' : 'Sent', count: stats.sent, color: '', activeColor: 'bg-blue-50 text-blue-600' },
    { key: 'accepted', label: isArabic ? 'مقبولة' : 'Accepted', count: stats.accepted, color: '', activeColor: 'bg-green-50 text-green-600' },
    { key: 'rejected', label: isArabic ? 'مرفوضة' : 'Rejected', count: stats.rejected, color: '', activeColor: 'bg-red-50 text-red-600' },
    { key: 'expired', label: isArabic ? 'منتهية' : 'Expired', count: stats.expired, color: '', activeColor: 'bg-amber-50 text-amber-600' },
    { key: 'pending', label: isArabic ? 'بانتظار الرد' : 'Pending', count: stats.pending, color: '', activeColor: 'bg-indigo-50 text-indigo-600' },
  ];

  /* ---- Filtered Quotes ---- */
  const filteredQuotes = useMemo(() => {
    let result = quotes;
    if (filter !== 'all') {
      result = result.filter(q => q.status === filter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(qt =>
        qt.quoteNumber.toLowerCase().includes(q) ||
        qt.customerName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [quotes, filter, debouncedSearch]);

  /* ---- Table Columns ---- */
  const columns: TableColumn[] = [
    { key: 'quoteNumber', label: isArabic ? 'رقم العرض' : 'Offer Number' },
    { key: 'customer', label: isArabic ? 'العميل' : 'Customer' },
    { key: 'amount', label: isArabic ? 'القيمة' : 'Amount' },
    { key: 'status', label: isArabic ? 'الحالة' : 'Status' },
    { key: 'expiration', label: isArabic ? 'الانتهاء' : 'Expiration' },
    { key: 'createdBy', label: isArabic ? 'أنشأها' : 'Created By' },
    { key: 'actions', label: isArabic ? 'إجراءات' : 'Actions', align: 'center' as const },
  ];

  /* ---- Toolbar Actions ---- */
  const toolbarActions: ToolbarAction[] = [
    { label: isArabic ? 'تصدير' : 'Export', icon: Download, onClick: () => {} },
    { label: isArabic ? 'طباعة' : 'Print', icon: Printer, onClick: () => {} },
  ];

  /* ---- Advanced Filters ---- */
  const advancedFilters = (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <FilterField label={isArabic ? 'العميل' : 'Customer'}><FilterInput placeholder={isArabic ? 'اسم العميل' : 'Customer name'} /></FilterField>
      <FilterField label={isArabic ? 'رقم العرض' : 'Offer Number'}><FilterInput placeholder={isArabic ? 'رقم العرض' : 'Offer number'} /></FilterField>
      <FilterField label={isArabic ? 'مسؤول المبيعات' : 'Sales Person'}><FilterInput placeholder={isArabic ? 'اسم المسؤول' : 'Sales person'} /></FilterField>
      <FilterField label={isArabic ? 'التاريخ' : 'Date'}><FilterInput type="date" /></FilterField>
      <FilterField label={isArabic ? 'الفرع' : 'Branch'}><FilterInput placeholder={isArabic ? 'الفرع' : 'Branch'} /></FilterField>
    </div>
  );

  /* ---- Guide ---- */
  const guide: SalesGuideData = {
    purpose: isArabic ? 'إنشاء وإدارة عروض الأسعار المرسلة للعملاء. تابع حالة كل عرض من إنشائه حتى قبوله أو رفضه.' : 'Create and manage price quotes sent to customers. Track each quote from creation to acceptance or rejection.',
    whenToUse: isArabic ? 'عند الحاجة لإنشاء عرض سعر لعميل. لمتابعة العروض المرسلة وحالتها.' : 'When you need to create a price quote for a customer. To track sent quotes and their status.',
    whatsInside: isArabic
      ? ['لوحة إحصائيات (إجمالي، مقبول، معلق، مرفوض، متوسط القيمة)', 'فلاتر الحالة (الكل، مقبول، معلق، مرفوض، منتهي)', 'بحث بالرقم أو اسم العميل', 'جدول احترافي بكل التفاصيل', 'بطاقات موبايل متجاوبة', 'زر إنشاء عرض سعر جديد']
      : ['Dashboard stats (total, accepted, pending, rejected, avg value)', 'Status filters (all, accepted, pending, rejected, expired)', 'Search by quote number or customer', 'Professional table with details', 'Responsive mobile cards', 'Create new quote button'],
    steps: isArabic
      ? [
          { title: 'اضغط "عرض سعر جديد"', description: 'لفتح نافذة إنشاء عرض سعر جديد' },
          { title: 'أدخل بيانات العرض', description: 'اسم العميل، القيمة، تاريخ الانتهاء' },
          { title: 'استخدم الفلاتر', description: 'لتصفية العروض حسب الحالة' },
          { title: 'اضغط على أيقونة العين', description: 'لعرض تفاصيل العرض' },
          { title: 'تابع العروض المعلقة', description: 'لإغلاق الصفقات وزيادة التحويل' },
        ]
      : [
          { title: 'Click "New Quote"', description: 'To open the create quote dialog' },
          { title: 'Enter quote details', description: 'Customer name, value, expiration date' },
          { title: 'Use filters', description: 'To narrow quotes by status' },
          { title: 'Click the eye icon', description: 'To view quote details' },
          { title: 'Follow up on pending', description: 'To close deals and increase conversion' },
        ],
    bestPractices: isArabic
      ? ['أرسل العروض فور طلبها', 'ضع تاريخ انتهاء واضح لخلق إلحاح', 'تابع العروض المعلقة لإغلاق الصفقات', 'حول العروض المقبولة لطلبات فوراً']
      : ['Send quotes promptly', 'Set clear expiration dates to create urgency', 'Follow up on pending quotes to close deals', 'Convert accepted quotes to orders immediately'],
    tips: isArabic
      ? ['راقب معدل التحويل لقياس فعالية عروضك', 'العروض المقبولة يمكن تحويلها لطلبات مباشرة', 'متوسط القيمة يساعدك على تحسين التسعير']
      : ['Monitor conversion rate to measure quote effectiveness', 'Accepted quotes can be converted to orders directly', 'Average value helps you improve pricing'],
    shortcuts: isArabic
      ? ['استخدم البحث للعثور سريعاً على عرض بالرقم أو اسم العميل', 'الفلاتر تساعد في تركيز القائمة', 'اضغط ESC لإغلاق النوافذ']
      : ['Use search to quickly find quotes by number or customer name', 'Filters help focus the list', 'Press ESC to close dialogs'],
    relatedLinks: [
      { label: isArabic ? 'الطلبات' : 'Orders', onClick: () => {} },
      { label: isArabic ? 'المدفوعات' : 'Payments', onClick: () => {} },
    ],
  };

  const isEmpty = filteredQuotes.length === 0 && !debouncedSearch && filter === 'all';

  const formatExpiration = (validUntil: string) => {
    const d = new Date(validUntil);
    if (isNaN(d.getTime())) return '-';
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return isArabic ? 'منتهية' : 'Expired';
    if (days === 0) return isArabic ? 'تنتهي اليوم' : 'Expires today';
    return isArabic ? `${days} يوم` : `${days} days`;
  };

  return (
    <SalesPageShell>
      <SalesPageHeader
        icon={FileText}
        title={isArabic ? 'عروض الأسعار' : 'Quotations'}
        subtitle={isArabic ? 'إدارة عروض الأسعار المرسلة للعملاء ومتابعة حالتها' : 'Manage price quotes sent to customers and track their status'}
        guide={guide}
        primaryAction={{ label: isArabic ? 'عرض سعر جديد' : 'New Quote', icon: Plus, onClick: () => setShowModal(true) }}
      />

      <SalesStatsGrid stats={statCards} />

      <SalesStatusFilters filters={statusFilters} active={filter} onChange={setFilter} />

      <SalesToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isArabic ? 'بحث برقم العرض أو اسم العميل...' : 'Search by quote number or customer...'}
        actions={toolbarActions}
        advancedFilters={advancedFilters}
      />

      {loading ? (
        <SalesLoading />
      ) : isEmpty ? (
        <SalesEmptyState
          emoji="📝"
          icon={FileText}
          title={isArabic ? 'لا توجد عروض أسعار بعد' : 'No quotes yet'}
          description={isArabic ? 'ابدأ بإنشاء عرض سعر جديد لعملائك. ستظهر جميع العروض هنا مع إمكانية تتبعها ومتابعة حالتها.' : 'Start by creating a new price quote for your customers. All quotes will appear here with full tracking.'}
          primaryAction={{ label: isArabic ? 'إنشاء عرض سعر' : 'Create Quote', icon: Plus, onClick: () => setShowModal(true) }}
          secondaryActions={[
            { label: isArabic ? 'استيراد عروض' : 'Import Quotes', icon: Upload, onClick: () => {} },
            { label: isArabic ? 'دليل الاستخدام' : 'User Guide', icon: BookOpen, onClick: () => {} },
          ]}
        />
      ) : filteredQuotes.length === 0 ? (
        <div className="py-12 text-center">
          <SearchIcon size={48} className="mx-auto mb-3 text-slate-200" />
          <p className="font-semibold text-slate-400">{isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results'}</p>
        </div>
      ) : (
        <>
          <SalesTable columns={columns}>
            {filteredQuotes.map((q) => {
              const st = STATUS_STYLES[q.status] || STATUS_STYLES.draft;
              return (
                <tr key={q.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 text-sm">{q.quoteNumber}</td>
                  <td className="p-4 text-sm">
                    <div className="font-semibold text-slate-900">{q.customerName}</div>
                    <div className="text-xs text-slate-400">{q.customerPhone}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {q.total.toLocaleString()}</td>
                  <td className="p-4">
                    <SalesStatusBadge label={isArabic ? st.ar : st.en} color={st.color} bg={st.bg} />
                  </td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{formatExpiration(q.validUntil)}</td>
                  <td className="p-4 text-slate-500 font-medium text-sm">{q.createdBy}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </SalesTable>
          <SalesMobileCards>
            {filteredQuotes.map((q) => {
              const st = STATUS_STYLES[q.status] || STATUS_STYLES.draft;
              return (
                <div key={q.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm">{q.quoteNumber}</div>
                      <div className="text-slate-500 font-medium text-xs mt-1">{q.customerName}</div>
                    </div>
                    <SalesStatusBadge label={isArabic ? st.ar : st.en} color={st.color} bg={st.bg} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'القيمة' : 'Amount'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{t('business.pos.egp')} {q.total.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-slate-500">{isArabic ? 'الانتهاء' : 'Expiration'}</div>
                      <div className="mt-1 font-bold text-slate-900 text-sm">{formatExpiration(q.validUntil)}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                      <Eye size={18} />
                    </button>
                    <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </SalesMobileCards>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold">{isArabic ? 'عرض سعر جديد' : 'New Quote'}</h4>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      <SalesHelpfulSection
        tips={isArabic
          ? ['راقب معدل التحويل لقياس فعالية عروضك', 'العروض المقبولة يمكن تحويلها لطلبات مباشرة', 'متوسط القيمة يساعدك على تحسين التسعير']
          : ['Monitor conversion rate to measure quote effectiveness', 'Accepted quotes can be converted to orders directly', 'Average value helps you improve pricing']
        }
        documentation={[
          { label: isArabic ? 'دليل عروض الأسعار' : 'Quotations Guide', onClick: () => {} },
          { label: isArabic ? 'أفضل ممارسات التسعير' : 'Pricing Best Practices', onClick: () => {} },
        ]}
        nextSteps={[
          { label: isArabic ? 'إنشاء عرض سعر' : 'Create New Quote', description: isArabic ? 'أرسل عرض سعر لعميل' : 'Send a price quote to a customer', onClick: () => setShowModal(true) },
          { label: isArabic ? 'متابعة العروض المعلقة' : 'Follow Up Pending', description: isArabic ? 'تواصل مع العملاء لإغلاق الصفقات' : 'Contact customers to close deals', onClick: () => {} },
        ]}
      />
    </SalesPageShell>
  );
};

export default QuotesPage;
