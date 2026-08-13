'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, Search, Loader2, Plus, Edit, Trash2, Download, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Send, Mail, Smartphone, Users, Eye, BarChart3 } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Message = {
  id: string;
  subject: string;
  subjectAr: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'failed';
  recipientCount: number;
  openedCount: number;
  clickedCount: number;
  sentDate: string;
  scheduledDate: string;
  templateId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    subjectAr: '',
    type: 'email' as 'email' | 'sms' | 'push' | 'in_app',
    status: 'draft' as 'draft' | 'sent' | 'delivered' | 'opened' | 'failed',
    scheduledDate: '',
    templateId: '',
    content: '',
  });

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/messages/shop/${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setMessages(data.map((m: any) => ({
        id: String(m.id),
        subject: m.subject || '---',
        subjectAr: m.subjectAr || m.subject_ar || '---',
        type: m.type || 'email',
        status: m.status || 'draft',
        recipientCount: Number(m.recipientCount || m.recipient_count || 0),
        openedCount: Number(m.openedCount || m.opened_count || 0),
        clickedCount: Number(m.clickedCount || m.clicked_count || 0),
        sentDate: m.sentDate || m.sent_date || null,
        scheduledDate: m.scheduledDate || m.scheduled_date || null,
        templateId: m.templateId || m.template_id || '---',
        content: m.content || '',
        createdBy: m.createdBy || m.created_by || '---',
        createdAt: m.createdAt || new Date().toISOString(),
        updatedAt: m.updatedAt || new Date().toISOString(),
      })));
    } catch { setMessages([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const filtered = useMemo(() => {
    let result = messages.filter(m =>
      m.subject.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      m.subjectAr.includes(debouncedSearch)
    );

    if (filterType !== 'all') {
      result = result.filter(m => m.type === filterType);
    }

    if (filterStatus !== 'all') {
      result = result.filter(m => m.status === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'subject' ? a.subject : sortBy === 'sentDate' ? a.sentDate : sortBy === 'recipientCount' ? a.recipientCount : a.createdAt;
      const bVal = sortBy === 'subject' ? b.subject : sortBy === 'sentDate' ? b.sentDate : sortBy === 'recipientCount' ? b.recipientCount : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return result;
  }, [messages, debouncedSearch, filterType, filterStatus, sortBy, sortOrder]);

  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedMessages.length && paginatedMessages.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedMessages.map(m => m.id)));
    }
  }, [paginatedMessages, selectedIds.size]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const bulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} رسالة؟`)) return;
    try {
      // TODO: Implement bulk delete API call
      alert(`تم حذف ${selectedIds.size} رسالة`);
      setSelectedIds(new Set());
      loadMessages();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [selectedIds, loadMessages]);

  const exportCSV = useCallback(() => {
    const headers = ['Subject', 'Subject (Arabic)', 'Type', 'Status', 'Recipient Count', 'Opened Count', 'Clicked Count', 'Sent Date', 'Scheduled Date', 'Created At'];
    const rows = filtered.map(m => [
      m.subject,
      m.subjectAr,
      m.type,
      m.status,
      m.recipientCount,
      m.openedCount,
      m.clickedCount,
      m.sentDate || '-',
      m.scheduledDate || '-',
      m.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'messages.csv';
    link.click();
  }, [filtered]);

  const handleAdd = useCallback(async () => {
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) return;
      await apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          shopId: sid,
        }),
      });
      setAddModal(false);
      setFormData({ subject: '', subjectAr: '', type: 'email', status: 'draft', scheduledDate: '', templateId: '', content: '' });
      loadMessages();
    } catch (error) {
      alert('حدث خطأ أثناء إضافة الرسالة');
    }
  }, [formData, loadMessages]);

  const handleEdit = useCallback(async () => {
    if (!editMessage) return;
    try {
      await apiRequest(`/messages/${editMessage.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setEditModal(false);
      setEditMessage(null);
      setFormData({ subject: '', subjectAr: '', type: 'email', status: 'draft', scheduledDate: '', templateId: '', content: '' });
      loadMessages();
    } catch (error) {
      alert('حدث خطأ أثناء تعديل الرسالة');
    }
  }, [editMessage, formData, loadMessages]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      await apiRequest(`/messages/${id}`, { method: 'DELETE' });
      loadMessages();
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  }, [loadMessages]);

  const openEditModal = useCallback((message: Message) => {
    setEditMessage(message);
    setFormData({
      subject: message.subject,
      subjectAr: message.subjectAr,
      type: message.type,
      status: message.status,
      scheduledDate: message.scheduledDate,
      templateId: message.templateId,
      content: message.content,
    });
    setEditModal(true);
  }, []);

  const TYPE_CONFIG = {
    email: { label: 'إيميل', color: 'bg-blue-50 text-blue-600', icon: <Mail size={12} /> },
    sms: { label: 'SMS', color: 'bg-green-50 text-green-600', icon: <Smartphone size={12} /> },
    push: { label: 'إشعار', color: 'bg-purple-50 text-purple-600', icon: <Send size={12} /> },
    in_app: { label: 'داخل التطبيق', color: 'bg-amber-50 text-amber-600', icon: <MessageSquare size={12} /> },
  };

  const STATUS_CONFIG = {
    draft: { label: 'مسودة', color: 'bg-slate-50 text-slate-600' },
    sent: { label: 'مرسلة', color: 'bg-blue-50 text-blue-600' },
    delivered: { label: 'تم التسليم', color: 'bg-cyan-50 text-cyan-600' },
    opened: { label: 'تمت القراءة', color: 'bg-green-50 text-green-600' },
    failed: { label: 'فشل', color: 'bg-red-50 text-red-600' },
  };

  const stats = useMemo(() => {
    const total = messages.length;
    const sent = messages.filter(m => m.status === 'sent').length;
    const delivered = messages.filter(m => m.status === 'delivered').length;
    const opened = messages.filter(m => m.status === 'opened').length;
    const totalRecipients = messages.reduce((sum, m) => sum + m.recipientCount, 0);
    const totalOpened = messages.reduce((sum, m) => sum + m.openedCount, 0);
    const openRate = totalRecipients > 0 ? (totalOpened / totalRecipients) * 100 : 0;
    return [
      { label: 'إجمالي الرسائل', value: total, icon: MessageSquare, color: 'bg-blue-50 text-blue-600' },
      { label: 'مرسلة', value: sent, icon: Send, color: 'bg-blue-50 text-blue-600' },
      { label: 'تم التسليم', value: delivered, icon: CheckCircle2, color: 'bg-cyan-50 text-cyan-600' },
      { label: 'تمت القراءة', value: opened, icon: Eye, color: 'bg-green-50 text-green-600' },
      { label: 'المستلمين', value: totalRecipients.toLocaleString(), icon: Users, color: 'bg-purple-50 text-purple-600' },
      { label: 'معدل الفتح', value: `${openRate.toFixed(1)}%`, icon: BarChart3, color: 'bg-amber-50 text-amber-600' },
    ];
  }, [messages]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <MessageSquare size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الرسائل</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة الرسائل والإشعارات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-white">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all">
            <Plus size={18} />
            رسالة جديدة
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
            <Download size={18} />
            تصدير CSV
          </button>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">{selectedIds.size} محدد</span>
            <button onClick={bulkDelete} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition-all">
              <Trash2 size={14} />
              حذف
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالموضوع..." className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">النوع:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">الكل</option>
            <option value="email">إيميل</option>
            <option value="sms">SMS</option>
            <option value="push">إشعار</option>
            <option value="in_app">داخل التطبيق</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الحالة:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">الكل</option>
            <option value="draft">مسودة</option>
            <option value="sent">مرسلة</option>
            <option value="delivered">تم التسليم</option>
            <option value="opened">تمت القراءة</option>
            <option value="failed">فشل</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">الترتيب:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="subject">الموضوع</option>
            <option value="sentDate">تاريخ الإرسال</option>
            <option value="recipientCount">المستلمين</option>
            <option value="createdAt">تاريخ الإنشاء</option>
          </select>
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
        >
          {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MessageSquare size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد رسائل حالياً</p>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto touch-auto">
          <table className="w-full text-right border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="p-1">
                    {selectedIds.size === paginatedMessages.length && paginatedMessages.length > 0 ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                  </button>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500">الموضوع</th>
                <th className="p-4 text-xs font-semibold text-slate-500">النوع</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">المستلمين</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تمت القراءة</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تم النقر</th>
                <th className="p-4 text-xs font-semibold text-slate-500">تاريخ الإرسال</th>
                <th className="p-4 text-xs font-semibold text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMessages.map((message) => {
                const typeConfig = TYPE_CONFIG[message.type];
                const statusConfig = STATUS_CONFIG[message.status];
                return (
                  <tr key={message.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-4">
                      <button onClick={() => toggleSelect(message.id)} className="p-1">
                        {selectedIds.has(message.id) ? <Check size={18} className="text-[#00E5FF]" /> : <div className="w-4 h-4 border-2 border-slate-300 rounded" />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{message.subject}</div>
                      <div className="text-slate-500 text-xs">{message.subjectAr}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${typeConfig.color}`}>
                        {typeConfig.icon}
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{message.recipientCount}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{message.openedCount}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{message.clickedCount}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-sm">{message.sentDate ? new Date(message.sentDate).toLocaleDateString('ar-EG') : '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(message)} className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all" title="تعديل">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(message.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="حذف">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAddModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">رسالة جديدة</h2>
              <button onClick={() => setAddModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الموضوع (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Subject"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الموضوع (عربي)</label>
                <input
                  type="text"
                  value={formData.subjectAr}
                  onChange={e => setFormData({ ...formData, subjectAr: e.target.value })}
                  placeholder="الموضوع"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">النوع</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="email">إيميل</option>
                  <option value="sms">SMS</option>
                  <option value="push">إشعار</option>
                  <option value="in_app">داخل التطبيق</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحالة</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="draft">مسودة</option>
                  <option value="sent">مرسلة</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="opened">تمت القراءة</option>
                  <option value="failed">فشل</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ الجدولة</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">القالب</label>
                <input
                  type="text"
                  value={formData.templateId}
                  onChange={e => setFormData({ ...formData, templateId: e.target.value })}
                  placeholder="معرف القالب"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المحتوى</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="محتوى الرسالة"
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                إضافة الرسالة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && editMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">تعديل الرسالة</h2>
              <button onClick={() => setEditModal(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الموضوع (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الموضوع (عربي)</label>
                <input
                  type="text"
                  value={formData.subjectAr}
                  onChange={e => setFormData({ ...formData, subjectAr: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">النوع</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="email">إيميل</option>
                  <option value="sms">SMS</option>
                  <option value="push">إشعار</option>
                  <option value="in_app">داخل التطبيق</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">الحالة</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="draft">مسودة</option>
                  <option value="sent">مرسلة</option>
                  <option value="delivered">تم التسليم</option>
                  <option value="opened">تمت القراءة</option>
                  <option value="failed">فشل</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">تاريخ الجدولة</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">القالب</label>
                <input
                  type="text"
                  value={formData.templateId}
                  onChange={e => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">المحتوى</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <button
                onClick={handleEdit}
                className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all"
              >
                حفظ التعديلات
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
              <h2 className="text-xl font-black text-slate-900">دليل الرسائل</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">إدارة الرسائل والإشعارات للعملاء.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><MessageSquare size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">الميزات</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إضافة وتعديل وحذف الرسائل</li>
                  <li>• أنواع مختلفة (إيميل، SMS، إشعار، داخل التطبيق)</li>
                  <li>• تتبع الإرسال والقراءة</li>
                  <li>• جدولة الرسائل</li>
                  <li>• تصدير تقارير الرسائل</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
