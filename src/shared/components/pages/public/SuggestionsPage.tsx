import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Lightbulb, Loader2, MessageSquarePlus, RefreshCw, Wrench } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { getLocalPublicFeedback, mergePublicFeedback, PublicFeedbackItem } from '@/lib/public-feedback';

const typeMeta: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  suggestion: {
    label: 'اقتراح',
    icon: <Lightbulb size={14} />,
    className: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  },
  edit: {
    label: 'تعديل',
    icon: <Wrench size={14} />,
    className: 'bg-purple-50 text-purple-700 ring-purple-100',
  },
  problem: {
    label: 'مشكلة',
    icon: <AlertTriangle size={14} />,
    className: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const SuggestionsPage: React.FC = () => {
  const [items, setItems] = useState<PublicFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSuggestions = async () => {
    setLoading(true);
    setError('');
    const local = getLocalPublicFeedback();
    try {
      const remote = await ApiService.getPublicFeedback({ take: 100 });
      setItems(mergePublicFeedback(remote, local));
    } catch {
      setItems(mergePublicFeedback([], local));
      setError('تعذر تحميل اقتراحات السيرفر حالياً، فبنعرِض الرسائل المحفوظة على جهازك.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSuggestions();
    const onUpdate = () => void loadSuggestions();
    window.addEventListener('ray-public-feedback-updated', onUpdate as any);
    return () => window.removeEventListener('ray-public-feedback-updated', onUpdate as any);
  }, []);

  const stats = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const key = String(item.type || 'suggestion');
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [items]);

  return (
    <section className="min-h-[70vh] bg-slate-50/70" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <div className="rounded-[2rem] md:rounded-[3rem] bg-slate-950 text-white p-6 md:p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute -top-24 -left-20 w-72 h-72 bg-[#BD00FF]/30 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -right-20 w-72 h-72 bg-[#00E5FF]/25 blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-cyan-200 ring-1 ring-white/10 mb-5">
                <MessageSquarePlus size={16} /> مساحة مفتوحة بدون تسجيل
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">الاقتراحات</h1>
              <p className="text-slate-300 font-bold leading-loose max-w-2xl">
                هنا تقدر تشوف الاقتراحات، التعديلات المطلوبة، والمشاكل اللي وصلتنا من الزوار علشان نطور التجربة باستمرار.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadSuggestions()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-950 px-5 py-4 text-sm font-black shadow-xl hover:scale-[1.02] transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              تحديث القائمة
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mt-6">
          {Object.entries(typeMeta).map(([key, meta]) => (
            <div key={key} className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
              <div className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ring-1 ${meta.className}`}>
                {meta.icon}
                {meta.label}
              </div>
              <div className="mt-4 text-3xl font-black text-slate-950">{stats[key] || 0}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-3xl bg-amber-50 text-amber-800 p-4 text-sm font-bold border border-amber-100">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {loading && !items.length ? (
            <div className="rounded-[2rem] bg-white p-10 text-center text-slate-500 font-black shadow-sm border border-slate-100">
              <Loader2 className="animate-spin mx-auto mb-3" /> جاري تحميل الاقتراحات...
            </div>
          ) : items.length ? (
            items.map((item) => {
              const meta = typeMeta[String(item.type || 'suggestion')] || typeMeta.suggestion;
              return (
                <article key={`${item.id}-${item.createdAt}`} className="rounded-[2rem] bg-white p-5 md:p-7 shadow-sm border border-slate-100 text-right">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ring-1 ${meta.className}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                      <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-500">
                        {item.userName || 'زائر'}
                      </span>
                      {item.source === 'local' && (
                        <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">محفوظ محلياً</span>
                      )}
                    </div>
                    <time className="text-xs font-bold text-slate-400">{formatDate(item.createdAt)}</time>
                  </div>
                  <p className="text-slate-800 font-bold leading-loose whitespace-pre-wrap">{item.text}</p>
                </article>
              );
            })
          ) : (
            <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm border border-slate-100">
              <MessageSquarePlus className="mx-auto mb-3 text-slate-300" size={34} />
              <h2 className="text-xl font-black text-slate-900 mb-2">لسه مفيش اقتراحات</h2>
              <p className="text-slate-500 font-bold">استخدم الزر العائم في الصفحة الرئيسية وأول رسالة هتظهر هنا.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SuggestionsPage;
