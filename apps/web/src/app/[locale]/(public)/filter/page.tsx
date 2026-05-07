'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal, X, Loader2, Store, Package } from 'lucide-react';
import { useLocale } from '@/i18n/LocaleProvider';
import { useT } from '@/i18n/useT';
import { clientFetch } from '@/lib/api/client';

type FilterTab = 'products' | 'shops';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  shopId?: string;
  shopName?: string;
}

interface Shop {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  category?: string;
}

export default function FilterPage() {
  const t = useT();
  const { locale, dir } = useLocale();
  const isRtl = dir === 'rtl';

  const [tab, setTab] = useState<FilterTab>('products');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [results, setResults] = useState<Product[] | Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const doSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      if (tab === 'products') {
        const params = new URLSearchParams({ q });
        if (category) params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        const data = await clientFetch<Product[]>(`/v1/search/products?${params}`);
        setResults(Array.isArray(data) ? data : []);
      } else {
        const params = new URLSearchParams({ q });
        if (category) params.set('category', category);
        if (governorate) params.set('governorate', governorate);
        if (city) params.set('city', city);
        const data = await clientFetch<Shop[]>(`/v1/search/shops?${params}`);
        setResults(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      const msg = typeof err?.message === 'string' && err.message.trim() ? err.message : '';
      setError(msg || t('filter.searchFailed', 'Search failed. Please try again.'));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, tab, category, minPrice, maxPrice, governorate, city, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
  };

  const clearFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setGovernorate('');
    setCity('');
  };

  const inputCls = `w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-5 outline-none focus:bg-white focus:border-[#00E5FF]/20 transition-all font-bold text-sm ${isRtl ? 'text-right' : 'text-left'}`;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8" dir={dir}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00E5FF] to-[#BD00FF]" />
            <SlidersHorizontal className="relative z-10 text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter">{t('filter.title', 'Advanced Search')}</h1>
          <p className="text-slate-400 font-bold text-sm mt-2">{t('filter.subtitle', 'Search products and shops with filters')}</p>
        </div>

        {/* Tab switcher */}
        <div className={`flex gap-2 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {(['products', 'shops'] as FilterTab[]).map((tKey) => (
            <button
              key={tKey}
              onClick={() => { setTab(tKey); setResults([]); setSearched(false); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${
                tab === tKey ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white text-slate-500 border border-slate-100 hover:border-slate-300'
              }`}
            >
              {tKey === 'products' ? <Package size={16} /> : <Store size={16} />}
              {tKey === 'products' ? t('filter.productsTab', 'Products') : t('filter.shopsTab', 'Shops')}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className={`flex items-center gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={inputCls}
              placeholder={t('filter.searchPlaceholder', 'Search...')}
            />
            <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-300 ${isRtl ? 'left-4' : 'right-4'}`} size={18} />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`p-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${
              showFilters ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
          <button
            onClick={doSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-2xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : t('filter.search', 'Search')}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 mb-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)]">
            <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <h3 className="font-black text-sm">{t('filter.filtersTitle', 'Filters')}</h3>
              <button onClick={clearFilters} className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-1">
                <X size={12} /> {t('filter.clearFilters', 'Clear')}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('filter.categoryLabel', 'CATEGORY')}</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} placeholder={t('filter.categoryPlaceholder', 'e.g. fashion')} />
              </div>

              {tab === 'products' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('filter.minPriceLabel', 'MIN PRICE')}</label>
                    <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={inputCls} placeholder="0" inputMode="numeric" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('filter.maxPriceLabel', 'MAX PRICE')}</label>
                    <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={inputCls} placeholder="10000" inputMode="numeric" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('filter.governorateLabel', 'GOVERNORATE')}</label>
                    <input value={governorate} onChange={(e) => setGovernorate(e.target.value)} className={inputCls} placeholder={t('filter.governoratePlaceholder', 'Cairo')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('filter.cityLabel', 'CITY')}</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder={t('filter.cityPlaceholder', 'Nasr City')} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-sm font-bold text-center mb-4">{error}</p>}

        {/* Results */}
        {searched && !loading && results.length === 0 && !error && (
          <div className="text-center py-12">
            <Search className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-black">{t('filter.noResults', 'No results found')}</p>
          </div>
        )}

        {tab === 'products' && (results as Product[]).map?.((p) => (
          <Link key={p.id} href={`/${locale}/product/${p.id}`} className="block mb-3">
            <div className={`flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_24px_-8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                {(p.image || p.imageUrl) ? (
                  <Image src={p.image || p.imageUrl || ''} alt={p.name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="text-slate-200" size={20} /></div>
                )}
              </div>
              <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                <p className="font-black text-sm">{p.name}</p>
                <p className="text-[#00E5FF] font-black text-xs">{t('common.currency', 'EGP')} {p.price}</p>
                {p.shopName && <p className="text-slate-400 text-[10px] font-bold">{p.shopName}</p>}
              </div>
            </div>
          </Link>
        ))}

        {tab === 'shops' && (results as Shop[]).map?.((s) => (
          <Link key={s.id} href={`/${locale}/shop/${s.slug || s.id}`} className="block mb-3">
            <div className={`flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-[0_8px_24px_-8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all ${isRtl ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0">
                {(s.logo || s.banner) ? (
                  <Image src={s.logo || s.banner || ''} alt={s.name} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Store className="text-slate-200" size={20} /></div>
                )}
              </div>
              <div className={`flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                <p className="font-black text-sm">{s.name}</p>
                {s.category && <p className="text-slate-400 text-[10px] font-bold">{s.category}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
