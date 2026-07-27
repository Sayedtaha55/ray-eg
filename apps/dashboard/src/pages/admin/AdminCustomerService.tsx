import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Headphones,
  User,
  Clock,
  Trash2,
  Loader2,
  Filter,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { useTranslation } from 'react-i18next';

const MotionDiv = motion.div as any;

const typeMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  COMPLAINT: { label: 'شكوى', icon: <AlertTriangle size={14} />, color: 'text-red-400 bg-red-500/10' },
  SUPPORT: { label: 'دعم', icon: <Headphones size={14} />, color: 'text-cyan-400 bg-cyan-500/10' },
  INQUIRY: { label: 'استفسار', icon: <HelpCircle size={14} />, color: 'text-purple-400 bg-purple-500/10' },
  FEEDBACK: { label: 'ملاحظات', icon: <MessageCircle size={14} />, color: 'text-green-400 bg-green-500/10' },
};

const statusMeta: Record<string, { label: string; color: string }> = {
  OPEN: { label: 'مفتوح', color: 'text-cyan-400 bg-cyan-500/10' },
  IN_PROGRESS: { label: 'قيد المعالجة', color: 'text-amber-400 bg-amber-500/10' },
  RESOLVED: { label: 'تم الحل', color: 'text-green-400 bg-green-500/10' },
  CLOSED: { label: 'مغلق', color: 'text-slate-400 bg-slate-500/10' },
};

const priorityMeta: Record<string, { label: string; color: string }> = {
  LOW: { label: 'منخفضة', color: 'text-slate-400' },
  NORMAL: { label: 'عادية', color: 'text-cyan-400' },
  HIGH: { label: 'عالية', color: 'text-amber-400' },
  URGENT: { label: 'عاجلة', color: 'text-red-400' },
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

const AdminCustomerService: React.FC = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { addToast } = useToast();

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        ApiService.getSupportTickets({
          take: 100,
          status: statusFilter || undefined,
          type: typeFilter || undefined,
          q: search || undefined,
        }),
        ApiService.getSupportStats(),
      ]);
      setTickets(data?.rows || []);
      setStats(statsData);
    } catch (e) {
      addToast('فشل تحميل التذاكر', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, search, addToast]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleReply = async (id: string) => {
    if (!replyText.trim()) {
      addToast('اكتب الرد أولاً', 'error');
      return;
    }
    setReplying(true);
    try {
      await ApiService.replySupportTicket(id, replyText.trim());
      addToast('تم إرسال الرد', 'success');
      setReplyText('');
      setExpandedId(null);
      await loadTickets();
    } catch (e: any) {
      addToast(e?.message || 'فشل إرسال الرد', 'error');
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await ApiService.updateSupportTicketStatus(id, status);
      addToast('تم تحديث الحالة', 'success');
      await loadTickets();
    } catch (e: any) {
      addToast(e?.message || 'فشل تحديث الحالة', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه التذكرة؟')) return;
    setActionLoading(id);
    try {
      await ApiService.deleteSupportTicket(id);
      addToast('تم حذف التذكرة', 'success');
      await loadTickets();
    } catch (e: any) {
      addToast(e?.message || 'فشل الحذف', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const normalizeItem = (item: any) => {
    const userName = item?.user?.name || item?.userName || 'زائر';
    const userEmail = item?.user?.email || item?.userEmail || '';
    const userPhone = item?.userPhone || '';
    return { ...item, _userName: userName, _userEmail: userEmail, _userPhone: userPhone };
  };

  const normalizedTickets = Array.isArray(tickets) ? tickets.map(normalizeItem) : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <Headphones size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">خدمة العملاء والشكاوى</h2>
            <p className="text-slate-500 text-sm font-bold">إدارة تذاكر الدعم والشكاوى</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'الإجمالي', value: stats.total, color: 'text-white' },
            { label: 'مفتوح', value: stats.open, color: 'text-cyan-400' },
            { label: 'قيد المعالجة', value: stats.inProgress, color: 'text-amber-400' },
            { label: 'تم الحل', value: stats.resolved, color: 'text-green-400' },
            { label: 'مغلق', value: stats.closed, color: 'text-slate-400' },
            { label: 'شكاوى', value: stats.complaints, color: 'text-red-400' },
            { label: 'دعم', value: stats.support, color: 'text-purple-400' },
            { label: 'استفسارات', value: stats.inquiries, color: 'text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-white/5 rounded-2xl p-4 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 font-bold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث..."
          className="flex-1 px-4 py-3 bg-slate-900 border border-white/5 rounded-xl text-white text-sm font-bold outline-none focus:border-white/20 transition-all"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-slate-900 border border-white/5 rounded-xl text-white text-sm font-bold outline-none focus:border-white/20 transition-all"
        >
          <option value="">كل الحالات</option>
          <option value="OPEN">مفتوح</option>
          <option value="IN_PROGRESS">قيد المعالجة</option>
          <option value="RESOLVED">تم الحل</option>
          <option value="CLOSED">مغلق</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 bg-slate-900 border border-white/5 rounded-xl text-white text-sm font-bold outline-none focus:border-white/20 transition-all"
        >
          <option value="">كل الأنواع</option>
          <option value="COMPLAINT">شكوى</option>
          <option value="SUPPORT">دعم</option>
          <option value="INQUIRY">استفسار</option>
          <option value="FEEDBACK">ملاحظات</option>
        </select>
        <button
          onClick={() => loadTickets()}
          className="px-6 py-3 bg-white/5 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-all border border-white/5"
        >
          <Filter size={14} /> تحديث
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#00E5FF]" />
        </div>
      ) : normalizedTickets.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-[3.5rem] p-24 text-center">
          <MessageCircle size={48} className="mx-auto text-slate-700 mb-6" />
          <p className="text-slate-500 font-bold text-xl">لا توجد تذاكر حالياً</p>
        </div>
      ) : (
        <div className="space-y-4">
          {normalizedTickets.map((item) => {
            const type = typeMeta[item.type] || typeMeta.COMPLAINT;
            const status = statusMeta[item.status] || statusMeta.OPEN;
            const priority = priorityMeta[item.priority] || priorityMeta.NORMAL;
            const isExpanded = expandedId === item.id;

            return (
              <MotionDiv
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.02] transition-all"
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex justify-between items-start mb-4 flex-row-reverse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white">{item._userName}</p>
                        <p className="text-[10px] text-slate-500 font-bold">
                          {item._userEmail}
                          {item._userPhone ? ` • ${item._userPhone}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black ${type.color}`}>
                        {type.icon} {type.label}
                      </span>
                      <span className={`inline-flex items-center rounded-lg px-2 py-1 text-[10px] font-black ${status.color}`}>
                        {status.label}
                      </span>
                      <span className={`text-[10px] font-black ${priority.color}`}>{priority.label}</span>
                    </div>
                  </div>

                  <h3 className="font-black text-white text-lg mb-2 text-right">{item.subject}</h3>
                  <p className="text-slate-400 font-bold text-sm leading-relaxed text-right line-clamp-2">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-4 flex-row-reverse">
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                      <Clock size={12} /> {formatDate(item.createdAt)}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 p-6 space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl text-right">
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-2">الرسالة كاملة</p>
                      <p className="text-slate-300 font-bold leading-relaxed whitespace-pre-wrap">{item.message}</p>
                    </div>

                    {item.adminReply && (
                      <div className="bg-green-500/5 p-4 rounded-2xl text-right border border-green-500/10">
                        <p className="text-[10px] text-green-400 font-black uppercase mb-2">رد الإدارة</p>
                        <p className="text-slate-300 font-bold leading-relaxed whitespace-pre-wrap">{item.adminReply}</p>
                        {item.repliedAt && (
                          <p className="text-[10px] text-slate-500 font-bold mt-2">{formatDate(item.repliedAt)}</p>
                        )}
                      </div>
                    )}

                    {!item.adminReply && (
                      <div className="space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl text-white text-sm outline-none focus:border-white/20 transition-all resize-none"
                          placeholder="اكتب ردك هنا..."
                        />
                        <button
                          onClick={() => handleReply(item.id)}
                          disabled={replying}
                          className="px-6 py-3 bg-cyan-500/10 text-cyan-400 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
                        >
                          {replying ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          إرسال الرد
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-row-reverse pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-500 font-black ml-2">تغيير الحالة:</span>
                      {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(item.id, st)}
                          disabled={actionLoading === item.id}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all disabled:opacity-50 ${
                            item.status === st
                              ? 'bg-white/10 text-white'
                              : 'bg-white/5 text-slate-500 hover:text-white'
                          }`}
                        >
                          {statusMeta[st]?.label || st}
                        </button>
                      ))}
                      <div className="flex-1" />
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={actionLoading === item.id}
                        className="p-2 text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                )}
              </MotionDiv>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCustomerService;
