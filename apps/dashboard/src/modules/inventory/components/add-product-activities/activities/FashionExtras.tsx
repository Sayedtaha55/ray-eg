import React, { useMemo } from 'react';
import FashionOptionsSection from '../../AddProduct/FashionOptionsSection';
import { useTranslation } from 'react-i18next';

type Props = {
  selectedColors: Array<{ name: string; value: string }>;
  setSelectedColors: React.Dispatch<React.SetStateAction<Array<{ name: string; value: string }>>>;
  customColor: string;
  setCustomColor: React.Dispatch<React.SetStateAction<string>>;
  fashionSizeItems: Array<{ label: string; price: string }>;
  setFashionSizeItems: React.Dispatch<React.SetStateAction<Array<{ label: string; price: string }>>>;
  customSize: string;
  setCustomSize: React.Dispatch<React.SetStateAction<string>>;
};

const FashionExtras: React.FC<Props> = ({
  selectedColors,
  setSelectedColors,
  customColor,
  setCustomColor,
  fashionSizeItems,
  setFashionSizeItems,
  customSize,
  setCustomSize,
}) => {
  const { t } = useTranslation();
  const presetColors: Array<{ name: string; value: string }> = useMemo(
    () => [
      { name: t('business.products.colors.black'), value: '#111827' },
      { name: t('business.products.colors.white'), value: '#ffffff' },
      { name: t('business.products.colors.gray'), value: '#9ca3af' },
      { name: t('business.products.colors.red'), value: '#ef4444' },
      { name: t('business.products.colors.pink'), value: '#ec4899' },
      { name: t('business.products.colors.purple'), value: '#a855f7' },
      { name: t('business.products.colors.blue'), value: '#3b82f6' },
      { name: t('business.products.colors.cyan'), value: '#06b6d4' },
      { name: t('business.products.colors.green'), value: '#22c55e' },
      { name: t('business.products.colors.yellow'), value: '#eab308' },
      { name: t('business.products.colors.orange'), value: '#f97316' },
      { name: t('business.products.colors.brown'), value: '#a16207' },
    ],
    [t],
  );

  const presetSizes: string[] = useMemo(() => ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'], []);

  return (
    <FashionOptionsSection
      presetColors={presetColors}
      selectedColors={selectedColors}
      setSelectedColors={setSelectedColors}
      customColor={customColor}
      setCustomColor={setCustomColor}
      presetSizes={presetSizes}
      fashionSizeItems={fashionSizeItems}
      setFashionSizeItems={setFashionSizeItems}
      customSize={customSize}
      setCustomSize={setCustomSize}
    />
  );
};

export function buildFashionExtrasPayload(args: {
  selectedColors: Array<{ name: string; value: string }>;
  fashionSizeItems: Array<{ label: string; price: string }>;
  parseNumberInput: (v: any) => number;
  basePrice: number;
  t: (key: string) => string;
}) {
  const { selectedColors, fashionSizeItems, parseNumberInput, basePrice, t } = args;

  const colors = (selectedColors || [])
    .map((c) => ({ name: String(c?.name || '').trim(), value: String(c?.value || '').trim() }))
    .filter((c) => c.name && c.value);

  const sizes = (() => {
    const list = Array.isArray(fashionSizeItems) ? fashionSizeItems : [];
    if (list.length === 0) return [];
    const mapped = list
      .map((s) => {
        const label = String(s?.label || '').trim();
        const p = parseNumberInput((s as any)?.price);
        if (!label) return null;
        if (!Number.isFinite(p) || p < 0) return null;
        return { label, price: Math.round(p * 100) / 100 };
      })
      .filter(Boolean) as any[];
    return mapped.length !== list.length ? '__INVALID__' : mapped;
  })();

  if (colors.length === 0) {
    throw new Error(t('business.products.selectAtLeastOneColor'));
  }

  if (sizes === '__INVALID__') {
    throw new Error(t('business.products.enterValidSizesPrices'));
  }

  if (Array.isArray(sizes) && sizes.length === 0) {
    throw new Error(t('business.products.addAtLeastOneSizeWithPrice'));
  }

  const resolvedBasePrice = (() => {
    if (Array.isArray(sizes) && sizes.length > 0) {
      const min = Math.min(...sizes.map((t: any) => Number(t?.price || 0)).filter((n: any) => Number.isFinite(n) && n >= 0));
      return Number.isFinite(min) ? min : basePrice;
    }
    return basePrice;
  })();

  return { payload: { colors, sizes }, resolvedBasePrice };
}

export default FashionExtras;
