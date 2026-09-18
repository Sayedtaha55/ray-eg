'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { apiRequestWithMeta } from '@/lib/api/client';
import { useShop } from '@/hooks/useShop';
import { useDebouncedValue } from '@/lib/useDebouncedValue';

/* ============================================================
 * نموذج العميل المشترك — إضافة/تعديل (صفحة كاملة وليست بطاقة)
 * فحص التكرار live برقم الهاتف قبل الإرسال
 * ============================================================ */

export type CustomerFormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  customerType: 'individual' | 'company';
  companyName: string;
  taxNumber: string;
  contactPerson: string;
  branch: string;
  source: string;
  segmentId: string;
  tags: string[];
  notes: string;
  shippingAddresses: { label: string; address: string; city: string; phone: string }[];
};

export const EMPTY_CUSTOMER: CustomerFormValues = {
  name: '', phone: '', email: '', address: '', city: '', country: 'مصر',
  customerType: 'individual', companyName: '', taxNumber: '', contactPerson: '',
  branch: '', source: 'manual', segmentId: '', tags: [], notes: '',
  shippingAddresses: [],
};

const SOURCE_OPTIONS = [
  { value: 'manual', label: 'إضافة يدوية' },
  { value: 'pos', label: 'الكاشير' },
  { value: 'website', label: 'الموقع' },
  { value: 'bookings', label: 'الحجوزات' },
  { value: 'services', label: 'الخدمات' },
  { value: 'import', label: 'استيراد' },
  { value: 'app', label: 'تطبيق العميل' },
];

const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 outline-none text-sm font-bold focus:ring-2 focus:ring-slate-200';
const labelCls = 'text-xs font-bold text-slate-500 mb-1.5 block';

export default function CustomerForm({
  mode,
  customerId,
  initial,
}: {
  mode: 'create' | 'edit';
  customerId?: string;
  initial?: Partial<CustomerFormValues>;
}) {
  const router = useRouter();
  const { shop } = useShop();
  const shopId = shop?.id || '';
  const [values, setValues] = useState<CustomerFormValues>({ ...EMPTY_CUSTOMER, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState<{ id: string; name: string; nameAr?: string; color?: string }[]>([]);
  const [segments, setSegments] = useState<{ id: string; name: string; nameAr?: string }[]>([]);
  const [dupCustomer, setDupCustomer] = useState<{ id: string; name: string; code: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [forceCreate, setForceCreate] = useState(false);
  const debouncedPhone = useDebouncedValue(values.phone, 500);

  // تحميل الشرائح والوسوم
  useEffect(() => {
    if (!shopId) return;
    (async () => {
      const [tagsRes, segRes] = await Promise.allSettled([
        apiRequest(`/shops/${shopId}/tags`),
        apiRequest(`/shops/${shopId}/segments`),
      ]);
      if (tagsRes.status === 'fulfilled') {
        const t = Array.isArray(tagsRes.value) ? tagsRes.value : tagsRes.value?.data || [];
        setTags(Array.isArray(t) ? t : []);
      }
      if (segRes.status === 'fulfilled') {
        const s = Array.isArray(segRes.value) ? segRes.value : segRes.value?.data || [];
        setSegments(Array.isArray(s) ? s : []);
      }
    })();
  }, [shopId]);

  // فحص التكرار live برقم الهاتف (إنشاء فقط)
  useEffect(() => {
    if (mode !== 'create' || !shopId) return;
    const digits = debouncedPhone.replace(/\D/g, '');
    if (digits.length < 6) { setDupCustomer(null); return; }
    let cancelled = false;
    setChecking(true);
    (async () => {
      try {
        const res = await apiRequest(`/shops/${shopId}/customers?query=${encodeURIComponent(digits)}&limit=5`);
        const list = Array.isArray(res) ? res : res?.data || [];
        const normalized = digits;
        const match = (Array.isArray(list) ? list : []).find((c: any) =>
          String(c.phone || '').replace(/\D/g, '').endsWith(normalized) || normalized.endsWith(String(c.phone || '').replace(/\D/g, ''))
        );
        if (!cancelled) setDupCustomer(match ? { id: match.id, name: match.name, code: match.code } : null);
      } catch { if (!cancelled) setDupCustomer(null); }
      finally { if (!cancelled) setChecking(false); }
    })();
    return () => { cancelled = true; };
  }, [debouncedPhone, mode, shopId]);

  const set = <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const setShipping = (idx: number, key: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      shippingAddresses: prev.shippingAddresses.map((a, i) => (i === idx ? { ...a, [key]: value } : a)),
    }));
  };

  const toggleTag = (id: string) => {
    setValues((prev) => ({
      ...prev,
      tags: prev.tags.includes(id) ? prev.tags.filter((t) => t !== id) : [...prev.tags, id],
    }));
  };

  const submit = async () => {
    setError('');
    if (!values.phone.trim()) { setError('رقم الهاتف مطلوب'); return; }
    if (!values.name.trim() && !values.companyName.trim()) { setError('الاسم مطلوب (أو اسم الشركة)'); return; }
    setSaving(true);
    try {
      const body: any = {
        name: values.name.trim() || values.companyName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        address: values.address,
        city: values.city,
        country: values.country,
        customerType: values.customerType,
        companyName: values.companyName,
        taxNumber: values.taxNumber,
        branch: values.branch,
        source: values.source,
        segmentId: values.segmentId,
        tags: values.tags,
        notes: values.notes,
        shippingAddresses: values.shippingAddresses,
        addresses: [],
      };
      if (values.customerType === 'company') {
        body.contactPerson = values.contactPerson;
        if (!body.name) body.name = values.companyName;
      }
      if (mode === 'create') {
        // apiRequestWithMeta يرجّع {data, raw} — raw يحمل علامة created للتمييز بين إنشاء جديد وتكرار
        const res = await apiRequestWithMeta(`/shops/${shopId}/customers`, { method: 'POST', body: JSON.stringify(body) });
        const customer = res?.data as any;
        const created = res?.raw?.created !== false;
        if (!created && customer?.id) {
          // الباك اند منع التكرار واستخدم السجل الموجود
          router.push(`/dashboard/crm/${customer.id}`);
          return;
        }
        router.push(`/dashboard/crm/${customer?.id || ''}`);
        return;
      } else if (customerId) {
        await apiRequest(`/shops/${shopId}/customers/${customerId}`, { method: 'PATCH', body: JSON.stringify(body) });
        router.push(`/dashboard/crm/${customerId}`);
      }
      router.refresh();
    } catch (e: any) {
      setError(String(e?.message || 'فشل الحفظ'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[12px] font-bold">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {/* تنبيه التكرار */}
      {mode === 'create' && (checking || dupCustomer) && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          {checking ? (
            <span className="flex items-center gap-2 text-amber-700 text-xs font-bold">
              <Loader2 size={14} className="animate-spin" /> جاري التحقق من رقم الهاتف...
            </span>
          ) : dupCustomer ? (
            <>
              <span className="flex items-center gap-2 text-amber-700 text-xs font-bold">
                <AlertTriangle size={15} />
                العميل موجود بالفعل: {dupCustomer.name} ({dupCustomer.code}) — نفس رقم الهاتف
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/crm/${dupCustomer.id}`)}
                  className="h-8 px-3 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-700"
                >
                  فتح الملف الموجود
                </button>
                {!forceCreate && (
                  <button
                    type="button"
                    onClick={() => setForceCreate(true)}
                    className="h-8 px-3 rounded-lg bg-white border border-amber-300 text-amber-700 text-[11px] font-bold hover:bg-amber-100"
                  >
                    متابعة الإنشاء
                  </button>
                )}
              </div>
            </>
          ) : (
            <span className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
              <CheckCircle2 size={15} /> الرقم غير مسجل — عميل جديد
            </span>
          )}
        </div>
      )}

      {/* أساسية */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">البيانات الأساسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>الاسم {mode === 'create' && <span className="text-slate-300">(أو اسم الشركة بالأسفل)</span>}</label>
            <input value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="اسم العميل" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>رقم الهاتف <span className="text-red-500">*</span></label>
            <input value={values.phone} onChange={(e) => set('phone', e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" className={`${inputCls} text-right`} inputMode="tel" />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>البريد الإلكتروني</label>
            <input value={values.email} onChange={(e) => set('email', e.target.value)} placeholder="email@example.com" dir="ltr" className={inputCls} />
          </div>
        </div>
      </div>

      {/* العنوان */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">العنوان</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className={labelCls}>العنوان الأساسي</label>
            <input value={values.address} onChange={(e) => set('address', e.target.value)} placeholder="العنوان" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>المدينة</label>
            <input value={values.city} onChange={(e) => set('city', e.target.value)} placeholder="المدينة" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>البلد</label>
            <input value={values.country} onChange={(e) => set('country', e.target.value)} placeholder="البلد" className={inputCls} />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">عناوين الشحن</span>
            <button
              type="button"
              onClick={() => set('shippingAddresses', [...values.shippingAddresses, { label: '', address: '', city: '', phone: '' }])}
              className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100 flex items-center gap-1"
            >
              <Plus size={12} />
              إضافة عنوان شحن
            </button>
          </div>
          {values.shippingAddresses.length === 0 && (
            <p className="text-[11px] text-slate-400 font-semibold">لا توجد عناوين شحن إضافية</p>
          )}
          <div className="space-y-2">
            {values.shippingAddresses.map((a, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center bg-slate-50 rounded-xl p-3">
                <input value={a.label} onChange={(e) => setShipping(idx, 'label', e.target.value)} placeholder="الاسم (المنزل/العمل)" className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none" />
                <input value={a.address} onChange={(e) => setShipping(idx, 'address', e.target.value)} placeholder="العنوان" className="md:col-span-2 w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none" />
                <input value={a.city} onChange={(e) => setShipping(idx, 'city', e.target.value)} placeholder="المدينة" className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none" />
                <div className="flex items-center gap-2">
                  <input value={a.phone} onChange={(e) => setShipping(idx, 'phone', e.target.value)} placeholder="هاتف" dir="ltr" className="flex-1 w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs font-bold outline-none text-right" />
                  <button
                    type="button"
                    onClick={() => set('shippingAddresses', values.shippingAddresses.filter((_, i) => i !== idx))}
                    className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* التصنيف */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">التصنيف</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>نوع العميل</label>
            <div className="flex gap-2">
              {[['individual', 'فرد'], ['company', 'شركة']].map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set('customerType', v as any)}
                  className={`flex-1 h-10 rounded-xl text-xs font-bold border transition-all ${
                    values.customerType === v ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {values.customerType === 'company' && (
            <>
              <div>
                <label className={labelCls}>اسم الشركة</label>
                <input value={values.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="اسم الشركة" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>الرقم الضريبي</label>
                <input value={values.taxNumber} onChange={(e) => set('taxNumber', e.target.value)} placeholder="الرقم الضريبي" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>جهة الاتصال</label>
                <input value={values.contactPerson} onChange={(e) => set('contactPerson', e.target.value)} placeholder="مسؤول التواصل" className={inputCls} />
              </div>
            </>
          )}
          <div>
            <label className={labelCls}>الشريحة</label>
            <select value={values.segmentId} onChange={(e) => set('segmentId', e.target.value)} className={inputCls}>
              <option value="">بدون شريحة</option>
              {segments.map((s) => <option key={s.id} value={s.id}>{s.nameAr || s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>الفرع</label>
            <input value={values.branch} onChange={(e) => set('branch', e.target.value)} placeholder="الفرع" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>مصدر العميل</label>
            <select value={values.source} onChange={(e) => set('source', e.target.value)} className={inputCls}>
              {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>الوسوم</label>
            {tags.length === 0 ? (
              <p className="text-[11px] text-slate-400 font-semibold">لا توجد وسوم بعد — أنشئها من صفحة الوسوم</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => {
                  const active = values.tags.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${active ? 'text-white border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      style={active ? { backgroundColor: t.color || '#334155' } : {}}
                    >
                      {t.nameAr || t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>ملاحظات</label>
            <textarea value={values.notes} onChange={(e) => set('notes', e.target.value)} placeholder="ملاحظات عن العميل" rows={2} className={`${inputCls} resize-none`} />
          </div>
        </div>
      </div>

      {/* حفظ */}
      <button
        type="button"
        onClick={submit}
        disabled={saving || (mode === 'create' && dupCustomer !== null && !forceCreate)}
        className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving && <Loader2 size={16} className="animate-spin" />}
        {mode === 'create' ? 'إنشاء العميل' : 'حفظ التعديلات'}
      </button>
    </div>
  );
}
