'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CreditCard, Search, Loader2, Plus, Edit, Trash2, X, Receipt, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Account = {
  id: string; code: string; name: string; type: string;
  parent_id: string | null; is_group: boolean; is_system: boolean;
  opening_balance: number; status: string;
  debit_balance: number; credit_balance: number;
};

type JLine = { account_id: string; account_code: string; account_name: string; description: string; debit: number; credit: number };
type Entry = {
  id: string; number: string; entry_date: string; description: string;
  reference: string; status: string; total_debit: number; lines: JLine[];
};

type ExpenseRow = {
  id: string; number: string; date: string; description: string;
  category: string; accountName: string; amount: number; payFrom: string; status: string;
};

export default function ExpensesPage() {
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [shopId, setShopId] = useState('');
  const [form, setForm] = useState({ expenseAccountId: '', payFromAccountId: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', reference: '' });

  const expenseAccounts = useMemo(() => accounts.filter(a => a.type === 'expense' && !a.is_group && a.status === 'active'), [accounts]);
  const cashAccounts = useMemo(() => accounts.filter(a => a.type === 'asset' && !a.is_group && a.status === 'active'
    && /نقد|نقدية|صندوق|بنك|كاش|محفظة|محفظه|cash|bank|wallet/i.test(`${a.code} ${a.name}`)), [accounts]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      setShopId(sid);
      const [accRes, jeRes] = await Promise.all([
        apiRequest(`/accounting/accounts/shop/${sid}`),
        apiRequest(`/accounting/journal/shop/${sid}?status=posted`),
      ]);
      const accData: Account[] = Array.isArray(accRes) ? accRes : (accRes?.data || []);
      const entries: Entry[] = Array.isArray(jeRes) ? jeRes : (jeRes?.data || []);
      setAccounts(accData);
      const expenseIds = new Set(accData.filter(a => a.type === 'expense').map(a => a.id));
      const out: ExpenseRow[] = [];
      for (const e of entries) {
        for (const l of e.lines || []) {
          if (expenseIds.has(l.account_id) && Number(l.debit) > 0) {
            const counter = (e.lines || []).find(x => x.account_id !== l.account_id);
            out.push({
              id: `${e.id}-${l.account_id}`, number: e.number, date: e.entry_date,
              description: l.description || e.description, category: l.account_name, accountName: l.account_name,
              amount: Number(l.debit), payFrom: counter ? `${counter.account_code} ${counter.account_name}` : '—', status: e.status,
            });
          }
        }
      }
      setRows(out.sort((a, b) => b.date.localeCompare(a.date)));
    } catch { setRows([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => rows
    .filter(r => `${r.description} ${r.category} ${r.number}`.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter(r => filterCategory === 'all' || r.category === filterCategory), [rows, debouncedSearch, filterCategory]);

  const paginated = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  useEffect(() => setCurrentPage(1), [debouncedSearch, filterCategory]);

  const totalExpenses = filtered.reduce((s, r) => s + r.amount, 0);
  const thisMonth = filtered.filter(r => r.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, r) => s + r.amount, 0);

  const save = async () => {
    if (!form.expenseAccountId || !form.payFromAccountId || form.amount <= 0 || !form.description) {
      setError('أكمل البند، جهة الدفع، المبلغ، والبيان'); return;
    }
    if (form.expenseAccountId === form.payFromAccountId) { setError('اختر حسابين مختلفين'); return; }
    setSaving(true); setError('');
    try {
      const created = await apiRequest(`/accounting/journal/shop/${shopId}`, {
        method: 'POST',
        body: JSON.stringify({
          entry_date: form.date, description: form.description, reference: form.reference || 'EXPENSE',
          lines: [
            { account_id: form.expenseAccountId, debit: Number(form.amount), credit: 0, description: form.description },

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center"><CreditCard size={24} className="text-[#00E5FF]" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المصروفات</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">كل مصروف = قيد محاسبي (مدين على المصروف، دائن على النقدية)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { window.location.href = '/dashboard/finance/journal'; }} className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200"><BookOpen size={16} /> دفتر اليومية</button>
          <button onClick={() => { setError(''); setModal(true); }} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-black"><Plus size={16} /> مصروف جديد</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي المصروفات', val: `ج.م ${fmt(totalExpenses)}` },
          { label: 'مصروفات الشهر', val: `ج.م ${fmt(thisMonth)}` },
          { label: 'عدد القيود', val: String(filtered.length) },
          { label: 'بنود المصروفات', val: String(expenseAccounts.length) },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-right">
            <span className="text-slate-500 font-semibold text-xs">{s.label}</span>
            <div className="text-lg font-black text-slate-900 mt-1">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالبيان أو البند..." className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold bg-white">
          <option value="all">كل البنود</option>
          {expenseAccounts.map(a => <option key={a.id} value={a.name}>{a.code} — {a.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 size={26} className="animate-spin text-slate-400" /></div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 font-bold text-sm">لا توجد مصروفات مسجلة — أضف أول مصروف</p>
          </div>
        ) : (
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-black text-slate-500">
                <th className="p-4 text-right">التاريخ</th>
                <th className="p-4 text-right">رقم القيد</th>
                <th className="p-4 text-right">البيان</th>
                <th className="p-4 text-right">بند المصروف</th>
                <th className="p-4 text-right">دُفع من</th>
                <th className="p-4 text-left">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(r => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-600 text-sm">{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4 font-mono text-xs font-bold text-slate-500">{r.number}</td>
                  <td className="p-4 font-bold text-slate-800 text-sm max-w-xs truncate">{r.description}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-lg text-[10px] font-black bg-rose-50 text-rose-700">{r.category}</span></td>
                  <td className="p-4 text-slate-600 text-sm">{r.payFrom}</td>
                  <td className="p-4 text-left font-black text-rose-600">ج.م {fmt(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

            { account_id: form.payFromAccountId, debit: 0, credit: Number(form.amount), description: form.description },
          ],
        }),
      });
      const newId = created?.data?.id || created?.id;
      if (newId) await apiRequest(`/accounting/journal/${newId}/post`, { method: 'POST' });
      setModal(false);
      await load();
    } catch (e: any) { setError(e?.message || 'تعذر حفظ المصروف'); } finally { setSaving(false); }
  };

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
