'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, StopCircle, TrendingUp, Loader2, RefreshCw, ShoppingCart, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';

const isArabic = true;

interface ShiftData {
  id: string; status: string; openingAmount: number; closingAmount?: number | null;
  expectedAmount?: number | null; difference?: number | null; ordersCount: number;
  totalSales: number; note?: string | null; openedAt: string; closedAt?: string | null;
}

const POSShiftsPage: React.FC = () => {
  const { shop } = useShop();
  const shopId = shop?.id || '';
  const [shift, setShift] = useState<ShiftData | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [openAmount, setOpenAmount] = useState(0);
  const [closingAmount, setClosingAmount] = useState(0);
  const [closeNote, setCloseNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [tick, setTick] = useState(0);

  const loadData = useCallback(async () => {
    if (!shopId) return;
    setLoading(true); setError('');
    try {
      const [activeData, allShifts] = await Promise.allSettled([
        apiRequest(`/shops/${shopId}/shifts/active`),
        apiRequest(`/shops/${shopId}/shifts?take=20`),
      ]);
      setShift(activeData.status === 'fulfilled' ? activeData.value : null);
      setShifts(allShifts.status === 'fulfilled' && Array.isArray(allShifts.value) ? allShifts.value : (allShifts.status === 'fulfilled' && allShifts.value?.shifts ? allShifts.value.shifts : []));
    } catch { setShift(null); }
    finally { setLoading(false); }
  }, [shopId]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 30000); return () => clearInterval(i); }, []);

  const openShift = async () => {
    setActionLoading(true); setError('');
    try { await apiRequest(`/shops/${shopId}/shifts`, { method: 'POST', body: JSON.stringify({ openingAmount: openAmount }) }); setOpenAmount(0); await loadData(); }
    catch (e: any) { setError(e?.message || (isArabic ? 'فشل فتح الوردية' : 'Failed to open shift')); }
    finally { setActionLoading(false); }
  };

  const closeShift = async () => {
    if (!shift?.id) return;
    setActionLoading(true); setError('');
    try { await apiRequest(`/shops/${shopId}/shifts/${shift.id}/close`, { method: 'POST', body: JSON.stringify({ closingAmount, note: closeNote }) }); setClosingAmount(0); setCloseNote(''); setShowCloseForm(false); await loadData(); }
    catch (e: any) { setError(e?.message || (isArabic ? 'فشل إغلاق الوردية' : 'Failed to close shift')); }
    finally { setActionLoading(false); }
  };

  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : '0.00');
  const elapsed = shift ? Math.floor((Date.now() + tick * 0 - new Date(shift.openedAt).getTime()) / 60000) : 0;
  const hours = Math.floor(elapsed / 60);
  const minutes = elapsed % 60;

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm min-h-[60vh]">
      <div className="flex flex-col gap-4 md:gap-6 mb-6 md:flex-row md:items-center md:justify-between md:flex-row-reverse">
        <div className="text-right">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
            <ShoppingCart size={24} className="text-[#BD00FF]" />
            {isArabic ? 'الورديات' : 'Shifts'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة ورديات الكاشير' : 'Cashier shifts management'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/pos" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black transition-all w-fit">
            <ChevronRight size={16} className="rotate-180" />
            {isArabic ? 'العودة للكاشير' : 'Back to POS'}
          </Link>
          <button type="button" onClick={loadData} disabled={loading} className="px-4 py-2 rounded-full font-black text-xs bg-slate-50 text-slate-700 flex items-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {isArabic ? 'تحديث' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold mb-4">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-slate-400" size={24} /></div>
      ) : shift ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-emerald-700">{isArabic ? 'الوردية مفتوحة' : 'Shift Active'}</span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{hours}h {minutes}m</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">{isArabic ? 'بدأت في' : 'Started at'} {new Date(shift.openedAt).toLocaleTimeString('ar-EG')}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-black mb-1">{isArabic ? 'العهدة' : 'Opening Cash'}</div>
              <div className="font-black text-slate-900 text-sm">ج.م {fmt(shift.openingAmount)}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-black mb-1">{isArabic ? 'عدد الطلبات' : 'Orders'}</div>
              <div className="font-black text-slate-900 text-sm">{shift.ordersCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 col-span-2">
              <div className="text-[10px] text-cyan-600 font-black mb-1 flex items-center gap-1"><TrendingUp size={12} />{isArabic ? 'إجمالي المبيعات' : 'Total Sales'}</div>
              <div className="font-black text-cyan-700 text-lg">ج.م {fmt(shift.totalSales)}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
            <div className="text-[10px] text-amber-600 font-black mb-1">{isArabic ? 'الصندوق المتوقع' : 'Expected Cash'}</div>
            <div className="font-black text-amber-700 text-sm">ج.م {fmt(shift.openingAmount + shift.totalSales)}</div>
          </div>

          {showCloseForm ? (
            <div className="space-y-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">{isArabic ? 'العهدة الختامية' : 'Closing Cash'}</label>
                <input type="number" value={closingAmount || ''} onChange={(e) => setClosingAmount(Number(e.target.value) || 0)} placeholder={isArabic ? 'مبلغ الإغلاق' : 'Closing amount'} className="w-full bg-white border rounded-xl py-3 px-4 outline-none text-sm font-black text-center focus:ring-2 focus:ring-[#BD00FF]" min={0} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">{isArabic ? 'ملاحظات' : 'Notes'}</label>
                <textarea value={closeNote} onChange={(e) => setCloseNote(e.target.value)} placeholder={isArabic ? 'ملاحظات الإغلاق...' : 'Closing notes...'} className="w-full bg-white border rounded-xl py-2.5 px-4 outline-none text-sm font-bold focus:ring-2 focus:ring-[#BD00FF] resize-none" rows={2} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCloseForm(false)} className="flex-1 py-3 rounded-2xl bg-slate-200 text-slate-700 font-black text-sm hover:bg-slate-300 transition-all">{isArabic ? 'إلغاء' : 'Cancel'}</button>
                <button type="button" onClick={closeShift} disabled={actionLoading} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <StopCircle size={18} />}
                  {isArabic ? 'تأكيد الإغلاق' : 'Confirm Close'}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowCloseForm(true)} className="w-full py-3.5 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2">
              <StopCircle size={18} />{isArabic ? 'إغلاق الوردية' : 'Close Shift'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3"><Clock size={28} className="text-slate-400" /></div>
            <p className="font-black text-slate-700 text-sm">{isArabic ? 'لا توجد وردية مفتوحة' : 'No active shift'}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{isArabic ? 'افتح وردية جديدة للبدء' : 'Open a new shift to start'}</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500">{isArabic ? 'العهدة الافتتاحية' : 'Opening Cash'}</label>
            <input type="number" value={openAmount || ''} onChange={(e) => setOpenAmount(Number(e.target.value) || 0)} placeholder={isArabic ? 'مبلغ العهدة' : 'Opening amount'} className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none text-sm font-black text-center focus:ring-2 focus:ring-[#BD00FF]" min={0} />
          </div>
          <button type="button" onClick={openShift} disabled={actionLoading} className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            {isArabic ? 'فتح الوردية' : 'Open Shift'}
          </button>
        </div>
      )}

      {/* History */}
      {shifts.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-xs font-black text-slate-700 mb-2">{isArabic ? 'سجل الورديات' : 'Shifts History'}</h4>
          {shifts.slice(0, 10).map((s: any) => (
            <div key={s?.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <div className="font-black text-xs text-slate-900">{s?.openedAt ? new Date(s.openedAt).toLocaleDateString('ar-EG') : '—'}</div>
                <div className="text-[10px] text-slate-400 font-bold">{s?.status === 'OPEN' ? (isArabic ? 'مفتوحة' : 'Open') : (isArabic ? 'مغلقة' : 'Closed')}</div>
              </div>
              <div className="text-left">
                <div className="font-black text-sm text-[#BD00FF]">ج.م {fmt(Number(s?.totalSales || 0))}</div>
                <div className="text-[10px] text-slate-400 font-bold">{s?.ordersCount || 0} {isArabic ? 'طلب' : 'orders'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default POSShiftsPage;
