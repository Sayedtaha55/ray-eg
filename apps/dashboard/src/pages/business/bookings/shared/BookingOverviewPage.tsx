/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingOverviewPage.tsx
 * صفحة نظرة عامة  - تعرض إحصائيات الحجوزات
 * ═══════════════════════════════════════════
 */
import React, { useEffect, useState } from 'react';
import {
  Loader2, CalendarCheck, Clock, CheckCircle2,
  TrendingUp, Star, MessageSquare,
} from 'lucide-react';
import type { BookingActivityType } from '../config';
import { ACTIVITY_MODULES, getLocalizedVocabulary, getLocalizedModuleLabel } from '../config';
import { ApiService } from '@/services/api.service';
import { matchesActivity, statusConfig, getLocalizedStatusConfigLabel, getEffectiveShop } from './utils';
import { useTranslation } from 'react-i18next';

type Props = {
  activityType: BookingActivityType;
  shop?: any;
  bookings?: any[];
  loading?: boolean;
  error?: string;
  onNavigate?: (route: string) => void;
};

type Review = { id: string; name: string; rating: number; text: string; date?: string };

const StarRow: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={13} className={i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
    ))}
  </div>
);

const BookingOverviewPage: React.FC<Props> = ({ activityType, shop, bookings: propBookings, onNavigate }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  const vocab = getLocalizedVocabulary(activityType, lang);
  const modules = ACTIVITY_MODULES[activityType] || [];
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });

  const loadReviews = async () => {
    try {
      const effectiveShop = getEffectiveShop(shop);
      if (!effectiveShop?.id) return;
      const data = await ApiService.getBookingActivityData(effectiveShop.id, 'activityReviewsList');
      setReviews(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleAddReview = async () => {
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) return;
    try {
      const effectiveShop = getEffectiveShop(shop);
      if (!effectiveShop?.id) return;
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        name: reviewForm.name,
        rating: reviewForm.rating,
        text: reviewForm.text,
        date: new Date().toISOString().slice(0, 10),
      };
      const next = [newReview, ...reviews];
      await ApiService.saveBookingActivityData(effectiveShop.id, 'activityReviewsList', next);
      setReviews(next);
      setReviewForm({ name: '', rating: 5, text: '' });
      setShowReviewForm(false);
    } catch {}
  };

  useEffect(() => { loadReviews(); }, [shop?.id]);

  useEffect(() => {
    if (propBookings) {
      const filtered = propBookings.filter(b => matchesActivity(b, activityType, shop));
      setBookings(filtered);
      setLoading(false);
      return;
    }

    const effectiveShop = getEffectiveShop(shop);

    if (!effectiveShop?.id) { setLoading(false); return; }
    setLoading(true);
    Promise.allSettled([
      ApiService.getReservations(effectiveShop.id),
      ApiService.getBookings(effectiveShop.id),
    ]).then(([res, book]) => {
      const all = [
        ...(res.status === 'fulfilled' && Array.isArray(res.value) ? res.value : []),
        ...(book.status === 'fulfilled' && Array.isArray(book.value) ? book.value : []),
      ].filter(b => matchesActivity(b, activityType, shop));
      setBookings(all);
    }).catch(() => setError(isEn ? 'Failed to load data' : 'تعذر تحميل البيانات')).finally(() => setLoading(false));
  }, [shop?.id, propBookings, activityType]);

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;

  const statCards = [
    { label: isEn ? 'Total Bookings' : 'إجمالي الحجوزات', value: total, icon: <CalendarCheck className="w-5 h-5" />, color: 'text-[#00E5FF]', bg: 'bg-cyan-50' },
    { label: isEn ? 'Pending' : 'قيد الانتظار', value: pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: isEn ? 'Confirmed' : 'مؤكدة', value: confirmed, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: isEn ? 'Completed' : 'مكتملة', value: completed, icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-bold text-slate-400">{isEn ? 'Loading...' : 'جاري التحميل...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir={isEn ? 'ltr' : 'rtl'}>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 ${card.bg} ${card.color} rounded-xl flex items-center justify-center`}>
              {card.icon}
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{card.value}</div>
              <div className="text-xs font-bold text-slate-400 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Ratings Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-900">{isEn ? 'Reviews' : 'التقييمات'}</h3>
            <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              {reviews.length} {isEn ? 'reviews' : 'تقييم'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <StarRow rating={Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)} />
              </div>
            )}
            <button type="button" onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-black hover:bg-black transition-all">
              {isEn ? '+ Add Review' : '+ إضافة تقييم'}
            </button>
          </div>
        </div>

        {showReviewForm && (
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder={isEn ? 'Customer name' : 'اسم العميل'} value={reviewForm.name}
                onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-600">{isEn ? 'Rating:' : 'التقييم:'}</span>
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: i }))}
                    className="p-0.5">
                    <Star size={18} className={i <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                  </button>
                ))}
              </div>
            </div>
            <textarea placeholder={isEn ? 'Review text...' : 'نص التقييم...'} value={reviewForm.text}
              onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
              rows={2} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300 resize-none" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowReviewForm(false)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50">{isEn ? 'Cancel' : 'إلغاء'}</button>
              <button type="button" onClick={handleAddReview} disabled={!reviewForm.name.trim() || !reviewForm.text.trim()}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-black disabled:opacity-50">{isEn ? 'Save Review' : 'حفظ التقييم'}</button>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="p-10 text-center">
            <Star className="w-12 h-12 text-slate-100 mx-auto mb-3" />
            <p className="font-bold text-slate-400">{isEn ? 'No reviews yet' : 'لا توجد تقييمات بعد'}</p>
            <p className="text-xs text-slate-300 mt-1">{isEn ? 'Add the first review from your customers' : 'أضف أول تقييم من عملائك'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {reviews.map((r) => (
              <div key={r.id} className="p-5 flex items-start gap-4 flex-row-reverse hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center font-black text-amber-700 text-base shrink-0">
                  {(r.name || '؟')[0]}
                </div>
                <div className="flex-1 text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <StarRow rating={r.rating} />
                    <span className="font-black text-sm text-slate-900">{r.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">{r.text}</p>
                  {r.date && <span className="text-[10px] text-slate-300 font-bold mt-1 block">{r.date}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-row-reverse">
          <h3 className="font-black text-slate-900">{isEn ? 'Recent Bookings' : 'آخر الحجوزات'}</h3>
          <span className="text-xs text-slate-400 font-bold">{total} {isEn ? 'bookings' : 'حجز'}</span>
        </div>

        {error ? (
          <div className="p-6 text-center">
            <p className="text-red-500 font-bold text-sm">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarCheck className="w-14 h-14 text-slate-100 mx-auto mb-3" />
            <p className="font-bold text-slate-400">{isEn ? 'No bookings yet' : 'لا توجد حجوزات حتى الآن'}</p>
            <p className="text-xs text-slate-300 mt-1">{isEn ? 'New bookings will appear here as they come in' : 'ستظهر الحجوزات الجديدة هنا فور وصولها'}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {bookings.slice(0, 8).map((b: any) => {
              const st = statusConfig[b.status] || statusConfig['pending'];
              return (
                <div key={b.id} className="flex items-center justify-between flex-row-reverse px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 text-sm">
                      {(b.customerName || (isEn ? '?' : '؟'))[0]}
                    </div>
                    <div>
                      <div className="font-black text-sm text-slate-900">{b.customerName || (isEn ? 'Customer' : 'عميل')}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{b.date || b.bookingDate || '—'}</span>
                        {b.startTime && <><span>•</span><span>{b.startTime}</span></>}
                        {b.serviceName && <><span>•</span><span>{b.serviceName}</span></>}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${st.bg} ${st.color}`}>
                    {getLocalizedStatusConfigLabel(b.status, lang)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingOverviewPage;