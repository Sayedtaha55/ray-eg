'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Users, Search, UserCog, Clock, Wallet, Plus, X,
  Phone, Mail, Loader2, Calendar, CheckCircle2, Info, Target, BookOpen, Zap, Link2, ChevronRight, Lightbulb, XCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';

type Employee = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
};

const STORAGE_KEY = 'shop_employees';

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

export default function HrPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const hrGuide: HRGuideData = {
    purpose: 'إدارة الموظفين والحضور والرواتب والإجازات والمهام في مكان واحد.',
    whenToUse: 'استخدم هذه الصفحة كنقطة البداية لإدارة جميع جوانب الموارد البشرية.',
    whatsInside: [
      'قائمة الموظفين',
      'إحصائيات سريعة',
      'بحث متقدم',
      'روابط لجميع أقسام HR'
    ],
    steps: [
      { title: 'إضافة موظف', description: 'اضغط على زر إضافة موظف لإدخال بيانات موظف جديد' },
      { title: 'البحث عن موظف', description: 'استخدم شريط البحث للوصول السريع لأي موظف' },
      { title: 'الانتقال للأقسام', description: 'استخدم القائمة الجانبية للوصول للحضور والرواتب والإجازات' }
    ],
    bestPractices: [
      'حافظ على بيانات الموظفين محدثة',
      'راجع الإحصائيات بانتظام',
      'استخدم البحث للوصول السريع'
    ],
    tips: [
      'يمكنك الوصول لجميع أقسام HR من القائمة الجانبية',
      'الإحصائيات تتحدث تلقائياً'
    ],
    shortcuts: [
      'استخدم مفتاح Enter للبحث السريع',
      'اضغط F5 لتحديث البيانات'
    ],
    relatedLinks: [
      { label: 'الحضور', onClick: () => window.location.href = '/dashboard/hr/attendance' },
      { label: 'الرواتب', onClick: () => window.location.href = '/dashboard/hr/payroll' },
      { label: 'الإجازات', onClick: () => window.location.href = '/dashboard/hr/leaves' },
      { label: 'المهام', onClick: () => window.location.href = '/dashboard/hr/tasks' }
    ]
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const shopData = await apiRequest('/shops/me');
        const sid = shopData?.id;
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setEmployees(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {}
        setEmployees([]);
      } catch (err: any) {
        setError(err?.message || 'فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveEmployees = (list: Employee[]) => {
    setEmployees(list);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  };

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.trim().toLowerCase();
    return employees.filter((e) =>
      String(e.name || '').toLowerCase().includes(q) ||
      String(e.email || '').toLowerCase().includes(q) ||
      String(e.role || '').toLowerCase().includes(q)
    );
  }, [employees, search]);

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => String(e.status || 'active').toLowerCase() !== 'inactive').length;
    return { total, active };
  }, [employees]);

  const handleAddEmployee = (data: Partial<Employee>) => {
    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      role: data.role || 'موظف',
      status: 'active',
    };
    saveEmployees([...employees, newEmp]);
    setShowAddModal(false);
  };

  const handleDeleteEmployee = (id: string) => {
    saveEmployees(employees.filter((e) => e.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <Users size={24} className="text-[#00E5FF]" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">الموارد البشرية</h1>
              <button onClick={() => setGuideOpen(true)} className="p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all" title="معلومات / Info">
                <Info size={18} />
              </button>
            </div>
            <p className="text-sm font-bold text-slate-400 mt-1">إدارة الموظفين والحضور والرواتب</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
        >
          <Plus size={18} />
          <span>إضافة موظف</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-right">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-blue-50 text-blue-600">
            <Users size={20} />
          </div>
          <span className="text-slate-500 font-semibold text-xs mb-1">إجمالي الموظفين</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.total}</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-green-50 text-green-600">
            <CheckCircle2 size={20} />
          </div>
          <span className="text-slate-500 font-semibold text-xs mb-1">موظفون نشطون</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">{stats.active}</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-amber-50 text-amber-600">
            <Clock size={20} />
          </div>
          <span className="text-slate-500 font-semibold text-xs mb-1">الحضور اليوم</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">0</span>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-end">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 bg-cyan-50 text-cyan-600">
            <Wallet size={20} />
          </div>
          <span className="text-slate-500 font-semibold text-xs mb-1">الرواتب الشهرية</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">ج.م 0</span>
        </div>
      </div>

      {/* Search */}
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

      {/* Employees list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <UserCog size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 font-bold text-sm mb-4">لا يوجد موظفون</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
          >
            إضافة موظف
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between flex-row-reverse">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">
                      {String(emp.name || 'م').charAt(0)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{emp.role || 'موظف'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-row-reverse">
                  {emp.phone && (
                    <span className="text-xs text-slate-500 hidden sm:block" dir="ltr">{emp.phone}</span>
                  )}
                  <button
                    onClick={() => handleDeleteEmployee(emp.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add employee modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEmployee}
        />
      )}

      {/* Guide drawer */}
      {guideOpen && (
        <InfoDrawer title="الموارد البشرية" onClose={() => setGuideOpen(false)}>
          <HRGuideContent guide={hrGuide} />
        </InfoDrawer>
      )}
    </div>
  );
}

function AddEmployeeModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: Partial<Employee>) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name: name.trim(), email: email.trim(), phone: phone.trim(), role: role.trim() || 'موظف' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6 flex-row-reverse">
          <h2 className="text-xl font-black text-slate-900">إضافة موظف</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">الاسم</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">المنصب</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="موظف"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">الهاتف</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400" />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400" />
          </div>
          <button type="submit"
            className="w-full px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all">
            إضافة
          </button>
        </form>
      </div>
    </div>
  );
}
