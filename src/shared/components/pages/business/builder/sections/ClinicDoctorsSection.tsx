import React, { useState } from 'react';
import { ApiService } from '@/services/api.service';
import { Plus, Trash2, Edit2, Loader2, UploadCloud, User2, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Doctor = {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  next: string;
  photoUrl?: string;
};

const DEFAULT_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'د. أحمد سليمان', title: 'استشاري جراحة العظام والمفاصل', rating: 4.9, reviews: 320, next: '05:30 م' },
  { id: 'd2', name: 'د. سارة المنصوري', title: 'استشارية الأمراض الجلدية والليزر', rating: 4.8, reviews: 210, next: '06:00 م' },
  { id: 'd3', name: 'د. محمد الراوي', title: 'أخصائي طب الأطفال وحديثي الولادة', rating: 4.7, reviews: 185, next: '07:30 م' },
];

type Props = {
  config: any;
  setConfig: (next: any) => void;
  shop?: any;
};

const ClinicDoctorsSection: React.FC<Props> = ({ config, setConfig, shop }) => {
  const { t } = useTranslation();
  const doctorsList: Doctor[] = Array.isArray(config.clinicDoctorsList)
    ? config.clinicDoctorsList
    : DEFAULT_DOCTORS;

  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for adding/editing
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState('4.8');
  const [reviews, setReviews] = useState('150');
  const [next, setNext] = useState('06:00 م');
  const [photoUrl, setPhotoUrl] = useState('');

  const setVal = (value: Doctor[]) => {
    setConfig({ ...config, clinicDoctorsList: value });
  };

  const handleUploadPhoto = async (file: File, doctorId: string) => {
    if (!shop?.id) return;
    setUploadingId(doctorId);

    try {
      const uploaded = await ApiService.uploadMediaRobust({
        file,
        purpose: 'shop_banner',
        shopId: shop.id,
      });
      const url = String(uploaded?.url || '').trim();
      if (url) {
        const nextList = doctorsList.map((doc) => {
          if (doc.id === doctorId) {
            return { ...doc, photoUrl: url };
          }
          return doc;
        });
        setVal(nextList);
        if (editingId === doctorId) {
          setPhotoUrl(url);
        }
      }
    } catch (err) {
      console.error('Failed to upload doctor photo:', err);
    } finally {
      setUploadingId(null);
    }
  };

  const handleAddDoctor = () => {
    if (!name.trim()) return;
    const newDoc: Doctor = {
      id: 'doc_' + Date.now(),
      name: name.trim(),
      title: title.trim() || 'طبيب أخصائي',
      rating: parseFloat(rating) || 4.8,
      reviews: parseInt(reviews) || 120,
      next: next.trim() || '05:30 م',
      photoUrl: photoUrl.trim() || undefined,
    };
    setVal([...doctorsList, newDoc]);
    resetForm();
  };

  const handleEditDoctor = (doc: Doctor) => {
    setEditingId(doc.id);
    setName(doc.name);
    setTitle(doc.title);
    setRating(String(doc.rating));
    setReviews(String(doc.reviews));
    setNext(doc.next);
    setPhotoUrl(doc.photoUrl || '');
  };

  const handleSaveEdit = () => {
    if (!editingId || !name.trim()) return;
    const nextList = doctorsList.map((doc) => {
      if (doc.id === editingId) {
        return {
          ...doc,
          name: name.trim(),
          title: title.trim(),
          rating: parseFloat(rating) || 4.8,
          reviews: parseInt(reviews) || 120,
          next: next.trim(),
          photoUrl: photoUrl.trim() || undefined,
        };
      }
      return doc;
    });
    setVal(nextList);
    resetForm();
  };

  const handleDeleteDoctor = (id: string) => {
    const nextList = doctorsList.filter((doc) => doc.id !== id);
    setVal(nextList);
    if (editingId === id) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setTitle('');
    setRating('4.8');
    setReviews('150');
    setNext('06:00 م');
    setPhotoUrl('');
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <div className="border-r-4 border-cyan-400 pr-2">
        <h3 className="text-xs font-black text-slate-900">إدارة أطباء المركز والعيادة</h3>
        <p className="text-[10px] font-bold text-slate-500 mt-0.5">يمكنك إضافة أطباء جدد، تعديل معلوماتهم، أو تحميل صور مخصصة لكل طبيب.</p>
      </div>

      {/* Editor Form (Add or Edit) */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3 shadow-inner">
        <span className="text-[10px] font-black text-cyan-600 block">
          {editingId ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد للمركز'}
        </span>

        <div className="space-y-2">
          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-0.5">اسم الطبيب بالكامل</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              placeholder="مثال: د. مجدي يعقوب"
            />
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-0.5">التخصص / المسمى الوظيفي</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              placeholder="مثال: استشاري جراحة القلب والأوعية الدموية"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black text-slate-400 block mb-0.5">التقييم (من 5.0)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                placeholder="4.9"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 block mb-0.5">عدد التقييمات / المرضى</label>
              <input
                type="number"
                value={reviews}
                onChange={(e) => setReviews(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                placeholder="150"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-0.5">موعد الحجز القادم المتاح</label>
            <input
              type="text"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              placeholder="مثال: اليوم 05:30 م"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-[9px] font-black text-slate-400 block mb-1">صورة الطبيب الشخصية</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="doc-photo-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (editingId) {
                      handleUploadPhoto(file, editingId);
                    } else {
                      // For a new doctor, upload using temporary id
                      handleUploadPhoto(file, 'new_temp');
                    }
                  }
                }}
              />
              <label
                htmlFor="doc-photo-upload"
                className="flex-1 bg-white border border-slate-200 border-dashed rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all min-h-[60px]"
              >
                {uploadingId === (editingId || 'new_temp') ? (
                  <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-slate-400 mb-0.5" />
                    <span className="text-[9px] font-bold text-slate-500">رفع صورة الطبيب</span>
                  </>
                )}
              </label>
              {(photoUrl || (editingId === 'new_temp' && photoUrl)) && (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                  <img src={photoUrl} alt="Doc Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-0.5 left-0.5 p-0.5 bg-black/50 text-white rounded-full hover:bg-black/75"
                  >
                    <Trash2 size={8} />
                  </button>
                </div>
              )}
            </div>
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
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-xs font-black bg-slate-200 hover:bg-slate-350 text-slate-700 transition-all"
              >
                إلغاء
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleAddDoctor}
              className="w-full py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-black text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <Plus size={14} />
              <span>إضافة الطبيب للقائمة</span>
            </button>
          )}
        </div>
      </div>

      {/* Doctor List */}
      <div className="space-y-2">
        <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">الأطباء الحاليين ({doctorsList.length})</span>
        <div className="divide-y divide-slate-100 border border-slate-150 rounded-2xl overflow-hidden bg-white max-h-[260px] overflow-y-auto">
          {doctorsList.map((doc) => (
            <div key={doc.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400">
                  {doc.photoUrl ? (
                    <img src={doc.photoUrl} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <User2 size={18} />
                  )}
                </div>
                <div>
                  <span className="font-black text-xs text-slate-900 block leading-tight">{doc.name}</span>
                  <span className="text-[9px] text-slate-400 font-bold leading-none block mt-0.5">{doc.title}</span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-500 mt-1 bg-amber-50 px-1 rounded">
                    <Star size={9} className="fill-amber-500 text-amber-500" />
                    {doc.rating} ({doc.reviews})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleEditDoctor(doc)}
                  className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDoctor(doc.id)}
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

export default ClinicDoctorsSection;
