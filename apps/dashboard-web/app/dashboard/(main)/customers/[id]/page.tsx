'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Loader2,
  Pencil,
  MessageCircle,
  Archive,
  ArchiveRestore,
  AlertTriangle,
  ClipboardList,
  FileText,
  Wallet,
  RotateCcw,
  ScrollText,
  MessageSquare,
  Star,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';

/* ============================================================
 * ملف العميل الموحد — التبويبات تتبدل حسب نشاط المتجر
 * ============================================================ */

type ShopCustomer = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  customerType: string;
  companyName: string;
  taxNumber: string;
  status: string;
  address: string;
  city: string;
  country: string;
  branch: string;
  source: string;
  segmentId: string;
  tags: string[];
  notes: string;
  archived: boolean;
  loyaltyBalance: number;
  balanceDue: number;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseAt: string | null;
  createdAt: string;
};

type ContactLogEntry = {
  id: string;
  type: string;
  content: string;
  followupAt?: string;
  staffName?: string;
  createdAt: string;
};
type ActivityRow = {
  id: string;
  status?: string;
  total: number;
  method?: string;
  source?: string;
  createdAt: string;
};
type StatementRow = {
  date: string;
  type: string;
  ref: string;
  debit: number;
  credit: number;
  balance: number;
};

const SOURCE_LABELS: Record<string, string> = {
  pos: 'الكاشير',
  website: 'الموقع',
  bookings: 'الحجوزات',
  services: 'الخدمات',
  manual: 'يدوي',
  import: 'استيراد',
  app: 'تطبيق العميل',
  customer: 'الموقع',
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: 'نشط', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  inactive: { label: 'غير نشط', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
  blocked: { label: 'محظور', cls: 'bg-red-50 text-red-600 border-red-200' },
};

// التبويبات حسب نشاط المتجر
const CATEGORY_TABS: Record<string, { id: string; label: string; icon: any }[]> = {
  RESTAURANT: [
    { id: 'orders', label: 'الطلبات', icon: ClipboardList },
    { id: 'bookings', label: 'الحجوزات', icon: Calendar },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
    { id: 'payments', label: 'المدفوعات', icon: Wallet },
    { id: 'returns', label: 'المرتجعات', icon: RotateCcw },
  ],
  FASHION: [
    { id: 'orders', label: 'الطلبات', icon: ClipboardList },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
    { id: 'payments', label: 'المدفوعات', icon: Wallet },
    { id: 'returns', label: 'المرتجعات والاستبدالات', icon: RotateCcw },
  ],
  REAL_ESTATE: [
    { id: 'bookings', label: 'الحجوزات', icon: Calendar },
    { id: 'contracts', label: 'العقود', icon: BookOpen },
    { id: 'payments', label: 'الدفعات', icon: Wallet },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
  ],
  SERVICES: [
    { id: 'services', label: 'الخدمات', icon: BookOpen },
    { id: 'orders', label: 'الطلبات', icon: ClipboardList },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
    { id: 'payments', label: 'المدفوعات', icon: Wallet },
  ],
  DEFAULT: [
    { id: 'orders', label: 'الطلبات', icon: ClipboardList },
    { id: 'invoices', label: 'الفواتير', icon: FileText },
    { id: 'payments', label: 'المدفوعات', icon: Wallet },
    { id: 'returns', label: 'المرتجعات', icon: RotateCcw },
  ],
};

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { shop } = useShop();
  const shopId = shop?.id || '';
  const customerId = String(params?.id || '');

  const [customer, setCustomer] = useState<ShopCustomer | null>(null);
  const [contactLog, setContactLog] = useState<ContactLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [activity, setActivity] = useState<ActivityRow[] | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [statement, setStatement] = useState<{
    opening: number;
    rows: StatementRow[];
    closing: number;
  } | null>(null);
  const [loyalty, setLoyalty] = useState<{ enabled: boolean; ledger: any[] }>({
    enabled: false,
    ledger: [],
  });
  const [archiving, setArchiving] = useState(false);

  // نموذج سجل التواصل
  const [logType, setLogType] = useState('note');
  const [logContent, setLogContent] = useState('');
  const [logFollowup, setLogFollowup] = useState('');
  const [logSaving, setLogSaving] = useState(false);

  // تعديل النقاط
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustDelta, setAdjustDelta] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSaving, setAdjustSaving] = useState(false);

  const loadCustomer = useCallback(async () => {
    if (!shopId || !customerId) return;
    setLoading(true);
    try {
      const res = await apiRequest(`/shops/${shopId}/customers/${customerId}`);
      const data = res?.data ?? res;
      if (!data?.id) {
        setNotFound(true);
        return;
      }
      setCustomer(data);
      setContactLog(Array.isArray(res?.contactLog) ? res.contactLog : []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [shopId, customerId]);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  const category = String(shop?.category || 'RETAIL').toUpperCase();
  const tabs = CATEGORY_TABS[category] || CATEGORY_TABS.DEFAULT;

  const loadTab = useCallback(
    async (tab: string) => {
      if (!shopId || !customerId || !customer) return;
      if (tab === 'orders' || tab === 'returns') {
        setActivityLoading(true);
        try {
          const rows = await apiRequest(
            `/shops/${shopId}/customers/${customerId}/activity?type=${tab === 'returns' ? 'returns' : 'orders'}`
          );
          setActivity(Array.isArray(rows) ? rows : []);
        } catch {
          setActivity([]);
        } finally {
          setActivityLoading(false);
        }
      } else if (tab === 'statement') {
        setActivityLoading(true);
        try {
          const res = await apiRequest(`/shops/${shopId}/customers/${customerId}/statement`);
          setStatement(res?.data ?? res ?? { opening: 0, rows: [], closing: 0 });
        } catch {
          setStatement({ opening: 0, rows: [], closing: 0 });
        } finally {
          setActivityLoading(false);
        }
      } else if (tab === 'loyalty') {
        setActivityLoading(true);
        try {
          const [settings, ledger] = await Promise.allSettled([
            apiRequest(`/shops/${shopId}/loyalty/settings`),
            apiRequest(`/shops/${shopId}/loyalty/ledger?customerId=${customerId}`),
          ]);
          const s =
            settings.status === 'fulfilled'
              ? (settings.value?.data ?? settings.value)
              : { enabled: false };
          const l = ledger.status === 'fulfilled' ? (ledger.value?.data ?? ledger.value) : [];
          setLoyalty({ enabled: Boolean(s?.enabled), ledger: Array.isArray(l) ? l : [] });
        } catch {
          setLoyalty({ enabled: false, ledger: [] });
        } finally {
          setActivityLoading(false);
        }
      } else {
        setActivity(null);
      }
    },
    [shopId, customerId, customer]
  );

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  const addContactLog = async () => {
    if (!logContent.trim()) return;
    setLogSaving(true);
    try {
      const res = await apiRequest(`/shops/${shopId}/customers/${customerId}/contact-log`, {
        method: 'POST',
        body: JSON.stringify({
          type: logType,
          content: logContent.trim(),
          followupAt: logFollowup,
          staffName: 'الإدارة',
        }),
      });
      setContactLog(Array.isArray(res?.data) ? res.data : contactLog);
      setLogContent('');
      setLogFollowup('');
    } catch {
    } finally {
      setLogSaving(false);
    }
  };

  const toggleArchive = async () => {
    if (!customer) return;
    setArchiving(true);
    try {
      await apiRequest(
        `/shops/${shopId}/customers/${customer.id}/${customer.archived ? 'restore' : 'archive'}`,
        { method: 'POST' }
      );
      router.push('/dashboard/customers');
    } catch {
    } finally {
      setArchiving(false);
    }
  };

  const adjustLoyalty = async () => {
    if (!adjustDelta || !adjustReason.trim()) return;
    setAdjustSaving(true);
    try {
      await apiRequest(`/shops/${shopId}/loyalty/adjust`, {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          delta: adjustDelta,
          reason: adjustReason.trim(),
          staffName: 'الإدارة',
        }),
      });
      setAdjustOpen(false);
      setAdjustDelta(0);
      setAdjustReason('');
      await loadTab('loyalty');
      await loadCustomer();
    } catch {
    } finally {
      setAdjustSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[#F4F5F7] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-300" />
      </div>
    );
  }

  if (notFound || !customer) {
    return (
      <div className="min-h-full bg-[#F4F5F7] p-6 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <AlertTriangle size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">العميل غير موجود</p>
          <Link
            href="/dashboard/customers"
            className="mt-3 inline-block text-xs font-bold text-slate-900 underline"
          >
            رجوع للعملاء
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_LABELS[customer.status] || {
    label: customer.status,
    cls: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  const avgOrder = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;

  const SummaryCard = ({ label, value }: { label: string; value: string }) => (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
      <div className="text-[10px] font-bold text-slate-400">{label}</div>
      <div className="text-sm font-bold text-slate-900 tabular-nums">{value}</div>
    </div>
  );

  return (
    <div
      className="min-h-full bg-[#F4F5F7] text-slate-900"
      style={{ fontFamily: "'Cairo','Tajawal',system-ui,sans-serif" }}
    >
      {/* هيدر الملف */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-5 max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                {customer.code}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${status.cls}`}>
                {status.label}
              </span>
              {customer.archived && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                  مؤرشف
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5" dir="ltr" style={{ textAlign: 'right' }}>
              {customer.phone} {customer.email ? `· ${customer.email}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/2${(customer.phone || '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[12px] font-bold hover:bg-emerald-100 flex items-center gap-1.5"
            >
              <MessageCircle size={13} />
              واتساب
            </a>
            <Link
              href={`/dashboard/customers/${customer.id}/edit`}
              className="h-10 px-4 rounded-full border border-slate-200 bg-white text-slate-700 text-[12px] font-bold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Pencil size={13} />
              تعديل
            </Link>
            <button
              onClick={toggleArchive}
              disabled={archiving}
              className="h-10 px-4 rounded-full border border-slate-200 bg-white text-slate-700 text-[12px] font-bold hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-50"
            >
              {archiving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : customer.archived ? (
                <ArchiveRestore size={13} />
              ) : (
                <Archive size={13} />
              )}
              {customer.archived ? 'استعادة' : 'أرشفة'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4 pb-8 space-y-4">
        {/* معلومات + ملخص */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 mb-3">معلومات العميل</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                ['كود العميل', customer.code],
                ['نوع العميل', customer.customerType === 'company' ? 'شركة' : 'فرد'],
                ...(customer.customerType === 'company'
                  ? [
                      ['اسم الشركة', customer.companyName || '—'],
                      ['الرقم الضريبي', customer.taxNumber || '—'],
                    ]
                  : []),
                ['مصدر العميل', SOURCE_LABELS[customer.source] || customer.source],
                ['الفرع', customer.branch || '—'],
                ['تاريخ التسجيل', new Date(customer.createdAt).toLocaleDateString('ar-EG')],
                [
                  'العنوان',
                  [customer.address, customer.city, customer.country].filter(Boolean).join('، ') ||
                    '—',
                ],
                ['البريد', customer.email || '—'],
                [
                  'آخر عملية',
                  customer.lastPurchaseAt
                    ? new Date(customer.lastPurchaseAt).toLocaleDateString('ar-EG')
                    : '—',
                ],
              ].map(([label, value]) => (
                <div key={label as string} className="bg-slate-50 rounded-lg px-3 py-2">
                  <div className="text-[10px] font-bold text-slate-400">{label}</div>
                  <div className="font-bold text-slate-900 mt-0.5 truncate">{value as string}</div>
                </div>
              ))}
              {customer.customerType === 'company' && customer.companyName && (
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <div className="text-[10px] font-bold text-slate-400">بيانات الفوترة</div>
                  <div className="font-bold text-slate-900 mt-0.5 truncate">
                    {customer.companyName}
                    {customer.taxNumber ? ` — ض.ر ${customer.taxNumber}` : ''}
                  </div>
                </div>
              )}
            </div>
            {customer.notes && (
              <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs font-semibold text-amber-700">
                ملاحظات: {customer.notes}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">ملخص العميل</h3>
              <div className="grid grid-cols-2 gap-2">
                <SummaryCard
                  label="إجمالي المبيعات"
                  value={`ج.م ${customer.totalSpent.toLocaleString()}`}
                />
                <SummaryCard label="عدد الطلبات" value={String(customer.totalOrders)} />
                <SummaryCard
                  label="متوسط الطلب"
                  value={`ج.م ${Math.round(avgOrder).toLocaleString()}`}
                />
                <SummaryCard
                  label="الرصيد المستحق"
                  value={`ج.م ${customer.balanceDue.toLocaleString()}`}
                />
                <SummaryCard label="نقاط الولاء" value={String(customer.loyaltyBalance)} />
                <SummaryCard
                  label="إجمالي المرتجعات"
                  value={`ج.م ${customer.balanceDue < 0 ? Math.abs(customer.balanceDue).toLocaleString() : 0}`}
                />
              </div>
            </div>
            {(customer.tags || []).length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2">الوسوم</h3>
                <div className="flex flex-wrap gap-1.5">
                  {customer.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                      style={{ backgroundColor: '#64748B' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* التبويبات */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-2 sm:px-3 py-2 border-b border-slate-100 flex gap-0.5 overflow-x-auto">
            {[
              ...tabs,
              { id: 'statement', label: 'كشف الحساب', icon: ScrollText },
              { id: 'contact', label: 'سجل التواصل', icon: MessageSquare },
              { id: 'loyalty', label: 'نقاط الولاء', icon: Star },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === t.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activityLoading &&
            (activeTab === 'orders' ||
              activeTab === 'returns' ||
              activeTab === 'statement' ||
              activeTab === 'loyalty') ? (
              <div className="flex justify-center py-12">
                <Loader2 size={22} className="animate-spin text-slate-300" />
              </div>
            ) : activeTab === 'orders' || activeTab === 'returns' ? (
              (activity || []).length === 0 ? (
                <p className="text-center text-xs font-bold text-slate-400 py-10">
                  {activeTab === 'orders' ? 'لا توجد طلبات لهذا العميل بعد' : 'لا توجد مرتجعات'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">
                          رقم العملية
                        </th>
                        <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الحالة</th>
                        <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">
                          طريقة الدفع
                        </th>
                        <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">المصدر</th>
                        <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">المبلغ</th>
                        <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">
                          التاريخ
                        </th>
                        <th className="px-3 py-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activity || []).map((o) => (
                        <tr
                          key={o.id}
                          className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-3 py-2.5 text-xs font-bold text-slate-900 tabular-nums">
                            #{String(o.id).slice(0, 8)}
                          </td>
                          <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">
                            {o.status}
                          </td>
                          <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">
                            {o.method || '—'}
                          </td>
                          <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-500">
                            {o.source ? SOURCE_LABELS[o.source] || o.source : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-xs font-bold text-slate-900 tabular-nums">
                            ج.م {Number(o.total || 0).toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-400">
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString('ar-EG') : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <Link
                              href={`/dashboard/sales/${o.id}`}
                              className="text-[11px] font-bold text-slate-900 hover:underline flex items-center gap-1"
                            >
                              عرض <ChevronRight size={11} className="rotate-180" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : activeTab === 'statement' ? (
              (statement?.rows || []).length === 0 ? (
                <p className="text-center text-xs font-bold text-slate-400 py-10">
                  لا توجد تعاملات آجلة — كشف الحساب هيظهر أول ما يكون فيه مديونية أو دفعات
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                      الرصيد الختامي: ج.م {(statement?.closing || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          {['التاريخ', 'العملية', 'المرجع', 'مدين', 'دائن', 'الرصيد'].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2.5 text-[11px] font-bold text-slate-500"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(statement?.rows || []).map((r, i) => (
                          <tr
                            key={i}
                            className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-400">
                              {new Date(r.date).toLocaleDateString('ar-EG')}
                            </td>
                            <td className="px-3 py-2.5 text-[11px] font-bold text-slate-700">
                              {r.type === 'invoice' ? 'فاتورة' : 'مرتجع'}
                            </td>
                            <td className="px-3 py-2.5 text-[11px] font-bold text-slate-500 tabular-nums">
                              {String(r.ref).slice(0, 8)}
                            </td>
                            <td className="px-3 py-2.5 text-xs font-bold text-red-600 tabular-nums">
                              {r.debit > 0 ? `ج.م ${r.debit.toLocaleString()}` : '—'}
                            </td>
                            <td className="px-3 py-2.5 text-xs font-bold text-emerald-600 tabular-nums">
                              {r.credit > 0 ? `ج.م ${r.credit.toLocaleString()}` : '—'}
                            </td>
                            <td className="px-3 py-2.5 text-xs font-bold text-slate-900 tabular-nums">
                              ج.م {r.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )
            ) : activeTab === 'contact' ? (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">النوع</label>
                    <select
                      value={logType}
                      onChange={(e) => setLogType(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                    >
                      <option value="note">ملاحظة</option>
                      <option value="call">اتصال</option>
                      <option value="message">رسالة</option>
                      <option value="followup">متابعة</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">
                      المحتوى
                    </label>
                    <input
                      value={logContent}
                      onChange={(e) => setLogContent(e.target.value)}
                      placeholder="اكتب هنا..."
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">
                      موعد متابعة
                    </label>
                    <input
                      type="date"
                      value={logFollowup}
                      onChange={(e) => setLogFollowup(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none"
                    />
                  </div>
                  <button
                    onClick={addContactLog}
                    disabled={logSaving || !logContent.trim()}
                    className="md:col-span-4 w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {logSaving && <Loader2 size={13} className="animate-spin" />}
                    إضافة للسجل
                  </button>
                </div>
                {contactLog.length === 0 ? (
                  <p className="text-center text-xs font-bold text-slate-400 py-6">
                    سجل التواصل فاضي — أضف أول ملاحظة
                  </p>
                ) : (
                  <div className="space-y-2">
                    {contactLog.map((e) => (
                      <div
                        key={e.id}
                        className="bg-slate-50 border border-slate-100 rounded-xl p-3"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                            {e.type === 'note'
                              ? 'ملاحظة'
                              : e.type === 'call'
                                ? 'اتصال'
                                : e.type === 'message'
                                  ? 'رسالة'
                                  : 'متابعة'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {new Date(e.createdAt).toLocaleString('ar-EG')}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700">{e.content}</p>
                        {e.followupAt && (
                          <p className="text-[10px] font-bold text-amber-600 mt-1">
                            موعد متابعة: {new Date(e.followupAt).toLocaleDateString('ar-EG')}
                          </p>
                        )}
                        {e.staffName && (
                          <p className="text-[10px] font-semibold text-slate-400 mt-1">
                            بواسطة: {e.staffName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'loyalty' ? (
              !loyalty.enabled ? (
                <div className="text-center py-10">
                  <Star size={32} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-xs font-bold text-slate-400">برنامج الولاء غير مفعّل</p>
                  <Link
                    href="/dashboard/customers/loyalty"
                    className="mt-2 inline-block text-[11px] font-bold text-slate-900 underline"
                  >
                    تفعيل البرنامج من صفحة الولاء
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                      رصيد العميل الحالي: {customer.loyaltyBalance} نقطة
                    </span>
                    <button
                      onClick={() => setAdjustOpen(true)}
                      className="h-8 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-700"
                    >
                      تعديل النقاط
                    </button>
                  </div>
                  {(loyalty.ledger || []).length === 0 ? (
                    <p className="text-center text-xs font-bold text-slate-400 py-6">
                      لا توجد حركات نقاط بعد
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {(loyalty.ledger || []).map((e: any) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-[11px] font-semibold"
                        >
                          <span
                            className={
                              e.delta > 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'
                            }
                          >
                            {e.delta > 0 ? `+${e.delta}` : e.delta} نقطة
                          </span>
                          <span className="text-slate-500">
                            {e.reason === 'earn:order'
                              ? 'كسب من طلب'
                              : e.reason === 'signup'
                                ? 'نقاط تسجيل'
                                : e.reason === 'redeem'
                                  ? 'استبدال'
                                  : 'تعديل يدوي'}
                          </span>
                          <span className="text-slate-400">
                            {new Date(e.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                          <span className="text-slate-600 font-bold tabular-nums">
                            الرصيد: {e.balanceAfter}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : (
              <p className="text-center text-xs font-bold text-slate-400 py-10">
                لا توجد بيانات في هذا التبويب حاليًا — بيتفعّل أول ما تستخدم الجزء ده من النظام مع
                العميل
              </p>
            )}
          </div>
        </div>
      </div>

      {/* تعديل النقاط */}
      {adjustOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setAdjustOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-black text-slate-900 mb-4">تعديل نقاط الولاء</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  القيمة (سالب للاستبدال)
                </label>
                <input
                  type="number"
                  value={adjustDelta || ''}
                  onChange={(e) => setAdjustDelta(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  السبب (إجباري — بيتسجل في السجل)
                </label>
                <input
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="مثال: هدية عميل مميز"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm font-bold outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setAdjustOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  onClick={adjustLoyalty}
                  disabled={adjustSaving || !adjustDelta || !adjustReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {adjustSaving && <Loader2 size={13} className="animate-spin" />}
                  تسجيل الحركة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
