'use client';

/**
 * بوابة المتجر: بتتشيك مرة واحدة على /shops/me.
 * لو الحساب مش مربوط بمتجر — بتعرض شاشة إنشاء متجر حقيقية (POST /shops)
 * بدل رسالة الخطأ الميتة "لا يوجد متجر مرتبط بهذا الحساب".
 * لو المتجر موجود بتعرض المحتوى عادي، ولو الحساب أدمن بتعرض المحتوى مباشرة.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Store } from 'lucide-react';
import { apiRequest } from '@/lib/auth';

const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: 'RETAIL', label: 'تجزئة عامة', emoji: '🛍️' },
  { id: 'RESTAURANT', label: 'مطعم', emoji: '🍽️' },
  { id: 'SERVICE', label: 'خدمات', emoji: '🛠️' },
  { id: 'ELECTRONICS', label: 'إلكترونيات', emoji: '📱' },
  { id: 'FASHION', label: 'ملابس', emoji: '👕' },
  { id: 'FOOD', label: 'أكل ومشروبات', emoji: '🥤' },
  { id: 'HEALTH', label: 'صحة وعناية', emoji: '💊' },
  { id: 'OTHER', label: 'أخرى', emoji: '📦' },
];

const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'كفر الشيخ',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'الإسماعيلية',
  'بورسعيد',
  'السويس',
  'المنيا',
  'بني سويف',
  'الفيوم',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'دمياط',
];

type GateState = 'checking' | 'ok' | 'create' | 'suspended';

export default function CreateShopGate({
  children,
  skip = false,
}: {
  children: React.ReactNode;
  /** الأدمن مالوش متجر — بتتلغي عنه البوابة */
  skip?: boolean;
}) {
  const [state, setState] = useState<GateState>('checking');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'RETAIL',
    phone: '',
    governorate: 'القاهرة',
    city: '',
    address: '',
    description: '',
  });

  useEffect(() => {
    if (skip) {
      setState('ok');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const shop = await apiRequest('/shops/me', { cache: 'no-store' });
        if (cancelled) return;
        if (shop?.id) {
          setState(String(shop.status).toUpperCase() === 'SUSPENDED' ? 'suspended' : 'ok');
        } else {
          setState('create');
        }
      } catch {
        // أي خطأ (صلاحيات/شبكة) مينفعش يمنع اللوحة — الأدمن مثلاً مالوش shops/me
        setState('ok');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [skip]);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = useCallback(async () => {
    setError('');
    if (form.name.trim().length < 2) {
      setError('اكتب اسم للمتجر (حرفين على الأقل)');
      return;
    }
    if (!form.phone.trim()) {
      setError('رقم التليفون مطلوب');
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest('/shops', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          phone: form.phone.trim(),
          governorate: form.governorate,
          city: form.city.trim(),
          address: form.address.trim(),
          description: form.description.trim(),
        }),
      });
      setCreated(true);
      // إعادة تحميل كاملة عشان كل الصفحات تقرا المتجر الجديد
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      setError(err?.message || 'فشل إنشاء المتجر — حاول تاني');
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  if (state === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
      </div>
    );
  }

  if (state === 'ok') return <>{children}</>;

  if (state === 'suspended') {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50 p-4"
        style={{ fontFamily: "'Cairo','Tajawal',system-ui,sans-serif" }}
      >
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <Store size={26} />
          </div>
          <h1 className="text-lg font-black text-slate-900 mb-2">متجرك موقوف حالياً</h1>
          <p className="text-sm text-slate-500 font-semibold leading-relaxed">
            تم إيقاف متجرك من إدارة المنصة. تواصل مع الدعم لمعرفة التفاصيل وإعادة تفعيل حسابك.
          </p>
        </div>
      </div>
    );
  }

  // state === 'create'
  return (
    <div
      className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4"
      style={{ fontFamily: "'Cairo','Tajawal',system-ui,sans-serif" }}
      dir="rtl"
    >
      <div className="w-full max-w-xl">
        {created ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
            <h1 className="text-xl font-black text-slate-900 mb-2">تم إنشاء متجرك بنجاح 🎉</h1>
            <p className="text-sm text-slate-500 font-semibold">جاري تحويلك للوحة التحكم…</p>
            <Loader2 size={18} className="mx-auto mt-4 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#00E5FF]/10 text-cyan-600 flex items-center justify-center mx-auto mb-3">
                <Store size={26} />
              </div>
              <h1 className="text-xl font-black text-slate-900">أنشئ متجرك للبدء</h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                خطوة واحدة ويبقى متجرك جاهز مع لوحة تحكم كاملة وموقع إلكتروني
              </p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[12px] font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  اسم المتجر <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="مثال: متجر النور"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  نوع النشاط <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-[10px] font-bold transition-all ${
                        form.category === cat.id
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg leading-none">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    رقم التليفون <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="01xxxxxxxxx"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    المحافظة
                  </label>
                  <select
                    value={form.governorate}
                    onChange={set('governorate')}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-700 focus:outline-none focus:border-slate-400"
                  >
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={set('city')}
                    placeholder="مثال: مدينة نصر"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                    العنوان
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={set('address')}
                    placeholder="شارع / منطقة"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  وصف مختصر (اختياري)
                </label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={2}
                  placeholder="اكتب وصف بسيط عن متجرك…"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="w-full h-12 rounded-full bg-slate-900 text-white text-[14px] font-black hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                إنشاء المتجر
              </button>
              <p className="text-center text-[10px] font-semibold text-slate-400">
                متجرك هيبقى مفعّل فوراً — تقدر تعدّل كل البيانات من الإعدادات في أي وقت
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
