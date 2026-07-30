import React, { useState } from 'react';
import { Star, Search, ThumbsUp, MessageSquare, Star as StarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Review = { id: string; customerName: string; rating: number; comment: string; date: string; product: string; status: 'published' | 'pending' | 'hidden' };

const ReviewsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [reviews, setReviews] = useState<Review[]>([
    { id: '1', customerName: 'Ahmed', rating: 5, comment: isArabic ? 'منتج رائع وخدمة ممتازة' : 'Great product and excellent service', date: '2026-07-28', product: 'Product A', status: 'published' },
    { id: '2', customerName: 'Sara', rating: 3, comment: isArabic ? 'المنتج جيد لكن التوصيل متأخر' : 'Good product but late delivery', date: '2026-07-27', product: 'Product B', status: 'published' },
    { id: '3', customerName: 'Omar', rating: 1, comment: isArabic ? 'تجربة سيئة' : 'Bad experience', date: '2026-07-26', product: 'Product C', status: 'pending' },
  ]);

  const filtered = reviews.filter(r => r.customerName.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase()));
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0';

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="mb-6"><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'التقييمات' : 'Reviews'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تقييمات العملاء' : 'Customer reviews'}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي التقييمات' : 'Total Reviews', value: reviews.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'متوسط التقييم' : 'Avg Rating', value: avgRating + ' ★', color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'تقييمات 5 نجوم' : '5 Star Reviews', value: reviews.filter(r => r.rating === 5).length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'قيد المراجعة' : 'Pending', value: reviews.filter(r => r.status === 'pending').length, color: 'bg-amber-50 text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Star size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <div key={r.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Star size={20} /></div>
                <div>
                  <p className="font-bold text-sm">{r.customerName}</p>
                  <p className="text-xs text-slate-400">{r.product} · {new Date(r.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <StarIcon key={idx} size={14} className={idx < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                  ))}
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${r.status === 'published' ? 'bg-green-100 text-green-600' : r.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{r.status === 'published' ? (isArabic ? 'منشور' : 'Published') : r.status === 'pending' ? (isArabic ? 'قيد المراجعة' : 'Pending') : (isArabic ? 'مخفي' : 'Hidden')}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-11">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
