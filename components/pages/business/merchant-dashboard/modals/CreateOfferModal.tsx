import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap, Search, Check } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { Product } from '@/types';
import { useToast } from '@/components/common/feedback/Toaster';
import SmartImage from '@/components/common/ui/SmartImage';
import { useTranslation } from 'react-i18next';

type Props = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  shopId: string;
  products: Product[];
};

const MotionDiv = motion.div as any;

const CreateOfferModal: React.FC<Props> = ({ isOpen, product, onClose, shopId, products }) => {
  const { t } = useTranslation();
  const [pricingMode, setPricingMode] = useState<'PERCENT' | 'AMOUNT' | 'NEW_PRICE'>('PERCENT');
  const [pricingValue, setPricingValue] = useState('20');
  const [title, setTitle] = useState(t('business.offers.specialOffer')); // default, overridden by t() in UI
  const [description, setDescription] = useState('');
  const [expiresDays, setExpiresDays] = useState('7');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [variantRows, setVariantRows] = useState<
    Array<{
      key: string;
      typeId: string;
      typeName: string;
      sizeId: string;
      sizeLabel: string;
      oldPrice: number;
      newPrice: string;
      selected: boolean;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const id = String((product as any)?.id || '').trim();
    setSelectedIds(id ? [id] : []);
    setTitle(t('business.offers.specialOffer'));
    setDescription(id ? t('business.offers.exclusiveOfferOn', { name: (product as any).name }) : '');
    setPricingMode('PERCENT');
    setPricingValue('20');
    setExpiresDays('7');
    setSearch('');
  }, [isOpen, (product as any)?.id]);

  const selectedProducts = useMemo(() => {
    const byId: Record<string, any> = {};
    for (const p of products || []) {
      byId[String((p as any)?.id || '')] = p;
    }
    return selectedIds.map((id) => byId[id]).filter(Boolean);
  }, [products, selectedIds]);

  const isVariantModeEligible = useMemo(() => {
    if (selectedProducts.length !== 1) return false;
    const first = selectedProducts[0] as any;
    const raw = first?.menuVariants ?? first?.menu_variants;
    return Array.isArray(raw) && raw.length > 0;
  }, [selectedProducts]);

  const menuVariantsDef = useMemo(() => {
    if (!isVariantModeEligible) return [];
    const first = selectedProducts[0] as any;
    const raw = first?.menuVariants ?? first?.menu_variants;
    return Array.isArray(raw) ? raw : [];
  }, [isVariantModeEligible, (selectedProducts as any)?.[0]?.id]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!normalizedSearch) return list;
    return list.filter((p: any) => {
      const name = String(p?.name || '').toLowerCase();
      return name.includes(normalizedSearch);
    });
  }, [products, normalizedSearch]);

  const computeNewPrice = (oldPrice: number) => {
    const oldP = Number(oldPrice);
    const v = Number(pricingValue);
    if (!Number.isFinite(oldP) || oldP < 0) return NaN;
    if (!Number.isFinite(v) || v < 0) return NaN;
    if (pricingMode === 'AMOUNT') return oldP - v;
    if (pricingMode === 'NEW_PRICE') return v;
    // percent
    return oldP * (1 - v / 100);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (!isVariantModeEligible) {
      setVariantRows([]);
      return;
    }

    const rows: any[] = [];
    for (const t of menuVariantsDef as any[]) {
      const typeId = String(t?.id || t?.typeId || t?.variantId || '').trim();
      const typeName = String(t?.name || t?.label || '').trim() || typeId;
      if (!typeId) continue;
      const sizes = Array.isArray(t?.sizes) ? t.sizes : [];
      for (const s of sizes) {
        const sizeId = String(s?.id || s?.sizeId || '').trim();
        const sizeLabel = String(s?.label || s?.name || '').trim() || sizeId;
        if (!sizeId) continue;
        const oldPrice = typeof s?.price === 'number' ? s.price : Number(s?.price || NaN);
        if (!Number.isFinite(oldPrice) || oldPrice < 0) continue;
        const computed = computeNewPrice(oldPrice);
        rows.push({
          key: `${typeId}:${sizeId}`,
          typeId,
          typeName,
          sizeId,
          sizeLabel,
          oldPrice,
          newPrice: Number.isFinite(computed) ? String(Math.round(computed * 100) / 100) : '',
          selected: true,
        });
      }
    }

    setVariantRows(rows);
  }, [isOpen, isVariantModeEligible, (selectedProducts as any)?.[0]?.id]);

  const applyPricingToSelectedVariants = () => {
    setVariantRows((prev) =>
      (prev || []).map((r) => {
        if (!r?.selected) return r;
        const computed = computeNewPrice(r.oldPrice);
        return {
          ...r,
          newPrice: Number.isFinite(computed) ? String(Math.round(computed * 100) / 100) : r.newPrice,
        };
      }),
    );
  };

  const previewForFirst = (() => {
    if (isVariantModeEligible) {
      const firstSelected = (variantRows || []).find((r) => r?.selected);
      if (!firstSelected) return { oldPrice: 0, newPrice: NaN };
      const oldP = Number(firstSelected.oldPrice || 0);
      const newP = Number(firstSelected.newPrice);
      return {
        oldPrice: oldP,
        newPrice: Number.isFinite(newP) ? Math.round(newP * 100) / 100 : NaN,
      };
    }

    const first = selectedProducts[0];
    if (!first) {
      return { oldPrice: 0, newPrice: NaN };
    }
    const oldP = Number((first as any)?.price || 0);
    const newP = computeNewPrice(oldP);
    return {
      oldPrice: oldP,
      newPrice: Number.isFinite(newP) ? Math.round(newP * 100) / 100 : NaN,
    };
  })();

  const validationError = (() => {
    const v = Number(pricingValue);
    if (!selectedIds.length) return t('business.offers.selectAtLeastOneProduct');
    if (!Number.isFinite(v) || v < 0) return t('business.offers.invalidValue');
    if (pricingMode === 'PERCENT' && v > 100) return t('business.offers.percentRange0To100');

    if (isVariantModeEligible) {
      const chosen = (variantRows || []).filter((r) => r?.selected);
      if (chosen.length === 0) return t('business.offers.selectAtLeastOneSize');
      for (const r of chosen) {
        const np = Number(r?.newPrice);
        if (!Number.isFinite(np)) return t('business.offers.invalidVariantPrice');
        if (np < 0) return t('business.offers.invalidVariantPrice');
        if (np > Number(r?.oldPrice || 0)) return t('business.offers.variantPriceCannotExceedOriginal');
      }
    }

    const first = selectedProducts[0];
    if (!first) return t('business.offers.selectAtLeastOneProduct');
    const oldP = Number((first as any)?.price || 0);
    const newP = computeNewPrice(oldP);
    if (!Number.isFinite(newP)) return t('business.offers.invalidValue');
    if (newP < 0) return t('business.offers.discountPriceCannotBeBelow0');
    if (newP > oldP) return t('business.offers.discountPriceCannotExceedOriginal');

    const days = Number(expiresDays);
    if (!Number.isFinite(days) || days <= 0 || days > 365) return t('business.offers.invalidDays');
    return '';
  })();

  const handleCreate = async () => {
    const err = validationError;
    if (err) {
      addToast(err, 'error');
      return;
    }
    setLoading(true);
    try {
      const days = Number(expiresDays);
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      const variantPricing = isVariantModeEligible
        ? (variantRows || [])
          .filter((r) => r?.selected)
          .map((r) => ({
            typeId: String(r.typeId),
            sizeId: String(r.sizeId),
            newPrice: Math.round(Number(r.newPrice) * 100) / 100,
          }))
        : undefined;

      const created = await ApiService.createOffer({
        shopId,
        productIds: selectedIds,
        variantPricing,
        title: String(title || '').trim() || t('business.offers.specialOffer'),
        description: String(description || '').trim() || null,
        pricingMode,
        pricingValue: Number(pricingValue),
        expiresAt,
      });

      const count = Array.isArray(created) ? created.length : 1;
      addToast(count > 1 ? t('business.offers.offersCreated', { count }) : t('business.offers.offerPublished'), 'success');
      onClose();
    } catch {
      addToast(t('business.offers.createOfferFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
      <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 text-right shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
        <h2 className="text-3xl font-black mb-8">
          {t('business.offers.createFlashOffer')} <Zap className="text-[#BD00FF] inline" />
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {product ? (
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                  <SmartImage
                    src={String((product as any).imageUrl || (product as any).image_url || '').trim() || '/placeholder-product.png'}
                    className="w-16 h-16 rounded-xl"
                    imgClassName="object-cover rounded-xl"
                    loading="lazy"
                  />
                  <div className="text-right">
                    <p className="font-black text-sm">{(product as any).name}</p>
                    <p className="text-slate-400 font-bold text-xs">{t('pos.egpShort')} {(product as any).price}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl text-slate-500 font-black text-sm text-right">
                  {t('business.offers.selectProductsFromList')}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{t('business.offers.offerTitle')}</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 rounded-2xl p-4 font-black text-right" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{t('business.offers.offerDescriptionOptional')}</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 rounded-2xl p-4 font-bold text-right min-h-[110px]" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{t('business.offers.offerDurationDays')}</label>
                <input type="number" value={expiresDays} onChange={(e) => setExpiresDays(e.target.value)} className="w-full bg-slate-50 rounded-2xl p-4 font-black text-center" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{t('business.dashboard.products.products')}</label>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <div className="relative mb-3">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t('business.offers.searchProduct')}
                      className="w-full bg-white rounded-xl py-3 pr-11 pl-4 font-bold text-right outline-none"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto no-scrollbar space-y-2">
                    {filteredProducts.map((p: any) => {
                      const id = String(p?.id || '').trim();
                      const checked = selectedIds.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
                          }}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-right ${checked ? 'bg-white border-[#BD00FF]/30' : 'bg-white/60 border-slate-100 hover:bg-white'}`}
                        >
                          <div className="flex items-center gap-3">
                            <SmartImage
                              src={String(p?.imageUrl || p?.image_url || '').trim() || '/placeholder-product.png'}
                              className="w-10 h-10 rounded-xl"
                              imgClassName="object-cover rounded-xl"
                              loading="lazy"
                            />
                            <div className="text-right">
                              <div className="font-black text-xs text-slate-900">{p?.name}</div>
                              <div className="font-bold text-[10px] text-slate-400">{t('pos.egpShort')} {p?.price}</div>
                            </div>
                          </div>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${checked ? 'bg-[#BD00FF] text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Check size={16} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-xs font-black text-slate-500">{t('business.offers.selectedCount', { count: selectedIds.length })}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">{t('business.offers.discountType')}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPricingMode('PERCENT')} className={`py-3 rounded-xl font-black text-xs ${pricingMode === 'PERCENT' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>{t('business.offers.percent')}</button>
                  <button type="button" onClick={() => setPricingMode('AMOUNT')} className={`py-3 rounded-xl font-black text-xs ${pricingMode === 'AMOUNT' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>{t('business.offers.amount')}</button>
                  <button type="button" onClick={() => setPricingMode('NEW_PRICE')} className={`py-3 rounded-xl font-black text-xs ${pricingMode === 'NEW_PRICE' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600'}`}>{t('business.offers.newPrice')}</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">
                  {pricingMode === 'PERCENT' ? t('business.offers.discountValuePercent') : pricingMode === 'AMOUNT' ? t('business.offers.discountValueEgp') : t('business.offers.newPriceEgp')}
                </label>
                <input
                  type="number"
                  value={pricingValue}
                  onChange={(e) => setPricingValue(e.target.value)}
                  className="w-full bg-slate-50 rounded-2xl p-4 font-black text-center"
                />
              </div>

              {isVariantModeEligible && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-700">{t('business.offers.pricingBySize')}</div>
                      <div className="text-[10px] font-black text-slate-400">{t('business.offers.selectSizesSetPrice')}</div>
                    </div>
                    <button
                      type="button"
                      onClick={applyPricingToSelectedVariants}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black hover:bg-slate-100"
                    >
                      {t('business.offers.applyRule')}
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto no-scrollbar space-y-2">
                    {(variantRows || []).map((r) => (
                      <div key={r.key} className="flex items-center justify-between gap-2 bg-white rounded-xl border border-slate-100 px-3 py-2">
                        <label className="flex items-center gap-2 text-right">
                          <input
                            type="checkbox"
                            checked={!!r.selected}
                            onChange={(e) => {
                              const checked = Boolean((e as any)?.target?.checked);
                              setVariantRows((prev) => (prev || []).map((x) => (x.key === r.key ? { ...x, selected: checked } : x)));
                            }}
                          />
                          <div>
                            <div className="text-[11px] font-black text-slate-800">{r.typeName} - {r.sizeLabel}</div>
                            <div className="text-[10px] font-black text-slate-400">{t('business.offers.original')}: {t('pos.egpShort')} {Math.round(Number(r.oldPrice || 0) * 100) / 100}</div>
                          </div>
                        </label>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400">{t('business.offers.offerPrice')}</span>
                          <input
                            type="number"
                            value={r.newPrice}
                            disabled={!r.selected}
                            onChange={(e) => {
                              const val = String((e as any)?.target?.value ?? '');
                              setVariantRows((prev) => (prev || []).map((x) => (x.key === r.key ? { ...x, newPrice: val } : x)));
                            }}
                            className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-center disabled:opacity-50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 bg-purple-50 rounded-2xl text-center border border-purple-100">
                <p className="text-[10px] font-black text-purple-400 uppercase mb-2">{t('business.offers.priceAfterDiscount')}</p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-slate-300 line-through font-black">{t('pos.egpShort')} {Math.round(previewForFirst.oldPrice * 100) / 100}</span>
                  <span className="text-4xl font-black text-[#BD00FF]">{t('pos.egpShort')} {Number.isFinite(previewForFirst.newPrice) ? previewForFirst.newPrice : '--'}</span>
                </div>
                {validationError ? (
                  <div className="mt-3 text-xs font-black text-red-500">{validationError}</div>
                ) : null}
              </div>
            </div>
          </div>

          <button onClick={handleCreate} disabled={loading} className="w-full py-5 bg-[#BD00FF] text-white rounded-2xl font-black text-xl shadow-xl disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : t('business.offers.publishOfferNow')}
          </button>
        </div>
      </MotionDiv>
    </div>
  );
};

export default CreateOfferModal;
