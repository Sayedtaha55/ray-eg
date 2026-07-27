import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Pencil, X, Wallet, TrendingUp, TrendingDown, Tag } from 'lucide-react';

type ExpenseCategory = 'rent' | 'utilities' | 'salaries' | 'supplies' | 'marketing' | 'maintenance' | 'transport' | 'equipment' | 'booking_fees' | 'misc' | 'other';

type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  createdAt: number;
};

type Props = {
  shopId: string;
  shop?: any;
  reservations?: any[];
  sales?: any[];
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  rent: '#8B5CF6',
  utilities: '#00E5FF',
  salaries: '#10B981',
  supplies: '#F59E0B',
  marketing: '#EC4899',
  maintenance: '#6366F1',
  transport: '#14B8A6',
  equipment: '#3B82F6',
  booking_fees: '#F97316',
  misc: '#94A3B8',
  other: '#A78BFA',
};

const STORAGE_PREFIX = 'shop_expenses_';

const ExpensesTab: React.FC<Props> = ({ shopId, shop, reservations, sales }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [range, setRange] = useState<'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months'>('thisMonth');
  const [recharts, setRecharts] = useState<any>(null);
  const [form, setForm] = useState({ category: 'rent' as ExpenseCategory, amount: '', description: '', date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('recharts');
        if (cancelled) return;
        setRecharts(mod);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + shopId);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setExpenses(parsed);
      }
    } catch {}
  }, [shopId]);

  const saveToStorage = (list: Expense[]) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + shopId, JSON.stringify(list));
    } catch {}
  };

  const now = new Date();
  const rangeStart = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    if (range === 'thisMonth') {
      d.setDate(1);
    } else if (range === 'lastMonth') {
      d.setDate(1);
      d.setMonth(d.getMonth() - 1);
    } else if (range === 'last3Months') {
      d.setDate(1);
      d.setMonth(d.getMonth() - 2);
    } else {
      d.setDate(1);
      d.setMonth(d.getMonth() - 5);
    }
    return d;
  }, [range]);

  const rangeEnd = useMemo(() => {
    if (range === 'lastMonth') {
      const d = new Date(rangeStart);
      d.setMonth(d.getMonth() + 1);
      d.setDate(0);
      d.setHours(23, 59, 59, 999);
      return d;
    }
    return new Date(now);
  }, [range, rangeStart]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        const ts = new Date(e.date).getTime();
        return ts >= rangeStart.getTime() && ts <= rangeEnd.getTime();
      })
      .filter((e) => filterCategory === 'all' || e.category === filterCategory)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [expenses, rangeStart, rangeEnd, filterCategory]);

  const totalThisMonth = useMemo(() => {
    const d = new Date(now);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return expenses
      .filter((e) => new Date(e.date).getTime() >= d.getTime())
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalLastMonth = useMemo(() => {
    const d = new Date(now);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    const prevEnd = new Date(d);
    d.setMonth(d.getMonth() - 1);
    return expenses
      .filter((e) => {
        const ts = new Date(e.date).getTime();
        return ts >= d.getTime() && ts < prevEnd.getTime();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const monthlyAverage = useMemo(() => {
    if (expenses.length === 0) return 0;
    const months: Record<string, number> = {};
    for (const e of expenses) {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months[key] = (months[key] || 0) + e.amount;
    }
    const values = Object.values(months);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }, [expenses]);

  const currentMonthRevenue = useMemo(() => {
    const d = new Date(now);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    const startTs = d.getTime();
    const safeSales = Array.isArray(sales) ? sales : [];
    const safeReservations = Array.isArray(reservations) ? reservations : [];
    const successfulStatuses = new Set(['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED']);
    const salesRev = safeSales
      .filter((s: any) => {
        const ts = new Date(s.created_at || s.createdAt || 0).getTime();
        return ts >= startTs && successfulStatuses.has(String(s?.status || '').toUpperCase());
      })
      .reduce((sum: number, s: any) => sum + Number(s.total || 0), 0);
    const bookingRev = safeReservations
      .filter((r: any) => {
        const st = String(r?.status || '').trim().toUpperCase();
        const ts = new Date(r.created_at || r.createdAt || 0).getTime();
        return ts >= startTs && (st === 'COMPLETED' || st === 'COMPLETEDRESERVATION');
      })
      .reduce((sum: number, r: any) => sum + Number(r.itemPrice || r.item_price || 0), 0);
    return salesRev + bookingRev;
  }, [sales, reservations]);

  const netProfit = currentMonthRevenue - totalThisMonth;
  const profitMargin = currentMonthRevenue > 0 ? (netProfit / currentMonthRevenue) * 100 : 0;

  const byCategory = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      rent: 0, utilities: 0, salaries: 0, supplies: 0, marketing: 0, maintenance: 0, transport: 0, equipment: 0, booking_fees: 0, misc: 0, other: 0,
    };
    for (const e of filteredExpenses) {
      map[e.category] += e.amount;
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ category: k as ExpenseCategory, label: t(`business.expenses.categories.${k}`), amount: v, color: CATEGORY_COLORS[k as ExpenseCategory] }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, t]);

  const highestCategory = byCategory[0];

  const monthlyTrendData = useMemo(() => {
    const months: Record<string, number> = {};
    const dStart = new Date(now);
    dStart.setDate(1);
    dStart.setHours(0, 0, 0, 0);
    dStart.setMonth(dStart.getMonth() - 5);
    for (let i = 0; i < 6; i++) {
      const d = new Date(dStart);
      d.setMonth(dStart.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = 0;
    }
    for (const e of expenses) {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (typeof months[key] === 'number') months[key] += e.amount;
    }
    return Object.keys(months).sort().map((key) => {
      const [y, m] = key.split('-');
      const d = new Date(Number(y), Number(m) - 1);
      return {
        name: d.toLocaleDateString(locale, { month: 'short' }),
        amount: Math.round(months[key] || 0),
      };
    });
  }, [expenses]);

  const monthGrowth = totalLastMonth > 0 ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0;

  const handleSubmit = () => {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return;
    if (editingId) {
      const updated = expenses.map((e) =>
        e.id === editingId
          ? { ...e, category: form.category, amount, description: form.description, date: form.date }
          : e
      );
      setExpenses(updated);
      saveToStorage(updated);
    } else {
      const newExpense: Expense = {
        id: `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        category: form.category,
        amount,
        description: form.description,
        date: form.date,
        createdAt: Date.now(),
      };
      const updated = [...expenses, newExpense];
      setExpenses(updated);
      saveToStorage(updated);
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ category: 'rent', amount: '', description: '', date: new Date().toISOString().slice(0, 10) });
  };

  const handleEdit = (e: Expense) => {
    setEditingId(e.id);
    setForm({ category: e.category, amount: String(e.amount), description: e.description, date: e.date });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('business.expenses.deleteConfirm'))) return;
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveToStorage(updated);
  };

  const R = recharts;

  const categoryChart = useMemo(() => {
    if (!R || byCategory.length === 0) return null;
    const { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } = R;
    return (
      <ResponsiveContainer width="100%" height={300} minWidth={300}>
        <PieChart>
          <Pie data={byCategory} dataKey="amount" nameKey="label" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2}>
            {byCategory.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [R, byCategory]);

  const trendChart = useMemo(() => {
    if (!R) return null;
    const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = R;
    return (
      <ResponsiveContainer width="100%" height={280} minWidth={300}>
        <BarChart data={monthlyTrendData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
          <Bar dataKey="amount" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={window.innerWidth < 768 ? 24 : 40} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [R, monthlyTrendData]);

  const rangeOptions = [
    { key: 'thisMonth' as const, label: t('business.expenses.thisMonth') },
    { key: 'lastMonth' as const, label: t('business.expenses.lastMonth') },
    { key: 'last3Months' as const, label: t('business.expenses.last3Months') },
    { key: 'last6Months' as const, label: t('business.expenses.last6Months') },
  ];

  const categoryOptions: ExpenseCategory[] = ['rent', 'utilities', 'salaries', 'supplies', 'marketing', 'maintenance', 'transport', 'equipment', 'booking_fees', 'misc', 'other'];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-black flex items-center gap-2">
              <Wallet size={22} className="text-indigo-500" />
              {t('business.expenses.title')}
            </h3>
            <p className="text-slate-400 text-xs font-bold mt-1">{t('business.expenses.subtitle')}</p>
          </div>
          <button
            onClick={() => { setEditingId(null); setForm({ category: 'rent', amount: '', description: '', date: new Date().toISOString().slice(0, 10) }); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition-all shadow-md whitespace-nowrap"
          >
            <Plus size={18} />
            {t('business.expenses.addExpense')}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-7 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-indigo-500" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.expenses.totalThisMonth')}</p>
          </div>
          <span className="text-2xl font-black">{t('business.expenses.currency')} {Math.round(totalThisMonth).toLocaleString()}</span>
          {totalLastMonth > 0 && (
            <span className={`text-xs font-bold ml-2 ${monthGrowth >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {monthGrowth >= 0 ? '+' : ''}{Math.round(monthGrowth)}%
            </span>
          )}
        </div>
        <div className="bg-white p-5 md:p-7 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-slate-400" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.expenses.totalLastMonth')}</p>
          </div>
          <span className="text-2xl font-black">{t('business.expenses.currency')} {Math.round(totalLastMonth).toLocaleString()}</span>
        </div>
        <div className="bg-white p-5 md:p-7 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-cyan-500" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.expenses.monthlyAverage')}</p>
          </div>
          <span className="text-2xl font-black">{t('business.expenses.currency')} {Math.round(monthlyAverage).toLocaleString()}</span>
        </div>
        <div className="bg-white p-5 md:p-7 rounded-[2rem] border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Tag size={16} className="text-purple-500" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.expenses.highestCategory')}</p>
          </div>
          <span className="text-sm font-black truncate block">{highestCategory?.label || '—'}</span>
          <span className="text-xs text-slate-400 font-bold">{t('business.expenses.currency')} {Math.round(highestCategory?.amount || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Financial context: Revenue, Net Profit, Profit Margin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-cyan-600" />
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.expenses.revenue')}</p>
          </div>
          <span className="text-2xl font-black text-slate-900">{t('business.expenses.currency')} {Math.round(currentMonthRevenue).toLocaleString()}</span>
          <p className="text-[10px] text-slate-400 font-bold mt-1">{t('business.expenses.totalThisMonth')}</p>
        </div>
        <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] border shadow-sm ${netProfit >= 0 ? 'border-emerald-100' : 'border-red-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              {netProfit >= 0 ? <TrendingUp size={18} className="text-emerald-600" /> : <TrendingDown size={18} className="text-red-500" />}
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.expenses.netProfit')}</p>
          </div>
          <span className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{t('business.expenses.currency')} {Math.round(netProfit).toLocaleString()}</span>
          <p className="text-[10px] text-slate-400 font-bold mt-1">{t('business.expenses.netProfitDesc')}</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Wallet size={18} className="text-indigo-500" />
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{t('business.expenses.profitMargin')}</p>
          </div>
          <span className={`text-2xl font-black ${profitMargin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{profitMargin.toFixed(1)}%</span>
          <p className="text-[10px] text-slate-400 font-bold mt-1">{t('business.expenses.vsLastMonth')}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-lg font-black mb-1">{t('business.expenses.byCategory')}</h4>
          <p className="text-slate-400 text-xs font-bold mb-6">{t('business.expenses.subtitle')}</p>
          {byCategory.length === 0 ? (
            <div className="py-12 text-center text-slate-300 font-bold">{t('business.expenses.noData')}</div>
          ) : categoryChart}
        </div>
        <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
          <h4 className="text-lg font-black mb-1">{t('business.expenses.monthlyTrend')}</h4>
          <p className="text-slate-400 text-xs font-bold mb-6">{t('business.expenses.last6Months')}</p>
          {trendChart}
        </div>
      </div>

      {/* Range selector + filter */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h4 className="text-lg font-black">{t('business.expenses.recentExpenses')}</h4>
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setRange(opt.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold ${range === opt.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filterCategory === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}
          >
            {t('business.expenses.allCategories')}
          </button>
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${filterCategory === cat ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}
            >
              {t(`business.expenses.categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* Expenses list */}
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-300 font-bold">{t('business.expenses.noExpenses')}</div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${CATEGORY_COLORS[e.category]}20` }}>
                  <Tag size={16} style={{ color: CATEGORY_COLORS[e.category] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-700 truncate">{e.description || t(`business.expenses.categories.${e.category}`)}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md" style={{ backgroundColor: `${CATEGORY_COLORS[e.category]}20`, color: CATEGORY_COLORS[e.category] }}>
                      {t(`business.expenses.categories.${e.category}`)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">{new Date(e.date).toLocaleDateString(locale)}</span>
                </div>
                <span className="font-black text-sm text-slate-800 shrink-0">{t('business.expenses.currency')} {e.amount.toLocaleString()}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(e)} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                    <Pencil size={14} className="text-slate-400" />
                  </button>
                  <button onClick={() => handleDelete(e.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 w-full max-w-md shadow-2xl" onClick={(ev) => ev.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black">{editingId ? t('business.expenses.editExpense') : t('business.expenses.addExpense')}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('business.expenses.category')}</label>
                <select
                  value={form.category}
                  onChange={(ev) => setForm({ ...form, category: ev.target.value as ExpenseCategory })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{t(`business.expenses.categories.${cat}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('business.expenses.amount')}</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(ev) => setForm({ ...form, amount: ev.target.value })}
                  placeholder={t('business.expenses.amountPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('business.expenses.description')}</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(ev) => setForm({ ...form, description: ev.target.value })}
                  placeholder={t('business.expenses.descriptionPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">{t('business.expenses.date')}</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(ev) => setForm({ ...form, date: ev.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-black text-sm hover:bg-slate-200 transition-colors">
                {t('business.expenses.cancel')}
              </button>
              <button onClick={handleSubmit} className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 transition-colors">
                {t('business.expenses.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;
