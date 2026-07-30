import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Play, StopCircle, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { ApiService } from '@/services/api.service';

interface Props {
  shopId: string;
  isArabic: boolean;
}

interface ShiftData {
  id: string;
  status: string;
  openingAmount: number;
  closingAmount?: number | null;
  expectedAmount?: number | null;
  difference?: number | null;
  ordersCount: number;
  totalSales: number;
  note?: string | null;
  openedAt: string;
  closedAt?: string | null;
}

const POSShiftsPage: React.FC<Props> = ({ shopId, isArabic }) => {
  const [shift, setShift] = useState<ShiftData | null>(null);
  const [shifts, setShifts] = useState<any[]>([]);
  const [openAmount, setOpenAmount] = useState(0);
  const [closingAmount, setClosingAmount] = useState(0);
  const [closeNote, setCloseNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCloseForm, setShowCloseForm] = useState(false);

  const loadData = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    setError('');
    try {
      const [activeData, allShifts] = await Promise.allSettled([
        ApiService.getMyActiveShift(shopId),
        ApiService.listShifts({ shopId, take: 20 }),
      ]);
      setShift(activeData.status === 'fulfilled' ? activeData.value : null);
      setShifts(allShifts.status === 'fulfilled' && Array.isArray(allShifts.value) ? allShifts.value : []);
    } catch {
      setShift(null);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openShift = async () => {
    setActionLoading(true);
    setError('');
    try {
      await ApiService.openShift({ shopId, openingAmount: openAmount });
      setOpenAmount(0);
      await loadData();
    } catch (e: any) {
      setError(e?.message || (isArabic ? 'فشل فتح الوردية' : 'Failed to open shift'));
    } finally {
      setActionLoading(false);
    }
  };

  const closeShift = async () => {
    if (!shift?.id) return;
    setActionLoading(true);
    setError('');
    try {
      await ApiService.closeShift(shift.id, { closingAmount, note: closeNote });
      setClosingAmount(0);
      setCloseNote('');
      setShowCloseForm(false);
      await loadData();
    } catch (e: any) {
      setError(e?.message || (isArabic ? 'فشل إغلاق الوردية' : 'Failed to close shift'));
    } finally {
      setActionLoading(false);
    }
  };

  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : '0.00');
  const elapsed = shift ? Math.floor((Date.now() - new Date(shift.openedAt).getTime()) / 60000) : 0;
  const hours = Math.floor(elapsed / 60);
  const minutes = elapsed % 60;

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      ) : shift ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-emerald-700">{isArabic ? 'الوردية مفتوحة' : 'Shift Active'}</span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                {hours}h {minutes}m
              </span>
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">
              {isArabic ? 'بدأت في' : 'Started at'} {new Date(shift.openedAt).toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-black mb-1">{isArabic ? 'العهدة' : 'Opening Cash'}</div>
              <div className="font-black text-slate-900 text-sm">{isArabic ? 'ج.م' : 'EGP'} {fmt(shift.openingAmount)}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[10px] text-slate-400 font-black mb-1">{isArabic ? 'عدد الطلبات' : 'Orders'}</div>
              <div className="font-black text-slate-900 text-sm">{shift.ordersCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 col-span-2">
              <div className="text-[10px] text-cyan-600 font-black mb-1 flex items-center gap-1">
                <TrendingUp size={12} />
                {isArabic ? 'إجمالي المبيعات' : 'Total Sales'}
              </div>
              <div className="font-black text-cyan-700 text-lg">{isArabic ? 'ج.م' : 'EGP'} {fmt(shift.totalSales)}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
            <div className="text-[10px] text-amber-600 font-black mb-1">{isArabic ? 'الصندوق المتوقع' : 'Expected Cash'}</div>
            <div className="font-black text-amber-700 text-sm">
              {isArabic ? 'ج.م' : 'EGP'} {fmt(shift.openingAmount + shift.totalSales)}
            </div>
          </div>

          {showCloseForm ? (
            <div className="space-y-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">{isArabic ? 'العهدة الختامية' : 'Closing Cash'}</label>
                <input type="number" value={closingAmount || ''} onChange={(e) => setClosingAmount(Number(e.target.value) || 0)}
                  placeholder={isArabic ? 'مبلغ الإغلاق' : 'Closing amount'}
                  className="w-full bg-white border rounded-xl py-3 px-4 outline-none text-sm font-black text-center focus:ring-2 focus:ring-[#BD00FF]"
                  min={0} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500">{isArabic ? 'ملاحظات' : 'Notes'}</label>
                <textarea value={closeNote} onChange={(e) => setCloseNote(e.target.value)}
                  placeholder={isArabic ? 'ملاحظات الإغلاق...' : 'Closing notes...'}
                  className="w-full bg-white border rounded-xl py-2.5 px-4 outline-none text-sm font-bold focus:ring-2 focus:ring-[#BD00FF] resize-none"
                  rows={2} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCloseForm(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-200 text-slate-700 font-black text-sm hover:bg-slate-300 transition-all">
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="button" onClick={closeShift} disabled={actionLoading}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <StopCircle size={18} />}
                  {isArabic ? 'تأكيد الإغلاق' : 'Confirm Close'}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowCloseForm(true)}
              className="w-full py-3.5 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2">
              <StopCircle size={18} />
              {isArabic ? 'إغلاق الوردية' : 'Close Shift'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Clock size={28} className="text-slate-400" />
            </div>
            <p className="font-black text-slate-700 text-sm">{isArabic ? 'لا توجد وردية مفتوحة' : 'No active shift'}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">{isArabic ? 'افتح وردية جديدة للبدء' : 'Open a new shift to start'}</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500">{isArabic ? 'العهدة الافتتاحية' : 'Opening Cash'}</label>
            <input type="number" value={openAmount || ''} onChange={(e) => setOpenAmount(Number(e.target.value) || 0)}
              placeholder={isArabic ? 'مبلغ العهدة' : 'Opening amount'}
              className="w-full bg-slate-50 border rounded-xl py-3 px-4 outline-none text-sm font-black text-center focus:ring-2 focus:ring-[#BD00FF]"
              min={0} />
          </div>
          <button type="button" onClick={openShift} disabled={actionLoading}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            {isArabic ? 'فتح الوردية' : 'Open Shift'}
          </button>
        </div>
      )}

      {/* Shift history */}
      {shifts.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-700">{isArabic ? 'سجل الورديات' : 'Shift History'}</h4>
            <button type="button" onClick={loadData} className="p-2 rounded-xl hover:bg-slate-100">
              <RefreshCw size={14} className="text-slate-400" />
            </button>
          </div>
          {shifts.slice(0, 10).map((s: any) => (
            <div key={s?.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
              <div className={`w-2 h-2 rounded-full ${s?.status === 'OPEN' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-black text-xs text-slate-900">
                  {s?.openedAt ? new Date(s.openedAt).toLocaleDateString() : '—'}
                </div>
                <div className="text-[10px] text-slate-400 font-bold">
                  {s?.openedAt ? new Date(s.openedAt).toLocaleTimeString() : ''} → {s?.closedAt ? new Date(s.closedAt).toLocaleTimeString() : (isArabic ? 'مفتوحة' : 'Open')}
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="font-black text-xs text-[#BD00FF]">{isArabic ? 'ج.م' : 'EGP'} {fmt(Number(s?.totalSales || 0))}</div>
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
