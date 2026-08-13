'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, Clock, Loader2, Search, RefreshCw, Download, Filter, ChevronDown, Plus, Calendar, AlertCircle, Circle, User, Info, Target, BookOpen, Zap, Link2, ChevronRight, Lightbulb } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

type Task = {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'منخفض', color: 'text-slate-600', bg: 'bg-slate-100' },
  medium: { label: 'متوسط', color: 'text-blue-600', bg: 'bg-blue-100' },
  high: { label: 'عالي', color: 'text-amber-600', bg: 'bg-amber-100' },
  urgent: { label: 'عاجل', color: 'text-red-600', bg: 'bg-red-100' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  todo: { label: 'قيد الانتظار', color: 'text-slate-600', bg: 'bg-slate-100', icon: <Circle size={12} /> },
  in_progress: { label: 'قيد التنفيذ', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Clock size={12} /> },
  completed: { label: 'مكتمل', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 size={12} /> },
  cancelled: { label: 'ملغي', color: 'text-red-600', bg: 'bg-red-100', icon: <AlertCircle size={12} /> },
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
          <AlertCircle size={20} />
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 200);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const { shop } = useShop();

  const tasksGuide: HRGuideData = {
    purpose: 'إدارة مهام الموظفين اليومية مع تحديد الأولويات وتتبع التقدم والتنبيه للمهام المتأخرة.',
    whenToUse: 'استخدم هذه الصفحة يومياً لتوزيع المهام، متابعة التقدم، وتحديد الأولويات للموظفين.',
    whatsInside: [
      'قائمة المهام',
      'أولويات المهام (منخفض، متوسط، عالي، عاجل)',
      'حالات المهام (قيد الانتظار، قيد التنفيذ، مكتمل، ملغي)',
      'تنبيه المهام المتأخرة',
      'تصفية حسب الأولوية والحالة',
      'إحصائيات المهام'
    ],
    steps: [
      { title: 'إضافة مهمة', description: 'اضغط على زر إضافة مهمة لإنشاء مهمة جديدة' },
      { title: 'تحديد الأولوية', description: 'حدد أولوية المهمة (عاجل، عالي، متوسط، منخفض)' },
      { title: 'تعيين الموظف', description: 'اختر الموظف المسؤول عن تنفيذ المهمة' },
      { title: 'تتبع التقدم', description: 'تابع حالة المهمة وحددها كمكتملة عند الانتهاء' }
    ],
    bestPractices: [
      'حدد أولويات واضحة للمهام',
      'راجع المهام يومياً',
      'استخدم الألوان للتمييز بين الأولويات',
      'تابع المهام المتأخرة بانتظام'
    ],
    tips: [
      'المهام المتأخرة تظهر باللون الأحمر',
      'يمكنك تغيير حالة المهمة بسرعة',
      'استخدم الفلاتر للوصول السريع للمهام'
    ],
    shortcuts: [
      'انقر على الدائرة لإكمال المهمة',
      'استخدم مفتاح Enter للبحث السريع'
    ],
    relatedLinks: [
      { label: 'إدارة الموظفين', onClick: () => window.location.href = '/dashboard/hr' },
      { label: 'الحضور', onClick: () => window.location.href = '/dashboard/hr/attendance' }
    ]
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) { setLoading(false); return; }
      
      // TODO: Replace with actual API call
      // const data = await apiRequest(`/tasks/shop/${sid}`);
      // setTasks(Array.isArray(data) ? data : []);
      setTasks([]);
    } catch { setTasks([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const filteredAndSorted = React.useMemo(() => {
    let result = tasks.filter(t => 
      t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'name') {
        comparison = a.assignedToName.localeCompare(b.assignedToName);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, debouncedSearch, filterStatus, filterPriority, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportCSV = () => {
    const headers = ['Title', 'Assigned To', 'Priority', 'Status', 'Due Date', 'Completed Date', 'Created At'];
    const rows = filteredAndSorted.map(t => [
      t.title,
      t.assignedToName,
      t.priority,
      t.status,
      t.dueDate || '-',
      t.completedDate || '-',
      t.createdAt
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tasks.csv';
    link.click();
  };

  const stats = React.useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const overdue = tasks.filter(t => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()).length;
    return [
      { label: 'إجمالي المهام', value: tasks.length, bg: 'bg-blue-50', color: 'text-blue-600' },
      { label: 'مكتملة', value: completed, bg: 'bg-green-50', color: 'text-green-600' },
      { label: 'قيد التنفيذ', value: inProgress, bg: 'bg-amber-50', color: 'text-amber-600' },
      { label: 'متأخرة', value: overdue, bg: 'bg-red-50', color: 'text-red-600' },
    ];
  }, [tasks]);

  const statusCounts = React.useMemo(() => 
    Object.keys(STATUS_CONFIG).map(key => ({
      key,
      count: tasks.filter(t => t.status === key).length,
      ...STATUS_CONFIG[key]
    })), [tasks]
  );

  const priorityCounts = React.useMemo(() => 
    Object.keys(PRIORITY_CONFIG).map(key => ({
      key,
      count: tasks.filter(t => t.priority === key).length,
      ...PRIORITY_CONFIG[key]
    })), [tasks]
  );

  const handleStatusChange = (id: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { 
      ...t, 
      status: newStatus,
      completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined
    } : t));
  };

  const isOverdue = (task: Task) => {
    return task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < new Date();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
          <CheckCircle2 size={24} className="text-[#00E5FF]" />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">المهام</h1>
            <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
              <Info size={18} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-400 mt-1">إدارة مهام الموظفين</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
        >
          <Plus size={16} />
          <span>إضافة مهمة</span>
        </button>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
          <Download size={16} />
          <span>تصدير CSV</span>
        </button>
        <button onClick={loadTasks} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all">
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
          <span className="text-sm font-bold text-slate-600">الأولوية:</span>
        </div>
        <select 
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
        >
          <option value="all">الكل</option>
          {Object.keys(PRIORITY_CONFIG).map(key => (
            <option key={key} value={key}>{PRIORITY_CONFIG[key].label}</option>
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
          <option value="date">تاريخ الإنشاء</option>
          <option value="dueDate">تاريخ الاستحقاق</option>
          <option value="priority">الأولوية</option>
          <option value="name">الموظف</option>
        </select>
      </div>

      <div className="relative">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن مهمة..."
          className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle2 size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm">لا توجد مهام</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {paginatedData.map((task) => (
              <div key={task.id} className={`p-4 hover:bg-slate-50 transition-all ${isOverdue(task) ? 'bg-red-50' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => {
                        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
                        handleStatusChange(task.id, newStatus);
                      }}
                      className={`mt-1 shrink-0 ${task.status === 'completed' ? 'text-green-600' : 'text-slate-300 hover:text-slate-500'}`}
                    >
                      {task.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>
                    <div className="flex-1">
                      <div className={`font-bold text-sm ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-slate-500 font-semibold mt-1">{task.description}</div>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 ${
                    STATUS_CONFIG[task.status].bg
                  } ${STATUS_CONFIG[task.status].color}`}>
                    {STATUS_CONFIG[task.status].label}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-500 font-semibold">{task.assignedToName}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${PRIORITY_CONFIG[task.priority].bg} ${PRIORITY_CONFIG[task.priority].color}`}>
                      {PRIORITY_CONFIG[task.priority].label}
                    </span>
                    {task.dueDate && (
                      <div className={`flex items-center gap-1 text-xs font-semibold ${isOverdue(task) ? 'text-red-600' : 'text-slate-500'}`}>
                        <Calendar size={14} />
                        <span>{new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>
                        {isOverdue(task) && <span className="text-red-600">(متأخرة)</span>}
                      </div>
                    )}
                  </div>
                  
                  {task.status !== 'completed' && task.status !== 'cancelled' && (
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                        className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
                      >
                        <option value="todo">قيد الانتظار</option>
                        <option value="in_progress">قيد التنفيذ</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </div>
                  )}
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
            <h3 className="text-lg font-bold text-slate-900 mb-4">إضافة مهمة جديدة</h3>
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
        <InfoDrawer title="المهام" onClose={() => setGuideOpen(false)}>
          <HRGuideContent guide={tasksGuide} />
        </InfoDrawer>
      )}
    </div>
  );
}