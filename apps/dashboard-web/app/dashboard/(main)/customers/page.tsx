'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Loader2,
  Plus,
  Download,
  ChevronDown,
  ChevronLeft,
  Check,
  Info,
  Archive,
  ArchiveRestore,
  MessageCircle,
  Eye,
  Pencil,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useShop } from '@/hooks/useShop';

/* ============================================================
 * العملاء — القائمة المركزية الموحدة (كيان واحد لكل النظام)
 * هيكل موحد مثل صفحة الطلبات: هيدر → كارت فلاتر → جدول + سهم توسيع
 * ============================================================ */

type ShopCustomer = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  customerType: string;
  companyName: string;
  status: string;
  city: string;
  branch: string;
  source: string;
  segmentId: string;
  tags: string[];
  archived: boolean;
  loyaltyBalance: number;
  balanceDue: number;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseAt: string | null;
  createdAt: string;
};

type Tag = { id: string; name: string; nameAr?: string; color?: string };
type Segment = { id: string; name: string; nameAr?: string };

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

export default function CustomersPage() {
  const { shop } = useShop();
  const shopId = shop?.id || '';
  const [customers, setCustomers] = useState<ShopCustomer[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [guideOpen, setGuideOpen] = useState(false);
  const [statusTab, setStatusTab] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<Record<string, any[]>>({});
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const load = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    setError('');
    try {
      const [custsRes, tagsRes, segRes] = await Promise.allSettled([
        apiRequest(`/shops/${shopId}/customers?limit=500`),
        apiRequest(`/shops/${shopId}/tags`),
        apiRequest(`/shops/${shopId}/segments`),
      ]);
      if (custsRes.status === 'fulfilled') {
        const data = Array.isArray(custsRes.value) ? custsRes.value : custsRes.value?.data || [];
        setCustomers(Array.isArray(data) ? data : []);
      } else {
        setCustomers([]);
        setError('تعذر تحميل العملاء');
      }
      if (tagsRes.status === 'fulfilled') {
        const t = Array.isArray(tagsRes.value) ? tagsRes.value : tagsRes.value?.data || [];
        setTags(Array.isArray(t) ? t : []);
      }
      if (segRes.status === 'fulfilled') {
        const s = Array.isArray(segRes.value) ? segRes.value : segRes.value?.data || [];
        setSegments(Array.isArray(s) ? s : []);
      }
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    load();
  }, [load]);

  const tagName = (id: string) => {
    const t = tags.find((x) => x.id === id);
    return t?.nameAr || t?.name || id;
  };
  const tagColor = (id: string) => tags.find((x) => x.id === id)?.color || '#64748B';

  const counts = useMemo(
    () => ({
      all: customers.length,
      active: customers.filter((c) => c.status === 'active').length,
      inactive: customers.filter((c) => c.status === 'inactive').length,
      blocked: customers.filter((c) => c.status === 'blocked').length,
      debtors: customers.filter((c) => c.balanceDue > 0).length,
    }),
    [customers]
  );

  const filtered = useMemo(() => {
    let result = [...customers];
    if (statusTab === 'debtors') result = result.filter((c) => c.balanceDue > 0);
    else if (statusTab !== 'all') result = result.filter((c) => c.status === statusTab);
    if (sourceFilter) result = result.filter((c) => c.source === sourceFilter);
    if (segmentFilter) result = result.filter((c) => c.segmentId === segmentFilter);
    if (tagFilter) result = result.filter((c) => (c.tags || []).includes(tagFilter));
    return result;
  }, [customers, statusTab, sourceFilter, segmentFilter, tagFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [statusTab, sourceFilter, segmentFilter, tagFilter, showArchived]);

  const exportCSV = useCallback(() => {
    const csv = [
      [
        'الكود',
        'الاسم',
        'الهاتف',
        'الإيميل',
        'النوع',
        'المصدر',
        'الحالة',
        'الطلبات',
        'المبيعات',
        'المستحق',
        'نقاط الولاء',
        'التسجيل',
      ].join(','),
      ...filtered.map((c) =>
        [
          c.code,
          c.name,
          c.phone,
          c.email,
          c.customerType === 'company' ? 'شركة' : 'فرد',
          SOURCE_LABELS[c.source] || c.source,
          c.status,
          c.totalOrders,
          c.totalSpent,
          c.balanceDue,
          c.loyaltyBalance,
          new Date(c.createdAt).toLocaleDateString('ar-EG'),
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filtered]);

  const toggleArchive = async (c: ShopCustomer) => {
    setArchivingId(c.id);
    try {
      await apiRequest(`/shops/${shopId}/customers/${c.id}/${c.archived ? 'restore' : 'archive'}`, {
        method: 'POST',
      });
      setCustomers((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, archived: !c.archived } : x))
      );
      setExpandedId(null);
    } catch {
    } finally {
      setArchivingId(null);
    }
  };

  const loadExpandedActivity = async (c: ShopCustomer) => {
    if (expandedActivity[c.id]) return;
    try {
      const rows = await apiRequest(`/shops/${shopId}/customers/${c.id}/activity?type=orders`);
      setExpandedActivity((prev) => ({
        ...prev,
        [c.id]: Array.isArray(rows) ? rows.slice(0, 3) : [],
      }));
    } catch {
      setExpandedActivity((prev) => ({ ...prev, [c.id]: [] }));
    }
  };

  const TABS = [
    { id: 'all', label: 'الكل', count: counts.all },
    { id: 'active', label: 'نشط', count: counts.active },
    { id: 'inactive', label: 'غير نشط', count: counts.inactive },
    { id: 'blocked', label: 'محظور', count: counts.blocked },
    { id: 'debtors', label: 'مدينون', count: counts.debtors },
  ];

  return (
    <div
      className="min-h-full bg-[#F4F5F7] text-slate-900"
      style={{ fontFamily: "'Cairo','Tajawal',system-ui,sans-serif" }}
    >
      {/* هيدر موحد: عنوان + وصف — الإجراءات في الطرف المقابل */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-5 max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">العملاء</h1>
              <button
                onClick={() => setGuideOpen(true)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                title="معلومات / Info"
              >
                <Info size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              قاعدة عملاء موحدة لكل النظام — كاشير وموقع وحجوزات
              {customers.length > 0 && (
                <span className="font-semibold"> — {customers.length} عميل</span>
              )}
              {counts.debtors > 0 && (
                <span className="text-red-600 font-semibold"> — {counts.debtors} مدين</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="h-10 px-4 rounded-full border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Download size={13} />
              تصدير
            </button>
            <Link
              href="/dashboard/customers/new"
              className="h-10 px-5 rounded-full bg-slate-900 text-white text-[12px] font-bold hover:bg-slate-700 flex items-center gap-1.5"
            >
              <Plus size={13} />
              عميل جديد
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[12px] font-bold">
            <Archive size={15} />
            {error}
          </div>
        </div>
      )}

      {/* شريط الفلاتر: تابات الحالة بالأعداد + البحث والفلاتر */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4">
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-2 sm:px-3 py-2 flex gap-0.5 overflow-x-auto">
            {TABS.map((t) => {
              const isActive = statusTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setStatusTab(t.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                  <span
                    className={`text-[10px] tabular-nums px-1.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="px-2 sm:px-3 pb-2 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                size={14}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف أو الإيميل أو الكود أو رقم طلب..."
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-full py-2 pr-9 pl-4 text-xs font-bold outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-10 px-3 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">كل المصادر</option>
              {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            {segments.length > 0 && (
              <select
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                className="h-10 px-3 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">كل الشرائح</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nameAr || s.name}
                  </option>
                ))}
              </select>
            )}
            {tags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="h-10 px-3 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">كل الوسوم</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nameAr || t.name}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowArchived((v) => !v)}
              className={`h-10 px-4 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 ${
                showArchived
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Archive size={13} />
              الأرشيف
            </button>
          </div>
        </div>
      </div>

      {/* الجدول */}
      {loading ? (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-white border border-slate-200 rounded-xl flex items-center justify-center py-16">
            <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Users size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 font-bold text-sm">
              {showArchived ? 'الأرشيف فاضي' : 'لا يوجد عملاء حالياً'}
            </p>
            {!showArchived && customers.length === 0 && (
              <Link
                href="/dashboard/customers/new"
                className="mt-3 inline-block text-xs font-bold text-slate-900 underline"
              >
                إضافة أول عميل
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4 pb-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[1500px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الاسم</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الهاتف</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الكود</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">النوع</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الوسوم</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">المبيعات</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الطلبات</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">المستحق</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">آخر عملية</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">المصدر</th>
                    <th className="px-3 py-2.5 text-[11px] font-bold text-slate-500">الحالة</th>
                    <th className="px-3 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => {
                    const status = STATUS_LABELS[c.status] || {
                      label: c.status,
                      cls: 'bg-slate-50 text-slate-600 border-slate-200',
                    };
                    const isExpanded = expandedId === c.id;
                    return (
                      <React.Fragment key={c.id}>
                        <tr
                          className={`border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${isExpanded ? 'bg-slate-50/70' : ''}`}
                        >
                          <td className="px-3 py-3">
                            <div className="text-xs font-bold text-slate-900">{c.name}</div>
                            {c.customerType === 'company' && c.companyName && (
                              <div className="text-[10px] text-slate-400 font-semibold">
                                {c.companyName}
                              </div>
                            )}
                          </td>
                          <td
                            className="px-3 py-3 text-xs font-semibold text-slate-600 tabular-nums"
                            dir="ltr"
                          >
                            {c.phone}
                          </td>
                          <td className="px-3 py-3 text-[11px] font-bold text-slate-500 tabular-nums">
                            {c.code}
                          </td>
                          <td className="px-3 py-3 text-[11px] font-semibold text-slate-600">
                            {c.customerType === 'company' ? 'شركة' : 'فرد'}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                              {(c.tags || []).slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white"
                                  style={{ backgroundColor: tagColor(t) }}
                                >
                                  {tagName(t)}
                                </span>
                              ))}
                              {(c.tags || []).length === 0 && (
                                <span className="text-[10px] text-slate-300">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs font-bold text-slate-900 tabular-nums">
                            ج.م {c.totalSpent.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-xs font-semibold text-slate-600 tabular-nums">
                            {c.totalOrders}
                          </td>
                          <td className="px-3 py-3">
                            {c.balanceDue > 0 ? (
                              <span className="text-xs font-bold text-red-600 tabular-nums">
                                ج.م {c.balanceDue.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-[11px] font-semibold text-slate-400">
                            {c.lastPurchaseAt
                              ? new Date(c.lastPurchaseAt).toLocaleDateString('ar-EG')
                              : '—'}
                          </td>
                          <td className="px-3 py-3 text-[11px] font-semibold text-slate-500">
                            {SOURCE_LABELS[c.source] || c.source}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${status.cls}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => {
                                setExpandedId(isExpanded ? null : c.id);
                                if (!isExpanded) loadExpandedActivity(c);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                              title={isExpanded ? 'إغلاق' : 'أهم الإحصائيات'}
                            >
                              <ChevronDown
                                size={16}
                                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>
                          </td>
                        </tr>

                        {/* صف التوسيع — أهم إحصائيات العميل + إجراءات سريعة */}
                        {isExpanded && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={12} className="px-6 py-4 border-b border-slate-200">
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                  {[
                                    { label: 'الطلبات', value: String(c.totalOrders) },
                                    {
                                      label: 'الإنفاق',
                                      value: `ج.م ${c.totalSpent.toLocaleString()}`,
                                    },
                                    {
                                      label: 'متوسط الطلب',
                                      value: `ج.م ${c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders).toLocaleString() : 0}`,
                                    },
                                    { label: 'نقاط الولاء', value: String(c.loyaltyBalance) },
                                    {
                                      label: 'المستحق',
                                      value: `ج.م ${c.balanceDue.toLocaleString()}`,
                                    },
                                  ].map((s) => (
                                    <div
                                      key={s.label}
                                      className="bg-white border border-slate-200 rounded-lg px-3 py-2"
                                    >
                                      <div className="text-[10px] font-bold text-slate-400">
                                        {s.label}
                                      </div>
                                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                                        {s.value}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="bg-white border border-slate-200 rounded-lg p-3">
                                  <div className="text-[11px] font-bold text-slate-500 mb-2">
                                    آخر الطلبات
                                  </div>
                                  {(expandedActivity[c.id] || []).length === 0 ? (
                                    <p className="text-[11px] text-slate-400 font-semibold">
                                      لا توجد طلبات بعد
                                    </p>
                                  ) : (
                                    <div className="space-y-1">
                                      {(expandedActivity[c.id] || []).map((o: any) => (
                                        <div
                                          key={o.id}
                                          className="flex items-center justify-between text-[11px] font-semibold text-slate-600"
                                        >
                                          <span className="tabular-nums text-slate-900 font-bold">
                                            #{String(o.id).slice(0, 8)}
                                          </span>
                                          <span>{o.status}</span>
                                          <span className="tabular-nums">
                                            ج.م {Number(o.total || 0).toLocaleString()}
                                          </span>
                                          <span className="text-slate-400">
                                            {o.createdAt
                                              ? new Date(o.createdAt).toLocaleDateString('ar-EG')
                                              : ''}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <Link
                                    href={`/dashboard/customers/${c.id}`}
                                    className="h-8 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-700 flex items-center gap-1.5"
                                  >
                                    <Eye size={13} />
                                    عرض الملف الكامل
                                  </Link>
                                  <Link
                                    href={`/dashboard/customers/${c.id}/edit`}
                                    className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 flex items-center gap-1.5"
                                  >
                                    <Pencil size={12} />
                                    تعديل
                                  </Link>
                                  <a
                                    href={`https://wa.me/2${(c.phone || '').replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-8 px-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 flex items-center gap-1.5"
                                  >
                                    <MessageCircle size={12} />
                                    واتساب
                                  </a>
                                  <button
                                    onClick={() => toggleArchive(c)}
                                    disabled={archivingId === c.id}
                                    className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-bold hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    {archivingId === c.id ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : c.archived ? (
                                      <ArchiveRestore size={12} />
                                    ) : (
                                      <Archive size={12} />
                                    )}
                                    {c.archived ? 'استعادة' : 'أرشفة'}
                                  </button>
                                  <Link
                                    href={`/dashboard/customers/${c.id}`}
                                    className="mr-auto text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                                  >
                                    الملف الكامل
                                    <ChevronLeft size={12} />
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-3 py-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">عرض</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-[11px] font-bold text-slate-500">لكل صفحة</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                  صفحة {currentPage} من {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* دليل الصفحة */}
      {guideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setGuideOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">عن صفحة العملاء</h2>
              <button
                onClick={() => setGuideOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-lg"
              >
                <Check size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-3 text-right text-sm text-slate-600 leading-relaxed">
              <p>
                قاعدة عملاء موحدة لكل النظام: أي عميل يتسجل من الكاشير أو الموقع أو الحجوزات يظهر
                هنا تلقائيًا — مفيش قواعد منفصلة.
              </p>
              <p>• اضغط السهم جنب أي عميل لأهم إحصائياته وآخر طلباته.</p>
              <p>
                • «عرض الملف الكامل» يفتح صفحة كاملة: النشاط، كشف الحساب، سجل التواصل، ونقاط الولاء.
              </p>
              <p>• الأرشفة تخفي العميل من القوائم مع الاحتفاظ بكل عملياته القديمة.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
