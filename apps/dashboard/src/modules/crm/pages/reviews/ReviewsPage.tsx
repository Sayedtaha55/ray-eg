import React, { useState } from 'react';
import { Star, Search, Plus, MessageSquare, Eye, EyeOff, CheckCircle2, Clock, X, Filter, Reply } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Review = { id: string; customerName: string; rating: number; comment: string; date: string; product: string; status: 'published' | 'pending' | 'hidden'; reply?: string };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  published: { ar: 'منشور', en: 'Published', color: 'text-green-600', bg: 'bg-green-100' },
  pending: { ar: 'قيد المراجعة', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100' },
  hidden: { ar: 'مخفي', en: 'Hidden', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const ReviewsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending' | 'hidden'>('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([
    { id: '1', customerName: 'أحمد محمد', rating: 5, comment: 'منتج رائع وخدمة ممتازة، التوصيل كان سريعاً جداً', date: '2026-07-28', product: 'ساعة ذكية', status: 'published' },
    { id: '2', customerName: 'سارة أحمد', rating: 4, comment: 'المنتج جيد لكن التوصيل تأخر يومين، أنصح بالشراء', date: '2026-07-27', product: 'سماعات بلوتوث', status: 'published', reply: 'شكراً لتقييمك، نعتذر عن التأخر ونعمل على تحسين الخدمة' },
    { id: '3', customerName: 'عمر علي', rating: 2, comment: 'المنتج لا يطابق الوصف الموجود في الموقع', date: '2026-07-26', product: 'حقيبة ظهر', status: 'pending' },
    { id: '4', customerName: 'فاطمة خالد', rating: 5, comment: 'تجربة ممتازة، سأطلب مرة أخرى بالتأكيد', date: '2026-07-25', product: 'نظارة شمسية', status: 'published' },
    { id: '5', customerName: 'محمود حسن', rating: 1, comment: 'سيء جداً، لا أنصح أحد بالشراء من هذا المتجر', date: '2026-07-24', product: 'محفظة جلدية', status: 'hidden' },
  ]);

  const filtered = reviews.filter(r => {
    const matchesSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  const handleReply = () => {
    if (selectedReview && replyText.trim()) {
      setReviews(reviews.map(r => r.id === selectedReview.id ? { ...r, reply: replyText } : r));
      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyText('');
    }
  };

  const handleStatusChange = (reviewId: string, newStatus: 'published' | 'pending' | 'hidden') => {
    setReviews(reviews.map(r => r.id === reviewId ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'التقييمات' : 'Reviews'}</h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة تقييمات العملاء والردود عليها' : 'Manage customer reviews and responses'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
            <Plus size={18} /> {isArabic ? 'إضافة تقييم' : 'Add Review'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي التقييمات' : 'Total Reviews', value: reviews.length, color: 'bg-blue-50 text-blue-600', icon: Star },
          { label: isArabic ? 'متوسط التقييم' : 'Avg Rating', value: avgRating + ' ★', color: 'bg-amber-50 text-amber-600', icon: Star },
          { label: isArabic ? 'تقييمات 5 نجوم' : '5 Star Reviews', value: reviews.filter(r => r.rating === 5).length, color: 'bg-green-50 text-green-600', icon: Star },
          { label: isArabic ? 'قيد المراجعة' : 'Pending', value: reviews.filter(r => r.status === 'pending').length, color: 'bg-amber-50 text-amber-600', icon: Clock },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><s.icon size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <p className="text-4xl font-black text-slate-900">{avgRating}</p>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={16} className={idx < parseFloat(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                ))}
              </div>
              <p className="text-xs font-bold text-slate-400 mt-1">{reviews.length} {isArabic ? 'تقييم' : 'reviews'}</p>
            </div>
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-4">{star}</span>
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-400 w-6">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <h4 className="font-bold text-sm mb-3">{isArabic ? 'دليل الصفحة' : 'Page Guide'}</h4>
          <ul className="space-y-2 text-xs text-slate-500">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
              <span>{isArabic ? 'راجع التقييمات الجديدة واقرأ تعليقات العملاء' : 'Review new ratings and read customer comments'}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
              <span>{isArabic ? 'رد على التقييمات لتحسين ثقة العملاء' : 'Reply to reviews to improve customer trust'}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
              <span>{isArabic ? 'أخفِ التقييمات غير المناسبة بعد المراجعة' : 'Hide inappropriate reviews after review'}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
              <span>{isArabic ? 'استخدم الفلاتر للبحث حسب الحالة' : 'Use filters to search by status'}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث بالاسم أو التعليق...' : 'Search by name or comment...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200">
            <option value="all">{isArabic ? 'الكل' : 'All'}</option>
            <option value="published">{isArabic ? 'منشور' : 'Published'}</option>
            <option value="pending">{isArabic ? 'قيد المراجعة' : 'Pending'}</option>
            <option value="hidden">{isArabic ? 'مخفي' : 'Hidden'}</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Star size={48} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-bold">{isArabic ? 'لا توجد تقييمات' : 'No reviews found'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const st = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
            return (
              <div key={r.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                      {r.customerName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{r.customerName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} size={12} className={idx < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400">{r.product}</span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{r.comment}</p>
                {r.reply && (
                  <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Reply size={14} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-500">{isArabic ? 'رد المتجر' : 'Store Reply'}</span>
                    </div>
                    <p className="text-sm text-slate-600">{r.reply}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  {!r.reply && (
                    <button onClick={() => { setSelectedReview(r); setShowReplyModal(true); setReplyText(''); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                      <Reply size={14} /> {isArabic ? 'رد' : 'Reply'}
                    </button>
                  )}
                  {r.status === 'pending' && (
                    <button onClick={() => handleStatusChange(r.id, 'published')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-green-600 hover:bg-green-50 transition-colors">
                      <CheckCircle2 size={14} /> {isArabic ? 'نشر' : 'Publish'}
                    </button>
                  )}
                  {r.status === 'published' && (
                    <button onClick={() => handleStatusChange(r.id, 'hidden')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                      <EyeOff size={14} /> {isArabic ? 'إخفاء' : 'Hide'}
                    </button>
                  )}
                  {r.status === 'hidden' && (
                    <button onClick={() => handleStatusChange(r.id, 'published')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                      <Eye size={14} /> {isArabic ? 'إظهار' : 'Show'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowReplyModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-black">{isArabic ? 'رد على التقييم' : 'Reply to Review'}</h4>
              <button onClick={() => setShowReplyModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
              <p className="text-sm text-slate-600">{selectedReview.comment}</p>
              <p className="text-xs text-slate-400 mt-2">- {selectedReview.customerName}</p>
            </div>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder={isArabic ? 'اكتب ردك هنا...' : 'Write your reply here...'}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={handleReply} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
                {isArabic ? 'إرسال الرد' : 'Send Reply'}
              </button>
              <button onClick={() => setShowReplyModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
