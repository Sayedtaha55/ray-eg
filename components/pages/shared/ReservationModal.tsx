
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RayDB } from '@/constants';
import { Reservation } from '@/types';
import { ApiService } from '@/services/api.service';
import * as ReactRouterDOM from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    name: string;
    image: string;
    price: number;
    shopId: string;
    shopName: string;
    addons?: any;
    variantSelection?: any;
  } | null;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, item }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { useLocation, useNavigate } = ReactRouterDOM as any;
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthed = Boolean(localStorage.getItem('ray_user'));

  useEffect(() => {
    if (isOpen) {
      // جلب بيانات المستخدم المسجل لتسهيل عملية الحجز
      const userStr = localStorage.getItem('ray_user');
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          setName(parsed.name || '');
          setPhone(parsed.phone || ''); 
        } catch (e) {
          // Error parsing user data - handled silently
        }
      }
      setStep('form');
    }
  }, [isOpen]);

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!isAuthed) {
      try {
        const returnTo = `${location.pathname}${location.search || ''}`;
        window.dispatchEvent(new CustomEvent('ray-auth-required', {
          detail: {
            message: t('public.reservation.authRequired'),
            returnTo,
          },
        }));
      } catch {
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reservation = {
        itemId: String(item.id),
        itemName: String(item.name),
        itemImage: String(item.image),
        itemPrice: Number(item.price),
        shopId: String(item.shopId),
        addons: (item as any)?.addons,
        variantSelection: (item as any)?.variantSelection,
      };

      await ApiService.addReservation(reservation);
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err?.message || t('public.reservation.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl text-right"
            dir="rtl"
          >
            {step === 'form' ? (
              <div className="p-8 md:p-12">
                <button type="button" aria-label={t('public.reservation.close')} onClick={onClose} className="absolute top-8 left-8 p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={24} className="text-slate-400" />
                </button>

                <div className="flex items-center gap-4 mb-8 flex-row-reverse justify-end">
                   <div className="w-12 h-12 bg-[#00E5FF]/10 rounded-2xl flex items-center justify-center text-[#00E5FF]">
                      <Clock size={24} />
                   </div>
                   <h2 className="text-3xl font-black tracking-tighter">{t('public.reservation.title')}</h2>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl mb-8 flex items-center gap-4 flex-row-reverse">
                   {String(item?.image || '').trim() ? (
                     <img
                       src={String(item?.image || '').trim()}
                       className="w-20 h-20 rounded-2xl object-cover shadow-sm"
                       alt={String(item?.name || t('public.reservation.itemFallback'))}
                     />
                   ) : (
                     <div className="w-20 h-20 rounded-2xl bg-white/70 border border-slate-200 shadow-sm" />
                   )}
                   <div className="flex-1">
                      <p className="font-black text-lg">{String(item?.name || t('public.reservation.itemFallback'))}</p>
                      <p className="text-[#00E5FF] font-black">{t('business.pos.egp')} {Number(item?.price || 0)}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">{t('public.reservation.shopLabel')}: {String(item?.shopName || '')}</p>
                   </div>
                </div>

                {!isAuthed ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 flex-row-reverse">
                      <ShieldCheck size={20} className="text-amber-500 shrink-0" />
                      <p className="text-xs font-bold text-amber-700 leading-relaxed">
                        {t('public.reservation.loginHint')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const returnTo = `${location.pathname}${location.search || ''}`;
                          window.dispatchEvent(new CustomEvent('ray-auth-required', {
                            detail: {
                              message: t('public.reservation.authRequired'),
                              returnTo,
                            },
                          }));
                        } catch {
                        }
                      }}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl"
                    >
                      {t('public.reservation.loginToReserve')}
                    </button>
                  </div>
                ) : (
                <form onSubmit={handleReserve} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-4">{t('public.reservation.nameLabel')}</label>
                    <div className="relative">
                      <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        disabled={isSubmitting}
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-14 pl-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-bold text-right"
                        placeholder={t('public.reservation.namePlaceholder')}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-4">{t('public.reservation.phoneLabel')}</label>
                    <div className="relative">
                      <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        disabled={isSubmitting}
                        type="tel"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 pr-14 pl-6 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-bold text-right"
                        placeholder="01x xxxx xxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mb-4 flex gap-3 flex-row-reverse">
                     <ShieldCheck size={20} className="text-red-500 shrink-0" />
                     <p className="text-xs font-bold text-red-700 leading-relaxed">{error}</p>
                  </div>
                )}

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mb-4 flex gap-3 flex-row-reverse">
                     <ShieldCheck size={20} className="text-amber-500 shrink-0" />
                     <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                        {t('public.reservation.cashNote')}
                     </p>
                  </div>

                  <button disabled={isSubmitting} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? t('public.reservation.submitting') : t('public.reservation.confirmFree')}
                  </button>
                </form>
                )}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-100">
                  <CheckCircle2 size={48} className="text-white" />
                </div>
                <h2 className="text-4xl font-black mb-4">{t('public.reservation.successTitle')}</h2>
                <p className="text-slate-400 font-bold text-lg mb-8">{t('public.reservation.successSubtitle')}</p>
                <div className="bg-slate-50 p-6 rounded-3xl inline-block">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{t('public.reservation.reservationNumber')}</p>
                   <p className="text-2xl font-black text-slate-900">#RA-{Math.floor(Math.random()*9000)+1000}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReservationModal;
