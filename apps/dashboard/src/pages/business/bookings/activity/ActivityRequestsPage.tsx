/**
 * ═══════════════════════════════════════════
 * activity/ActivityRequestsPage.tsx
 * إدارة طلبات العملاء الخاصة
 * يُستخدم في: مطاعم
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { MessageSquare, Plus, Search, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { useTranslation } from 'react-i18next';

type Request = {
  id: string;
  customerName: string;
  type: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
};

type Props = { activityType: BookingActivityType };

const STATUS_MAP_AR = {
  pending:  { label: 'قيد المراجعة', color: 'text-amber-700',   bg: 'bg-amber-50', icon: <Clock size={12} /> },
  approved: { label: 'موافق عليه',  color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle2 size={12} /> },
  rejected: { label: 'مرفوض',       color: 'text-red-700',     bg: 'bg-red-50', icon: <XCircle size={12} /> },
};
const STATUS_MAP_EN = {
  pending:  { label: 'Pending',    color: 'text-amber-700',   bg: 'bg-amber-50', icon: <Clock size={12} /> },
  approved: { label: 'Approved',   color: 'text-emerald-700', bg: 'bg-emerald-50', icon: <CheckCircle2 size={12} /> },
  rejected: { label: 'Rejected',   color: 'text-red-700',     bg: 'bg-red-50', icon: <XCircle size={12} /> },
};

const ActivityRequestsPage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const STATUS_MAP = isEn ? STATUS_MAP_EN : STATUS_MAP_AR;
  const [requests, setRequests] = useState<Request[]>([
    { id: '1', customerName: 'أحمد علي', type: 'طلب خاص', message: 'طاولة بجانب النافذة مع إضاءة خافتة', status: 'pending', date: '2025-06-20' },
    { id: '2', customerName: 'سارة خالد', type: 'مناسبة', message: 'حفل عيد ميلاد - 15 شخص - كيكة وبالونات', status: 'approved', date: '2025-06-18' },
    { id: '3', customerName: 'محمد عبدالله', type: 'حساسية', message: 'حساسية من المكسرات - يرجى مراعاة ذلك', status: 'approved', date: '2025-06-19' },
    { id: '4', customerName: 'نور حسن', type: 'طلب خاص', message: 'مقاعد مرتفعة للأطفال', status: 'rejected', date: '2025-06-17' },
  ]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const updateStatus = (id: string, status: Request['status']) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const filtered = requests.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || r.customerName.toLowerCase().includes(q) || r.message.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{isEn ? 'Customer Requests' : 'طلبات العملاء'}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{requests.filter(r => r.status === 'pending').length} {isEn ? 'pending requests' : 'طلب قيد المراجعة'}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-row-reverse">
        {[
          { key: 'all' as const, label: isEn ? 'All' : 'الكل', count: requests.length },
          { key: 'pending' as const, label: isEn ? 'Pending' : 'قيد المراجعة', count: requests.filter(r => r.status === 'pending').length },
          { key: 'approved' as const, label: isEn ? 'Approved' : 'موافق', count: requests.filter(r => r.status === 'approved').length },
          { key: 'rejected' as const, label: isEn ? 'Rejected' : 'مرفوض', count: requests.filter(r => r.status === 'rejected').length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${filter === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input type="text" placeholder={isEn ? 'Search requests...' : 'ابحث في الطلبات...'} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 shadow-sm rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <MessageSquare className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{isEn ? 'No requests' : 'لا توجد طلبات'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const st = STATUS_MAP[req.status];
            return (
              <div key={req.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-slate-100 flex items-center justify-center font-black text-slate-600 text-sm shrink-0">
                      {req.customerName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-900">{req.customerName}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{req.type}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-bold leading-relaxed">{req.message}</p>
                      <span className="text-[10px] text-slate-300 font-bold mt-1 block">{req.date}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 ${st.bg} ${st.color} shrink-0`}>
                    {st.icon} {st.label}
                  </span>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-3 justify-end">
                    <button onClick={() => updateStatus(req.id, 'approved')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-black hover:bg-emerald-100 flex items-center gap-1">
                      <CheckCircle2 size={12} /> {isEn ? 'Approve' : 'موافقة'}
                    </button>
                    <button onClick={() => updateStatus(req.id, 'rejected')}
                      className="px-4 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-black hover:bg-red-100 flex items-center gap-1">
                      <XCircle size={12} /> {isEn ? 'Reject' : 'رفض'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityRequestsPage;
