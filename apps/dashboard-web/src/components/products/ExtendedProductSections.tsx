'use client';

import { useState } from 'react';
import { type OrderFormField } from './OrderFormFieldsBuilder';
import type { ChangeEvent, JSX, KeyboardEvent } from 'react';
import { ChevronDown, GripVertical, Trash2, X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CustomField = { id: string; key: string; value: string };

export type ProductExtraData = {
  // نموذج الطلب (للخدمات)
  orderFormFields?: OrderFormField[];
  // أساسيات موسّعة (تُحفظ في extra_data)
  costPrice?: number | null;
  brand?: string;
  googleCategory?: string;
  localCategory?: string;
  youtubeUrl?: string;
  // المعلومات المتقدمة
  subtitle?: string; // العنوان الفرعي
  promoTitle?: string; // العنوان الترويجي
  // التخفيضات
  discountPrice?: number | null;
  discountStart?: string; // yyyy-mm-dd
  discountEnd?: string;
  // قنوات عرض المنتج
  channelWebsite?: boolean; // default true
  channelApp?: boolean; // default false
  // خيارات شراء المنتج
  allowFileAttachment?: boolean;
  allowCustomerNote?: boolean;
  vatApplicable?: boolean; // المنتج خاضع لضريبة القيمة المضافة
  // الوسوم
  tags?: string[];
  // الشحن
  requiresShipping?: boolean; // default true
  // المخزون
  weightGrams?: number | null;
  maxQtyPerCustomer?: number | null;
  sku?: string;
  barcode?: string;
  mpn?: string;
  gtin?: string;
  allowQtySelector?: boolean; // تحديد كمية الشراء (default true)
  // بيانات SEO
  seoTitle?: string;
  seoSlug?: string;
  seoDescription?: string;
  // الحقول المخصصة
  customFields?: CustomField[];
  // الإشعارات
  lowStockNotifyQty?: number | null; // نبهني عند وصول الكمية إلى
  backInStockMinQty?: number | null; // default 15
  backInStockPercent?: number | null; // default 100
};

/** القيم الافتراضية للبيانات الموسّعة للمنتج */
export function defaultExtraData(): ProductExtraData {
  return {
    channelWebsite: true,
    requiresShipping: true,
    allowQtySelector: true,
    backInStockMinQty: 15,
    backInStockPercent: 100,
    tags: [],
    customFields: [],
  };
}

/* ------------------------------------------------------------------ */
/* Internal helpers                                                    */
/* ------------------------------------------------------------------ */

const INPUT_CLS =
  'w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-900 focus:outline-none focus:border-teal-400 transition-colors';

const LABEL_CLS = 'text-xs font-bold text-slate-500';

const HELPER_CLS = 'text-[11px] leading-relaxed text-slate-400';

function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `cf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 bg-teal-50 px-4 py-3 text-right focus:outline-none"
      >
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-sm font-bold text-teal-700">{title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <GripVertical className="h-4 w-4 text-teal-400" aria-hidden />
          <ChevronDown
            className={`h-4 w-4 text-teal-600 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
            aria-hidden
          />
        </div>
      </button>
      {open ? <div className="space-y-3 bg-white p-4">{children}</div> : null}
    </div>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className={LABEL_CLS}>{label}</span>
      {children}
      {helper ? <span className={`${HELPER_CLS} block`}>{helper}</span> : null}
    </label>
  );
}

function CheckboxField({
  label,
  helper,
  checked,
  onChange,
}: {
  label: string;
  helper?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-slate-300 text-teal-600 accent-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
        <span className="text-[13px] font-semibold text-slate-700">{label}</span>
      </label>
      {helper ? <p className={`${HELPER_CLS} mt-1 pr-7`}>{helper}</p> : null}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
  placeholder,
}: {
  value: number | null | undefined;
  onChange: (next: number | null) => void;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        className={INPUT_CLS}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const raw = e.target.value;
          onChange(raw === '' ? null : Number(raw));
        }}
      />
      {suffix ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[11px] font-bold text-slate-400">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const SECTION_TITLES = [
  'المعلومات المتقدمة',
  'التخفيضات',
  'قنوات عرض المنتج',
  'خيارات شراء المنتج',
  'الوسوم',
  'الشحن',
  'المخزون',
  'بيانات SEO',
  'الحقول المخصصة',
  'الإشعارات',
] as const;

type SectionId = (typeof SECTION_TITLES)[number];

export function ExtendedProductSections({
  value,
  onChange,
}: {
  value: ProductExtraData;
  onChange: (next: ProductExtraData) => void;
}): JSX.Element {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set());

  const toggle = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const set = <K extends keyof ProductExtraData>(field: K, next: ProductExtraData[K]) => {
    onChange({ ...value, [field]: next });
  };

  const isOpen = (id: SectionId) => openSections.has(id);

  const tagInputId = 'ext-tags-input';

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    const tags = value.tags ?? [];
    if (tags.includes(tag)) return;
    set('tags', [...tags, tag]);
    const input = document.getElementById(tagInputId) as HTMLInputElement | null;
    if (input) input.value = '';
  };

  const removeTag = (tag: string) => {
    set(
      'tags',
      (value.tags ?? []).filter((t) => t !== tag)
    );
  };

  return (
    <div className="space-y-3" dir="rtl">
      {/* 1. المعلومات المتقدمة */}
      <Section
        title="المعلومات المتقدمة"
        open={isOpen('المعلومات المتقدمة')}
        onToggle={() => toggle('المعلومات المتقدمة')}
      >
        <Field label="العنوان الفرعي">
          <input
            type="text"
            className={INPUT_CLS}
            value={value.subtitle ?? ''}
            onChange={(e) => set('subtitle', e.target.value)}
            placeholder="يظهر تحت اسم المنتج في صفحة المنتج"
          />
        </Field>
        <Field label="العنوان الترويجي">
          <input
            type="text"
            className={INPUT_CLS}
            value={value.promoTitle ?? ''}
            onChange={(e) => set('promoTitle', e.target.value)}
            placeholder="مثال: الأكثر مبيعاً"
          />
        </Field>
      </Section>

      {/* 2. التخفيضات */}
      <Section title="التخفيضات" open={isOpen('التخفيضات')} onToggle={() => toggle('التخفيضات')}>
        <Field label="السعر المخفض">
          <NumberInput
            value={value.discountPrice}
            onChange={(next) => set('discountPrice', next)}
            placeholder="0.00"
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="تاريخ بداية التخفيض">
            <input
              type="date"
              className={INPUT_CLS}
              value={value.discountStart ?? ''}
              onChange={(e) => set('discountStart', e.target.value)}
            />
          </Field>
          <Field label="تاريخ نهاية التخفيض">
            <input
              type="date"
              className={INPUT_CLS}
              value={value.discountEnd ?? ''}
              onChange={(e) => set('discountEnd', e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* 3. قنوات عرض المنتج */}
      <Section
        title="قنوات عرض المنتج"
        open={isOpen('قنوات عرض المنتج')}
        onToggle={() => toggle('قنوات عرض المنتج')}
      >
        <CheckboxField
          label="موقع المتجر"
          checked={value.channelWebsite ?? false}
          onChange={(next) => set('channelWebsite', next)}
        />
        <CheckboxField
          label="تطبيق المتجر"
          checked={value.channelApp ?? false}
          onChange={(next) => set('channelApp', next)}
        />
      </Section>

      {/* 4. خيارات شراء المنتج */}
      <Section
        title="خيارات شراء المنتج"
        open={isOpen('خيارات شراء المنتج')}
        onToggle={() => toggle('خيارات شراء المنتج')}
      >
        <CheckboxField
          label="إتاحة إرفاق ملف عند الطلب"
          checked={value.allowFileAttachment ?? false}
          onChange={(next) => set('allowFileAttachment', next)}
        />
        <CheckboxField
          label="إتاحة كتابة ملاحظة"
          checked={value.allowCustomerNote ?? false}
          onChange={(next) => set('allowCustomerNote', next)}
        />
        <CheckboxField
          label="المنتج خاضع لضريبة القيمة المضافة"
          checked={value.vatApplicable ?? false}
          onChange={(next) => set('vatApplicable', next)}
        />
      </Section>

      {/* 5. الوسوم */}
      <Section title="الوسوم" open={isOpen('الوسوم')} onToggle={() => toggle('الوسوم')}>
        <div className="flex gap-2">
          <input
            id={tagInputId}
            type="text"
            className={INPUT_CLS}
            placeholder="اكتب وسمًا ثم اضغط Enter"
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(e.currentTarget.value);
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById(tagInputId) as HTMLInputElement | null;
              if (input) addTag(input.value);
            }}
            className="h-10 shrink-0 rounded-xl bg-teal-600 px-4 text-[13px] font-bold text-white transition-colors hover:bg-teal-700 focus:outline-none"
          >
            إضافة
          </button>
        </div>
        {(value.tags ?? []).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {(value.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 border border-teal-100"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  aria-label={`حذف الوسم ${tag}`}
                  className="text-teal-400 transition-colors hover:text-teal-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </Section>

      {/* 6. الشحن */}
      <Section title="الشحن" open={isOpen('الشحن')} onToggle={() => toggle('الشحن')}>
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'يتطلب شحن', val: true },
            { label: 'لا يتطلب شحن', val: false },
          ].map((opt) => (
            <label key={opt.label} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="ext-requires-shipping"
                checked={(value.requiresShipping ?? true) === opt.val}
                onChange={() => set('requiresShipping', opt.val)}
                className="h-4 w-4 accent-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
              <span className="text-[13px] font-semibold text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* 7. المخزون */}
      <Section title="المخزون" open={isOpen('المخزون')} onToggle={() => toggle('المخزون')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="وزن المنتج (جرام)">
            <NumberInput
              value={value.weightGrams}
              onChange={(next) => set('weightGrams', next)}
              suffix="جرام"
              placeholder="0"
            />
          </Field>
          <Field label="أقصى كمية لكل عميل">
            <NumberInput
              value={value.maxQtyPerCustomer}
              onChange={(next) => set('maxQtyPerCustomer', next)}
              placeholder="0"
            />
          </Field>
          <Field label="رمز التخزين SKU">
            <input
              type="text"
              className={INPUT_CLS}
              value={value.sku ?? ''}
              onChange={(e) => set('sku', e.target.value)}
            />
          </Field>
          <Field label="الباركود">
            <input
              type="text"
              className={INPUT_CLS}
              value={value.barcode ?? ''}
              onChange={(e) => set('barcode', e.target.value)}
            />
          </Field>
          <Field label="رمز MPN">
            <input
              type="text"
              className={INPUT_CLS}
              value={value.mpn ?? ''}
              onChange={(e) => set('mpn', e.target.value)}
            />
          </Field>
          <Field label="رمز GTIN">
            <input
              type="text"
              className={INPUT_CLS}
              value={value.gtin ?? ''}
              onChange={(e) => set('gtin', e.target.value)}
            />
          </Field>
        </div>
        <CheckboxField
          label="تحديد كمية الشراء"
          helper="يتيح للعميل اختيار الكمية التي يريد شراءها عبر عدَّاد يظهر في صفحة المنتج."
          checked={value.allowQtySelector ?? false}
          onChange={(next) => set('allowQtySelector', next)}
        />
      </Section>

      {/* 8. بيانات SEO */}
      <Section title="بيانات SEO" open={isOpen('بيانات SEO')} onToggle={() => toggle('بيانات SEO')}>
        <Field
          label="عنوان الصفحة"
          helper="اسم المنتج: {Name} • التصنيف: {Category} • العلامة التجارية: {Brand}"
        >
          <input
            type="text"
            className={INPUT_CLS}
            value={value.seoTitle ?? ''}
            onChange={(e) => set('seoTitle', e.target.value)}
            placeholder="{اسم المنتج} - {التصنيف} | {اسم المتجر}"
          />
        </Field>
        <Field label="رابط مخصص">
          <div
            dir="ltr"
            className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-teal-400"
          >
            <span className="flex select-none items-center border-e border-slate-200 bg-slate-50 px-3 text-[12px] font-semibold text-slate-400">
              ar/p/
            </span>
            <input
              type="text"
              className="h-10 w-full bg-transparent px-3 text-[13px] font-semibold text-slate-900 focus:outline-none"
              value={value.seoSlug ?? ''}
              onChange={(e) => set('seoSlug', e.target.value)}
              placeholder="product-slug"
            />
          </div>
        </Field>
        <Field label="وصف الصفحة">
          <textarea
            rows={3}
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold leading-relaxed text-slate-900 focus:outline-none focus:border-teal-400"
            value={value.seoDescription ?? ''}
            onChange={(e) => set('seoDescription', e.target.value)}
          />
        </Field>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className={`${LABEL_CLS} mb-1`}>معاينة</p>
          <p dir="ltr" className="truncate text-[12px] font-semibold text-slate-400">
            https://yourstore.com/ar/p/{value.seoSlug?.trim() || '...'}
          </p>
        </div>
      </Section>

      {/* 9. الحقول المخصصة */}
      <Section
        title="الحقول المخصصة"
        open={isOpen('الحقول المخصصة')}
        onToggle={() => toggle('الحقول المخصصة')}
      >
        {(value.customFields ?? []).map((field) => (
          <div key={field.id} className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <span className={LABEL_CLS}>المفتاح</span>
              <input
                type="text"
                className={INPUT_CLS}
                value={field.key}
                placeholder="مثال: اللون"
                onChange={(e) =>
                  set(
                    'customFields',
                    (value.customFields ?? []).map((cf) =>
                      cf.id === field.id ? { ...cf, key: e.target.value } : cf
                    )
                  )
                }
              />
            </div>
            <div className="flex-1 space-y-1">
              <span className={LABEL_CLS}>القيمة</span>
              <input
                type="text"
                className={INPUT_CLS}
                value={field.value}
                placeholder="مثال: أحمر"
                onChange={(e) =>
                  set(
                    'customFields',
                    (value.customFields ?? []).map((cf) =>
                      cf.id === field.id ? { ...cf, value: e.target.value } : cf
                    )
                  )
                }
              />
            </div>
            <button
              type="button"
              aria-label="حذف الحقل المخصص"
              onClick={() =>
                set(
                  'customFields',
                  (value.customFields ?? []).filter((cf) => cf.id !== field.id)
                )
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition-colors hover:border-red-200 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            set('customFields', [
              ...(value.customFields ?? []),
              { id: makeId(), key: '', value: '' },
            ])
          }
          className="flex h-10 items-center gap-1.5 rounded-xl border border-dashed border-teal-300 bg-teal-50/50 px-4 text-[13px] font-bold text-teal-700 transition-colors hover:bg-teal-50"
        >
          <span aria-hidden>＋</span>
          إضافة القسم
        </button>
      </Section>

      {/* 10. الإشعارات */}
      <Section title="الإشعارات" open={isOpen('الإشعارات')} onToggle={() => toggle('الإشعارات')}>
        <Field label="نبّهني عند وصول كمية المنتج إلى">
          <NumberInput
            value={value.lowStockNotifyQty}
            onChange={(next) => set('lowStockNotifyQty', next)}
            suffix="قطعة"
            placeholder="0"
          />
        </Field>
        <Field
          label="إشعار العملاء المشتركين في 'أعلمني عند التوفر' عند توفر كمية أكبر من"
          helper="لتجنب إرسال الإشعارات عند توفر كمية محدودة لا تكفي جميع المشتركين، سيتم الإشعار فقط عند توفر كمية أكبر من هذه القيمة. القيمة الافتراضية 15."
        >
          <NumberInput
            value={value.backInStockMinQty}
            onChange={(next) => set('backInStockMinQty', next)}
            suffix="قطعة"
            placeholder="15"
          />
        </Field>
        <Field label="نسبة العملاء المُراد إشعارهم">
          <NumberInput
            value={value.backInStockPercent}
            onChange={(next) => set('backInStockPercent', next)}
            suffix="%"
            placeholder="100"
          />
        </Field>
      </Section>
    </div>
  );
}

export default ExtendedProductSections;
