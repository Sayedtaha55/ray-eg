'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Wallet, Search, Loader2, Plus, Edit, X, Landmark, Smartphone, Banknote, CreditCard, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Account = {
  id: string; code: string; name: string; type: string;
  parent_id: string | null; is_group: boolean; is_system: boolean;
  opening_balance: number; status: string;
  debit_balance: number; credit_balance: number;
};

function kindOf(a: Account): 'cash' | 'bank' | 'wallet' | 'other' {
  const s = `${a.code} ${a.name}`;
  if (/بنك|bank|جاري/i.test(s)) return 'bank';
  if (/محفظة|محفظه|فودافون|اتصالات|أورانج|اورانج|انستاباي|insta|vodafone|etisalat|wallet/i.test(s)) return 'wallet';
  if (/نقد|صندوق|كاش|cash/i.test(s)) return 'cash';
  return 'other';
}

const KIND_META: Record<string, { label: string; icon: any; cls: string }> = {
  cash: { label: 'نقدية / صندوق', icon: Banknote, cls: 'bg-emerald-100 text-emerald-700' },
  bank: { label: 'حساب بنكي', icon: Landmark, cls: 'bg-blue-100 text-blue-700' },
  wallet: { label: 'محفظة إلكترونية', icon: Smartphone, cls: 'bg-purple-100 text-purple-700' },
  other: { label: 'أصل نقدي آخر', icon: CreditCard, cls: 'bg-slate-100 text-slate-600' },
};

export default function WalletsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterKind, setFilterKind] = useState('all');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editItem, setEditItem] = useState<Account | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [shopId, setShopId] = useState('');
  const [form, setForm] = useState({ name: '', opening_balance: 0 });

  const balanceOf = (a: Account) => a.opening_balance + (a.debit_balance - a.credit_balance);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      setShopId(sid);
      const res = await apiRequest(`/accounting/accounts/shop/${sid}`);
      const data: Account[] = Array.isArray(res) ? res : (res?.data || []);
      setAccounts(data);
    } catch { setAccounts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const wallets = useMemo(() => accounts.filter(a => a.type === 'asset' && !a.is_group && a.status === 'active'), [accounts]);
  const filtered = useMemo(() => wallets
    .filter(w => `${w.code} ${w.name}`.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .filter(w => filterKind === 'all' || kindOf(w) === filterKind), [wallets, debouncedSearch, filterKind]);
  const cashGroup = accounts.find(a => a.type === 'asset' && a.is_group && /نقد|صندوق|بنك|cash|bank/i.test(`${a.code} ${a.name}`))
    || accounts.find(a => a.type === 'asset' && a.is_group);
  const totalBalance = filtered.reduce((s, w) => s + balanceOf(w), 0);

  const openAdd = () => { setForm({ name: '', opening_balance: 0 }); setEditItem(null); setError(''); setModal('add'); };
  const openEdit = (w: Account) => { setForm({ name: w.name, opening_balance: w.opening_balance }); setEditItem(w); setError(''); setModal('edit'); };

  const save = async () => {
    if (!form.name) { setError('أدخل اسم المحفظة'); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'edit' && editItem) {
        await apiRequest(`/accounting/accounts/${editItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: form.name, status: editItem.status }),
        });
      } else {
        const base = parseInt(cashGroup?.code || '1100', 10) || 1100;
        const used = new Set(accounts.map(a => parseInt(a.code, 10) || 0));
        let candidate = base * 10 + 1;
        while (used.has(candidate)) candidate++;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center"><Wallet size={24} className="text-[#00E5FF]" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المحافظ والنقدية</h1>
            <p className="text-sm font-bold text-slate-400 mt-1">حسابات النقدية والبنوك والمحافظ — أرصدة حقيقية من دفتر الأستاذ</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-black"><Plus size={16} /> محفظة جديدة</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-right">
          <span className="text-slate-500 font-semibold text-xs">إجمالي النقدية</span>
          <div className="text-xl font-black text-slate-900 mt-1">ج.م {fmt(totalBalance)}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-right">
          <span className="text-slate-500 font-semibold text-xs">عدد المحافظ</span>
          <div className="text-xl font-black text-slate-900 mt-1">{filtered.length}</div>
        </div>
        {(['cash', 'bank'] as const).map(k => (
          <div key={k} className="bg-white rounded-xl border border-slate-200 p-4 text-right">
            <span className="text-slate-500 font-semibold text-xs">{KIND_META[k].label}</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              ج.م {fmt(filtered.filter(w => kindOf(w) === k).reduce((s, w) => s + balanceOf(w), 0))}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث باسم المحفظة..." className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium" />
        </div>
        <select value={filterKind} onChange={e => setFilterKind(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold bg-white">
          <option value="all">كل الأنواع</option>
          {Object.entries(KIND_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 flex items-center justify-center py-16"><Loader2 size={26} className="animate-spin text-slate-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Wallet size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد محافظ — أضف صندوق نقدي أو حساب بنكي للبدء</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(w => {
            const Meta = KIND_META[kindOf(w)];
            const Icon = Meta.icon;
            const bal = balanceOf(w);
            return (
              <div key={w.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${Meta.cls}`}><Icon size={18} /></div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">{w.name}</div>
                      <div className="text-[11px] font-bold text-slate-400 font-mono" dir="ltr">{w.code}</div>
                    </div>
                  </div>
                  <button onClick={() => openEdit(w)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="تعديل"><Edit size={14} /></button>
                </div>
                <div className="mt-4">
                  <div className="text-xs font-bold text-slate-400">الرصيد الحالي</div>
                  <div className={`text-2xl font-black mt-1 ${bal < 0 ? 'text-rose-600' : 'text-slate-900'}`} dir="ltr">{fmt(bal)} EGP</div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span className={`px-2 py-0.5 rounded-lg ${Meta.cls}`}>{Meta.label}</span>
                  {w.is_system && <span className="text-slate-400">حساب أساسي</span>}
                </div>
              </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">{modal === 'edit' ? 'تعديل محفظة' : 'محفظة جديدة'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
            </div>
            {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">{error}</div>}
            <div>
              <label className="text-xs font-black text-slate-600 block mb-1">اسم المحفظة</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: صندوق الفرع / فودافون كاش" className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold" />
            </div>
            {modal === 'add' && (
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1">الرصيد الافتتاحي</label>
                <input type="number" value={form.opening_balance} onChange={e => setForm({ ...form, opening_balance: Number(e.target.value) })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold" dir="ltr" />
              </div>
            )}
            {modal === 'edit' && editItem && (
              <p className="text-xs font-bold text-slate-500 bg-slate-50 rounded-xl p-3">
                الأرصدة تُحدَّث تلقائيًا من القيود المحاسبية — لتغيير الرصيد استخدم قيدًا في دفتر اليومية.
              </p>
            )}
            <button onClick={save} disabled={saving || !form.name} className="w-full bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {modal === 'edit' ? 'حفظ التعديلات' : 'إضافة المحفظة'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

            );
          })}
        </div>
      )}

        await apiRequest(`/accounting/accounts/shop/${shopId}`, {
          method: 'POST',
          body: JSON.stringify({ code: String(candidate), name: form.name, type: 'asset', parent_id: cashGroup?.id || null, is_group: false, opening_balance: Number(form.opening_balance) || 0 }),
        });
      }
      setModal(null);
      await load();
    } catch (e: any) { setError(e?.message || 'تعذر الحفظ'); } finally { setSaving(false); }
  };

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
