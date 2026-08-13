import React, { useEffect, useMemo, useState } from 'react';
import {
  MousePointerClick, Target, TrendingUp, TrendingDown, Filter, ShoppingCart,
  Download, Calendar, Search, X, ArrowUpRight, ArrowDownRight, Zap, Award,
  Eye, CreditCard, Package, RefreshCw, CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '@/services/api.service';

type Props = { shopId: string; shop?: any };

type FunnelStage = {
  id: string;
  label: string;
  labelAr: string;
  visitors: number;
  icon: React.ReactNode;
  color: string;
};

type Goal = {
  id: string;
  name: string;
  nameAr: string;
  conversions: number;
  visitors: number;
  rate: number;
  target: number;
  status: 'on-track' | 'at-risk' | 'behind';
};

type ConversionSource = {
  id: string;
  source: string;
  sourceAr: string;
  visits: number;
  conversions: number;
  rate: number;
  revenue: number;
  trend: number;
};

type TimelinePoint = { day: string; rate: number; conversions: number };

const DEFAULT_FUNNEL: FunnelStage[] = [
  { id: 'visit', label: 'Visits', labelAr: 'الزيارات', visitors: 12500, icon: <Eye size={18} />, color: 'bg-blue-500' },
  { id: 'product', label: 'Product Views', labelAr: 'مشاهدات المنتجات', visitors: 8200, icon: <Package size={18} />, color: 'bg-indigo-500' },
  { id: 'cart', label: 'Add to Cart', labelAr: 'إضافة للسلة', visitors: 3100, icon: <ShoppingCart size={18} />, color: 'bg-purple-500' },
  { id: 'checkout', label: 'Checkout', labelAr: 'الدفع', visitors: 1640, icon: <CreditCard size={18} />, color: 'bg-amber-500' },
  { id: 'purchase', label: 'Purchase', labelAr: 'إتمام الشراء', visitors: 980, icon: <CheckCircle2 size={18} />, color: 'bg-green-500' },
];

const DEFAULT_GOALS: Goal[] = [
  { id: 'g1', name: 'Checkout Completion', nameAr: 'إتمام الدفع', conversions: 980, visitors: 1640, rate: 59.8, target: 65, status: 'at-risk' },
  { id: 'g2', name: 'Add to Cart', nameAr: 'إضافة للسلة', conversions: 3100, visitors: 8200, rate: 37.8, target: 35, status: 'on-track' },
  { id: 'g3', name: 'Newsletter Signup', nameAr: 'اشتراك النشرة', conversions: 540, visitors: 12500, rate: 4.3, target: 6, status: 'behind' },
  { id: 'g4', name: 'First Purchase', nameAr: 'أول عملية شراء', conversions: 234, visitors: 12500, rate: 1.9, target: 1.5, status: 'on-track' },
];

const DEFAULT_SOURCES: ConversionSource[] = [
  { id: 's1', source: 'Google Ads', sourceAr: 'إعلانات جوجل', visits: 3200, conversions: 285, rate: 8.9, revenue: 14250, trend: 12.4 },
  { id: 's2', source: 'Organic Search', sourceAr: 'بحث طبيعي', visits: 4100, conversions: 312, rate: 7.6, revenue: 15600, trend: 5.2 },
  { id: 's3', source: 'Instagram', sourceAr: 'إنستجرام', visits: 2400, conversions: 168, rate: 7.0, revenue: 8400, trend: -3.1 },
  { id: 's4', source: 'Facebook', sourceAr: 'فيسبوك', visits: 1800, conversions: 121, rate: 6.7, revenue: 6050, trend: 8.7 },
  { id: 's5', source: 'Email', sourceAr: 'البريد', visits: 1000, conversions: 94, rate: 9.4, revenue: 4700, trend: 2.1 },
];

const DEFAULT_TIMELINE: TimelinePoint[] = [
  { day: 'Sat', rate: 7.2, conversions: 120 },
  { day: 'Sun', rate: 7.8, conversions: 135 },
  { day: 'Mon', rate: 6.9, conversions: 118 },
  { day: 'Tue', rate: 8.1, conversions: 142 },
  { day: 'Wed', rate: 7.5, conversions: 128 },
  { day: 'Thu', rate: 8.4, conversions: 150 },
  { day: 'Fri', rate: 7.9, conversions: 187 },
];

const STATUS_STYLES: Record<Goal['status'], { en: string; ar: string; cls: string; dot: string }> = {
  'on-track': { en: 'On Track', ar: 'على المسار', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'at-risk': { en: 'At Risk', ar: 'معرض للخطر', cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  'behind': { en: 'Behind', ar: 'متأخر', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const ConversionsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [funnel, setFunnel] = useState<FunnelStage[]>(DEFAULT_FUNNEL);
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [sources, setSources] = useState<ConversionSource[]>(DEFAULT_SOURCES);
  const [timeline, setTimeline] = useState<TimelinePoint[]>(DEFAULT_TIMELINE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  useEffect(() => {
    const sid = String(shopId || '').trim();
    if (!sid) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res: any = await ApiService.getConversionsAnalytics(sid, { period });
        if (cancelled || !res) return;
        const data = res.data ?? res;
        if (Array.isArray(data?.funnel) && data.funnel.length) {
          setFunnel(
            data.funnel.map((s: any) => ({
              id: String(s.id || ''),
              label: String(s.label || ''),
              labelAr: String(s.label_ar || s.labelAr || s.label || ''),
              visitors: Number(s.visitors || 0),
              icon: <Eye size={18} />,
              color: 'bg-blue-500',
            })),
          );
        }
        if (Array.isArray(data?.goals)) {
          setGoals(
            data.goals.map((g: any) => ({
              id: String(g.id || ''),
              name: String(g.name || ''),
              nameAr: String(g.name_ar || g.nameAr || g.name || ''),
              conversions: Number(g.conversions || 0),
              visitors: Number(g.visitors || 0),
              rate: Number(g.rate || 0),
              target: Number(g.target || 0),
              status: (String(g.status || 'behind') as Goal['status']),
            })),
          );
        }
        if (Array.isArray(data?.sources)) {
          setSources(
            data.sources.map((s: any) => ({
              id: String(s.id || ''),
              source: String(s.source || ''),
              sourceAr: String(s.source_ar || s.sourceAr || s.source || ''),
              visits: Number(s.visits || 0),
              conversions: Number(s.conversions || 0),
              rate: Number(s.rate || 0),
              revenue: Number(s.revenue || 0),
              trend: Number(s.trend || 0),
            })),
          );
        }
        if (Array.isArray(data?.timeline)) {
          setTimeline(
            data.timeline.map((p: any) => ({
              day: String(p.day || ''),
              rate: Number(p.rate || 0),
              conversions: Number(p.conversions || 0),
            })),
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load conversions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [shopId, period]);

  const overallRate = useMemo(() => {
    const first = funnel[0]?.visitors ?? 0;
    const last = funnel[funnel.length - 1]?.visitors ?? 0;
    return first > 0 ? (last / first) * 100 : 0;
  }, [funnel]);

  const totalConversions = funnel[funnel.length - 1]?.visitors ?? 0;
  const totalRevenue = sources.reduce((s, c) => s + c.revenue, 0);
  const avgRate = sources.reduce((s, c) => s + c.rate, 0) / (sources.length || 1);

  const filteredSources = sources.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return s.source.toLowerCase().includes(q) || s.sourceAr.includes(search);
  });

  const maxTimelineRate = Math.max(...timeline.map((p) => p.rate));

  const openCreateGoal = () => {
    setEditingGoal(null);
    setNewGoalName('');
    setNewGoalTarget('');
    setShowGoalModal(true);
  };

  const openEditGoal = (g: Goal) => {
    setEditingGoal(g);
    setNewGoalName(isArabic ? g.nameAr : g.name);
    setNewGoalTarget(String(g.target));
    setShowGoalModal(true);
  };

  const saveGoal = () => {
    const name = newGoalName.trim();
    const target = parseFloat(newGoalTarget);
    if (!name || isNaN(target) || target <= 0) return;
    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id
            ? {
                ...g,
                name: isArabic ? g.name : name,
                nameAr: isArabic ? name : g.nameAr,
                target,
                status: g.rate >= target ? 'on-track' : g.rate >= target * 0.8 ? 'at-risk' : 'behind',
              }
            : g,
        ),
      );
    } else {
      const id = `g${Date.now()}`;
      const newGoal: Goal = {
        id,
        name: isArabic ? 'New Goal' : name,
        nameAr: isArabic ? name : 'هدف جديد',
        conversions: 0,
        visitors: 0,
        rate: 0,
        target,
        status: 'behind',
      };
      setGoals((prev) => [...prev, newGoal]);
    }
    setShowGoalModal(false);
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const stats = [
    { label: isArabic ? 'معدل التحويل الإجمالي' : 'Overall Conv. Rate', value: `${overallRate.toFixed(1)}%`, change: '+1.2%', up: true, icon: <MousePointerClick size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: isArabic ? 'إجمالي التحويلات' : 'Total Conversions', value: totalConversions.toLocaleString(), change: '+8.4%', up: true, icon: <Zap size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: isArabic ? 'الإيراد من التحويلات' : 'Conv. Revenue', value: `${t('business.reports.currency')} ${totalRevenue.toLocaleString()}`, change: '+12.5%', up: true, icon: <TrendingUp size={20} />, color: 'bg-green-50 text-green-600' },
    { label: isArabic ? 'متوسط معدل المصدر' : 'Avg Source Rate', value: `${avgRate.toFixed(1)}%`, change: '-0.3%', up: false, icon: <Target size={20} />, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black flex items-center gap-2">
            <MousePointerClick size={24} className="text-blue-600" />
            {isArabic ? 'التحويلات' : 'Conversions'}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">
            {isArabic ? 'تحليل مسار التحويل والأهداف' : 'Conversion funnel & goals analysis'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                {isArabic ? (p === '7d' ? '٧ أيام' : p === '30d' ? '٣٠ يوم' : '٩٠ يوم') : p === '7d' ? '7D' : p === '30d' ? '30D' : '90D'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors">
            <Download size={14} /> {isArabic ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 mb-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${s.color}`}>{s.icon}</div>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? 'text-green-600' : 'text-red-600'}`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{s.change}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400">{s.label}</p>
            <p className="text-lg font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Funnel + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-4 flex items-center gap-2"><Filter size={16} /> {isArabic ? 'مسار التحويل' : 'Conversion Funnel'}</h4>
          <div className="space-y-3">
            {funnel.map((stage, i) => {
              const prev = i === 0 ? stage.visitors : funnel[i - 1].visitors;
              const dropOff = prev > 0 ? ((prev - stage.visitors) / prev) * 100 : 0;
              const widthPct = (stage.visitors / (funnel[0].visitors || 1)) * 100;
              return (
                <div key={stage.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg text-white ${stage.color}`}>{stage.icon}</span>
                      <span className="text-sm font-bold">{isArabic ? stage.labelAr : stage.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black">{stage.visitors.toLocaleString()}</span>
                      {i > 0 && (
                        <span className="text-xs text-red-500 mr-2">-{dropOff.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${stage.color} transition-all`} style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100">
          <h4 className="font-black mb-4 flex items-center gap-2"><TrendingUp size={16} /> {isArabic ? 'معدل التحويل الأسبوعي' : 'Weekly Conv. Rate'}</h4>
          <div className="flex items-end justify-between gap-2 h-40">
            {timeline.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-slate-500">{p.rate}%</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-400 to-blue-600 transition-all hover:from-blue-500 hover:to-blue-700"
                  style={{ height: `${(p.rate / maxTimelineRate) * 100}%` }}
                  title={`${p.conversions} ${isArabic ? 'تحويل' : 'conversions'}`}
                />
                <span className="text-xs text-slate-400 font-bold">{isArabic ? ({ Sat: 'سبت', Sun: 'أحد', Mon: 'إثنين', Tue: 'ثلاثاء', Wed: 'أربعاء', Thu: 'خميس', Fri: 'جمعة' } as any)[p.day] : p.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="p-5 rounded-2xl border border-slate-100 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-black flex items-center gap-2"><Target size={16} /> {isArabic ? 'أهداف التحويل' : 'Conversion Goals'}</h4>
          <button
            onClick={openCreateGoal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <Target size={14} /> {isArabic ? 'هدف جديد' : 'New Goal'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goals.map((g) => {
            const st = STATUS_STYLES[g.status];
            const progress = Math.min((g.rate / g.target) * 100, 100);
            return (
              <div key={g.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                    <span className="font-black text-sm">{isArabic ? g.nameAr : g.name}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.cls}`}>{isArabic ? st.ar : st.en}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 font-bold">{isArabic ? 'المعدل الحالي' : 'Current Rate'}</span>
                  <span className="text-sm font-black">{g.rate.toFixed(1)}% / {g.target}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${g.status === 'on-track' ? 'bg-green-500' : g.status === 'at-risk' ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{g.conversions.toLocaleString()} {isArabic ? 'تحويل' : 'conv.'} · {g.visitors.toLocaleString()} {isArabic ? 'زائر' : 'visitors'}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditGoal(g)} className="text-slate-500 hover:text-blue-600"><RefreshCw size={12} /></button>
                    <button onClick={() => deleteGoal(g.id)} className="text-slate-500 hover:text-red-600"><X size={12} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sources */}
      <div className="p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h4 className="font-black flex items-center gap-2"><Award size={16} /> {isArabic ? 'مصادر التحويل' : 'Conversion Sources'}</h4>
          <div className="relative">
            <Search size={14} className="absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isArabic ? 'بحث...' : 'Search...'}
              className="w-44 pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-right border-b border-slate-100">
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المصدر' : 'Source'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الزيارات' : 'Visits'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'التحويلات' : 'Conversions'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'المعدل' : 'Rate'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الإيراد' : 'Revenue'}</th>
                <th className="pb-3 font-bold text-slate-400">{isArabic ? 'الاتجاه' : 'Trend'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 font-bold">{isArabic ? s.sourceAr : s.source}</td>
                  <td className="py-3 text-slate-600">{s.visits.toLocaleString()}</td>
                  <td className="py-3 text-slate-600">{s.conversions.toLocaleString()}</td>
                  <td className="py-3"><span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">{s.rate.toFixed(1)}%</span></td>
                  <td className="py-3 text-slate-600 font-bold">{t('business.reports.currency')} {s.revenue.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`flex items-center gap-0.5 text-xs font-bold ${s.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {s.trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(s.trend).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {filteredSources.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-sm">
                    <AlertTriangle size={20} className="inline-block mb-1" />
                    <p>{isArabic ? 'لا توجد نتائج' : 'No results found'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowGoalModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-black text-lg flex items-center gap-2"><Target size={18} className="text-blue-600" /> {editingGoal ? (isArabic ? 'تعديل هدف' : 'Edit Goal') : (isArabic ? 'هدف جديد' : 'New Goal')}</h4>
              <button onClick={() => setShowGoalModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">{isArabic ? 'اسم الهدف' : 'Goal Name'}</label>
                <input
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  placeholder={isArabic ? 'مثال: إتمام الدفع' : 'e.g. Checkout Completion'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">{isArabic ? 'الهدف المطلوب (%)' : 'Target Rate (%)'}</label>
                <input
                  type="number"
                  step="0.1"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                  placeholder="5.0"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button onClick={() => setShowGoalModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold hover:bg-slate-200">{isArabic ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={saveGoal} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">{isArabic ? 'حفظ' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversionsPage;
