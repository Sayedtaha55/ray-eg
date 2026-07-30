import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Plus, Search, Trash2, Eye, Loader2, X, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type Payment = {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: 'cash' | 'card' | 'online' | 'wallet' | 'cod';
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
};

const METHOD_LABELS: Record<string, { ar: string; en: string }> = {
  cash: { ar: 'كاش', en: 'Cash' },
  card: { ar: 'بطاقة', en: 'Card' },
  online: { ar: 'أونلاين', en: 'Online' },
  wallet: { ar: 'محفظة', en: 'Wallet' },
  cod: { ar: 'دفع عند الاستلام', en: 'COD' },
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string; icon: React.ReactNode }> = {
  paid: { ar: 'مدفوع', en: 'Paid', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 size={12} /> },
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'text-amber-600', bg: 'bg-amber-100', icon: <Clock size={12} /> },
  failed: { ar: 'فشل', en: 'Failed', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle size={12} /> },
  refunded: { ar: 'مسترجع', en: 'Refunded', color: 'text-blue-600', bg: 'bg-blue-100', icon: <CreditCard size={12} /> },
};

const PaymentsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAllOrders({ shopId });
      const orders = Array.isArray(res) ? res : (res as any)?.data || [];
      setPayments(orders.map((o: any) => ({
        id: String(o.id),
        orderNumber: o.orderNumber || `#${o.id}`,
        customerName: o.customerName || o.customer?.name || '---',
        amount: Number(o.total || o.totalAmount || 0),
        method: o.paymentMethod || 'cod',
        status: o.paymentStatus || (o.isPaid ? 'paid' : 'pending'),
        date: o.createdAt || new Date().toISOString(),
      })));
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const filtered = payments.filter(p =>
    p.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  const stats = [
    { label: isArabic ? 'إجمالي المدفوعات' : 'Total Payments', value: payments.length, icon: <CreditCard size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'المبلغ المدفوع' : 'Paid Amount', value: `${t('business.reports.currency')} ${totalPaid.toLocaleString()}`, icon: <CheckCircle2 size={20} />, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'قيد الانتظار' : 'Pending', value: `${t('business.reports.currency')} ${totalPending.toLocaleString()}`, icon: <Clock size={20} />, color: 'bg-amber-50 text-amber-600' },
    { label: isArabic ? 'فشل' : 'Failed', value: payments.filter(p => p.status === 'failed').length, icon: <XCircle size={20} />, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'المدفوعات' : 'Payments'}</h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'تتبع جميع المدفوعات والمعاملات' : 'Track all payments and transactions'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث برقم الطلب أو العميل...' : 'Search by order or customer...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <CreditCard size={64} className="mx-auto mb-4 text-slate-200" />
          <p className="font-black text-xl text-slate-300 mb-2">{isArabic ? 'لا توجد مدفوعات' : 'No payments yet'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b border-slate-100">
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'رقم الطلب' : 'Order #'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'العميل' : 'Customer'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المبلغ' : 'Amount'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'طريقة الدفع' : 'Method'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const st = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                const m = METHOD_LABELS[p.method] || METHOD_LABELS.cod;
                return (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 font-bold">{p.orderNumber}</td>
                    <td className="py-3 font-medium">{p.customerName}</td>
                    <td className="py-3 font-bold">{t('business.reports.currency')} {p.amount.toLocaleString()}</td>
                    <td className="py-3 text-slate-500">{isArabic ? m.ar : m.en}</td>
                    <td className="py-3"><span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color} w-fit`}>{st.icon} {isArabic ? st.ar : st.en}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
