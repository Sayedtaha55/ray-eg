import React, { useEffect, useMemo, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CheckCircle2, Edit2, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import {
  BOOKING_SETTINGS_PAGE_BUTTONS,
  getBookingActivityDefinition,
  getBookingActivityExtraPageId,
} from './bookingActivityConfig';

type BookingActivityPageItem = {
  id: string;
  title: string;
  description?: string;
  price?: string;
  capacity?: string;
  schedule?: string;
};

type Props = {
  shop?: any;
  onSaved?: () => void;
  pageId?: string;
};

const emptyForm = {
  title: '',
  description: '',
  price: '',
  capacity: '',
  schedule: '',
};

const BookingActivityExtraPage: React.FC<Props> = ({ shop, onSaved, pageId: propsPageId }) => {
  const { useParams, useOutletContext } = ReactRouterDOM as any;
  const params = useParams?.() || {};
  const pageId = String(propsPageId || params.pageId || '').trim();
  const context = useOutletContext?.() || {};

  const [loadedShop, setLoadedShop] = useState<any>(shop || context.shop || null);
  const effectiveShop = shop || context.shop || loadedShop;
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  const activityDefinition = useMemo(
    () => getBookingActivityDefinition(effectiveShop?.pageDesign?.bookingActivityType),
    [effectiveShop?.pageDesign?.bookingActivityType],
  );

  const extraPages = useMemo(
    () => [
      ...activityDefinition.extraButtons.map((label, index) => ({
        id: getBookingActivityExtraPageId(label, index),
        label,
      })),
      ...BOOKING_SETTINGS_PAGE_BUTTONS,
    ],
    [activityDefinition.extraButtons],
  );

  const currentPage = extraPages.find((page) => page.id === pageId) || extraPages[0];
  const currentPageId = currentPage?.id || pageId || 'general';

  const savedPages = (effectiveShop?.pageDesign?.bookingActivityPages && typeof effectiveShop.pageDesign.bookingActivityPages === 'object')
    ? effectiveShop.pageDesign.bookingActivityPages
    : {};

  const currentItems: BookingActivityPageItem[] = Array.isArray(savedPages?.[currentPageId]?.items)
    ? savedPages[currentPageId].items
    : [];

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveItems = async (nextItems: BookingActivityPageItem[]) => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const nextPageDesign = {
        ...(effectiveShop?.pageDesign || {}),
        bookingActivityType: activityDefinition.id,
        bookingDashboardScope: 'booking_only',
        bookingActivityPages: {
          ...savedPages,
          [currentPageId]: {
            id: currentPageId,
            label: currentPage?.label || currentPageId,
            items: nextItems,
            updatedAt: new Date().toISOString(),
          },
        },
      };
      const updatedShop = await ApiService.updateMyShop({ pageDesign: nextPageDesign });
      setLoadedShop(updatedShop || { ...(effectiveShop || {}), pageDesign: nextPageDesign });
      setMessage('تم حفظ بيانات الصفحة وربطها بلوحة الحجوزات بنجاح.');
      onSaved?.();
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'فشل حفظ بيانات صفحة النشاط');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('اكتب الاسم أو العنوان أولاً');
      return;
    }

    const normalizedItem: BookingActivityPageItem = {
      id: editingId || `booking_extra_${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price.trim(),
      capacity: form.capacity.trim(),
      schedule: form.schedule.trim(),
    };

    const nextItems = editingId
      ? currentItems.map((item) => (item.id === editingId ? normalizedItem : item))
      : [...currentItems, normalizedItem];

    await saveItems(nextItems);
  };

  const startEdit = (item: BookingActivityPageItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      description: item.description || '',
      price: item.price || '',
      capacity: item.capacity || '',
      schedule: item.schedule || '',
    });
  };

  const removeItem = async (id: string) => {
    if (!window.confirm('هل تريد حذف هذا العنصر من صفحة النشاط؟')) return;
    await saveItems(currentItems.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-black text-cyan-700">
              صفحة حقيقية لنشاط {activityDefinition.title}
            </div>
            <h3 className="mt-3 text-xl md:text-2xl font-black text-slate-900">{currentPage?.label || 'صفحة نشاط الحجوزات'}</h3>
            <p className="mt-2 text-sm font-bold text-slate-500 max-w-3xl">
              أضف البيانات الخاصة بهذا الزر هنا، سواء كان زر نشاط أو زر إعدادات حجوزات، وسيتم حفظها في الباك داخل إعدادات المتجر الخاصة بالحجوزات فقط بدون التأثير على باقي الأنشطة.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs font-black text-slate-500">
            {currentItems.length} عنصر محفوظ
          </div>
        </div>

        {message && <div className="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 text-xs font-black flex items-center gap-2 justify-end"><CheckCircle2 size={16} /> {message}</div>}
        {error && <div className="mt-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 p-4 text-xs font-black">⚠️ {error}</div>}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <form onSubmit={handleSubmit} className="xl:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 justify-end">
            <Plus size={18} className="text-cyan-600" />
            <h4 className="font-black text-slate-900">{editingId ? 'تعديل عنصر' : 'إضافة عنصر جديد'}</h4>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 mb-1">الاسم / العنوان</label>
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 mb-1">وصف مختصر</label>
            <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-slate-400 mb-1">السعر / الرسوم</label>
              <input value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="مثال: 500 ج" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 mb-1">السعة / العدد</label>
              <input value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))} placeholder="مثال: 20 فرد" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 mb-1">المواعيد / السياسة</label>
            <input value={form.schedule} onChange={(e) => setForm((prev) => ({ ...prev, schedule: e.target.value }))} placeholder="مثال: يومياً من 10 إلى 6" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-black text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'حفظ التعديل' : 'حفظ العنصر'}
            </button>
            {editingId && <button type="button" onClick={resetForm} className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm">إلغاء</button>}
          </div>
        </form>

        <div className="xl:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
          <h4 className="font-black text-slate-900">البيانات المحفوظة</h4>
          {currentItems.length === 0 ? (
            <div className="mt-5 rounded-3xl bg-slate-50 border border-slate-100 p-8 text-center text-sm font-bold text-slate-400">
              لا توجد بيانات بعد. ابدأ بإضافة أول عنصر لهذه الصفحة.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentItems.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="font-black text-slate-900">{item.title}</h5>
                      {item.description && <p className="mt-2 text-xs font-bold text-slate-500 leading-6">{item.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => startEdit(item)} className="w-9 h-9 rounded-xl bg-white border border-slate-100 text-slate-700 flex items-center justify-center"><Edit2 size={15} /></button>
                      <button type="button" onClick={() => removeItem(item.id)} className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-black">
                    {item.price && <span className="rounded-2xl bg-white border border-slate-100 px-3 py-2 text-slate-600">{item.price}</span>}
                    {item.capacity && <span className="rounded-2xl bg-white border border-slate-100 px-3 py-2 text-slate-600">{item.capacity}</span>}
                    {item.schedule && <span className="rounded-2xl bg-white border border-slate-100 px-3 py-2 text-slate-600">{item.schedule}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingActivityExtraPage;
