import React, { useState } from 'react';
import { CheckSquare, Plus, Search, X, Calendar, Flag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Task = { id: string; title: string; assignee: string; priority: 'low' | 'medium' | 'high'; status: 'todo' | 'inProgress' | 'done'; dueDate: string; description: string };

const PRIORITY_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  low: { ar: 'منخفض', en: 'Low', color: 'text-slate-600', bg: 'bg-slate-100' },
  medium: { ar: 'متوسط', en: 'Medium', color: 'text-amber-600', bg: 'bg-amber-100' },
  high: { ar: 'عالي', en: 'High', color: 'text-red-600', bg: 'bg-red-100' },
};

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string; icon: React.ReactNode }> = {
  todo: { ar: 'للقيام', en: 'To Do', color: 'text-slate-600', bg: 'bg-slate-100', icon: <Clock size={14} /> },
  inProgress: { ar: 'قيد التنفيذ', en: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-100', icon: <AlertCircle size={14} /> },
  done: { ar: 'مكتمل', en: 'Done', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle2 size={14} /> },
};

const TasksPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: isArabic ? 'تحديث المخزون' : 'Update inventory', assignee: 'Ahmed', priority: 'high', status: 'inProgress', dueDate: '2026-07-30', description: isArabic ? 'تحديث جميع المنتجات' : 'Update all products' },
    { id: '2', title: isArabic ? 'تقرير المبيعات' : 'Sales report', assignee: 'Sara', priority: 'medium', status: 'todo', dueDate: '2026-08-01', description: isArabic ? 'تقرير شهر يوليو' : 'July report' },
    { id: '3', title: isArabic ? 'تنظيم المخزن' : 'Organize warehouse', assignee: 'Omar', priority: 'low', status: 'done', dueDate: '2026-07-25', description: '' },
  ]);

  const filtered = tasks.filter(tk => tk.title.toLowerCase().includes(search.toLowerCase()) || tk.assignee.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'المهام' : 'Tasks'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'إدارة مهام الموظفين' : 'Manage employee tasks'}</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'مهمة جديدة' : 'New Task'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي المهام' : 'Total Tasks', value: tasks.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'للقيام' : 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: 'bg-slate-50 text-slate-600' },
          { label: isArabic ? 'قيد التنفيذ' : 'In Progress', value: tasks.filter(t => t.status === 'inProgress').length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'مكتملة' : 'Done', value: tasks.filter(t => t.status === 'done').length, color: 'bg-green-50 text-green-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><CheckSquare size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-300" size={18} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isArabic ? 'بحث...' : 'Search...'} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
      </div>

      <div className="space-y-2">
        {filtered.map((tk) => {
          const pr = PRIORITY_STYLES[tk.priority] || PRIORITY_STYLES.low;
          const st = STATUS_STYLES[tk.status] || STATUS_STYLES.todo;
          return (
            <div key={tk.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><CheckSquare size={20} /></div>
                <div>
                  <p className="font-bold text-sm">{tk.title}</p>
                  <p className="text-xs text-slate-400">{tk.assignee} · {new Date(tk.dueDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${pr.bg} ${pr.color} flex items-center gap-1`}><Flag size={10} /> {isArabic ? pr.ar : pr.en}</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color} flex items-center gap-1`}>{st.icon} {isArabic ? st.ar : st.en}</span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'مهمة جديدة' : 'New Task'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'عنوان المهمة' : 'Task title'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input placeholder={isArabic ? 'المسؤول' : 'Assignee'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"><option>{isArabic ? 'منخفض' : 'Low'}</option><option>{isArabic ? 'متوسط' : 'Medium'}</option><option>{isArabic ? 'عالي' : 'High'}</option></select>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <textarea placeholder={isArabic ? 'الوصف' : 'Description'} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">{isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
