'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Star, Search, Loader2, Plus, Edit, Trash2, Download, Filter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Check, X, Info, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, User, Eye, MessageSquare, Tag, TrendingUp, Smile, Frown, Meh } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Review = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  type: 'review' | 'rating' | 'comment' | 'complaint';
  verified: boolean;
  helpfulCount: number;
  response: string;
  respondedAt: string;
  createdAt: string;
  updatedAt: string;
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'قيد المراجعة', color: 'text-amber-600', bg: 'bg-amber-100' },
  approved: { label: 'موافق عليه', color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { label: 'مرفوض', color: 'text-red-600', bg: 'bg-red-100' },
  flagged: { label: 'مبلغ عنه', color: 'text-purple-600', bg: 'bg-purple-100' },
};

const TYPE_LABELS: Record<string, string> = {
  review: 'مراجعة',
  rating: 'تقييم',
  comment: 'تعليق',
  complaint: 'شكوى',
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [responseModal, setResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState('');

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/feedback?shopId=${sid}`);
      const data = Array.isArray(res) ? res : (res?.data || []);
      setReviews(data.map((r: any) => ({
        id: String(r.id),
        customerName: r.userName || r.customerName || '---',
        customerEmail: r.userEmail || r.customerEmail || '---',
        customerPhone: r.phone || '---',
        productId: r.productId || '',
        productName: r.productName || '---',
        rating: Number(r.rating || 0),
        title: r.title || '',
        comment: r.comment || '',
        status: r.status || 'pending',
        type: r.type || 'review',
        verified: r.verified || false,
        helpfulCount: Number(r.helpfulCount || 0),
        response: r.response || '',
        respondedAt: r.respondedAt || '',
        createdAt: r.createdAt || new Date().toISOString(),
        updatedAt: r.updatedAt || new Date().toISOString(),
      })));
    } catch { setReviews([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const filtered = useMemo(() => {
    let result = reviews.filter(r =>
      r.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      r.productName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      r.comment.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
    }

    if (filterType !== 'all') {
      result = result.filter(r => r.type === filterType);
    }

    if (filterRating !== 'all') {
      result = result.filter(r => r.rating === Number(filterRating));
    }

    result = [...result].sort((a, b) => {
      const aVal = sortBy === 'rating' ? a.rating : sortBy === 'helpful' ? a.helpfulCount : a.createdAt;
      const bVal = sortBy === 'rating' ? b.rating : sortBy === 'helpful' ? b.helpfulCount : b.createdAt;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [reviews, debouncedSearch, filterStatus, filterType, filterRating, sortBy, sortOrder]);

  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedReviews.length && paginatedReviews.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedReviews.map(r => r.id)));
    }
  }, [paginatedReviews, selectedIds.size]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const bulkApprove = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => 
        apiRequest(`/feedback/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) })
      ));
      loadReviews();
      setSelectedIds(new Set());
    } catch (error) {
      alert('حدث خطأ أثناء الموافقة');
    }
  }, [selectedIds, loadReviews]);

  const bulkReject = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => 
        apiRequest(`/feedback/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) })
      ));
      loadReviews();
      setSelectedIds(new Set());
    } catch (error) {
      alert('حدث خطأ أثناء الرفض');
    }
  }, [selectedIds, loadReviews]);

  const exportCSV = useCallback(() => {
    const headers = ['Customer', 'Product', 'Rating', 'Type', 'Status', 'Comment', 'Created At'];
    const rows = filtered.map(r => [
      r.customerName,
      r.productName,
      r.rating,
      r.type,
      r.status,
      r.comment,
      r.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reviews.csv';
    link.click();
  }, [filtered]);

  const handleResponse = useCallback(async () => {
    if (!selectedReview) return;
    try {
      await apiRequest(`/feedback/${selectedReview.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ response: responseText, status: 'approved' })
      });
      setResponseModal(false);
      setSelectedReview(null);
      setResponseText('');
      loadReviews();
    } catch (error) {
      alert('حدث خطأ أثناء إرسال الرد');
    }
  }, [selectedReview, responseText, loadReviews]);

  const stats = useMemo(() => {
    const avgRating = reviews.length > 0 
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length 
      : 0;
    return [
      { label: 'إجمالي التقييمات', value: reviews.length, color: 'bg-blue-50 text-blue-600' },
      { label: 'متوسط التقييم', value: avgRating.toFixed(1), color: 'bg-yellow-50 text-yellow-600' },
      { label: 'قيد المراجعة', value: reviews.filter(r => r.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
      { label: 'موافق عليه', value: reviews.filter(r => r.status === 'approved').length, color: 'bg-green-50 text-green-600' },
    ];
  }, [reviews]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
      />
    ));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Star size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">التقييمات</h1>
            <button
              onClick={() => setGuideOpen(true)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              title="معلومات / Info"
            >
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة تقييمات ومراجعات العملاء</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end ${stat.color}`}>
            <span className="text-slate-500 font-semibold text-xs mb-1">{stat.label}</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-slate-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-slate-400"
        >
          <option value="all">كل الحالات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="approved">موافق عليه</option>
          <option value="rejected">مرفوض</option>
          <option value="flagged">مبلغ عنه</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-slate-400"
        >
          <option value="all">كل الأنواع</option>
          <option value="review">مراجعة</option>
          <option value="rating">تقييم</option>
          <option value="comment">تعليق</option>
          <option value="complaint">شكوى</option>
        </select>
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-slate-400"
        >
          <option value="all">كل التقييمات</option>
          <option value="5">5 نجوم</option>
          <option value="4">4 نجوم</option>
          <option value="3">3 نجوم</option>
          <option value="2">نجمتان</option>
          <option value="1">نجمة واحدة</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-sm font-bold text-slate-600">تم اختيار {selectedIds.size} تقييم</span>
          <button
            onClick={bulkApprove}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
          >
            <CheckCircle2 size={16} />
            موافقة
          </button>
          <button
            onClick={bulkReject}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
          >
            <XCircle size={16} />
            رفض
          </button>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : paginatedReviews.length === 0 ? (
        <div className="text-center py-12">
          <Star size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">لا توجد تقييمات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.has(review.id)}
                  onChange={() => toggleSelect(review.id)}
                  className="mt-1 w-4 h-4 rounded border-slate-300"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{review.customerName}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{review.productName}</span>
                      {review.verified && (
                        <CheckCircle2 size={14} className="text-green-500" />
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[review.status]?.bg} ${STATUS_STYLES[review.status]?.color}`}>
                      {STATUS_STYLES[review.status]?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(review.rating)}
                  </div>
                  {review.title && (
                    <h3 className="font-bold text-slate-800 mb-1">{review.title}</h3>
                  )}
                  <p className="text-sm text-slate-600 mb-2">{review.comment}</p>
                  {review.response && (
                    <div className="bg-slate-50 rounded-lg p-3 mb-2">
                      <p className="text-sm text-slate-700 font-bold mb-1">ردك:</p>
                      <p className="text-sm text-slate-600">{review.response}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setResponseText(review.response || '');
                          setResponseModal(true);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                        title="رد"
                      >
                        <MessageSquare size={16} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} من {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
            <span className="text-sm font-bold text-slate-600">
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {responseModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">رد على التقييم</h3>
              <button
                onClick={() => {
                  setResponseModal(false);
                  setSelectedReview(null);
                  setResponseText('');
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">{selectedReview.comment}</p>
            </div>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="اكتب ردك هنا..."
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-slate-400 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleResponse}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
              >
                إرسال الرد
              </button>
              <button
                onClick={() => {
                  setResponseModal(false);
                  setSelectedReview(null);
                  setResponseText('');
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
