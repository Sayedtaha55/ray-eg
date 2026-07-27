/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingProvidersPage.tsx
 * صفحة مقدمي الخدمة - أطباء، خبراء، مدربين، إلخ
 * ═══════════════════════════════════════════
 */
import React, { useEffect, useState } from 'react';
import {
  Users, Plus, Loader2, Search, UserPlus, Trash2, X,
  Phone, Star, Briefcase, Clock, Edit3, CheckCircle2, XCircle,
  Camera, FileText,
} from 'lucide-react';
import type { BookingActivityType } from '../config';
import { getLocalizedVocabulary } from '../config';
import { ApiService } from '@/services/api.service';
import type { BookingProvider } from '../types';
import { getEffectiveShop, getLocalizedDays } from './utils';
import { useImageUpload } from './useImageUpload';
import { useTranslation } from 'react-i18next';

type Provider = BookingProvider & {
  specialty: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  active: boolean;
  experience?: number;
  rating?: number;
  totalReviews?: number;
  workingDays?: string[];
};

type Props = { activityType: BookingActivityType; shop?: any };

const EMPTY_FORM = {
  name: '', specialty: '', phone: '', photoUrl: '', bio: '',
  experience: '', workingDays: [] as string[],
};

const StarRow: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
    ))}
  </div>
);

const BookingProvidersPage: React.FC<Props> = ({ activityType, shop }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  const vocab = getLocalizedVocabulary(activityType, lang);
  const DAYS = getLocalizedDays(lang);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const { upload: uploadImage, state: uploadState } = useImageUpload();

  const getShop = () => getEffectiveShop(shop);

  const loadData = async () => {
    setLoading(true);
    const shop = getShop();
    if (!shop?.id) { setLoading(false); return; }
    try {
      const data: any = await ApiService.getShopProviders?.(shop.id, activityType);
      setProviders(Array.isArray(data) ? data : []);
    } catch { setProviders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [activityType, shop?.id]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setModalMode('add');
  };

  const openEdit = (p: Provider) => {
    setEditing(p);
    setForm({
      name: p.name,
      specialty: p.specialty || '',
      phone: p.phone || '',
      photoUrl: p.photoUrl || '',
      bio: p.bio || '',
      experience: p.experience != null ? String(p.experience) : '',
      workingDays: p.workingDays || [],
    });
    setModalMode('edit');
  };

  const closeModal = () => { setModalMode(null); setEditing(null); };

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter(d => d !== day)
        : [...f.workingDays, day],
    }));
  };

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
        specialty: form.specialty.trim() || vocab.providerSingular,
        phone: form.phone.trim() || undefined,
        photoUrl: form.photoUrl.trim() || undefined,
        bio: form.bio.trim() || undefined,
        experience: form.experience ? Number(form.experience) : undefined,
        workingDays: form.workingDays,
        active: true,
      };
      if (modalMode === 'edit' && editing?.id) {
        await ApiService.updateShopProvider?.(editing.id, payload);
      } else {
        await ApiService.addShopProvider?.(payload);
      }
      closeModal();
      loadData();
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isEn ? 'Are you sure you want to delete this item?' : 'هل أنت متأكد من حذف هذا العنصر؟')) return;
    try {
      await ApiService.deleteShopProvider?.(id, activityType);
      loadData();
    } catch { /* silent */ }
  };

  const handleToggleActive = async (p: Provider) => {
    const shop = getShop();
    if (!shop?.id) return;
    try {
      await ApiService.updateShopProvider?.(p.id, { ...p, shopId: shop.id, activityType, active: !p.active });
      setProviders(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
    } catch { /* silent */ }
  };

  const filtered = providers.filter(p =>
    !search || (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.specialty || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
        <p className="font-bold text-slate-400">{isEn ? `Loading ${vocab.providerPlural}...` : `جاري تحميل ${vocab.providerPlural}...`}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      {/* Header */}
      <div className="bg-gradient-to-l from-cyan-50 to-white rounded-[2rem] border border-cyan-100 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/15 flex items-center justify-center">
            <Users className="w-6 h-6 text-[#00E5FF]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{vocab.providerPlural}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{providers.length} {vocab.providerSingular} {isEn ? 'registered' : 'مسجل'}</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          {isEn ? 'Add' : 'إضافة'} {vocab.providerSingular}
        </button>
      </div>


      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={isEn ? `Search ${vocab.providerPlural}...` : `بحث في ${vocab.providerPlural}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-300 shadow-sm"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <UserPlus className="w-14 h-14 text-slate-200 mx-auto mb-3" />
          <p className="font-black text-slate-500">{isEn ? `No ${vocab.providerSingular} yet` : `لا يوجد ${vocab.providerSingular} حالياً`}</p>
          <p className="text-xs text-slate-400 mt-1">{isEn ? `Add a ${vocab.providerSingular} to start receiving bookings` : `أضف ${vocab.providerSingular} لبدء استقبال الحجوزات`}</p>
          <button onClick={openAdd} className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all">
            {isEn ? `+ Add first ${vocab.providerSingular}` : `+ إضافة أول ${vocab.providerSingular}`}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className={`bg-white rounded-[2rem] border shadow-sm hover:shadow-lg transition-all overflow-hidden ${p.active === false ? 'opacity-60 border-slate-100' : 'border-slate-100 hover:border-cyan-100'}`}>
              {/* Card top */}
              <div className="bg-gradient-to-l from-cyan-50/60 to-slate-50/40 p-5 flex items-start gap-4">
                <div className="shrink-0">
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E5FF]/30 to-emerald-100 flex items-center justify-center text-2xl font-black text-[#0097A7] shadow-inner">
                      {(p.name || (isEn ? '?' : '؟'))[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-slate-900 text-base leading-tight truncate">{p.name}</div>
                  <div className="text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-lg inline-block mt-1">{p.specialty}</div>
                  {(p.rating != null && p.rating > 0) && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <StarRow rating={p.rating} />
                      <span className="text-[10px] font-black text-slate-400">{p.rating.toFixed(1)} ({p.totalReviews || 0})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="px-5 pb-4 space-y-2">
                {p.phone && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Phone size={12} className="text-slate-400" /> {p.phone}
                  </div>
                )}
                {p.experience != null && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Briefcase size={12} className="text-slate-400" /> {isEn ? `${p.experience} years exp` : `خبرة ${p.experience} سنة`}
                  </div>
                )}
                {p.workingDays && p.workingDays.length > 0 && (
                  <div className="flex items-start gap-2 text-xs font-bold text-slate-500">
                    <Clock size={12} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{p.workingDays.join(' • ')}</span>
                  </div>
                )}
                {p.bio && (
                  <p className="text-xs text-slate-400 font-bold leading-relaxed line-clamp-2 border-t border-slate-50 pt-2 mt-2">{p.bio}</p>
                )}
              </div>

              {/* Card footer */}
              <div className="border-t border-slate-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all"
                    title={isEn ? 'Edit' : 'تعديل'}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title={isEn ? 'Delete' : 'حذف'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <button
                  onClick={() => handleToggleActive(p)}
                  className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl transition-all ${p.active !== false ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  {p.active !== false ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {p.active !== false ? (isEn ? 'Active' : 'نشط') : (isEn ? 'Inactive' : 'غير نشط')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col" dir={isEn ? 'ltr' : 'rtl'}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-black text-slate-900">
                {modalMode === 'edit' ? (isEn ? `Edit ${vocab.providerSingular}` : `تعديل بيانات ${vocab.providerSingular}`) : (isEn ? `Add New ${vocab.providerSingular}` : `إضافة ${vocab.providerSingular} جديد`)}
              </h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto flex-1">
              <div className="p-6 space-y-4">
                {/* Photo Upload */}
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <Camera size={13} /> {isEn ? 'Profile Photo' : 'الصورة الشخصية'}
                  </label>
                  <div className="flex items-center gap-3">
                    {form.photoUrl && (
                      <img src={form.photoUrl} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full bg-slate-50 border border-dashed border-slate-300 rounded-xl px-4 py-3 text-center text-xs font-black text-slate-500 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all">
                        {uploadState === 'compressing' && (isEn ? 'Compressing...' : 'جاري الضغط...')}
                        {uploadState === 'uploading' && (isEn ? 'Uploading...' : 'جاري الرفع...')}
                        {uploadState === 'error' && <span className="text-red-500">{isEn ? 'Upload failed' : 'فشل الرفع'}</span>}
                        {uploadState === 'idle' && (form.photoUrl ? (isEn ? 'Change Photo' : 'تغيير الصورة') : (isEn ? 'Choose from device' : 'اختر صورة من الجهاز'))}
                        {uploadState === 'done' && (form.photoUrl ? (isEn ? 'Change Photo' : 'تغيير الصورة') : (isEn ? 'Choose from device' : 'اختر صورة من الجهاز'))}
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
                            maxWidth: 600,
                            maxHeight: 600,
                            quality: 0.85,
                            purpose: 'booking_provider',
                            shopId: shop?.id,
                          });
                          if (result?.url) {
                            setForm(f => ({ ...f, photoUrl: result.url }));
                          }
                        }}
                      />
                    </label>
                    {form.photoUrl && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, photoUrl: '' }))} title={isEn ? 'Remove photo' : 'إزالة الصورة'}
                        className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 text-xs">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Name + Specialty */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1.5">{isEn ? 'Full Name *' : 'الاسم الكامل *'}</label>
                    <input
                      type="text" required
                      placeholder={vocab.providerDefaultTitle}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1.5">{isEn ? 'Specialty' : 'التخصص'}</label>
                    <input
                      type="text"
                      placeholder={vocab.providerTitleLabel}
                      value={form.specialty}
                      onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
                    />
                  </div>
                </div>

                {/* Phone + Experience */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1.5 flex items-center gap-1"><Phone size={12} /> {isEn ? 'Phone' : 'رقم الهاتف'}</label>
                    <input
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-600 block mb-1.5 flex items-center gap-1"><Briefcase size={12} /> {isEn ? 'Years of experience' : 'سنوات الخبرة'}</label>
                    <input
                      type="number" min="0" max="60"
                      placeholder={isEn ? 'e.g. 5' : 'مثال: 5'}
                      value={form.experience}
                      onChange={e => setForm(f => ({ ...f, experience: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-1.5 flex items-center gap-1"><FileText size={12} /> {isEn ? 'Short bio' : 'نبذة مختصرة'}</label>
                  <textarea
                    rows={2}
                    placeholder={isEn ? `${vocab.providerDefaultTitle} specializing in...` : `${vocab.providerDefaultTitle} متخصص في...`}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300 resize-none"
                  />
                </div>

                {/* Working Days */}
                <div>
                  <label className="text-xs font-black text-slate-600 block mb-2 flex items-center gap-1"><Clock size={12} /> {isEn ? 'Working Days' : 'أيام العمل'}</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button
                        key={day} type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${form.workingDays.includes(day) ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 flex gap-3 shrink-0">
                <button
                  type="submit" disabled={submitting || !form.name.trim()}
                  className="flex-1 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalMode === 'edit' ? (isEn ? 'Save Changes' : 'حفظ التعديلات') : (isEn ? 'Add' : 'إضافة')}
                </button>
                <button type="button" onClick={closeModal} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all">
                  {isEn ? 'Cancel' : 'إلغاء'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingProvidersPage;

