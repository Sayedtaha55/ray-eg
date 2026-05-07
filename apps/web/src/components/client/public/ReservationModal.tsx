'use client';

import { useState } from 'react';
import { X, CalendarDays, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clientFetch } from '@/lib/api/client';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    price: number;
    image?: string;
    shopId: string;
    shopName?: string;
    addons?: any;
    variantSelection?: any;
  } | null;
}

export default function ReservationModal({ isOpen, onClose, item }: ReservationModalProps) {
  const t = useT();
  const { dir } = useLocale();
  const isRtl = dir === 'rtl';

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError(t('reservation.dateRequired', 'Please select a date'));
      return;
    }

    setLoading(true);
    try {
      await clientFetch('/v1/reservations', {
        method: 'POST',
        body: JSON.stringify({
          itemId: item.id,
          itemName: item.name,
          itemImage: item.image || '',
          itemPrice: item.price,
          shopId: item.shopId,
          addons: item.addons || undefined,
          variantSelection: item.variantSelection || undefined,
          date,
          time: time || undefined,
          notes: notes.trim() || undefined,
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      const status = (err as any)?.status;
      if (status === 401) {
        setError(t('reservation.authRequired', 'Please log in to make a reservation'));
        return;
      }
      const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
      setError(msg || t('reservation.failed', 'Reservation failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDate('');
    setTime('');
    setNotes('');
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  const inputCls = `w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-bold text-sm ${isRtl ? 'text-right' : 'text-left'}`;

  return (
    <>
      {/* Backdrop */}
      <div onClick={handleClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]" />

      {/* Modal */}
      <div className="fixed inset-0 z-[310] flex items-center justify-center p-4" dir={dir}>
        <div
          className="w-full max-w-lg bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-xl font-black flex items-center gap-3">
              <CalendarDays className="text-[#00E5FF]" size={22} />
              {t('reservation.title', 'Reserve Item')}
            </h2>
            <button onClick={handleClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Item info */}
          <div className={`flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {item.image && (
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-white" loading="lazy" />
            )}
            <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
              <p className="font-black text-sm">{item.name}</p>
              <p className="text-[#00E5FF] font-black text-xs">{t('common.currency', 'EGP')} {item.price}</p>
              {item.shopName && <p className="text-slate-400 text-[10px] font-bold mt-1">{item.shopName}</p>}
            </div>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">{t('reservation.successTitle', 'Reservation Confirmed!')}</h3>
              <p className="text-slate-400 font-bold text-sm">{t('reservation.successSubtitle', 'We will notify you when it\'s confirmed.')}</p>
              <button
                onClick={handleClose}
                className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-2xl"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className={`bg-red-50 border-r-4 border-red-500 p-3 flex items-center gap-2 text-red-600 font-bold text-xs ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <AlertCircle size={16} />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  {t('reservation.dateLabel', 'DATE')}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className={inputCls}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <CalendarDays className={`absolute top-1/2 -translate-y-1/2 text-slate-300 ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  {t('reservation.timeLabel', 'TIME (OPTIONAL)')}
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={inputCls}
                  />
                  <Clock className={`absolute top-1/2 -translate-y-1/2 text-slate-300 ${isRtl ? 'left-4' : 'right-4'}`} size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  {t('reservation.notesLabel', 'NOTES (OPTIONAL)')}
                </label>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputCls}
                  placeholder={t('reservation.notesPlaceholder', 'Any special requests')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CalendarDays size={18} className="text-[#00E5FF]" />}
                {loading ? t('reservation.submitting', 'Reserving...') : t('reservation.submit', 'Reserve Now')}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
