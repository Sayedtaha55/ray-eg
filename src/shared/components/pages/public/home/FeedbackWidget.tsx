import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquarePlus, X, Loader2, Lightbulb, Wrench, AlertTriangle } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { saveLocalPublicFeedback } from '@/lib/public-feedback';

const MotionDiv = motion.div as any;

interface FeedbackWidgetProps {
  onSend?: (response: string) => void;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = () => {
  const { t } = useTranslation();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'edit' | 'problem'>('suggestion');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackResponse, setFeedbackResponse] = useState('');

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackLoading(true);
    try {
      const userStr = localStorage.getItem('ray_user');
      const user = userStr ? JSON.parse(userStr) : null;

      const saved = await ApiService.saveFeedback({
        text: feedbackText,
        type: feedbackType,
        userName: user?.name,
        userEmail: user?.email
      });

      saveLocalPublicFeedback({
        id: saved?.id,
        text: feedbackText,
        type: feedbackType,
        userName: user?.name || null,
        userEmail: user?.email || null,
        status: saved?.status || 'PENDING',
        createdAt: saved?.createdAt,
      });

      setFeedbackResponse('وصلنا كلامك ✅ هتلاقيه ظاهر في صفحة الاقتراحات من الفوتر.');
    } catch (e) {
      saveLocalPublicFeedback({
        text: feedbackText,
        type: feedbackType,
        userName: 'زائر',
        status: 'PENDING',
      });
      setFeedbackResponse('تم حفظ رسالتك محلياً ✅ وهتظهر في صفحة الاقتراحات.');
    } finally {
      setFeedbackLoading(false);
      setFeedbackText('');
    }
  };

  return (
    <div className="fixed bottom-28 left-4 md:bottom-10 md:left-10 z-[150]">
      <AnimatePresence>
        {isFeedbackOpen && (
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 md:bottom-24 left-0 w-72 sm:w-80 bg-white border border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-4 sm:p-8 text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-[#00E5FF]" /> اقتراح جديد أو تعديل
              </h4>
              <button type="button" aria-label={t('home.feedback.close')} onClick={() => setIsFeedbackOpen(false)}>
                <X size={16} />
              </button>
            </div>
            
            {feedbackResponse ? (
              <div className="space-y-4">
                <p className="text-sm font-bold text-[#BD00FF] bg-purple-50 p-6 rounded-3xl leading-loose">
                  {feedbackResponse}
                </p>
                <button 
                  type="button" 
                  onClick={() => {setFeedbackResponse(''); setIsFeedbackOpen(false);}} 
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs"
                >
                  {t('home.feedback.thanksBtn')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 font-bold mb-4">اكتب اقتراح، تعديل مطلوب، أو مشكلة حصلت معاك من غير تسجيل.</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'suggestion', label: 'اقتراح', icon: <Lightbulb size={14} /> },
                    { key: 'edit', label: 'تعديل', icon: <Wrench size={14} /> },
                    { key: 'problem', label: 'مشكلة', icon: <AlertTriangle size={14} /> },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFeedbackType(item.key as any)}
                      className={`flex items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-black transition-all ${feedbackType === item.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
                <textarea 
                  className="w-full bg-slate-50 rounded-2xl p-4 text-xs font-bold border-none focus:ring-2 focus:ring-[#00E5FF] h-28 outline-none"
                  placeholder="اكتب اللي تحب نطوره أو نصلحه..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <button 
                  onClick={handleSendFeedback}
                  disabled={feedbackLoading}
                  className="w-full py-5 bg-[#00E5FF] text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl"
                >
                  {feedbackLoading ? <Loader2 className="animate-spin" size={16} /> : <><MessageSquarePlus size={16} /> إرسال</>}
                </button>
              </div>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>
      <button 
        type="button"
        aria-label="افتح صندوق الاقتراحات"
        onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-110 transition-all hover:bg-[#BD00FF] group"
      >
        <MessageSquarePlus className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};

export default React.memo(FeedbackWidget);
