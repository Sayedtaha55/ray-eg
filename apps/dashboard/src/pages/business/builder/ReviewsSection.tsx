import React, { useState, useEffect } from 'react';
import { Star, Plus, X, Loader2 } from 'lucide-react';
import { ApiService } from '@/services/api.service';

type Props = {
  shop?: any;
  primary?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
};

const ReviewsSection: React.FC<Props> = ({
  shop,
  primary = '#0EA5E9',
  title = 'آراء العملاء',
  subtitle,
  badge = 'آراء العملاء',
  className = '',
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 5, text: '' });
  const [error, setError] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const effectiveShop = shop || (() => {
        try { return JSON.parse(localStorage.getItem('ray_last_shop') || '{}'); } catch { return {}; }
      })();
      if (!effectiveShop?.id) { setLoading(false); return; }
      const data = await ApiService.getBookingActivityData(effectiveShop.id, 'activityReviewsList');
      setReviews(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadReviews(); }, [shop?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      setError('يرجى ملء الاسم والتعليق');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const effectiveShop = shop || (() => {
        try { return JSON.parse(localStorage.getItem('ray_last_shop') || '{}'); } catch { return {}; }
      })();
      if (!effectiveShop?.id) { setError('لا يمكن حفظ المراجعة بدون متجر'); setSubmitting(false); return; }
      const newReview = {
        id: `rev-${Date.now()}`,
        name: form.name.trim(),
        rating: form.rating,
        text: form.text.trim(),
        date: new Date().toISOString().slice(0, 10),
      };
      const next = [newReview, ...reviews];
      await ApiService.saveBookingActivityData(effectiveShop.id, 'activityReviewsList', next);
      setReviews(next);
      setForm({ name: '', rating: 5, text: '' });
      setShowForm(false);
    } catch {
      setError('فشل حفظ المراجعة، حاول مرة أخرى');
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((s: number, r: any) => s + (r.rating || 5), 0) / reviews.length
    : 0;

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span
            className="inline-block text-xs font-bold px-3.5 py-1.5 rounded-full"
            style={{ backgroundColor: `${primary}15`, color: primary }}
          >
            {badge}
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
          {reviews.length > 0 && (
            <div className="inline-flex items-center gap-2 text-sm font-black text-slate-700 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              {avgRating.toFixed(1)}
              <span className="text-[11px] text-slate-400 font-bold">({reviews.length} مراجعة)</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {reviews.slice(0, 9).map((rev) => (
              <div key={rev.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div className="text-sm font-black text-slate-900">{rev.name}</div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed italic">
                  "{rev.text}"
                </div>
                {rev.date && <div className="mt-2 text-[10px] text-slate-300 font-bold">{rev.date}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-8">
            <p className="text-slate-400 font-bold text-sm">لا توجد مراجعات بعد. كن أول من يشارك تجربته!</p>
          </div>
        )}

        {/* Add Review Form / Button */}
        {!showForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 py-3 px-8 text-sm font-bold rounded-xl transition text-white shadow-sm"
              style={{ backgroundColor: primary }}
            >
              <Plus size={18} />
              شارك تجربتك
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">أضف مراجعتك</h3>
              <button onClick={() => { setShowForm(false); setError(''); }} className="p-2 rounded-lg hover:bg-slate-100 transition">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">الاسم *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="اكتب اسمك هنا"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:bg-white focus:outline-none font-semibold text-right"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">التقييم</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: n })}
                      className="transition transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500">تعليقك *</label>
                <textarea
                  required
                  rows={4}
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="شاركنا تجربتك معنا..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:bg-white focus:outline-none font-semibold text-right resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl text-sm font-bold transition text-white disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: primary }}
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> جاري الإرسال...</>
                ) : (
                  'نشر المراجعة'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewsSection;
