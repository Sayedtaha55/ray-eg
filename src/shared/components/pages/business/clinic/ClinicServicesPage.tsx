import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  CheckCircle2,
  Stethoscope,
  Shield,
  User2,
  Heart,
  Activity,
  Sparkles,
} from 'lucide-react';
import { ApiService } from '@/services/api.service';

type Specialty = {
  id: string;
  name: string;
  iconName: 'Stethoscope' | 'Shield' | 'User2' | 'CheckCircle2' | 'Heart' | 'Activity';
};

const DEFAULT_SPECIALTIES: Specialty[] = [
  { id: 'dentistry', name: 'طب وجراحة الأسنان', iconName: 'Stethoscope' },
  { id: 'dermatology', name: 'الأمراض الجلدية والتجميل', iconName: 'Shield' },
  { id: 'pediatrics', name: 'طب الأطفال ورعاية الرضع', iconName: 'User2' },
  { id: 'orthopedics', name: 'جراحة العظام والمفاصل', iconName: 'CheckCircle2' },
];

type Props = {
  shop?: any;
  onSaved?: () => void;
};

const ClinicServicesPage: React.FC<Props> = ({ shop, onSaved }) => {
  const { t } = useTranslation();

  const specialtiesList: Specialty[] = useMemo(() => {
    if (Array.isArray(shop?.pageDesign?.clinicSpecialtiesList) && shop.pageDesign.clinicSpecialtiesList.length > 0) {
      return shop.pageDesign.clinicSpecialtiesList;
    }
    // Do not show hardcoded defaults — require real data in pageDesign
    return [];
  }, [shop?.pageDesign?.clinicSpecialtiesList]);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form input states
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState<'Stethoscope' | 'Shield' | 'User2' | 'CheckCircle2' | 'Heart' | 'Activity'>('Stethoscope');

  const saveSpecialtiesList = async (nextList: Specialty[]) => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const updatedPageDesign = {
        ...(shop?.pageDesign || {}),
        clinicSpecialtiesList: nextList,
      };
      await ApiService.updateMyShop({
        pageDesign: updatedPageDesign,
      });
      setSuccessMsg('تم تحديث قائمة التخصصات والخدمات بنجاح!');
      if (onSaved) onSaved();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'فشل حفظ التعديلات في خادم البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOrEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('الرجاء إدخال اسم التخصص');
      return;
    }

    let nextList: Specialty[];
    if (editingId) {
      // Edit mode
      nextList = specialtiesList.map((spec) => {
        if (spec.id === editingId) {
          return {
            ...spec,
            name: name.trim(),
            iconName,
          };
        }
        return spec;
      });
    } else {
      // Add mode
      const newSpec: Specialty = {
        id: 'spec_' + Date.now(),
        name: name.trim(),
        iconName,
      };
      nextList = [...specialtiesList, newSpec];
    }

    await saveSpecialtiesList(nextList);
    closeAndResetForm();
  };

  const handleOpenAdd = () => {
    setName('');
    setIconName('Stethoscope');
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (spec: Specialty) => {
    setEditingId(spec.id);
    setName(spec.name);
    setIconName(spec.iconName);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التخصص/الخدمة الطبية؟')) return;
    const nextList = specialtiesList.filter((spec) => spec.id !== id);
    await saveSpecialtiesList(nextList);
  };

  const closeAndResetForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
    setIconName('Stethoscope');
  };

  const renderIcon = (icon: string, size = 20) => {
    switch (icon) {
      case 'Stethoscope':
        return <Stethoscope size={size} />;
      case 'Shield':
        return <Shield size={size} />;
      case 'User2':
        return <User2 size={size} />;
      case 'CheckCircle2':
        return <CheckCircle2 size={size} />;
      case 'Heart':
        return <Heart size={size} />;
      case 'Activity':
        return <Activity size={size} />;
      default:
        return <Stethoscope size={size} />;
    }
  };

  const getIconLabel = (icon: string) => {
    switch (icon) {
      case 'Stethoscope':
        return 'سماعة الطبيب (Stethoscope)';
      case 'Shield':
        return 'تأمين ورعاية (Shield)';
      case 'User2':
        return 'طب الأطفال والأسرة (User2)';
      case 'CheckCircle2':
        return 'تأكيدات الصحة (CheckCircle)';
      case 'Heart':
        return 'طب القلب والشرايين (Heart)';
      case 'Activity':
        return 'مؤشرات الحيوية (Activity)';
      default:
        return 'سماعة الطبيب';
    }
  };

  return (
    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-8 md:p-12 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 border-b border-slate-100 pb-6 flex-row-reverse">
        <div className="text-right">
          <div className="flex items-center gap-2.5 justify-end">
            <Sparkles size={18} className="text-cyan-500" />
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">الخدمات الطبية والتخصصات</h3>
          </div>
          <p className="text-slate-400 font-bold text-xs md:text-sm mt-2">
            حدد عيادات التخصصات والخدمات المتاحة بمركزك الطبي، والظاهرة في حقل حجز مواعيد المرضى بالخارج.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>إضافة تخصص / عيادة جديدة</span>
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl px-6 py-4 font-black text-xs sm:text-sm flex items-center gap-2 flex-row-reverse">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 bg-red-50 text-red-650 border border-red-100 rounded-2xl px-6 py-4 font-bold text-xs sm:text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {isSaving && !isModalOpen && (
        <div className="mb-6 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-2xl px-6 py-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-cyan-600" size={16} />
          <span>جاري حفظ البيانات وتحديث موقع العيادة بالخارج...</span>
        </div>
      )}

      {/* Specialties Grid */}
      {specialtiesList.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-350 bg-slate-50/20">
          <Stethoscope size={56} className="mx-auto mb-5 opacity-20" />
          <p className="font-black text-lg">لا توجد أي تخصصات أو عيادات فرعية مسجلة بالمركز حالياً.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all font-black text-xs rounded-xl"
          >
            إضافة أول تخصص
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialtiesList.map((spec) => (
            <div
              key={spec.id}
              className="bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg rounded-[2.2rem] p-6 flex flex-col items-center justify-between text-center transition-all group relative overflow-hidden"
            >
              {/* Actions for each card */}
              <div className="absolute top-4 left-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(spec)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-650 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-all"
                  title="تعديل التخصص"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(spec.id)}
                  className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"
                  title="حذف التخصص"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Icon Area */}
              <div className="w-16 h-16 rounded-[1.8rem] bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-inner">
                {renderIcon(spec.iconName, 26)}
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900 leading-snug">{spec.name}</h4>
                <p className="text-[10px] font-bold text-slate-400">قسم طبي متكامل</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Specialty Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-row-reverse text-right">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingId ? 'تعديل التخصص الطبي' : 'إضافة عيادة أو تخصص جديد'}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">تعديل التخصصات الطبية المعروضة بجدول الحجوزات</p>
              </div>
              <button
                onClick={closeAndResetForm}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-650 flex items-center justify-center transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddOrEditSubmit} className="p-6 sm:p-8 space-y-4 text-right" dir="rtl">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">اسم التخصص أو الخدمة</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: طب وجراحة الأسنان"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">اختر الأيقونة المعبرة</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Stethoscope', 'Shield', 'User2', 'CheckCircle2', 'Heart', 'Activity'] as const).map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setIconName(icon)}
                        className={`flex items-center gap-2 p-3 rounded-xl border font-bold text-xs text-right transition-all flex-row-reverse ${
                          iconName === icon
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className={iconName === icon ? 'text-white' : 'text-slate-400'}>
                          {renderIcon(icon, 16)}
                        </div>
                        <span className="truncate">{getIconLabel(icon).split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 bg-slate-900 hover:bg-black"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>حفظ البيانات</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeAndResetForm}
                  className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicServicesPage;
