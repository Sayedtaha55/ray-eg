'use client';

import React, { useState } from 'react';
import { Flag, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReportProductProps {
  productId: string;
  isLoggedIn?: boolean;
}

const reportReasons = [
  { value: 'misleading', label: 'معلومات مضللة' },
  { value: 'counterfeit', label: 'منتج مغشوش/مزيف' },
  { value: 'unsafe', label: 'منتج غير آمن' },
  { value: 'inappropriate', label: 'محتوى غير لائق' },
  { value: 'other', label: 'أخرى' },
] as const;

export default function ReportProduct({ productId, isLoggedIn = false }: ReportProductProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await fetch('/api/v1/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetType: 'product',
          targetId: productId,
          reason,
          description: description || undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      // error state
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
      >
        <Flag className="w-3.5 h-3.5" />
        إبلاغ
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-0 z-[1000] p-4 overflow-y-auto" dir="rtl">
              <div className="min-h-full flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden"
                >
                  <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">إبلاغ عن المنتج</h3>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    {submitted ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                          <Flag className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">تم إرسال البلاغ</p>
                        <p className="text-sm text-slate-500 mt-1">سنتحقق من الأمر ونتخذ الإجراء المناسب</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">سبب الإبلاغ</p>
                          <div className="space-y-1.5">
                            {reportReasons.map((r) => (
                              <button
                                key={r.value}
                                type="button"
                                onClick={() => setReason(r.value)}
                                className={`w-full text-right px-4 py-2.5 rounded-lg text-sm font-semibold transition-all
                                  ${reason === r.value
                                    ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'}
                                `}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">وصف إضافي (اختياري)</p>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-[#BD00FF]/50 outline-none"
                            placeholder="أضف تفاصيل إضافية..."
                          />
                        </div>

                        {!isLoggedIn && (
                          <p className="text-xs text-slate-400">
                            يمكنك الإبلاغ بدون تسجيل دخول، لكن تسجيل الدخول يساعدنا في المتابعة.
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!reason || submitting}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all
                            ${reason && !submitting
                              ? 'bg-red-500 text-white hover:scale-105 shadow-lg'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}
                          `}
                        >
                          {submitting ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          إرسال البلاغ
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
