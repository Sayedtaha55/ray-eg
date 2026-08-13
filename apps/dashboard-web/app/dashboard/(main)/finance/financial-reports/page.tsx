'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileBarChart, Download, RefreshCw, Info, X, Printer,
  DollarSign, TrendingUp, TrendingDown, Minus, Calendar,
  FileText, Scale, Wallet,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type ReportType = 'income_statement' | 'balance_sheet' | 'cash_flow';

type ReportData = {
  revenue: { label: string; amount: number }[];
  expenses: { label: string; amount: number }[];
  assets: { label: string; amount: number }[];
  liabilities: { label: string; amount: number }[];
  equity: { label: string; amount: number }[];
  cashIn: { label: string; amount: number }[];
  cashOut: { label: string; amount: number }[];
  totals: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalCashIn: number;
    totalCashOut: number;
    netCashFlow: number;
  };
};

export default function FinancialReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('income_statement');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 12);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const res = await apiRequest(`/finance/reports/shop/${sid}?type=${reportType}&from=${dateFrom}&to=${dateTo}`);
      setData({
        revenue: (res?.revenue || []).map((r: any) => ({ label: r.label || '---', amount: Number(r.amount ?? 0) })),
        expenses: (res?.expenses || []).map((r: any) => ({ label: r.label || '---', amount: Number(r.amount ?? 0) })),
        assets: (res?.assets || []).map((r: any) => ({ label: r.label || '---', amount: Number(r.amount ?? 0) })),
        liabilities: (res?.liabilities || []).map((r: any) => ({ label: r.label || '---', amount: Number(r.amount ?? 0) })),
        equity: (res?.equity || []).map((r: any) => ({ label: r.label || '---', amount: Number(r.amount ?? 0) })),
        cashIn: (res?.cashIn || []).map((r: any) => ({ label: r.label || '---', amount: Number(r.amount ?? 0) })),
        cashOut: (res?.cashOut || []).map((r: any) => ({ label: r.label || '---', amount: Number(r.amount ?? 0) })),
        totals: {
          totalRevenue: Number(res?.totals?.totalRevenue ?? 0),
          totalExpenses: Number(res?.totals?.totalExpenses ?? 0),
          netIncome: Number(res?.totals?.netIncome ?? 0),
          totalAssets: Number(res?.totals?.totalAssets ?? 0),
          totalLiabilities: Number(res?.totals?.totalLiabilities ?? 0),
          totalEquity: Number(res?.totals?.totalEquity ?? 0),
          totalCashIn: Number(res?.totals?.totalCashIn ?? 0),
          totalCashOut: Number(res?.totals?.totalCashOut ?? 0),
          netCashFlow: Number(res?.totals?.netCashFlow ?? 0),
        },
      });
    } catch { setData(null); } finally { setLoading(false); }
  }, [reportType, dateFrom, dateTo]);

  useEffect(() => { loadData(); }, [loadData]);

  const fmt = (n: number) => `${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;

  const exportCSV = useCallback(() => {
    if (!data) return;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'income_statement') {
      headers = ['Section', 'Item', 'Amount'];
      rows = [
        ['الإيرادات', '', ''],
        ...data.revenue.map(r => ['إيراد', r.label, r.amount]),
        ['', 'إجمالي الإيرادات', data.totals.totalRevenue],
        ['المصروفات', '', ''],
        ...data.expenses.map(r => ['مصروف', r.label, r.amount]),
        ['', 'إجمالي المصروفات', data.totals.totalExpenses],
        ['', 'صافي الدخل', data.totals.netIncome],
      ];
    } else if (reportType === 'balance_sheet') {
      headers = ['Section', 'Item', 'Amount'];
      rows = [
        ['الأصول', '', ''],
        ...data.assets.map(r => ['أصل', r.label, r.amount]),
        ['', 'إجمالي الأصول', data.totals.totalAssets],
        ['الخصوم', '', ''],
        ...data.liabilities.map(r => ['خصم', r.label, r.amount]),
        ['', 'إجمالي الخصوم', data.totals.totalLiabilities],
        ['حقوق الملكية', '', ''],
        ...data.equity.map(r => ['حق ملكية', r.label, r.amount]),
        ['', 'إجمالي حقوق الملكية', data.totals.totalEquity],
      ];
    } else {
      headers = ['Section', 'Item', 'Amount'];
      rows = [
        ['التدفقات الداخلة', '', ''],
        ...data.cashIn.map(r => ['داخل', r.label, r.amount]),
        ['', 'إجمالي التدفقات الداخلة', data.totals.totalCashIn],
        ['التدفقات الخارجة', '', ''],
        ...data.cashOut.map(r => ['خارج', r.label, r.amount]),
        ['', 'إجمالي التدفقات الخارجة', data.totals.totalCashOut],
        ['', 'صافي التدفق النقدي', data.totals.netCashFlow],
      ];
    }

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financial-report-${reportType}.csv`;
    link.click();
  }, [data, reportType]);

  const handlePrint = useCallback(() => {
    if (!data) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const reportTitle = reportType === 'income_statement' ? 'قائمة الدخل' : reportType === 'balance_sheet' ? 'الميزانية العمومية' : 'قائمة التدفقات النقدية';

    let tableHTML = '';
    if (reportType === 'income_statement') {
      tableHTML = `
        <h3>الإيرادات</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;"><thead><tr><th>البند</th><th>المبلغ</th></tr></thead><tbody>
        ${data.revenue.map(r => `<tr><td>${r.label}</td><td style="text-align:left">${r.amount.toLocaleString()}</td></tr>`).join('')}
        <tr style="font-weight:bold;background:#f0f9ff;"><td>إجمالي الإيرادات</td><td style="text-align:left">${data.totals.totalRevenue.toLocaleString()}</td></tr>
        </tbody></table>
        <h3>المصروفات</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;"><thead><tr><th>البند</th><th>المبلغ</th></tr></thead><tbody>
        ${data.expenses.map(r => `<tr><td>${r.label}</td><td style="text-align:left">${r.amount.toLocaleString()}</td></tr>`).join('')}
        <tr style="font-weight:bold;background:#fef2f2;"><td>إجمالي المصروفات</td><td style="text-align:left">${data.totals.totalExpenses.toLocaleString()}</td></tr>
        </tbody></table>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;margin-top:16px;"><tr style="font-weight:bold;font-size:16px;background:${data.totals.netIncome >= 0 ? '#dcfce7' : '#fee2e2'};"><td>صافي الدخل</td><td style="text-align:left">${data.totals.netIncome.toLocaleString()}</td></tr></table>`;
    } else if (reportType === 'balance_sheet') {
      tableHTML = `
        <h3>الأصول</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;"><thead><tr><th>البند</th><th>المبلغ</th></tr></thead><tbody>
        ${data.assets.map(r => `<tr><td>${r.label}</td><td style="text-align:left">${r.amount.toLocaleString()}</td></tr>`).join('')}
        <tr style="font-weight:bold;background:#f0f9ff;"><td>إجمالي الأصول</td><td style="text-align:left">${data.totals.totalAssets.toLocaleString()}</td></tr>
        </tbody></table>
        <h3>الخصوم</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;"><thead><tr><th>البند</th><th>المبلغ</th></tr></thead><tbody>
        ${data.liabilities.map(r => `<tr><td>${r.label}</td><td style="text-align:left">${r.amount.toLocaleString()}</td></tr>`).join('')}
        <tr style="font-weight:bold;background:#fef2f2;"><td>إجمالي الخصوم</td><td style="text-align:left">${data.totals.totalLiabilities.toLocaleString()}</td></tr>
        </tbody></table>
        <h3>حقوق الملكية</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;"><thead><tr><th>البند</th><th>المبلغ</th></tr></thead><tbody>
        ${data.equity.map(r => `<tr><td>${r.label}</td><td style="text-align:left">${r.amount.toLocaleString()}</td></tr>`).join('')}
        <tr style="font-weight:bold;background:#f0fdf4;"><td>إجمالي حقوق الملكية</td><td style="text-align:left">${data.totals.totalEquity.toLocaleString()}</td></tr>
        </tbody></table>`;
    } else {
      tableHTML = `
        <h3>التدفقات النقدية الداخلة</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;"><thead><tr><th>البند</th><th>المبلغ</th></tr></thead><tbody>
        ${data.cashIn.map(r => `<tr><td>${r.label}</td><td style="text-align:left">${r.amount.toLocaleString()}</td></tr>`).join('')}
        <tr style="font-weight:bold;background:#dcfce7;"><td>إجمالي التدفقات الداخلة</td><td style="text-align:left">${data.totals.totalCashIn.toLocaleString()}</td></tr>
        </tbody></table>
        <h3>التدفقات النقدية الخارجة</h3>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;"><thead><tr><th>البند</th><th>المبلغ</th></tr></thead><tbody>
        ${data.cashOut.map(r => `<tr><td>${r.label}</td><td style="text-align:left">${r.amount.toLocaleString()}</td></tr>`).join('')}
        <tr style="font-weight:bold;background:#fee2e2;"><td>إجمالي التدفقات الخارجة</td><td style="text-align:left">${data.totals.totalCashOut.toLocaleString()}</td></tr>
        </tbody></table>
        <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%;margin-top:16px;"><tr style="font-weight:bold;font-size:16px;background:${data.totals.netCashFlow >= 0 ? '#dcfce7' : '#fee2e2'};"><td>صافي التدفق النقدي</td><td style="text-align:left">${data.totals.netCashFlow.toLocaleString()}</td></tr></table>`;
    }

    printWindow.document.write(`
      <html><head><title>${reportTitle}</title></head>
      <body style="font-family:Arial,sans-serif;direction:rtl;">
        <h2 style="text-align:center;">${reportTitle}</h2>
        <p style="text-align:center;color:#666;">من ${dateFrom} إلى ${dateTo}</p>
        ${tableHTML}
      </body></html>`);
    printWindow.document.close();
    printWindow.print();
  }, [data, reportType, dateFrom, dateTo]);

  const REPORT_CONFIG: Record<ReportType, { label: string; icon: React.ReactNode; description: string }> = {
    income_statement: { label: 'قائمة الدخل', icon: <FileText size={18} />, description: 'الإيرادات والمصروفات وصافي الدخل' },
    balance_sheet: { label: 'الميزانية العمومية', icon: <Scale size={18} />, description: 'الأصول والخصوم وحقوق الملكية' },
    cash_flow: { label: 'التدفقات النقدية', icon: <Wallet size={18} />, description: 'التدفقات الداخلة والخارجة' },
  };

  const summaryStats = useMemo(() => {
    if (!data) return [];
    if (reportType === 'income_statement') {
      return [
        { label: 'إجمالي الإيرادات', value: fmt(data.totals.totalRevenue), icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
        { label: 'إجمالي المصروفات', value: fmt(data.totals.totalExpenses), icon: TrendingDown, color: 'bg-orange-50 text-orange-600' },
        { label: 'صافي الدخل', value: fmt(data.totals.netIncome), icon: data.totals.netIncome >= 0 ? TrendingUp : TrendingDown, color: data.totals.netIncome >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700' },
      ];
    } else if (reportType === 'balance_sheet') {
      return [
        { label: 'إجمالي الأصول', value: fmt(data.totals.totalAssets), icon: DollarSign, color: 'bg-blue-50 text-blue-600' },
        { label: 'إجمالي الخصوم', value: fmt(data.totals.totalLiabilities), icon: TrendingDown, color: 'bg-red-50 text-red-600' },
        { label: 'حقوق الملكية', value: fmt(data.totals.totalEquity), icon: Scale, color: 'bg-purple-50 text-purple-600' },
      ];
    } else {
      return [
        { label: 'تدفقات داخلة', value: fmt(data.totals.totalCashIn), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
        { label: 'تدفقات خارجة', value: fmt(data.totals.totalCashOut), icon: TrendingDown, color: 'bg-red-50 text-red-600' },
        { label: 'صافي التدفق', value: fmt(data.totals.netCashFlow), icon: data.totals.netCashFlow >= 0 ? TrendingUp : TrendingDown, color: data.totals.netCashFlow >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700' },
      ];
    }
  }, [data, reportType]);

  const renderReportSection = (title: string, items: { label: string; amount: number }[], total: number, color: string) => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className={`px-4 py-3 ${color}`}>
        <h3 className="font-bold text-sm">{title}</h3>
      </div>
      <table className="w-full text-right">
        <tbody>
          {items.length === 0 ? (
            <tr><td className="p-4 text-center text-slate-400 text-sm">لا توجد بيانات</td></tr>
          ) : (
            items.map((item, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="p-3 text-sm text-slate-700">{item.label}</td>
                <td className="p-3 text-sm font-bold text-slate-900 text-left">{fmt(item.amount)}</td>
              </tr>
            ))
          )}
          <tr className="bg-slate-50">
            <td className="p-3 font-bold text-sm text-slate-900">الإجمالي</td>
            <td className="p-3 font-black text-sm text-slate-900 text-left">{fmt(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <FileBarChart size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">التقارير المالية</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">تقارير مالية شاملة: قائمة الدخل، الميزانية، التدفقات النقدية</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(REPORT_CONFIG) as ReportType[]).map(type => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right ${reportType === type ? 'border-[#00E5FF] bg-cyan-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className={`p-2 rounded-xl ${reportType === type ? 'bg-[#00E5FF] text-slate-900' : 'bg-slate-100 text-slate-500'}`}>
              {REPORT_CONFIG[type].icon}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{REPORT_CONFIG[type].label}</div>
              <div className="text-xs text-slate-400">{REPORT_CONFIG[type].description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Period Filter + Actions */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">من:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-400">إلى:</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
        </div>
        <button onClick={() => loadData()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
          <RefreshCw size={18} /> تحديث
        </button>
        <button onClick={handlePrint} disabled={!data} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-slate-900 font-bold text-sm hover:bg-[#00B8CC] transition-all disabled:opacity-50">
          <Printer size={18} /> طباعة
        </button>
        <button onClick={exportCSV} disabled={!data} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50">
          <Download size={18} /> تصدير CSV
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileBarChart size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد بيانات مالية حالياً</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {summaryStats.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
                <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon size={22} /></div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400">{s.label}</p>
                  <p className="text-lg font-black text-slate-900 truncate">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Report Content */}
          {reportType === 'income_statement' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderReportSection('الإيرادات', data.revenue, data.totals.totalRevenue, 'bg-blue-50 text-blue-700')}
              {renderReportSection('المصروفات', data.expenses, data.totals.totalExpenses, 'bg-orange-50 text-orange-700')}
              <div className="lg:col-span-2 bg-white rounded-xl border-2 border-slate-200 p-6 text-center">
                <div className="text-sm font-bold text-slate-400 mb-1">صافي الدخل</div>
                <div className={`text-3xl font-black ${data.totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(data.totals.netIncome)}</div>
              </div>
            </div>
          )}

          {reportType === 'balance_sheet' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {renderReportSection('الأصول', data.assets, data.totals.totalAssets, 'bg-blue-50 text-blue-700')}
              {renderReportSection('الخصوم', data.liabilities, data.totals.totalLiabilities, 'bg-red-50 text-red-700')}
              {renderReportSection('حقوق الملكية', data.equity, data.totals.totalEquity, 'bg-purple-50 text-purple-700')}
              <div className="lg:col-span-3 bg-white rounded-xl border-2 border-slate-200 p-6 text-center">
                <div className="text-sm font-bold text-slate-400 mb-1">الأصول = الخصوم + حقوق الملكية</div>
                <div className="text-2xl font-black text-slate-900">
                  {fmt(data.totals.totalAssets)} = {fmt(data.totals.totalLiabilities + data.totals.totalEquity)}
                </div>
                {Math.abs(data.totals.totalAssets - (data.totals.totalLiabilities + data.totals.totalEquity)) > 0.01 && (
                  <div className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
                    <Info size={14} /> الميزانية غير متوازنة
                  </div>
                )}
              </div>
            </div>
          )}

          {reportType === 'cash_flow' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {renderReportSection('التدفقات الداخلة', data.cashIn, data.totals.totalCashIn, 'bg-green-50 text-green-700')}
              {renderReportSection('التدفقات الخارجة', data.cashOut, data.totals.totalCashOut, 'bg-red-50 text-red-700')}
              <div className="lg:col-span-2 bg-white rounded-xl border-2 border-slate-200 p-6 text-center">
                <div className="text-sm font-bold text-slate-400 mb-1">صافي التدفق النقدي</div>
                <div className={`text-3xl font-black ${data.totals.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(data.totals.netCashFlow)}</div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل التقارير المالية</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2"><Info size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">وظيفة الصفحة</h3></div>
                <p className="text-sm text-slate-600 leading-relaxed">تقارير مالية شاملة: قائمة الدخل، الميزانية العمومية، التدفقات النقدية.</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><FileBarChart size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">أنواع التقارير</h3></div>
                <ul className="text-sm text-slate-600 space-y-2 pr-4">
                  <li><strong>قائمة الدخل:</strong> الإيرادات ناقص المصروفات = صافي الدخل</li>
                  <li><strong>الميزانية العمومية:</strong> الأصول = الخصوم + حقوق الملكية</li>
                  <li><strong>التدفقات النقدية:</strong> التدفقات الداخلة ناقص الخارجة = صافي التدفق</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><Download size={18} className="text-slate-700" /><h3 className="font-bold text-slate-900">التصدير</h3></div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• تصدير CSV لجميع التقارير</li>
                  <li>• طباعة مباشرة بتنسيق احترافي</li>
                  <li>• تخصيص الفترة الزمنية</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
