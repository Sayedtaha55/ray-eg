import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, Trash2, Eye, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type Quote = {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  items: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  validUntil: string;
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  draft: { ar: 'مسودة', en: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
  sent: { ar: 'مرسلة', en: 'Sent', color: 'text-blue-600', bg: 'bg-blue-100' },
  accepted: { ar: 'مقبولة', en: 'Accepted', color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { ar: 'مرفوضة', en: 'Rejected', color: 'text-red-600', bg: 'bg-red-100' },
  expired: { ar: 'منتهية', en: 'Expired', color: 'text-amber-600', bg: 'bg-amber-100' },
};

const QuotesPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAllOrders({ shopId });
      const orders = Array.isArray(res) ? res : (res as any)?.data || [];
      setQuotes(orders.map((o: any) => ({
        id: String(o.id),
        quoteNumber: o.orderNumber || `Q-${o.id}`,
        customerName: o.customerName || o.customer?.name || '---',
        customerPhone: o.customerPhone || o.customer?.phone || '---',
        items: o.items?.length || 0,
        total: Number(o.total || o.totalAmount || 0),
        status: 'draft',
        createdAt: o.createdAt || new Date().toISOString(),
        validUntil: o.validUntil || new Date(Date.now() + 30 * 86400000).toISOString(),
      })));
    } catch {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  const filtered = quotes.filter(q =>
    q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
    q.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: isArabic ? 'إجمالي عروض الأسعار' : 'Total Quotes', value: quotes.length, icon: <FileText size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'مقبولة' : 'Accepted', value: quotes.filter(q => q.status === 'accepted').length, icon: <FileText size={20} />, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'مرسلة' : 'Sent', value: quotes.filter(q => q.status === 'sent').length, icon: <FileText size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'إجمالي القيمة' : 'Total Value', value: `${t('business.reports.currency')} ${quotes.reduce((s, q) => s + q.total, 0).toLocaleString()}`, icon: <FileText size={20} />, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'عروض الأسعار' : 'Quotations'}</h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة عروض الأسعار المرسلة للعملاء' : 'Manage price quotes sent to customers'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
          <Plus size={18} /> {isArabic ? 'عرض سعر جديد' : 'New Quote'}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-400">{s.label}</p>
              <p className="text-lg font-black">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث برقم العرض أو اسم العميل...' : 'Search by quote number or customer...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <FileText size={64} className="mx-auto mb-4 text-slate-200" />
          <p className="font-black text-xl text-slate-300 mb-2">{isArabic ? 'لا توجد عروض أسعار بعد' : 'No quotes yet'}</p>
          <p className="text-sm text-slate-400">{isArabic ? 'ابدأ بإنشاء عرض سعر جديد' : 'Start by creating a new quote'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b border-slate-100">
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'رقم العرض' : 'Quote #'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العميل' : 'Customer'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العناصر' : 'Items'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الإجمالي' : 'Total'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="pb-3 font-bold text-slate-400"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const st = STATUS_STYLES[q.status] || STATUS_STYLES.draft;
                return (
                  <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-bold">{q.quoteNumber}</td>
                    <td className="py-3">
                      <p className="font-medium">{q.customerName}</p>
                      <p className="text-xs text-slate-400">{q.customerPhone}</p>
                    </td>
                    <td className="py-3 text-slate-500">{q.items}</td>
                    <td className="py-3 font-bold">{t('business.reports.currency')} {q.total.toLocaleString()}</td>
                    <td className="py-3"><span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span></td>
                    <td className="py-3"><div className="flex items-center gap-2"><Eye size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" /><Trash2 size={16} className="text-slate-400 hover:text-red-500 cursor-pointer" /></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-black">{isArabic ? 'عرض سعر جديد' : 'New Quote'}</h4>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم العميل' : 'Customer name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;
