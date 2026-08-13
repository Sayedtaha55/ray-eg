'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell, Search, Plus, Download, RefreshCw, Info, X, Send, Clock,
  ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check,
  Users, Eye, MousePointerClick, BellRing, Calendar,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Notification = {
  id: string;
  title: string;
  body: string;
  audience: 'all' | 'segment' | 'specific';
  segmentName: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt: string | null;
  sentAt: string | null;
  sentCount: number;
  openCount: number;
  clickCount: number;
  createdAt: string;
};

const TEMPLATES = [
  { title: 'عرض خاص', body: 'لدينا عرض خاص لك! خصم 20% على جميع المنتجات لفترة محدودة.' },
  { title: 'منتج جديد', body: 'تصفح أحدث منتجاتنا التي وصلت الآن. اطلب قبل نفاد الكمية!' },
  { title: 'تذكير السلة', body: 'لديك منتجات في سلتك بانتظارك. أكمل طلبك الآن واحصل على شحن مجاني.' },
  { title: 'كود خصم', body: 'استخدم كود SAVE10 للحصول على خصم 10% على طلبك القادم.' },
  { title: 'رمضان كريم', body: 'رمضان كريم! عروض حصرية طوال الشهر الفضيل. تسوق الآن.' },
  { title: 'نهاية العام', body: 'تخفيضات نهاية العام! حتى 50% خصم على مجموعة مختارة.' },
];

const emptyForm = {
  title: '',
  body: '',
  audience: 'all' as 'all' | 'segment' | 'specific',
  segmentName: '',
  scheduledAt: '',
};

export default function PushNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/notifications/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setNotifications(data.map((n: any) => ({
        id: String(n.id),
        title: n.title || '',
        body: n.body || '',
        audience: n.audience || 'all',
        segmentName: n.segmentName || n.segment_name || '',
        status: n.status || 'draft',
        scheduledAt: n.scheduledAt || n.scheduled_at || null,
        sentAt: n.sentAt || n.sent_at || null,
        sentCount: Number(n.sentCount ?? n.sent_count ?? 0),
        openCount: Number(n.openCount ?? n.open_count ?? 0),
        clickCount: Number(n.clickCount ?? n.click_count ?? 0),
        createdAt: n.createdAt || new Date().toISOString(),
      })));
    } catch { setNotifications([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const filtered = useMemo(() => {
    let result = notifications.filter(n =>
      n.title.includes(debouncedSearch) ||
      n.body.includes(debouncedSearch) ||
      n.segmentName.includes(debouncedSearch)
    );
    if (filterStatus !== 'all') {
      result = result.filter(n => n.status === filterStatus);
    }
    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'createdAt' ? a.createdAt : sortBy === 'sentCount' ? a.sentCount : sortBy === 'openCount' ? a.openCount : a.clickCount;
      const bVal = sortBy === 'createdAt' ? b.createdAt : sortBy === 'sentCount' ? b.sentCount : sortBy === 'openCount' ? b.openCount : b.clickCount;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [notifications, debouncedSearch, filterStatus, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleSend = useCallback(async () => {
    if (!formData.title || !formData.body) { alert('يرجى إدخال العنوان والنص'); return; }
    setSaving(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      const payload: any = {
        title: formData.title,
        body: formData.body,
        audience: formData.audience,
        shopId: sid,
      };
      if (formData.audience === 'segment' && formData.segmentName) {
        payload.segmentName = formData.segmentName;
      }
      if (formData.scheduledAt) {
        payload.scheduledAt = formData.scheduledAt;
      }
      await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAddModal(false);
      setFormData(emptyForm);
      loadNotifications();
    } catch { alert('حدث خطأ أثناء إرسال الإشعار'); }
    finally { setSaving(false); }
  }, [formData, loadNotifications]);

  const exportCSV = useCallback(() => {
    const headers = ['Title', 'Body', 'Audience', 'Status', 'Sent Count', 'Open Count', 'Click Count', 'Created At'];
    const rows = filtered.map(n => [n.title, n.body, n.audience, n.status, n.sentCount, n.openCount, n.clickCount, n.createdAt]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'push-notifications.csv';
    link.click();
  }, [filtered]);

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    draft: { label: 'مسودة', color: 'bg-slate-50 text-slate-600', icon: <Clock size={12} /> },
    scheduled: { label: 'مجدول', color: 'bg-blue-50 text-blue-700', icon: <Calendar size={12} /> },
    sent: { label: 'مرسل', color: 'bg-green-50 text-green-700', icon: <Check size={12} /> },
    failed: { label: 'فشل', color: 'bg-red-50 text-red-700', icon: <X size={12} /> },
  };

  const stats = useMemo(() => {
    const total = notifications.length;
    const sent = notifications.filter(n => n.status === 'sent').length;
    const scheduled = notifications.filter(n => n.status === 'scheduled').length;
    const totalSent = notifications.reduce((s, n) => s + n.sentCount, 0);
    const totalOpens = notifications.reduce((s, n) => s + n.openCount, 0);
    const totalClicks = notifications.reduce((s, n) => s + n.clickCount, 0);
    const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : '0';
    const clickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : '0';
    return [
      { label: 'إجمالي الإشعارات', value: total, icon: Bell, color: 'bg-blue-50 text-blue-600' },
      { label: 'مرسلة', value: sent, icon: Send, color: 'bg-green-50 text-green-600' },
      { label: 'مجدولة', value: scheduled, icon: Calendar, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'وصلت', value: totalSent.toLocaleString(), icon: Users, color: 'bg-purple-50 text-purple-600' },
      { label: 'معدل الفتح', value: `${openRate}%`, icon: Eye, color: 'bg-amber-50 text-amber-600' },
      { label: 'معدل النقر', value: `${clickRate}%`, icon: MousePointerClick, color: 'bg-orange-50 text-orange-600' },
    ];
  }, [notifications]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Bell size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الإشعارات الفورية</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إرسال إشعارات فورية للعملاء عبر المتصفح والتطبيق</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            <div className="min-w-0"><p className="text-xs font-bold text-slate-400 truncate">{s.label}</p><p className="text-sm font-black text-slate-900 truncate">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all">
          <Plus size={18} /> إشعار جديد
        </button>
        <button onClick={() => loadNotifications()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
          <RefreshCw size={18} /> تحديث
        </button>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
          <Download size={18} /> تصدير CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في الإشعارات..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الحالة:</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">الكل</option>
            <option value="draft">مسودة</option>
            <option value="scheduled">مجدول</option>
            <option value="sent">مرسل</option>
            <option value="failed">فشل</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="createdAt">التاريخ</option>
            <option value="sentCount">عدد الإرسال</option>
            <option value="openCount">عدد الفتح</option>
            <option value="clickCount">عدد النقر</option>
          </select>
        </div>
        <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
          {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد إشعارات حالياً</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="space-y-3 md:hidden">
            {paginated.map((n) => {
              const statusConfig = STATUS_CONFIG[n.status];
              const openRate = n.sentCount > 0 ? ((n.openCount / n.sentCount) * 100).toFixed(0) : '0';
              return (
                <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm">{n.title}</div>
                      <div className="text-slate-500 text-xs mt-1 line-clamp-2">{n.body}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 ${statusConfig.color}`}>{statusConfig.icon} {statusConfig.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><Users size={12} /> {n.sentCount}</span>
                    <span className="flex items-center gap-1"><Eye size={12} /> {openRate}%</span>
                    {n.scheduledAt && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(n.scheduledAt).toLocaleDateString('ar-EG')}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto touch-auto">
            <table className="w-full text-right border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500">العنوان</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الجمهور</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">وصلت</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">فتحت</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">نقرت</th>
                  <th className="p-4 text-xs font-semibold text-slate-500">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((n) => {
                  const statusConfig = STATUS_CONFIG[n.status];
                  return (
                    <tr key={n.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{n.title}</div>
                        <div className="text-slate-500 text-xs mt-0.5 line-clamp-1">{n.body}</div>
                      </td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{n.audience === 'all' ? 'الكل' : n.segmentName || 'شريحة'}</div></td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit ${statusConfig.color}`}>{statusConfig.icon} {statusConfig.label}</span></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{n.sentCount}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{n.openCount}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{n.clickCount}</div></td>
                      <td className="p-4"><div className="text-slate-600 text-sm">{n.sentAt ? new Date(n.sentAt).toLocaleDateString('ar-EG') : n.scheduledAt ? `مجدول: ${new Date(n.scheduledAt).toLocaleDateString('ar-EG')}` : new Date(n.createdAt).toLocaleDateString('ar-EG')}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-xs font-bold text-slate-500">عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} من {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
                <span className="text-xs font-bold text-slate-600 px-3">صفحة {currentPage} من {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">إشعار جديد</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              {/* Templates */}
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">قوالب جاهزة</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((t, i) => (
                    <button key={i} onClick={() => setFormData({ ...formData, title: t.title, body: t.body })} className="text-right p-3 rounded-lg border border-slate-200 hover:border-[#00E5FF] hover:bg-cyan-50/30 transition-all">
                      <div className="font-bold text-slate-900 text-xs">{t.title}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5 line-clamp-2">{t.body}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">العنوان</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="عنوان الإشعار" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">النص</label>
                <textarea value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })} placeholder="نص الإشعار" rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-1 block">الجمهور</label>
                  <select value={formData.audience} onChange={e => setFormData({ ...formData, audience: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                    <option value="all">جميع العملاء</option>
                    <option value="segment">شريحة محددة</option>
                  </select>
                </div>
                {formData.audience === 'segment' && (
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1 block">اسم الشريحة</label>
                    <input type="text" value={formData.segmentName} onChange={e => setFormData({ ...formData, segmentName: e.target.value })} placeholder="مثال: العملاء النشطين" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">جدولة (اختياري)</label>
                <input type="datetime-local" value={formData.scheduledAt} onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
                <p className="text-xs text-slate-400 mt-1">اتركه فارغاً للإرسال الفوري</p>
              </div>
              <button onClick={handleSend} disabled={saving} className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? 'جاري الإرسال...' : <><Send size={16} /> {formData.scheduledAt ? 'جدولة الإشعار' : 'إرسال الآن'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل الإشعارات الفورية</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إرسال إشعارات فورية للعملاء عبر المتصفح والتطبيق.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><BellRing size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إرسال إشعارات فورية للعملاء</li>
                  <li>• جدولة الإشعارات مسبقاً</li>
                  <li>• استهداف شريحة معينة من العملاء</li>
                  <li>• تتبع معدلات الفتح والتفاعل</li>
                  <li>• قوالب إشعارات جاهزة</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
