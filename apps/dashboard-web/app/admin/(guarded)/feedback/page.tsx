'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, User, Clock, CheckCircle2, Sparkles, Filter, Trash2, Loader2, MessageCircle,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useToast } from '@/components/settings/ToastProvider';

const MotionDiv = motion.div as any;

export default function AdminFeedbackPage() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/feedback');
      setFeedback(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'فشل تحميل التقييمات', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeedback(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا التقييم؟')) return;
    try {
      await apiRequest(`/feedback/${id}`, { method: 'DELETE' });
      toast({ title: 'تم الحذف', variant: 'success' });
      setFeedback((prev) => prev.filter((f) => String(f?.id) !== String(id)));
    } catch {
      toast({ title: 'فشل الحذف', variant: 'destructive' });
    }
  };

  const normalizeItem = (item: any) => {
    const userName = item?.user?.name || item?.userName || item?.user_name || 'مستخدم مجهول';
    const userEmail = item?.user?.email || item?.userEmail || item?.user_email || '';
    const content = item?.comment || item?.content || item?.text || '';
    const createdAt = item?.createdAt || item?.created_at || new Date().toISOString();
    const status = item?.status || item?.state || item?.ticketStatus || 'PENDING';
    return { ...item, user_name: userName, user_email: userEmail, content, created_at: createdAt, status };
  };

  const normalizedFeedback = feedback.map(normalizeItem);
  const filtered = search
    ? normalizedFeedback.filter((f) =>
        String(f.user_name).toLowerCase().includes(search.toLowerCase()) ||
        String(f.content).toLowerCase().includes(search.toLowerCase())
      )
    : normalizedFeedback;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">التقييمات والملاحظات</h2>
            <p className="text-slate-500 text-sm font-bold">آراء وملاحظات المستخدمين</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="ابحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-3 bg-slate-900 border border-white/5 rounded-xl text-white text-sm font-bold outline-none focus:border-white/20 transition-all"
          />
          <button className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5">
            <Filter size={14} /> تصفية
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-[3.5rem] p-24 text-center">
          <MessageCircle size={48} className="mx-auto text-slate-700 mb-6" />
          <p className="text-slate-500 font-bold text-xl">لا توجد تقييمات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <MotionDiv
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.03] transition-all group"
            >
              <div className="flex justify-between items-start mb-6 flex-row-reverse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                    <User size={18} />
                  </div>
                  <div className="text-right">
                    <p className="font-black text-white">{item.user_name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{item.user_email}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-2">
                  <Clock size={12} /> {new Date(item.created_at).toLocaleDateString('ar-EG')}
                </span>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl mb-6 text-right">
                <p className="text-slate-300 font-bold leading-relaxed">{item.content}</p>
              </div>

              <div className="flex items-center justify-between flex-row-reverse">
                <div className="flex gap-2">
                  <button className="p-2 text-slate-500 hover:text-green-500 transition-colors" title="تحديد كمقروء">
                    <CheckCircle2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(String(item.id))}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#00E5FF]" />
                  <span className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest">تنبيه ذكي</span>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      )}
    </div>
  );
}
