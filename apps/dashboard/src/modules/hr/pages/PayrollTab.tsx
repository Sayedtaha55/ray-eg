import React, { useEffect, useState, useCallback } from 'react';
import { Wallet, TrendingUp, Loader2, DollarSign } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useTranslation } from 'react-i18next';

type Props = {
  shopId: string;
  shop: any;
};

const PayrollTab: React.FC<Props> = ({ shopId }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    try {
      const data = await ApiService.getPayroll(shopId);
      setPayroll(Array.isArray(data) ? data : []);
    } catch {
      setPayroll([]);
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPaid = payroll.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-slate-400" />
          {isArabic ? 'إدارة الرواتب' : 'Payroll Management'}
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          {isArabic ? 'تتبع مدفوعات الرواتب' : 'Track salary payments'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {isArabic ? 'إجمالي المدفوع' : 'Total Paid'}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalPaid.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {isArabic ? 'عدد الموظفين' : 'Employees'}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{payroll.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {isArabic ? 'متوسط الراتب' : 'Avg Salary'}
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {payroll.length > 0 ? Math.round(totalPaid / payroll.length).toLocaleString() : 0}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : payroll.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-200" />
          <p className="font-bold text-slate-400 text-sm">
            {isArabic ? 'لا توجد سجلات رواتب' : 'No payroll records'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {payroll.map((p, idx) => (
              <div key={p.id || idx} className="flex items-center justify-between p-4">
                <div className="font-bold text-sm text-slate-900">{p.employeeName || p.name || '—'}</div>
                <div className="text-sm font-semibold text-slate-700">
                  {Number(p.amount || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollTab;
