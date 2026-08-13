'use client';

import { Suspense, useEffect, useState } from 'react';
import { Search, Loader2, Store, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { jsonRequest } from '@/lib/api';
import type { Product } from '@/lib/services';

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQuery = params.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      doSearch(initialQuery);
    }
  }, [initialQuery]);

  const doSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const data = await jsonRequest<any>(`/search/products?q=${encodeURIComponent(trimmed)}&limit=48`);
      setResults(Array.isArray(data) ? data : (data?.items ?? []));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
    doSearch(trimmed);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">بحث عن المنتجات</h1>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن منتج..."
          autoFocus
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pr-12 pl-12 font-bold text-sm outline-none focus:border-brand-cyan transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setSearched(false); router.push('/search'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="w-10 h-10 text-brand-cyan animate-spin mb-4" />
          <p className="text-slate-500 font-bold">جاري البحث...</p>
        </div>
      ) : searched ? (
        results.length > 0 ? (
          <>
            <p className="text-sm font-bold text-slate-500 mb-4">
              {results.length} نتيجة لـ "{initialQuery || query}"
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-lg">لا توجد نتائج</p>
            <p className="text-slate-400 text-sm mt-1">جرّب كلمات بحث مختلفة</p>
          </div>
        )
      ) : (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-bold text-lg">ابدأ البحث عن المنتجات</p>
          <p className="text-slate-400 text-sm mt-1">اكتب كلمة بحث في الأعلى</p>
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {['موبايل', 'ملابس', 'أحذية', 'ساعات', 'عطور'].map((tag) => (
              <button
                key={tag}
                onClick={() => { setQuery(tag); router.push(`/search?q=${encodeURIComponent(tag)}`); doSearch(tag); }}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-brand-cyan/10 hover:text-brand-cyan transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm font-bold text-slate-500">جاري التحميل...</div>}>
      <SearchContent />
    </Suspense>
  );
}
