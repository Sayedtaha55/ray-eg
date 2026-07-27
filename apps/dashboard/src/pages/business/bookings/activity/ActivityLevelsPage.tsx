/**
 * ═══════════════════════════════════════════
 * activity/ActivityLevelsPage.tsx
 * إدارة المستويات التعليمية
 * يُستخدم في: دورات تعليمية
 * ═══════════════════════════════════════════
 */
import React, { useState } from 'react';
import { Sliders, Plus, Edit2, Trash2, Users, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import type { BookingActivityType } from '../config';
import { useTranslation } from 'react-i18next';

type Level = {
  id: string;
  name: string;
  order: number;
  description?: string;
  prerequisites?: string;
  studentCount: number;
  color: string;
};

type Props = { activityType: BookingActivityType };

const COLORS = ['#00E5FF', '#7C3AED', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899', '#6366F1'];

const ActivityLevelsPage: React.FC<Props> = ({ activityType }) => {
  const { i18n } = useTranslation();
  const isEn = String(i18n.language || '').toLowerCase().startsWith('en');
  const [levels, setLevels] = useState<Level[]>([
    { id: '1', name: 'مبتدئ', order: 1, description: 'للطلاب الجدد بدون خبرة سابقة', studentCount: 45, color: '#10B981' },
    { id: '2', name: 'متوسط', order: 2, description: 'إتمام المستوى المبتدئ أو اجتياز اختبار القبول', prerequisites: 'إتمام المبتدئ', studentCount: 32, color: '#3B82F6' },
    { id: '3', name: 'متقدم', order: 3, description: 'للطلاب ذوي الخبرة العملية', prerequisites: 'إتمام المتوسط', studentCount: 18, color: '#7C3AED' },
    { id: '4', name: 'احترافي', order: 4, description: 'برنامج متخصص للمحترفين', prerequisites: 'إتمام المتقدم + تقييم', studentCount: 8, color: '#EF4444' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', prerequisites: '', color: COLORS[0] });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    setLevels(prev => [...prev, {
      id: Date.now().toString(), name: form.name, order: prev.length + 1,
      description: form.description || undefined, prerequisites: form.prerequisites || undefined,
      studentCount: 0, color: form.color,
    }]);
    setForm({ name: '', description: '', prerequisites: '', color: COLORS[0] });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setLevels(prev => prev.filter(l => l.id !== id).map((l, i) => ({ ...l, order: i + 1 })));
  };

  const moveUp = (id: string) => {
    setLevels(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((l, i) => ({ ...l, order: i + 1 }));
    });
  };

  const moveDown = (id: string) => {
    setLevels(prev => {
      const idx = prev.findIndex(l => l.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((l, i) => ({ ...l, order: i + 1 }));
    });
  };

  const totalStudents = levels.reduce((s, l) => s + l.studentCount, 0);

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center justify-between flex-row-reverse">
        <div className="flex items-center gap-3">
          <Sliders className="w-7 h-7 text-[#00E5FF]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900">{isEn ? 'Educational Levels' : 'المستويات التعليمية'}</h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{levels.length} {isEn ? 'levels' : 'مستوى'} • {totalStudents} {isEn ? 'students' : 'طالب'}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#00E5FF] text-slate-900 px-4 py-2.5 rounded-xl font-black text-sm hover:bg-[#00D4EE] transition-all shadow-sm">
          <Plus size={16} /> {isEn ? 'Add Level' : 'إضافة مستوى'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] border border-cyan-100 shadow-sm p-6 space-y-4">
          <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Add New Level' : 'إضافة مستوى جديد'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Level Name *' : 'اسم المستوى *'}</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={isEn ? 'e.g. Beginner' : 'مثال: مبتدئ'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Color' : 'اللون'}</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Description' : 'الوصف'}</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={isEn ? 'Level description...' : 'وصف المستوى...'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Prerequisites' : 'المتطلبات المسبقة'}</label>
              <input type="text" value={form.prerequisites} onChange={e => setForm(f => ({ ...f, prerequisites: e.target.value }))}
                placeholder={isEn ? 'e.g. Complete Beginner' : 'مثال: إتمام المبتدئ'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">{isEn ? 'Cancel' : 'إلغاء'}</button>
            <button onClick={handleAdd} disabled={!form.name.trim()}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-black transition-all disabled:opacity-50">{isEn ? 'Save' : 'حفظ'}</button>
          </div>
        </div>
      )}

      {/* Levels Timeline */}
      {levels.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 text-center">
          <Sliders className="w-14 h-14 text-slate-100 mx-auto mb-3" />
          <p className="font-bold text-slate-400">{isEn ? 'No levels added yet' : 'لم تضف مستويات بعد'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {levels.map((level, idx) => (
            <div key={level.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                {/* Order Controls */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => moveUp(level.id)} disabled={idx === 0} className="p-1 rounded hover:bg-slate-50 disabled:opacity-20"><ArrowUp size={14} /></button>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: level.color }}>{level.order}</div>
                  <button onClick={() => moveDown(level.id)} disabled={idx === levels.length - 1} className="p-1 rounded hover:bg-slate-50 disabled:opacity-20"><ArrowDown size={14} /></button>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-900 text-lg">{level.name}</div>
                  {level.description && <p className="text-xs text-slate-500 font-bold mt-0.5">{level.description}</p>}
                  <div className="flex items-center gap-3 mt-2 flex-wrap text-xs font-bold">
                    <span className="text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg flex items-center gap-1"><Users size={11} /> {level.studentCount} {isEn ? 'students' : 'طالب'}</span>
                    {level.prerequisites && <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">⚡ {level.prerequisites}</span>}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-slate-50"><Edit2 size={14} className="text-slate-400" /></button>
                  <button onClick={() => handleDelete(level.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLevelsPage;
