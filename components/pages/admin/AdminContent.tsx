import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Loader2, RefreshCw, Search, Trash2, CheckCircle2, Clock3, Wrench, XCircle } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';

const AdminContent: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED'>('ALL');

  const loadData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await ApiService.getFeedback({ take: 50, skip: 0, status, q });
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      addToast(e?.message || 'فشل تحميل التذاكر', 'error');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const query = String(q || '').trim().toLowerCase();
    if (!query) return list;
    return list.filter((x: any) => {
      const comment = String(x?.comment || x?.content || x?.text || '').toLowerCase();
      const uName = String(x?.user?.name || x?.userName || x?.user_name || '').toLowerCase();
      const uEmail = String(x?.user?.email || x?.userEmail || x?.user_email || '').toLowerCase();
      return comment.includes(query) || uName.includes(query) || uEmail.includes(query);
    });
  }, [items, q]);

  const setTicketStatus = async (id: string, next: any) => {
    try {
      await ApiService.updateFeedbackStatus(id, next);
      setItems((prev) => prev.map((x) => (String(x?.id) === String(id) ? { ...x, status: next } : x)));
      addToast('تم تحديث حالة التذكرة', 'success');
    } catch (e: any) {
      addToast(e?.message || 'فشل تحديث الحالة', 'error');
    }
  };

  const deleteTicket = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه التذكرة؟')) return;
    try {
      await ApiService.deleteFeedback(id);
      setItems((prev) => prev.filter((x) => String(x?.id) !== String(id)));
      addToast('تم حذف التذكرة', 'success');
    } catch (e: any) {
      addToast(e?.message || 'فشل حذف التذكرة', 'error');
    }
  };

  const statusBadge = (stRaw: any) => {
    const st = String(stRaw || 'PENDING').toUpperCase();
    if (st === 'RESOLVED') return { label: 'تم الحل', cls: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', icon: <CheckCircle2 size={14} /> };
    if (st === 'IN_PROGRESS') return { label: 'قيد التنفيذ', cls: 'bg-sky-500/10 text-sky-300 border-sky-500/20', icon: <Wrench size={14} /> };
    if (st === 'REJECTED') return { label: 'مرفوض', cls: 'bg-red-500/10 text-red-300 border-red-500/20', icon: <XCircle size={14} /> };
    return { label: 'جديد', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20', icon: <Clock3 size={14} /> };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">التذاكر والملاحظات</h2>
            <p className="text-slate-500 text-sm font-bold">إدارة اقتراحات ومشاكل المستخدمين</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="px-4 py-2 rounded-2xl text-xs font-black bg-slate-900 border border-white/5 text-slate-200 hover:bg-slate-800 disabled:opacity-60 flex items-center gap-2"
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            تحديث
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-[2.5rem] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث بالاسم/الإيميل/نص الرسالة..."
                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pr-11 pl-4 text-slate-200 text-sm font-bold outline-none"
              />
            </div>
            <button
              onClick={() => loadData(true)}
              className="px-4 py-3 rounded-2xl text-xs font-black bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10"
            >
              تطبيق
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-4 sm:p-6">
          <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-3">الحالة</div>
          <div className="grid grid-cols-2 gap-2">
            {(['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-2xl text-xs font-black border ${status === s ? 'bg-white text-slate-900 border-white/10' : 'bg-slate-950 text-slate-200 border-white/5'}`}
              >
                {s === 'ALL' ? 'الكل' : s === 'PENDING' ? 'جديد' : s === 'IN_PROGRESS' ? 'قيد التنفيذ' : s === 'RESOLVED' ? 'تم الحل' : 'مرفوض'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 text-slate-400 font-bold flex items-center gap-3">
          <Loader2 className="animate-spin" size={18} />
          جاري تحميل التذاكر...
        </div>
      ) : (
        <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-slate-500 font-bold">لا توجد تذاكر بهذه المعايير.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((x: any) => {
                const badge = statusBadge(x?.status);
                const created = new Date(x?.createdAt || x?.created_at || 0);
                const createdText = !Number.isNaN(created.getTime()) ? created.toLocaleString('ar-EG') : '';
                const userName = x?.user?.name || x?.userName || x?.user_name || 'مستخدم';
                const userEmail = x?.user?.email || x?.userEmail || x?.user_email || '';
                const msg = x?.comment || x?.content || x?.text || '';

                return (
                  <div key={String(x?.id)} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black border ${badge.cls}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                          <div className="text-slate-200 font-black text-sm">{String(userName)}</div>
                          {userEmail ? <div className="text-slate-600 font-bold text-xs">{String(userEmail)}</div> : null}
                          {createdText ? <div className="text-slate-600 font-bold text-xs">{createdText}</div> : null}
                        </div>
                        <div className="mt-3 bg-slate-950 border border-white/5 rounded-2xl p-4 text-slate-200 font-bold text-sm leading-7">
                          {String(msg || '—')}
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2">
                        <button
                          onClick={() => setTicketStatus(String(x?.id), 'IN_PROGRESS')}
                          className="px-4 py-2 rounded-2xl text-xs font-black bg-sky-500/10 border border-sky-500/20 text-sky-300 hover:bg-sky-500/15"
                        >
                          قيد التنفيذ
                        </button>
                        <button
                          onClick={() => setTicketStatus(String(x?.id), 'RESOLVED')}
                          className="px-4 py-2 rounded-2xl text-xs font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15"
                        >
                          تم الحل
                        </button>
                        <button
                          onClick={() => setTicketStatus(String(x?.id), 'REJECTED')}
                          className="px-4 py-2 rounded-2xl text-xs font-black bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/15"
                        >
                          رفض
                        </button>
                        <button
                          onClick={() => deleteTicket(String(x?.id))}
                          className="px-4 py-2 rounded-2xl text-xs font-black bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 flex items-center justify-center gap-2"
                        >
                          <Trash2 size={14} /> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminContent;
