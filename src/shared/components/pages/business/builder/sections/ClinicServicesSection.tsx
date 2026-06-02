import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Shield, Stethoscope, User2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Specialty = {
  id: string;
  name: string;
  iconName: 'Stethoscope' | 'Shield' | 'User2' | 'CheckCircle2';
};

type Props = {
  config: any;
  setConfig: (next: any) => void;
};

const ClinicServicesSection: React.FC<Props> = ({ config, setConfig }) => {
  const { t } = useTranslation();
  const specialtiesList: Specialty[] = Array.isArray(config.clinicSpecialtiesList)
    ? config.clinicSpecialtiesList
    : [];

  const [name, setName] = useState('');
  const [iconName, setIconName] = useState<'Stethoscope' | 'Shield' | 'User2' | 'CheckCircle2'>('Stethoscope');
  const [editingId, setEditingId] = useState<string | null>(null);

  const setVal = (value: Specialty[]) => {
    setConfig({ ...config, clinicSpecialtiesList: value });
  };

  const handleAddSpecialty = () => {
    if (!name.trim()) return;
    const newSpecialty: Specialty = {
      id: 'spec_' + Date.now(),
      name: name.trim(),
      iconName,
    };
    setVal([...specialtiesList, newSpecialty]);
    setName('');
  };

  const handleEditSpecialty = (spec: Specialty) => {
    setEditingId(spec.id);
    setName(spec.name);
    setIconName(spec.iconName);
  };

  const handleSaveEdit = () => {
    if (!editingId || !name.trim()) return;
    const nextList = specialtiesList.map((spec) => {
      if (spec.id === editingId) {
        return { ...spec, name: name.trim(), iconName };
      }
      return spec;
    });
    setVal(nextList);
    setEditingId(null);
    setName('');
  };

  const handleDeleteSpecialty = (id: string) => {
    const nextList = specialtiesList.filter((spec) => spec.id !== id);
    setVal(nextList);
    if (editingId === id) {
      setEditingId(null);
      setName('');
    }
  };

  const renderIconPreview = (name: string) => {
    switch (name) {
      case 'Stethoscope':
        return <Stethoscope size={14} />;
      case 'Shield':
        return <Shield size={14} />;
      case 'User2':
        return <User2 size={14} />;
      case 'CheckCircle2':
        return <CheckCircle2 size={14} />;
      default:
        return <Stethoscope size={14} />;
    }
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="border-r-4 border-cyan-400 pr-2">
        <h3 className="text-xs font-black text-slate-900">تخصيص التخصصات والخدمات</h3>
        <p className="text-[10px] font-bold text-slate-500 mt-0.5">أضف التخصصات والخدمات المتاحة بالعيادة وقم بتعديل أسمائها وأيقوناتها.</p>
      </div>

      {/* Add or Edit Form */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 shadow-inner">
        <span className="text-[10px] font-black text-cyan-600 block">
          {editingId ? 'تعديل بيانات التخصص' : 'إضافة تخصص جديد للعيادة'}
        </span>

        <div className="space-y-2">
          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-0.5">اسم التخصص / الخدمة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              placeholder="مثال: طب وجراحة الأسنان"
            />
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-0.5">اختر الأيقونة البصرية</label>
            <select
              value={iconName}
              onChange={(e: any) => setIconName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-none"
            >
              <option value="Stethoscope">سماعة طبية (Stethoscope)</option>
              <option value="Shield">درع الأمان (Shield)</option>
              <option value="User2">رعاية أطفال (User)</option>
              <option value="CheckCircle2">علامة التحقق (Check Circle)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          {editingId ? (
            <>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2 rounded-xl text-xs font-black bg-cyan-500 hover:bg-cyan-600 text-white shadow-md transition-all active:scale-95"
              >
                حفظ التعديلات
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-slate-250 hover:bg-slate-350 text-slate-700 transition-all"
              >
                إلغاء
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleAddSpecialty}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-black text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <Plus size={14} />
              <span>إضافة التخصص</span>
            </button>
          )}
        </div>
      </div>

      {/* Specialties List */}
      <div className="space-y-2">
        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">التخصصات الحالية ({specialtiesList.length})</span>
        <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-white max-h-[220px] overflow-y-auto">
          {specialtiesList.map((spec) => (
            <div key={spec.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-cyan-600 bg-cyan-50 p-2 rounded-lg border border-cyan-100/50">
                  {renderIconPreview(spec.iconName)}
                </span>
                <span className="font-black text-xs text-slate-800">{spec.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEditSpecialty(spec)}
                  className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSpecialty(spec.id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClinicServicesSection;
