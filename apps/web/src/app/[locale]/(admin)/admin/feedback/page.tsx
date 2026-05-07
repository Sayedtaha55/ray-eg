'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Clock, CheckCircle2, Sparkles, Filter, Trash2, Loader2, MessageCircle } from 'lucide-react';
import { clientFetch } from '@/lib/api/client';
import { useT } from '@/i18n/useT';

const MotionDiv = motion.div as any;

export default function AdminFeedbackPage() {
  const t = useT();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await clientFetch<any[]>('/v1/feedback/admin');
      setFeedback(Array.isArray(data) ? data : []);
    } catch {
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeedback(); }, []);

  const normalizeItem = (item: any) => ({
    ...item,
    user_name: item?.user?.name || item?.userName || t('admin.feedback.anonymousUser', 'مستخدم مجهول'),
    user_email: item?.user?.email || item?.userEmail || '',
    content: item?.comment || item?.content || item?.text || '',
    created_at: item?.createdAt || item?.created_at || new Date().toISOString(),
    status: item?.status || item?.state || 'PENDING',
  });

  const normalizedFeedback = feedback.map(normalizeItem);

  const updateStatus = async (id: string, status: string) => {
    try {
      await clientFetch<any>(`/v1/feedback/admin/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadFeedback();
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl"><MessageSquare size={24} /></div>
          <div>
            <h2 className="text-3xl font-black text-white">{t('admin.feedback.title', 'الشكاوي والمقترحات')}</h2>
            <p className="text-slate-500 text-sm font-bold">{t('admin.feedback.subtitle', 'إدارة反馈 من المستخدمين')}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5">
            <Filter size={14} /> {t('admin.feedback.filterResults', 'تصفية')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
      ) : normalizedFeedback.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-[3.5rem] p-24 text-center">
          <MessageCircle size={48} className="mx-auto text-slate-700 mb-6" />
          <p className="text-slate-500 font-bold text-xl">{t('admin.feedback.noMessages', 'لا توجد رسائل')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {normalizedFeedback.map((item: any) => (
            <MotionDiv
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.03] transition-all group"
            >
              <div className="flex justify-between items-start mb-6 flex-row-reverse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400"><User size={18} /></div>
                  <div className="text-right">
                    <p className="font-black text-white">{item.user_name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{item.user_email}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-2"><Clock size={12} /> {new Date(item.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
              <div className="bg-white/5 p-6 rounded-2xl mb-6 text-right">
                <p className="text-slate-300 font-bold leading-relaxed">{item.content}</p>
              </div>
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(item.id, 'RESOLVED')} className="p-2 text-slate-500 hover:text-green-500 transition-colors"><CheckCircle2 size={18} /></button>
                  <button onClick={() => updateStatus(item.id, 'DISMISSED')} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00E5FF]" />
                  <span className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest">{t('admin.feedback.smartAlert', 'تنبيه ذكي')}</span>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      )}
    </div>
  );
}
