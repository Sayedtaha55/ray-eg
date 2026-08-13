'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Wallet, TrendingUp, Loader2, DollarSign, Search, RefreshCw, Download, Filter, ChevronDown, Calendar, CheckCircle2, Clock, XCircle, Plus, Info, Target, BookOpen, Zap, Link2, ChevronRight, Lightbulb } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type PayrollRecord = {
  id: string;
  employeeName: string;
  employeeId: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  paymentDate?: string;
  dueDate: string;
  month: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  paid: { label: 'مدفوع', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 size={12} /> },
  pending: { label: 'قيد الانتظار', color: 'text-amber-600', bg: 'bg-amber-100', icon: <Clock size={12} /> },
  failed: { label: 'فشل', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle size={12} /> },
};

/* ============================================================
 * HR Guide System
 * ============================================================ */

type GuideStep = {
  title: string;
  description: string;
};

type GuideLink = {
  label: string;
  onClick?: () => void;
};

type HRGuideData = {
  purpose: string;
  whenToUse: string;
  whatsInside: string[];
  steps: GuideStep[];
  bestPractices: string[];
  tips: string[];
  shortcuts: string[];
  relatedLinks?: GuideLink[];
};

const GuideSectionBlock: React.FC<{
  icon: any;
  iconColor: string;
  iconBg: string;
  heading: string;
  children: React.ReactNode;
}> = ({ icon: Icon, iconColor, iconBg, heading, children }) => (
  <div className="rounded-xl border border-slate-100 p-4 bg-white">
    <div className="flex items-center gap-2.5 mb-3">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${iconBg} ${iconColor} shrink-0`}>
        <Icon size={16} />
      </div>
      <h4 className="font-bold text-slate-900 text-sm">{heading}</h4>
    </div>
    {children}
  </div>
);

const HRGuideContent: React.FC<{ guide: HRGuideData }> = ({ guide }) => (
  <div className="space-y-4">
    <GuideSectionBlock icon={Target} iconColor="text-blue-600" iconBg="bg-blue-50" heading="وظيفة الصفحة / Page Purpose">
      <p className="text-slate-600 text-sm leading-relaxed">{guide.purpose}</p>
    </GuideSectionBlock>

    <GuideSectionBlock icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" heading="متى تستخدمها / When to Use">
      <p className="text-slate-600 text-sm leading-relaxed">{guide.whenToUse}</p>
    </GuideSectionBlock>

    <GuideSectionBlock icon={BookOpen} iconColor="text-purple-600" iconBg="bg-purple-50" heading="ماذا ستجد داخلها / What's Inside">
      <ul className="space-y-1.5">
        {guide.whatsInside.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
            <ChevronRight size={14} className="text-slate-300 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </GuideSectionBlock>

    {guide.steps.length > 0 && (
      <GuideSectionBlock icon={Zap} iconColor="text-cyan-600" iconBg="bg-cyan-50" heading="خطوات الاستخدام / How to Use">
        <ol className="space-y-2">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold shrink-0">{i + 1}</span>
              <div>
                <div className="font-semibold text-slate-900">{step.title}</div>
                <div className="text-slate-500">{step.description}</div>
              </div>
            </li>
          ))}
        </ol>
      </GuideSectionBlock>
    )}

    {guide.bestPractices.length > 0 && (
      <GuideSectionBlock icon={Target} iconColor="text-green-600" iconBg="bg-green-50" heading="أفضل الممارسات / Best Practices">
        <ul className="space-y-1.5">
          {guide.bestPractices.map((practice, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <CheckCircle2 size={14} className="text-green-500 mt-0.5 shrink-0" />
              {practice}
            </li>
          ))}
        </ul>
      </GuideSectionBlock>
    )}

    {guide.tips.length > 0 && (
      <GuideSectionBlock icon={Lightbulb} iconColor="text-amber-600" iconBg="bg-amber-50" heading="نصائح / Tips">
        <ul className="space-y-1.5">
          {guide.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <Zap size={14} className="text-amber-500 mt-0.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </GuideSectionBlock>
    )}

    {guide.shortcuts.length > 0 && (
      <GuideSectionBlock icon={Link2} iconColor="text-indigo-600" iconBg="bg-indigo-50" heading="اختصارات / Shortcuts">
        <ul className="space-y-1.5">
          {guide.shortcuts.map((shortcut, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-600 text-sm leading-relaxed">
              <ChevronRight size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              {shortcut}
            </li>
          ))}
        </ul>
      </GuideSectionBlock>
    )}

    {guide.relatedLinks && guide.relatedLinks.length > 0 && (
      <GuideSectionBlock icon={Link2} iconColor="text-slate-600" iconBg="bg-slate-100" heading="روابط ذات صلة / Related Links">
        <div className="flex flex-wrap gap-2">
          {guide.relatedLinks.map((link, i) => (
            <button
              key={i}
              onClick={link.onClick}
              className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-all"
            >
              {link.label}
            </button>
          ))}
        </div>
      </GuideSectionBlock>
    )}
  </div>
);

const InfoDrawer: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex" onClick={onClose}>
    <div className="absolute inset-0 bg-black/40 animate-[fadeIn_0.15s_ease-out]" />
    <div
      className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Info size={20} className="text-slate-400" />
          {title}
        </h3>
        <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
          <XCircle size={20} />
        </button>
      </div>
      <div className="px-6 py-5 space-y-5 text-sm text-slate-600 leading-relaxed">{children}</div>
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-3">
        <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors">
          حسناً
        </button>
      </div>
    </div>
  </div>
);

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const { shop } = useShop();

  const payrollGuide: HRGuideData = {
    purpose: 'إدارة رواتب الموظفين الشهرية مع تتبع حالة المدفوعات وتصدير التقارير المالية.',
    whenToUse: 'استخدم هذه الصفحة شهرياً لإدارة رواتب الموظفين، مراجعة المدفوعات، وتصدير تقارير الرواتب.',
    whatsInside: [
      'سجلات الرواتب الشهرية',
      'تصفية حسب الحالة (مدفوع، قيد الانتظار، فشل)',
      'تصفية حسب الشهر',
      'إحصائيات الرواتب',
      'تصدير تقارير CSV',
      'بحث متقدم'
    ],
    steps: [
      { title: 'إضافة راتب', description: 'اضغط على زر إضافة راتب لإدخال بيانات راتب جديد' },
      { title: 'مراجعة الرواتب', description: 'راجع قائمة الرواتب وحالة كل دفعة' },
      { title: 'تصفية السجلات', description: 'استخدم فلاتر الحالة والشهر للوصول للسجلات المطلوبة' },
      { title: 'تصدير التقرير', description: 'اضغط على زر تصدير CSV للحصول على تقرير الرواتب' }
    ],
    bestPractices: [
      'راجع الرواتب شهرياً قبل الدفع',
      'استخدم الفلاتر للوصول السريع للبيانات',
      'صدر تقارير دورية للمتابعة المالية',
      'تأكد من صحة البيانات قبل الإدخال'
    ],
    tips: [
      'يمكنك البحث عن موظف محدد باستخدام شريط البحث',
      'الألوان المختلفة تشير إلى حالات دفع مختلفة',
      'يمكنك ترتيب السجلات حسب التاريخ أو المبلغ'
    ],
    shortcuts: [
      'استخدم مفتاح Enter للبحث السريع',
      'اضغط F5 لتحديث البيانات'
    ],
    relatedLinks: [
      { label: 'إدارة الموظفين', onClick: () => window.location.href = '/dashboard/hr' },
      { label: 'الحضور', onClick: () => window.location.href = '/dashboard/hr/attendance' }
    ]
  };

  const loadPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      
      // TODO: Replace with actual API call
      // const data = await apiRequest(`/payroll/shop/${sid}`);
      // setPayroll(Array.isArray(data) ? data : []);
      setPayroll([]);
    } catch { setPayroll([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPayroll(); }, [loadPayroll]);

  const filteredAndSorted = React.useMemo(() => {
    let result = payroll.filter(p => 
      p.employeeName.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    if (filterMonth !== 'all') {
      result = result.filter(p => p.month === filterMonth);
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'name') {
        comparison = a.employeeName.localeCompare(b.employeeName);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [payroll, debouncedSearch, filterStatus, filterMonth, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportCSV = () => {
    const headers = ['Employee Name', 'Amount', 'Status', 'Payment Date', 'Due Date', 'Month'];
    const rows = filteredAndSorted.map(p => [
      p.employeeName,
      p.amount,
      p.status,
      p.paymentDate || '-',
      p.dueDate,
      p.month
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payroll.csv';
    link.click();
  };

  const stats = React.useMemo(() => {
    const totalPaid = payroll.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payroll.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    return [
      { label: 'إجمالي المدفوع', value: `ج.م ${totalPaid.toLocaleString()}`, bg: 'bg-green-50', color: 'text-green-600' },
      { label: 'قيد الانتظار', value: `ج.م ${totalPending.toLocaleString()}`, bg: 'bg-amber-50', color: 'text-amber-600' },
      { label: 'عدد الموظفين', value: payroll.length, bg: 'bg-blue-50', color: 'text-blue-600' },
      { label: 'متوسط الراتب', value: payroll.length > 0 ? `ج.م ${Math.round(payroll.reduce((s, p) => s + p.amount, 0) / payroll.length).toLocaleString()}` : 'ج.م 0', bg: 'bg-purple-50', color: 'text-purple-600' },
    ];
  }, [payroll]);

  const statusCounts = React.useMemo(() => 
    Object.keys(STATUS_CONFIG).map(key => ({
      key,
      count: payroll.filter(p => p.status === key).length,
      ...STATUS_CONFIG[key]
    })), [payroll]
  );

  const months = React.useMemo(() => {
    const uniqueMonths = [...new Set(payroll.map(p => p.month))];
    return uniqueMonths;
  }, [payroll]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <Wallet size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الرواتب</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة رواتب الموظفين</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
        >
          <Plus size={16} />
          <span>إضافة راتب</span>
        </button>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
          <Download size={16} />
          <span>تصدير CSV</span>
        </button>
        <button onClick={loadPayroll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
          <RefreshCw size={16} />
          <span>تحديث</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl border ${stat.bg} ${stat.color}`}>
            <div className="text-xs font-bold mb-1">{stat.label}</div>
            <div className="text-xl font-black">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {statusCounts.map(s => (
          <button 
            key={s.key} 
            onClick={() => setFilterStatus(filterStatus === s.key ? 'all' : s.key)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterStatus === s.key ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            <div className={`flex items-center justify-center gap-1 mb-1 ${s.color}`}>
              {s.icon}
              <span className="text-xs font-bold">{s.label}</span>
            </div>
            <div className="text-lg font-black text-slate-900">{s.count}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">تصفية:</span>
        </div>
        <select 
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        >
          <option value="all">كل الشهور</option>
          {months.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 mr-4">
          <ChevronDown size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">ترتيب:</span>
        </div>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        >
          <option value="date">التاريخ</option>
          <option value="amount">المبلغ</option>
          <option value="name">الاسم</option>
        </select>
      </div>

      <div className="relative">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن موظف..."
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Wallet size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد سجلات رواتب</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {paginatedData.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <DollarSign size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{record.employeeName}</div>
                    <div className="text-xs text-slate-500 font-semibold">
                      {record.month} | استحقاق: {new Date(record.dueDate).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="font-bold text-sm text-slate-900">ج.م {record.amount.toLocaleString()}</div>
                    {record.paymentDate && (
                      <div className="text-xs text-slate-500 font-semibold">
                        مدفوع: {new Date(record.paymentDate).toLocaleDateString('ar-EG')}
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    STATUS_CONFIG[record.status].bg
                  } ${STATUS_CONFIG[record.status].color}`}>
                    {STATUS_CONFIG[record.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">
                صفحة {currentPage} من {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">إضافة راتب جديد</h3>
            <p className="text-sm text-slate-500 mb-4">هذه الميزة قيد التطوير</p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {guideOpen && (
        <InfoDrawer title="الرواتب" onClose={() => setGuideOpen(false)}>
          <HRGuideContent guide={payrollGuide} />
        </InfoDrawer>
      )}
    </div>
  );
}