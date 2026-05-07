'use client';

export const cleanText = (v: any) => {
  const s = typeof v === 'string' ? v : v == null ? '' : String(v);
  return s.trim() || '';
};

export const isDeliveryDisabledOrder = (o: any) =>
  Boolean(
    o?.shops?.deliveryDisabled ??
      o?.shops?.delivery_disabled ??
      o?.shop?.deliveryDisabled ??
      o?.shop?.delivery_disabled ??
      o?.deliveryDisabled ??
      o?.delivery_disabled ??
      false,
  );

export const parseCodLocation = (notes: any): { lat: number; lng: number; note?: string; address?: string } | null => {
  try {
    const raw = typeof notes === 'string' ? notes : '';
    const prefix = 'COD_LOCATION:';
    const start = raw.indexOf(prefix);
    if (start < 0) return null;

    const after = raw.slice(start + prefix.length).trim();
    const jsonPart = String(after.split(/\r?\n/)[0] || '').trim();
    if (!jsonPart) return null;

    const parsed = JSON.parse(jsonPart);
    const lat = Number(parsed?.coords?.lat);
    const lng = Number(parsed?.coords?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    const note = typeof parsed?.note === 'string' ? String(parsed.note).trim() : '';
    const address = typeof parsed?.address === 'string' ? String(parsed.address).trim() : '';

    return {
      lat,
      lng,
      ...(note ? { note } : {}),
      ...(address ? { address } : {}),
    };
  } catch {
    return null;
  }
};

export const formatVariantSelectionCompact = (raw: any, isArabic = false) => {
  if (!raw || typeof raw !== 'object') return '';
  const kind = cleanText(raw?.kind).toLowerCase();

  if (kind === 'pack') {
    const label = cleanText(raw?.label || raw?.name);
    if (label) return label;
    const qty = cleanText(raw?.qty);
    const unit = cleanText(raw?.unit);
    return [qty, unit].filter(Boolean).join(' ');
  }

  if (kind === 'fashion') {
    const color = cleanText(raw?.colorName || raw?.color);
    const size = cleanText(raw?.size);
    return [color, size].filter(Boolean).join(' ');
  }

  const size = cleanText(raw?.sizeLabel || raw?.sizeName || raw?.size);
  const type = cleanText(raw?.typeLabel || raw?.typeName || raw?.type);
  return [type, size].filter(Boolean).join(' ');
};

export const formatOrderItemsSummary = (sale: any, egpLabel: string) => {
  const items = Array.isArray(sale?.items) ? sale.items : [];
  if (items.length === 0) return '';

  const parts = items.slice(0, 3).map((it: any) => {
    const name = cleanText(it?.product?.name || it?.name || it?.title);
    const qty = Number(it?.quantity || it?.qty || 1);
    const qtyText = Number.isFinite(qty) && qty > 1 ? ` × ${qty}` : '';

    const unitPrice = Number(it?.price ?? it?.unitPrice ?? 0);
    const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
    const lineTotal = Number.isFinite(unitPrice) ? unitPrice * safeQty : NaN;

    const priceText = (() => {
      if (!Number.isFinite(unitPrice) || unitPrice < 0) return '';
      const useTotal = Number.isFinite(lineTotal) && safeQty > 1;
      const n = useTotal ? lineTotal : unitPrice;
      return ` ${egpLabel} ${Math.round(n * 100) / 100}`;
    })();

    const variantText = formatVariantSelectionCompact(it?.variantSelection ?? it?.variant_selection);

    const core = [name, variantText].filter(Boolean).join(' ');
    return [core ? `${core}${qtyText}` : '', priceText].filter(Boolean).join('');
  }).filter(Boolean);

  const more = items.length > 3 ? ` +${items.length - 3}` : '';
  return `${parts.join(' + ')}${more}`;
};
