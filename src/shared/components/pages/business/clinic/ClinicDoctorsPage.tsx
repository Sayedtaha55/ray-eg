import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as ReactRouterDOM from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  UploadCloud,
  User2,
  Star,
  Users,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { getBookingActivityVocabulary } from './bookingActivityConfig';

type Doctor = {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  next: string;
  photoUrl?: string;
};

type Props = {
  shop?: any;
  onSaved?: () => void;
};

const ClinicDoctorsPage: React.FC<Props> = ({ shop, onSaved }) => {
  const { t } = useTranslation();
  const { useLocation, useOutletContext } = ReactRouterDOM as any;
  const location = useLocation();
  const context = useOutletContext?.() || {};
  const basePath = String(location?.pathname || '').split('/').filter(Boolean)[1] || 'clinic';
  const vocab = getBookingActivityVocabulary(basePath);
  const [loadedShop, setLoadedShop] = useState<any>(shop || context.shop || null);
  const effectiveShop = shop || context.shop || loadedShop;

  useEffect(() => {
    if (context.shop && !shop) {
      setLoadedShop(context.shop);
    }
  }, [context.shop, shop]);

  useEffect(() => {
    if (shop || loadedShop) return;
    let cancelled = false;
    ApiService.getMyShop()
      .then((myShop: any) => {
        if (!cancelled) setLoadedShop(myShop);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [shop, loadedShop]);

  const doctorsList: Doctor[] = useMemo(() => {
    if (Array.isArray(effectiveShop?.pageDesign?.clinicDoctorsList)) {
      return effectiveShop.pageDesign.clinicDoctorsList;
    }
    return [];
  }, [effectiveShop?.pageDesign?.clinicDoctorsList]);

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form input states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState('4.8');
  const [reviews, setReviews] = useState('150');
  const [next, setNext] = useState('06:00 م');
  const [photoUrl, setPhotoUrl] = useState('');

  // Handle image upload robustly
  const handleUploadPhoto = async (file: File, doctorId: string) => {
    if (!effectiveShop?.id) {
      setErrorMsg('معرف النشاط غير موجود');
      return;
    }
    setUploadingId(doctorId);
    setErrorMsg('');

    try {
      const uploaded = await ApiService.uploadMediaRobust({
        file,
        purpose: 'shop_banner',
        shopId: effectiveShop.id,
      });
      const url = String(uploaded?.url || '').trim();
      if (url) {
        // Immediately update doctors list in backend
        const nextList = doctorsList.map((doc) => {
          if (doc.id === doctorId) {
            return { ...doc, photoUrl: url };
          }
          return doc;
        });
        await saveDoctorsList(nextList);
        if (editingId === doctorId) {
          setPhotoUrl(url);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || `فشل تحميل الصورة الشخصية`);
    } finally {
      setUploadingId(null);
    }
  };

  const saveDoctorsList = async (nextList: Doctor[]) => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const updatedPageDesign = {
        ...(effectiveShop?.pageDesign || {}),
        clinicDoctorsList: nextList,
      };
      const updatedShop = await ApiService.updateMyShop({
        pageDesign: updatedPageDesign,
      });
      setLoadedShop(updatedShop || { ...(effectiveShop || {}), pageDesign: updatedPageDesign });
      setSuccessMsg(`تم تحديث قائمة ${vocab.providerPlural} وحفظ التعديلات بنجاح!`);
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
      setErrorMsg(`الرجاء إدخال اسم ${vocab.providerSingular}`);
      return;
    }

    let nextList: Doctor[];
    if (editingId) {
      // Edit mode
      nextList = doctorsList.map((doc) => {
        if (doc.id === editingId) {
          return {
            ...doc,
            name: name.trim(),
            title: title.trim() || vocab.providerSingular,
            rating: parseFloat(rating) || 4.8,
            reviews: parseInt(reviews) || 120,
            next: next.trim() || '05:30 م',
            photoUrl: photoUrl.trim() || undefined,
          };
        }
        return doc;
      });
    } else {
      // Add mode
      const newDoc: Doctor = {
        id: 'doc_' + Date.now(),
        name: name.trim(),
        title: title.trim() || vocab.providerSingular,
        rating: parseFloat(rating) || 4.8,
        reviews: parseInt(reviews) || 120,
        next: next.trim() || '05:30 م',
        photoUrl: photoUrl.trim() || undefined,
      };
      nextList = [...doctorsList, newDoc];
    }

    await saveDoctorsList(nextList);
    closeAndResetForm();
  };

  const handleOpenAdd = () => {
    resetFormStates();
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingId(doc.id);
    setName(doc.name);
    setTitle(doc.title);
    setRating(String(doc.rating));
    setReviews(String(doc.reviews));
    setNext(doc.next);
    setPhotoUrl(doc.photoUrl || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف هذا من ${vocab.providerPlural}؟`)) return;
    const nextList = doctorsList.filter((doc) => doc.id !== id);
    await saveDoctorsList(nextList);
  };

  const resetFormStates = () => {
    setName('');
    setTitle('');
    setRating('4.8');
    setReviews('150');
    setNext('06:00 م');
    setPhotoUrl('');
  };

  const closeAndResetForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    resetFormStates();
  };

  return (
    <div className={context.shop !== undefined ? "text-right" : "bg-white rounded-[3.5rem] border border-slate-100 shadow-sm p-8 md:p-12 text-right"} dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 border-b border-slate-100 pb-6 flex-row-reverse">
        {context.shop === undefined ? (
          <div className="text-right">
            <div className="flex items-center gap-2.5 justify-end">
              <Sparkles size={18} className="text-cyan-500" />
              <h3 className="text-2xl md:text-3xl font-black text-slate-900">{`إدارة ${vocab.providerPlural}`}</h3>
            </div>
            <p className="text-slate-400 font-bold text-xs md:text-sm mt-2">
              {`قم بإضافة ${vocab.providerPlural}، وتحديث بياناتهم وصورهم وساعات العمل المتاحة.`}
            </p>
          </div>
        ) : <div />}
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>{vocab.addProviderButton}</span>
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
          <span>جاري حفظ البيانات وتحديث الموقع بالخارج...</span>
        </div>
      )}

      {/* Doctors Grid */}
      {doctorsList.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-350 bg-slate-50/20">
          <Users size={56} className="mx-auto mb-5 opacity-20" />
          <p className="font-black text-lg">{`لا يوجد ${vocab.providerPlural} مسجلين حالياً.`}</p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all font-black text-xs rounded-xl"
          >
            {`إضافة أول ${vocab.providerSingular}`}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorsList.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg rounded-[2.2rem] p-6 flex flex-col items-center justify-between text-center transition-all group relative overflow-hidden"
            >
              {/* Actions for each card */}
              <div className="absolute top-4 left-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(doc)}
                  className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center transition-all"
                  title={`تعديل بيانات ${vocab.providerSingular}`}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all"
                  title={`حذف ${vocab.providerSingular}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Photo Area */}
              <div className="relative w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner flex items-center justify-center text-slate-450 overflow-hidden mb-4 group-hover:scale-105 transition-transform">
                {doc.photoUrl ? (
                  <img src={doc.photoUrl} alt={doc.name} className="w-full h-full object-cover" />
                ) : (
                  <User2 size={36} />
                )}
                {uploadingId === doc.id ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                    <Loader2 className="animate-spin" size={18} />
                  </div>
                ) : (
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-black cursor-pointer transition-opacity gap-1">
                    <UploadCloud size={14} />
                    <span>تغيير الصورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadPhoto(file, doc.id);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Info */}
              <div className="space-y-1 mb-4">
                <h4 className="text-base sm:text-lg font-black text-slate-900">{doc.name}</h4>
                <p className="text-xs font-bold text-slate-400 max-w-[200px] mx-auto line-clamp-1">{doc.title}</p>
              </div>

              {/* Rating + Next slot */}
              <div className="w-full border-t border-slate-50 pt-4 flex items-center justify-between px-2 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-black">
                  <Star size={14} fill="currentColor" />
                  <span>{doc.rating}</span>
                  <span className="text-slate-350 font-bold">({doc.reviews})</span>
                </div>
                <div className="flex items-center gap-1 font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-100">
                  <Clock size={12} />
                  <span>الموعد: {doc.next}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Doctor Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-250">
            {/* Modal Header */}
            <div className="relative p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-row-reverse text-right">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingId ? `تعديل بيانات ${vocab.providerSingular}` : `إضافة ${vocab.providerSingular} جديد`}
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1">{`تعبئة مواصفات ${vocab.providerPlural} الظاهرة في الموقع`}</p>
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
                  <label className="block text-xs font-black text-slate-500 mb-1.5">{`اسم ${vocab.providerLabel}`}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={`مثال: اسم ${vocab.providerSingular}`}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 mb-1.5">المسمى الوظيفي والتخصص</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`مثال: ${vocab.providerSingular} متخصص`}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">التقييم الافتراضي (من 5)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      required
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">عدد المراجعات (التقييمات)</label>
                    <input
                      type="number"
                      required
                      value={reviews}
                      onChange={(e) => setReviews(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">ساعة أقرب كشف متاح</label>
                    <input
                      type="text"
                      required
                      value={next}
                      onChange={(e) => setNext(e.target.value)}
                      placeholder="مثال: 05:30 م"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 mb-1.5">{`رابط صورة ${vocab.providerSingular} (اختياري)`}</label>
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-xs sm:text-sm outline-none focus:bg-white focus:border-slate-900 transition-all text-left"
                    />
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
                      <span>{`حفظ ${vocab.providerSingular} والبيانات`}</span>
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

export default ClinicDoctorsPage;
