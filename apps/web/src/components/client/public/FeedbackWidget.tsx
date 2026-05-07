'use client';

import { useState } from 'react';
import { MessageSquare, X, Loader2, CheckCircle2, Star } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clientFetch } from '@/lib/api/client';

export default function FeedbackWidget() {
  const t = useT();
  const { dir } = useLocale();
  const isRtl = dir === 'rtl';

  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!text.trim()) {
      setError(t('feedback.textRequired', 'Please write your feedback'));
      return;
    }

    setLoading(true);
    try {
      await clientFetch('/v1/feedback/public', {
        method: 'POST',
        body: JSON.stringify({
          text: text.trim(),
          rating: rating > 0 ? rating : undefined,
        }),
      });
      setSuccess(true);
    } catch {
      setError(t('feedback.failed', 'Failed to submit feedback. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setText('');
    setRating(0);
    setError('');
    setSuccess(false);
    setLoading(false);
  };

  const inputCls = `w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-bold text-sm resize-none ${isRtl ? 'text-right' : 'text-left'}`;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-black transition-all hover:scale-110"
          title={t('feedback.trigger', 'Feedback')}
        >
          <MessageSquare size={22} />
        </button>
      )}

      {/* Widget panel */}
      {isOpen && (
        <>
          <div onClick={handleClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]" />
          <div
            className={`fixed bottom-6 right-6 z-[110] w-80 max-h-[85vh] bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-y-auto ${isRtl ? 'text-right' : 'text-left'}`}
            dir={dir}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b border-slate-100 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h3 className="font-black text-sm flex items-center gap-2">
                <MessageSquare size={16} className="text-[#00E5FF]" />
                {t('feedback.title', 'Feedback')}
              </h3>
              <button onClick={handleClose} className="p-1.5 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} className="text-white" />
                  </div>
                  <p className="font-black text-sm">{t('feedback.success', 'Thank you for your feedback!')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
                      {t('feedback.ratingLabel', 'RATING (OPTIONAL)')}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            size={20}
                            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text */}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">
                      {t('feedback.textLabel', 'YOUR FEEDBACK')}
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      className={inputCls}
                      placeholder={t('feedback.textPlaceholder', 'Tell us what you think...')}
                    />
                  </div>

                  {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <MessageSquare size={16} className="text-[#00E5FF]" />}
                    {loading ? t('feedback.submitting', 'Sending...') : t('feedback.submit', 'Send Feedback')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
