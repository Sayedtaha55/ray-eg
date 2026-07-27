/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingServicesPage.tsx
 * صفحة الخدمات - تخصصات، خدمات، إلخ
 * ═══════════════════════════════════════════
 */
import React, { useEffect, useState } from 'react';
import {
  ListChecks, Plus, Loader2, Search, PackagePlus, Trash2, X,
  Clock, DollarSign, Edit3, CheckCircle2, XCircle, FileText,
  Tag, Camera,
} from 'lucide-react';
import type { BookingActivityType } from '../config';
import { getLocalizedVocabulary } from '../config';
import { ApiService } from '@/services/api.service';
import type { BookingService } from '../types';
import { getEffectiveShop } from './utils';
import { useImageUpload } from './useImageUpload';
import { useTranslation } from 'react-i18next';

type Service = BookingService & {
  price: number;
  duration: number;
  category?: string;
  active?: boolean;
  imageUrl?: string;
};

type Props = { activityType: BookingActivityType; shop?: any };

const EMPTY_FORM = { name: '', price: '', duration: '30', description: '', category: '', imageUrl: '' };

const getCategoryColor = (cat?: string) => 'bg-slate-100 text-slate-600';

const BookingServicesPage: React.FC<Props> = ({ activityType, shop }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  const vocab = getLocalizedVocabulary(activityType, lang);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const { upload: uploadImage, state: uploadState } = useImageUpload();

  const getShop = () => getEffectiveShop(shop);

  const loadData = () => {
    const shop = getShop();
    if (!shop?.id) { setLoading(false); return; }
    ApiService.getShopServices?.(shop.id, activityType)
      .then((data: any) => setServices(Array.isArray(data) ? data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); loadData(); }, [activityType, shop?.id]);

  const openAdd = () => { setEditing(null); setForm({ ...EMPTY_FORM }); setModalMode('add'); };
  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({ name: s.name, price: String(s.price ?? ''), duration: String(s.duration ?? 30), description: s.description || '', category: s.category || '', imageUrl: s.imageUrl || '' });
    setModalMode('edit');
  };
  const closeModal = () => { setModalMode(null); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const shop = getShop();
    if (!shop?.id) return;
    setSubmitting(true);
    try {
      const payload = {
        shopId: shop.id, activityType,
        name: form.name.trim(),
        price: Number(form.price) || 0,
        duration: Number(form.duration) || 30,
        description: form.description.trim() || undefined,
        category: form.category.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        active: true,
      };
      if (modalMode === 'edit' && editing?.id) {
        await ApiService.updateShopService?.(editing.id, payload);
      } else {
        await ApiService.addShopService?.(payload);
      }
      closeModal();
      loadData();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isEn ? 'Are you sure you want to delete?' : 'هل أنت متأكد من الحذف؟')) return;
    try { await ApiService.deleteShopService?.(id, activityType); loadData(); } catch { /* silent */ }
  };

  const handleToggle = async (s: Service) => {
    const shop = getShop();
    if (!shop?.id) return;
    try {
      await ApiService.updateShopService?.(s.id, { ...s, shopId: shop.id, activityType, active: !s.active });
      setServices(prev => prev.map(x => x.id === s.id ? { ...x, active: !x.active } : x));
    } catch { /* silent */ }
  };

  const filtered = services.filter(s => !search || (s.name || '').toLowerCase().includes(search.toLowerCase()));
  const active = services.filter(s => s.active !== false).length;

  if (loading) return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
      <p className="font-bold text-slate-400">{isEn ? `Loading ${vocab.servicePlural}...` : `جاري تحميل ${vocab.servicePlural}...`}</p>
    </div>
  );

  return (
    <div className="space-y-6 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Header */}
      <div className="bg-gradient-to-l from-violet-50 to-white rounded-[2rem] border border-violet-100 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
            <ListChecks className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{vocab.servicePlural}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{services.length} {vocab.serviceSingular} • {active} {isEn ? 'active' : 'نشط'}</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-md">
          <Plus className="w-4 h-4" /> {isEn ? 'Add' : 'إضافة'} {vocab.serviceSingular}
        </button>
      </div>


      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder={isEn ? `Search ${vocab.servicePlural}...` : `بحث في ${vocab.servicePlural}...`} value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 shadow-sm" />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <PackagePlus className="w-14 h-14 text-slate-200 mx-auto mb-3" />
          <p className="font-black text-slate-500">{isEn ? `No ${vocab.serviceSingular} yet` : `لا يوجد ${vocab.serviceSingular} حالياً`}</p>
          <p className="text-xs text-slate-400 mt-1">{isEn ? `Add a ${vocab.serviceSingular} to start receiving bookings` : `أضف ${vocab.serviceSingular} لبدء استقبال الحجوزات`}</p>
          <button onClick={openAdd} className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all">{isEn ? `+ Add first ${vocab.serviceSingular}` : `+ إضافة أول ${vocab.serviceSingular}`}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((svc) => (
            <div key={svc.id} className={`bg-white rounded-[2rem] border shadow-sm hover:shadow-md transition-all overflow-hidden ${svc.active === false ? 'opacity-60 border-slate-100' : 'border-slate-100 hover:border-violet-100'}`}>
              {svc.imageUrl && (
                <div className="h-32 bg-slate-100 overflow-hidden">
                  <img src={svc.imageUrl} alt={svc.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 text-base">{svc.name}</div>
                    {svc.category && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg inline-block mt-1 ${getCategoryColor(svc.category)}`}>
                        {svc.category}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-black text-slate-900 shrink-0">{svc.price > 0 ? `${svc.price} ${isEn ? 'EGP' : 'ج.م'}` : (isEn ? 'Free' : 'مجاني')}</div>
                </div>

                {svc.description && (
                  <p className="text-xs text-slate-400 font-bold leading-relaxed mb-3 line-clamp-2">{svc.description}</p>
                )}

                <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1"><Clock size={11} /> {svc.duration} {isEn ? 'min' : 'دقيقة'}</span>
                  <span className="flex items-center gap-1"><DollarSign size={11} /> {svc.price > 0 ? `${svc.price} ${isEn ? 'EGP' : 'ج.م'}` : (isEn ? 'Free' : 'مجاني')}</span>
                </div>
              </div>

              <div className="border-t border-slate-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(svc)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all" title={isEn ? 'Edit' : 'تعديل'}><Edit3 size={15} /></button>
                  <button onClick={() => handleDelete(svc.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title={isEn ? 'Delete' : 'حذف'}><Trash2 size={15} /></button>
                </div>
                <button onClick={() => handleToggle(svc)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl transition-all ${svc.active !== false ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  {svc.active !== false ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {svc.active !== false ? (isEn ? 'Active' : 'نشط') : (isEn ? 'Inactive' : 'غير نشط')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" dir={isEn ? 'ltr' : 'rtl'}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-black text-slate-900">{modalMode === 'edit' ? (isEn ? `Edit ${vocab.serviceSingular}` : `تعديل ${vocab.serviceSingular}`) : (isEn ? `Add New ${vocab.serviceSingular}` : `إضافة ${vocab.serviceSingular} جديد`)}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <Camera size={13} /> {isEn ? 'Service Image' : 'صورة الخدمة'}
                  </label>
                  <div className="flex items-center gap-3">
                    {form.imageUrl && (
                      <img src={form.imageUrl} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 py-3 text-center text-xs font-black text-slate-500 hover:border-violet-300 hover:bg-violet-50/30 transition-all">
                        {uploadState === 'compressing' && (isEn ? 'Compressing...' : 'جاري الضغط...')}
                        {uploadState === 'uploading' && (isEn ? 'Uploading...' : 'جاري الرفع...')}
                        {uploadState === 'error' && <span className="text-red-500">{isEn ? 'Upload failed' : 'فشل الرفع'}</span>}
                        {uploadState === 'idle' && (form.imageUrl ? (isEn ? 'Change Image' : 'تغيير الصورة') : (isEn ? 'Choose from device' : 'اختر صورة من الجهاز'))}
                        {uploadState === 'done' && (form.imageUrl ? (isEn ? 'Change Image' : 'تغيير الصورة') : (isEn ? 'Choose from device' : 'اختر صورة من الجهاز'))}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const shop = getShop();
                          const result = await uploadImage(file, {
                            maxWidth: 800,
                            maxHeight: 600,
                            quality: 0.82,
                            purpose: 'booking_service',
                            shopId: shop?.id,
                          });
                          if (result?.url) {
                            setForm(f => ({ ...f, imageUrl: result.url }));
                          }
                        }}
                      />
                    </label>
                    {form.imageUrl && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))} title={isEn ? 'Remove image' : 'إزالة الصورة'}
                        className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 text-xs">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1.5">{isEn ? `${vocab.serviceSingular} Name *` : `اسم ${vocab.serviceSingular} *`}</label>
                  <input type="text" required placeholder={vocab.serviceSingular} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-violet-300" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1.5 flex items-center gap-1"><DollarSign size={12} /> {isEn ? 'Price (EGP)' : 'السعر (ج.م)'}</label>
                    <input type="number" min="0" placeholder="150" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-violet-300" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1.5 flex items-center gap-1"><Clock size={12} /> {isEn ? 'Duration (min)' : 'المدة (دقيقة)'}</label>
                    <input type="number" min="1" placeholder="30" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-violet-300" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1.5 flex items-center gap-1"><Tag size={12} /> {isEn ? 'Category' : 'التصنيف'}</label>
                  <input type="text" placeholder={vocab.servicePlural} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-violet-300" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1.5 flex items-center gap-1"><FileText size={12} /> {isEn ? 'Description' : 'وصف مختصر'}</label>
                  <textarea rows={2} placeholder={isEn ? 'Service details...' : 'تفاصيل الخدمة...'} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-violet-300 resize-none" />
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button type="submit" disabled={submitting || !form.name.trim()}
                  className="flex-1 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalMode === 'edit' ? (isEn ? 'Save Changes' : 'حفظ التعديلات') : (isEn ? 'Add' : 'إضافة')}
                </button>
                <button type="button" onClick={closeModal} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all">{isEn ? 'Cancel' : 'إلغاء'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingServicesPage;

