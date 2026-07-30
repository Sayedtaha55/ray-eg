import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Loader2, TrendingUp, ShoppingBag, DollarSign, Receipt, Clock, Calendar } from 'lucide-react';
import { ApiService } from '@/services/api.service';

interface Props {
  shopId: string;
  isArabic: boolean;
}

type RangeKey = 'today' | 'yesterday' | 'last7days' | 'last30days';

const POSReportsPage: React.FC<Props> = ({ shopId, isArabic }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [shiftSummary, setShiftSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<RangeKey>('today');

  const loadReport = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const now = new Date();
      const from = new Date(now);
      if (range === 'today') from.setHours(0, 0, 0, 0);
      else if (range === 'yesterday') { from.setDate(from.getDate() - 1); from.setHours(0, 0, 0, 0); }
      else if (range === 'last7days') { from.setDate(from.getDate() - 7); from.setHours(0, 0, 0, 0); }
      else { from.setDate(from.getDate() - 30); from.setHours(0, 0, 0, 0); }

      const to = new Date(now);
      if (range === 'yesterday') { to.setDate(to.getDate() - 1); to.setHours(23, 59, 59, 999); }

      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];

      const [ordersData, summaryData] = await Promise.allSettled([
        ApiService.getAllOrders({ shopId }),
        ApiService.getShiftSummary({ shopId, from: fromStr, to: toStr }),
      ]);

      const filtered = ordersData.status === 'fulfilled'
        ? (Array.isArray(ordersData.value) ? ordersData.value : []).filter((o: any) => {
            const created = new Date(o?.createdAt || 0);
            return created >= from && created <= to && (o?.source === 'pos' || o?.source === 'POS');
          })
        : [];
      setOrders(filtered);

      if (summaryData.status === 'fulfilled' && summaryData.value) {
        setShiftSummary(summaryData.value);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [shopId, range]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const totalSales = orders.reduce((sum, o) => sum + Number(o?.total || 0), 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : '0.00');

  const paymentBreakdown = orders.reduce((acc, o) => {
    const method = String(o?.paymentMethod || 'COD').toUpperCase();
    acc[method] = (acc[method] || 0) + Number(o?.total || 0);
    return acc;
  }, {} as Record<string, number>);

  const rangeLabels: Record<RangeKey, string> = isArabic
    ? { today: 'اليوم', yesterday: 'أمس', last7days: 'آخر ٧ أيام', last30days: 'آخر ٣٠ يوم' }
    : { today: 'Today', yesterday: 'Yesterday', last7days: 'Last 7 days', last30days: 'Last 30 days' };

  return (
    <div className="space-y-5">
      {/* Range selector */}
      <div className="flex flex-wrap gap-2">
        {(['today', 'yesterday', 'last7days', 'last30days'] as RangeKey[]).map((r) => (
          <button key={r} type="button" onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-full font-black text-[11px] ${range === r ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>
            {rangeLabels[r]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="p-3 md:p-4 rounded-2xl bg-cyan-50 border border-cyan-100">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center mb-2">
                <DollarSign size={16} className="text-cyan-600" />
              </div>
              <div className="text-[10px] text-cyan-600 font-black mb-0.5">{isArabic ? 'المبيعات' : 'Sales'}</div>
              <div className="font-black text-cyan-700 text-sm md:text-base">{isArabic ? 'ج.م' : 'EGP'} {fmt(totalSales)}</div>
            </div>
            <div className="p-3 md:p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
                <Receipt size={16} className="text-emerald-600" />
              </div>
              <div className="text-[10px] text-emerald-600 font-black mb-0.5">{isArabic ? 'الفواتير' : 'Orders'}</div>
              <div className="font-black text-emerald-700 text-sm md:text-base">{totalOrders}</div>
            </div>
            <div className="p-3 md:p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center mb-2">
                <TrendingUp size={16} className="text-purple-600" />
              </div>
              <div className="text-[10px] text-purple-600 font-black mb-0.5">{isArabic ? 'المتوسط' : 'Avg'}</div>
              <div className="font-black text-purple-700 text-sm md:text-base">{isArabic ? 'ج.م' : 'EGP'} {fmt(avgOrder)}</div>
            </div>
          </div>

          {/* Shift summary */}
          {shiftSummary && Number(shiftSummary?.totalShifts || 0) > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <h4 className="text-xs font-black text-blue-700 mb-3 flex items-center gap-1.5">
                <Clock size={14} />
                {isArabic ? 'ملخص الورديات' : 'Shifts Summary'}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-[10px] text-blue-500 font-black">{isArabic ? 'الإجمالي' : 'Total'}</div>
                  <div className="font-black text-blue-700 text-sm">{shiftSummary.totalShifts}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-emerald-500 font-black">{isArabic ? 'مفتوحة' : 'Open'}</div>
                  <div className="font-black text-emerald-700 text-sm">{shiftSummary.openCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-500 font-black">{isArabic ? 'مغلقة' : 'Closed'}</div>
                  <div className="font-black text-slate-700 text-sm">{shiftSummary.closedCount}</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-100 flex justify-between text-xs font-bold">
                <span className="text-slate-600">{isArabic ? 'مبيعات الورديات' : 'Shift Sales'}</span>
                <span className="text-slate-900">{isArabic ? 'ج.م' : 'EGP'} {fmt(Number(shiftSummary.totalSales || 0))}</span>
              </div>
            </div>
          )}

          {/* Payment breakdown */}
          {Object.keys(paymentBreakdown).length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-1.5">
                <ShoppingBag size={14} />
                {isArabic ? 'تفصيل طرق الدفع' : 'Payment Methods Breakdown'}
              </h4>
              <div className="space-y-2">
                {Object.entries(paymentBreakdown).map(([method, amount]) => (
                  <div key={method} className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">{method}</span>
                    <span className="text-slate-900">{isArabic ? 'ج.م' : 'EGP'} {fmt(Number(amount))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders list */}
          {orders.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-700">{isArabic ? 'الفواتير' : 'Orders'}</h4>
              {orders.slice(0, 30).map((order) => (
                <div key={order?.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-xs text-slate-900">
                      #{order?.orderNumber || order?.id?.slice(-6) || '—'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      {order?.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                  <div className="font-black text-xs text-[#BD00FF]">
                    {isArabic ? 'ج.م' : 'EGP'} {fmt(Number(order?.total || 0))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {orders.length === 0 && (
            <div className="text-center text-slate-400 py-12 font-bold text-sm">
              {isArabic ? 'لا توجد مبيعات في هذه الفترة' : 'No sales in this period'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default POSReportsPage;
