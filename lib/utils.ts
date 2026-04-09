import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type { ClassValue };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toArabicUnitLabel(raw: any) {
  const u = String(raw || '').trim();
  if (!u) return '';
  const key = u.toUpperCase();
  const map: Record<string, string> = {
    PIECE: 'قطعة',
    PC: 'قطعة',
    PCS: 'قطعة',
    CARTON: 'كرتونة',
    BOX: 'علبة',
    BOTTLE: 'عبوة',
    PACK: 'باك',
    BAG: 'كيس',
    CAN: 'علبة',
    TUBE: 'أنبوبة',
    JAR: 'برطمان',
    SACHET: 'كيس',
    G: 'جرام',
    GRAM: 'جرام',
    KG: 'كيلو',
    KGM: 'كيلو',
    ML: 'مل',
    L: 'لتر',
    LITER: 'لتر',
  };
  return map[key] || u;
}

export function formatPackLabelArabic(input: any, fallbackUnit?: any) {
  if (!input || typeof input !== 'object') return '';
  const label = String((input as any)?.label || (input as any)?.name || '').trim();
  if (label) return label;
  const qtyRaw = typeof (input as any)?.qty === 'number' ? (input as any).qty : Number((input as any)?.qty ?? NaN);
  const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? qtyRaw : NaN;
  if (!Number.isFinite(qty)) return '';
  const unit = toArabicUnitLabel((input as any)?.unit || fallbackUnit);
  return unit ? `${qty} ${unit}` : String(qty);
}
