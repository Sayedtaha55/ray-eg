
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Clock, CheckCircle2, Sparkles, Filter, Trash2, Loader2, Smile, Frown, MessageCircle } from 'lucide-react';
import { ApiService } from '../services/api.service';
import { useToast } from './Toaster';

const MotionDiv = motion.div as any;

const AdminFeedback: React.FC = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getFeedback();
      setFeedback(data);
    } catch (e) {
      addToast('فشل تحميل التعليقات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">مركز الاقتراحات</h2>
            <p className="text-slate-500 text-sm font-bold">صوت المستخدمين لمستقبل "تست".</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5">
             <Filter size={14} /> تصفية النتائج
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
      ) : feedback.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-[3.5rem] p-24 text-center">
           <MessageCircle size={48} className="mx-auto text-slate-700 mb-6" />
           <p className="text-slate-500 font-bold text-xl">لا توجد رسائل من المستخدمين حتى الآن.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedback.map((item) => (
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
                       <p className="font-black text-white">{item.user_name || 'مستخدم مجهول'}</p>
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
                    <button className="p-2 text-slate-500 hover:text-green-500 transition-colors"><CheckCircle2 size={18} /></button>
                    <button className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
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
};

export default AdminFeedback;
