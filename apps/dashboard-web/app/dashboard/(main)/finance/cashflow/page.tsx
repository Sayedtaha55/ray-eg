'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowRightLeft, Loader2, Download, Info, Search, ArrowDownToLine, ArrowUpFromLine, X } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Account = {
  id: string; code: string; name: string; type: string;
  is_group: boolean; opening_balance: number; status: string;
  debit_balance: number; credit_balance: number;
};

type JLine = { account_id: string; account_code: string; account_name: string; description: string; debit: number; credit: number };
type Entry = {
  id: string; number: string; entry_date: string; description: string; reference: string;
  status: string; lines: JLine[];
};

type Movement = {
  id: string; date: string; number: string;
  direction: 'in' | 'out';
  description: string; counterAccount: string;
  amount: number; wallet: string;
};

export default function CashflowPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [guideOpen, setGuideOpen] = useState(false);
  const [filterDirection, setFilterDirection] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      const [accRes, jeRes] = await Promise.all([
        apiRequest(`/accounting/accounts/shop/${sid}`),
        apiRequest(`/accounting/journal/shop/${sid}?status=posted`),
      ]);
      const accData: Account[] = Array.isArray(accRes) ? accRes : (accRes?.data || []);
      setAccounts(accData);
      const entries: Entry[] = Array.isArray(jeRes) ? jeRes : (jeRes?.data || []);
      const cashIds = new Set(accData.filter(a =>
        a.type === 'asset' && !a.is_group && a.status === 'active' &&
        /نقد|نقدية|صندوق|بنك|كاش|محفظة|محفظه|cash|bank|wallet/i.test(`${a.code} ${a.name}`)
      ).map(a => a.id));
      const out: Movement[] = [];
      for (const e of entries) {
        for (const l of e.lines || []) {
          if (!cashIds.has(l.account_id)) continue;
          const counter = (e.lines || []).find(x => x.account_id !== l.account_id);
          const debit = Number(l.debit || 0);
          const credit = Number(l.credit || 0);
          if (debit <= 0 && credit <= 0) continue;
          out.push({
            id: `${e.id}-${l.account_id}`,
            date: e.entry_date,
            number: e.number,
            direction: debit > 0 ? 'in' : 'out',
            description: l.description || e.description,
            counterAccount: counter ? `${counter.account_code} ${counter.account_name}` : '—',
            amount: debit > 0 ? debit : credit,
            wallet: l.account_name,
          });
        }
      }
      setMovements(out.sort((a, b) => b.date.localeCompare(a.date)));
    } catch { setMovements([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => movements
    .filter(m => `${m.description} ${m.wallet} ${m.number}`.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter(m => filterDirection === 'all' || m.direction === filterDirection), [movements, debouncedSearch, filterDirection]);

  const paginated = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterDirection]);

  const totalIn = filtered.filter(m => m.direction === 'in').reduce((s, m) => s + m.amount, 0);
  const totalOut = filtered.filter(m => m.direction === 'out').reduce((s, m) => s + m.amount, 0);
  const netCash = totalIn - totalOut;
  const closingBalance = accounts
    .filter(a => a.type === 'asset' && !a.is_group &&
      /نقد|نقدية|صندوق|بنك|كاش|محفظة|محفظه|cash|bank|wallet/i.test(`${a.code} ${a.name}`))
    .reduce((s, a) => s + a.opening_balance + (a.debit_balance - a.credit_balance), 0);

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportCSV = () => {
    const headers = ['Date', 'Entry', 'Direction', 'Wallet', 'Counter Account', 'Description', 'Amount'];
    const rows = filtered.map(m => [m.date, m.number, m.direction === 'in' ? 'IN' : 'OUT', m.wallet, m.counterAccount, m.description, m.amount]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cashflow.csv';
    link.click();
  };


  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <ArrowRightLeft size={24} className="text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">التدفق النقدي</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">حركات النقدية الحقيقية من القيود المرحَّلة على حسابات النقد والبنوك</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGuideOpen(true)} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" title="دليل"><Info size={16} /></button>
          <button onClick={exportCSV} disabled={!filtered.length} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 disabled:opacity-50">
            <Download size={16} /> تصدير CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-right">
          <span className="text-slate-500 font-semibold text-xs flex items-center gap-1"><ArrowDownToLine size={12} className="text-emerald-500" /> داخِل</span>
          <div className="text-lg font-black text-emerald-600 mt-1">ج.م {fmt(totalIn)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-right">
          <span className="text-slate-500 font-semibold text-xs flex items-center gap-1"><ArrowUpFromLine size={12} className="text-rose-500" /> خارِج</span>
          <div className="text-lg font-black text-rose-600 mt-1">ج.م {fmt(totalOut)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-right">
          <span className="text-slate-500 font-semibold text-xs">صافي التدفق</span>
          <div className={`text-lg font-black mt-1 ${netCash >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>ج.م {fmt(netCash)}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-right">
          <span className="text-slate-500 font-semibold text-xs">الرصيد الختامي (دفتر الأستاذ)</span>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={26} className="animate-spin text-slate-400" /></div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowRightLeft size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 font-bold text-sm">لا توجد حركات نقدية مرحَّلة — سجل مصروفًا أو رحِّل فاتورة لتظهر الحركة هنا</p>
          </div>
        ) : (
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-black text-slate-500">
                <th className="p-4 text-right">التاريخ</th>
                <th className="p-4 text-right">القيد</th>
                <th className="p-4 text-right">النوع</th>
                <th className="p-4 text-right">المحفظة</th>
                <th className="p-4 text-right">الطرف المقابل</th>
                <th className="p-4 text-right">البيان</th>
                <th className="p-4 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(m => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-600 text-sm">{new Date(m.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4 font-mono text-xs font-bold text-slate-500">{m.number}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${m.direction === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {m.direction === 'in' ? 'داخل' : 'خارج'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-800 text-sm">{m.wallet}</td>
                  <td className="p-4 text-slate-500 text-sm">{m.counterAccount}</td>
                  <td className="p-4 text-slate-600 text-sm max-w-xs truncate">{m.description}</td>
                  <td className={`p-4 text-left font-black ${m.direction === 'in' ? 'text-emerald-600' : 'text-rose-600'}`} dir="ltr">
                    {m.direction === 'in' ? '+' : '−'}{fmt(m.amount)} EGP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold disabled:opacity-40">السابق</button>
          <span className="text-sm font-bold text-slate-500">{currentPage} / {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold disabled:opacity-40">التالي</button>
        </div>
      )}

      {/* Guide Modal */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setGuideOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل التدفق النقدي</h2>
              <button onClick={() => setGuideOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4 text-right text-sm text-slate-600 leading-relaxed">
              <p><strong>مصدر البيانات:</strong> كل سطر في القيود المرحَّلة يمس حساب نقدي (صندوق / بنك / محفظة) يظهر هنا كحركة.</p>
              <p><strong>داخِل / خارِج:</strong> مدين على حساب نقدي = نقد داخِل، دائن = نقد خارِج — وفق القيد المزدوج.</p>
              <p><strong>الرصيد الختامي:</strong> نفس رصيد حسابات النقدية في شجرة الحسابات وميزان المراجعة وميزانية المراكز — أرقام متطابقة دائمًا.</p>
              <p><strong>الربط:</strong> أي مصروف من صفحة المصروفات أو تحصيل/سداد من المدفوعات يظهر هنا تلقائيًا.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

          <div className="text-lg font-black text-emerald-700 mt-1">ج.م {fmt(closingBalance)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالبيان أو المحفظة..." className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium" />
        </div>
        <select value={filterDirection} onChange={e => setFilterDirection(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold bg-white">
          <option value="all">الكل</option>
          <option value="in">داخل فقط</option>
          <option value="out">خارج فقط</option>
        </select>
      </div>
