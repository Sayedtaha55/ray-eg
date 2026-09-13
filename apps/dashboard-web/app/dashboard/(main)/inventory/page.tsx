'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Search,
  Package,
  X,
  Info,
  Target,
  BookOpen,
  Zap,
  Link2,
  ClipboardList,
  CheckCircle2,
  Download,
  Upload,
  ArrowUpDown,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useShop } from '@/hooks/useShop';
import { useInstalledApps } from '@/hooks/useInstalledApps';
import ImageMapEditorModal from '@/components/apps/image-editor/ImageMapEditor';

type Product = {
  id: string;
  name: string;
  price: number;
  stock?: number;
  category?: string | { name?: string; id?: string };
  imageUrl?: string;
  image_url?: string;
  description?: string;
  isActive?: boolean;
  unit?: string;
  colors?: any[];
  sizes?: any[];
  createdAt?: string;
};

export default function InventoryPage() {
  const { shop } = useShop();
  const { isInstalled } = useInstalledApps();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [shopId, setShopId] = useState('');
  const [togglingId, setTogglingId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkExporting, setBulkExporting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockTab, setStockTab] = useState<'all' | 'visible' | 'hidden' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'newest'>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [showImageMapModal, setShowImageMapModal] = useState(false);
  const [addonItems, setAddonItems] = useState<any[]>([]);
  const [savingAddons, setSavingAddons] = useState(false);

  const shopCategory = shop?.category?.toUpperCase() || 'RETAIL';
  const isRestaurant = shopCategory === 'RESTAURANT';
  const isRetail = shopCategory === 'RETAIL' || !isRestaurant;
  // Image map editor is available for every non-restaurant shop (mirrors legacy dashboard).
  const canUseImageMapEditor = !isRestaurant && Boolean(String(shop?.id || '').trim());

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const shopData = await apiRequest('/shops/me');
      const sid = shopData?.id;
      if (!sid) {
        setError('لم يتم العثور على المتجر');
        setLoading(false);
        return;
      }
      setShopId(sid);
      const data = await apiRequest(`/products/manage/by-shop/${sid}?limit=200`);
      const list = Array.isArray(data) ? data : data?.products || data?.data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.message || 'فشل تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const cats = new Map<string, string>();
    list.forEach((p: any) => {
      const catName = p?.category?.name;
      const catId = String(p?.category?.id || catName || '').trim();
      if (catId && !cats.has(catId)) {
        cats.set(catId, String(catName || catId));
      }
    });
    return Array.from(cats.entries()).map(([id, name]) => ({ id, name }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = Array.isArray(products) ? products : [];

    // Search filter
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((p: any) => {
        const name = String(p?.name || '').toLowerCase();
        const cat = String(p?.category?.name || '').toLowerCase();
        const desc = String(p?.description || '').toLowerCase();
        return name.includes(q) || cat.includes(q) || desc.includes(q);
      });
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((p: any) => {
        const catId = String(p?.category?.id || '').trim();
        const catName = String(p?.category?.name || '').trim();
        return catId === categoryFilter || catName === categoryFilter;
      });
    }

    // Status tab (visibility on the storefront / low stock)
    if (stockTab === 'visible') {
      result = result.filter((p) => p.isActive !== false);
    } else if (stockTab === 'hidden') {
      result = result.filter((p) => p.isActive === false);
    } else if (stockTab === 'low') {
      result = result.filter((p) => Number(p.stock ?? 999) <= 5);
    }

    // Sort
    result = [...result].sort((a: any, b: any) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = String(a?.name || '').localeCompare(String(b?.name || ''), 'ar');
      } else if (sortBy === 'price') {
        comparison = Number(a?.price || 0) - Number(b?.price || 0);
      } else if (sortBy === 'stock') {
        comparison = Number(a?.stock ?? 0) - Number(b?.stock ?? 0);
      } else if (sortBy === 'newest') {
        comparison =
          Number(b?.createdAt ? new Date(b.createdAt).getTime() : 0) -
          Number(a?.createdAt ? new Date(a.createdAt).getTime() : 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [products, search, categoryFilter, stockTab, sortBy, sortOrder]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive !== false).length;
    const lowStock = products.filter((p) => Number(p.stock ?? 999) <= 5).length;
    const value = products.reduce((s, p) => s + Number(p.price || 0) * Number(p.stock || 0), 0);
    return { total, active, lowStock, value };
  }, [products]);

  const handleToggleActive = useCallback(async (product: Product) => {
    setTogglingId(product.id);
    try {
      await apiRequest(`/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch (err: any) {
      setError(err?.message || 'فشل تحديث الحالة');
    } finally {
      setTogglingId('');
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await apiRequest(`/products/${id}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err?.message || 'فشل الحذف');
    }
  }, []);

  const handleSave = useCallback(
    async (data: Partial<Product>) => {
      setSaving(true);
      try {
        if (editingProduct) {
          await apiRequest(`/products/${editingProduct.id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
        } else {
          await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify({ ...data, shopId }),
          });
        }
        setShowAddModal(false);
        setEditingProduct(null);
        await fetchProducts();
      } catch (err: any) {
        setError(err?.message || 'فشل الحفظ');
      } finally {
        setSaving(false);
      }
    },
    [editingProduct, shopId, fetchProducts]
  );

  const handleBulkImport = async (file: File) => {
    if (!shopId) return;
    setBulkImporting(true);
    try {
      const raw = await file.text();
      const lines = raw
        .replace(/\r/g, '')
        .trim()
        .split('\n')
        .filter((x) => x.trim());
      if (lines.length < 2) {
        setError('ملف CSV غير صالح');
        return;
      }
      const header = lines[0].split(/[;,]/g).map((x) => x.trim().toLowerCase());
      const idx = (name: string) => header.findIndex((h) => h === name);
      const iName = idx('name');
      const iPrice = idx('price');
      const iStock = idx('stock');
      const iCategory = idx('category');
      const iDesc = idx('description');
      if (iName < 0 || iPrice < 0) {
        setError('الملف يجب أن يحتوي على أعمدة name و price');
        return;
      }
      const items = lines
        .slice(1)
        .map((line) => {
          const cols = line.split(/[;,]/g).map((x) => x.trim());
          return {
            name: cols[iName] || '',
            price: Number(cols[iPrice] || 0),
            stock: iStock >= 0 ? Number(cols[iStock] || 0) : 0,
            category: iCategory >= 0 ? cols[iCategory] || 'عام' : 'عام',
            description: iDesc >= 0 ? cols[iDesc] || null : null,
          };
        })
        .filter((x) => x.name && Number.isFinite(x.price) && x.price >= 0);

      await apiRequest(`/products/manage/by-shop/${shopId}/import-drafts`, {
        method: 'POST',
        body: JSON.stringify({ source: 'excel_bulk', items }),
      });
      setError('');
      await fetchProducts();
    } catch (err: any) {
      setError(err?.message || 'فشل الاستيراد');
    } finally {
      setBulkImporting(false);
    }
  };

  const handleBulkExport = async () => {
    setBulkExporting(true);
    try {
      const rows = products.map((p: any) => [
        String(p?.name || '').replace(/[;,]/g, ' '),
        String(Number(p?.price || 0)),
        String(Number(p?.stock || 0)),
        String(p?.category || 'عام').replace(/[;,]/g, ' '),
        String(p?.description || '').replace(/[\n\r;,]/g, ' '),
      ]);
      const csv = ['name,price,stock,category,description', ...rows.map((r) => r.join(','))].join(
        '\n'
      );
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || 'فشل التصدير');
    } finally {
      setBulkExporting(false);
    }
  };

  return (
    <div
      className="min-h-full bg-[#F4F5F7] text-slate-900"
      style={{ fontFamily: "'Cairo','Tajawal',system-ui,sans-serif" }}
    >
      {/* هيدر بنفس هيكل قائمة الطلبات: عنوان + وصف — الإجراءات في الطرف المقابل */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-5 max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">المخزون</h1>
              <button
                onClick={() => setGuideOpen(true)}
                className="p-1 rounded-full text-slate-300 hover:text-slate-900 hover:bg-slate-100 transition-all"
                title="معلومات / Info"
              >
                <Info size={15} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              إدارة المنتجات والمخزون
              {stats.lowStock > 0 && (
                <span className="text-amber-600 font-semibold">
                  {' '}
                  — {stats.lowStock} منتج مخزونه منخفض
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isRestaurant && (
              <button
                onClick={() => setShowAddonsModal(true)}
                className="h-10 px-4 rounded-full border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 hidden sm:flex items-center gap-1.5"
              >
                <Package size={14} />
                الإضافات
              </button>
            )}
            {/* تطبيق محرر الصور — يظهر فقط بعد تثبيته من صفحة التطبيقات */}
            {canUseImageMapEditor && isInstalled('image-editor') && (
              <button
                onClick={() => setShowImageMapModal(true)}
                className="h-10 px-4 rounded-full border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 hidden sm:flex items-center gap-1.5"
              >
                <Target size={14} />
                خريطة الصور
              </button>
            )}
            <label className="h-10 px-4 rounded-full border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
              {bulkImporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              استيراد
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBulkImport(file);
                }}
                className="hidden"
                disabled={bulkImporting}
              />
            </label>
            <button
              onClick={handleBulkExport}
              disabled={bulkExporting || products.length === 0}
              className="h-10 px-4 rounded-full border border-slate-200 bg-white text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1.5"
            >
              {bulkExporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              تصدير
            </button>
            <button
              onClick={() => {
                setEditingProduct(null);
                setShowAddModal(true);
              }}
              className="h-10 px-5 rounded-full bg-slate-900 text-white text-[12px] font-bold hover:bg-slate-700 flex items-center gap-1.5"
            >
              <Plus size={14} />
              إضافة منتج
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-3">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[12px] font-bold">
            {error}
            <button onClick={() => setError('')} className="p-1 rounded hover:bg-red-100">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* شريط التشغيل بنفس هيكل الطلبات: تبويبات فوق — بحث وفلاتر تحت */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4">
        <div className="bg-white border border-slate-200 rounded-xl">
          {/* تبويبات الحالة */}
          <div className="px-2 sm:px-3 py-2 flex gap-0.5 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'الكل', count: stats.total },
                { id: 'visible', label: 'معروض', count: stats.active },
                { id: 'hidden', label: 'مخفي', count: stats.total - stats.active },
                { id: 'low', label: 'مخزون منخفض', count: stats.lowStock },
              ] as const
            ).map((f) => {
              const isActive = stockTab === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setStockTab(f.id);
                    setCurrentPage(1);
                  }}
                  className={`h-8 px-3 rounded-full text-[12px] font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {f.label}
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums ${
                      isActive ? 'bg-white text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* بحث + فلاتر */}
          <div className="px-3 sm:px-4 py-2.5 flex flex-col lg:flex-row lg:items-center gap-2.5 border-t border-slate-100">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="دوّر باسم المنتج أو الفئة…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pr-10 pl-4 rounded-full border border-slate-200 bg-white text-[13px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 rounded-full border border-slate-200 text-[12px] font-bold text-slate-600 bg-white focus:outline-none"
              >
                <option value="all">كل الفئات</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3 rounded-full border border-slate-200 text-[12px] font-bold text-slate-600 bg-white focus:outline-none"
              >
                <option value="newest">الأحدث أولاً</option>
                <option value="name">الاسم</option>
                <option value="price">السعر</option>
                <option value="stock">المخزون</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                title={sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'}
              >
                <ArrowUpDown size={15} className={sortOrder === 'desc' ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products list */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mt-4 pb-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#00E5FF] rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Package size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 font-bold text-sm">لا توجد منتجات</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="col-span-2 text-right text-xs font-bold text-slate-500">الصورة</div>
                <div className="col-span-4 text-right text-xs font-bold text-slate-500">المنتج</div>
                <div className="col-span-2 text-right text-xs font-bold text-slate-500">السعر</div>
                <div className="col-span-2 text-right text-xs font-bold text-slate-500">
                  المخزون
                </div>
                <div className="col-span-2 text-right text-xs font-bold text-slate-500">
                  إجراءات
                </div>
              </div>
              {paginatedProducts.map((product) => {
                const imgSrc = String(product.imageUrl || product.image_url || '').trim();
                const isInactive = product.isActive === false;
                const categoryName =
                  typeof product.category === 'string'
                    ? product.category
                    : product.category?.name || 'عام';

                return (
                  <div
                    key={product.id}
                    className={`grid grid-cols-12 px-4 py-3 items-center border-b border-slate-100 hover:bg-slate-50 transition-colors ${isInactive ? 'opacity-60' : ''}`}
                  >
                    <div className="col-span-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!imgSrc) return;
                          setPreviewImageSrc(imgSrc);
                        }}
                        className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                      >
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Package size={14} />
                          </div>
                        )}
                      </button>
                    </div>
                    <div className="col-span-4 pr-4 text-right">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {product.name}
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">
                        {categoryName}
                      </div>
                    </div>
                    <div className="col-span-2 font-semibold text-slate-900 text-xs sm:text-sm">
                      ج.م {Number(product.price || 0).toLocaleString()}
                    </div>
                    <div className="col-span-2 font-semibold text-slate-900 text-xs sm:text-sm">
                      <span className={Number(product.stock ?? 0) <= 5 ? 'text-amber-600' : ''}>
                        {product.stock ?? 0}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      {/* إظهار/إخفاء المنتج في الموقع */}
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={togglingId === product.id}
                        title={
                          isInactive
                            ? 'المنتج مخفي من الموقع — اضغط لإظهاره'
                            : 'المنتج معروض في الموقع — اضغط لإخفائه'
                        }
                        className={`h-8 px-3 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition-all disabled:opacity-50 ${
                          isInactive
                            ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {togglingId === product.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : isInactive ? (
                          <EyeOff size={13} />
                        ) : (
                          <Eye size={13} />
                        )}
                        {isInactive ? 'مخفي' : 'معروض'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowAddModal(true);
                        }}
                        title="تعديل المنتج"
                        className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        title="حذف المنتج"
                        className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                <div className="text-sm text-slate-500">
                  عرض {(currentPage - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)} من{' '}
                  {filteredProducts.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                  >
                    السابق
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-slate-900 text-white'
                            : 'border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                  >
                    التالي
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-500">عرض</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <label className="text-sm text-slate-500">لكل صفحة</label>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit modal */}
      {showAddModal && (
        <ProductModal
          product={editingProduct}
          saving={saving}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Image Preview Modal */}
      {previewImageSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setPreviewImageSrc('')}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">معاينة الصورة</h3>
              <button
                onClick={() => setPreviewImageSrc('')}
                className="p-2 hover:bg-slate-50 rounded-lg"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <img src={previewImageSrc} alt="Preview" className="w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* Guide Dialog */}
      {guideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setGuideOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">دليل المخزون</h2>
              <button
                onClick={() => setGuideOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-lg"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-6 text-right">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={18} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900">وظيفة الصفحة</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  إدارة المنتجات والمخزون، إضافة وتعديل وحذف المنتجات، مع إمكانية الاستيراد والتصدير
                  بالجملة.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={18} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900">متى تستخدمها</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  عند الحاجة لإضافة منتجات جديدة، تعديل الأسعار أو المخزون، أو تصدير قائمة المنتجات.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList size={18} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900">ماذا ستجد داخلها</h3>
                </div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• إحصائيات المخزون (إجمالي المنتجات، النشطة، منخفضة المخزون، القيمة)</li>
                  <li>• جدول بجميع المنتجات مع الصور والأسعار والمخزون</li>
                  <li>• بحث وفلترة حسب الفئة والترتيب</li>
                  <li>• إجراءات سريعة (إضافة، تعديل، حذف، تفعيل/تعطيل)</li>
                  <li>• استيراد وتصدير CSV</li>
                  <li>• ترقيم الصفحات</li>
                  {isRestaurant && <li>• إدارة الإضافات (للمطاعم)</li>}
                  {isRetail && (
                    <li>• محرر خريطة الصور (تطبيق اختياري — ثبّته من صفحة التطبيقات)</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={18} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900">كيفية العمل</h3>
                </div>
                <ol className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>1. راجع إحصائيات المخزون لفهم الوضع الحالي</li>
                  <li>2. استخدم البحث للعثور على منتج محدد</li>
                  <li>3. استخدم الفلاتر لتضييق النتائج حسب الفئة</li>
                  <li>4. اضغط "إضافة منتج" لإضافة منتج جديد</li>
                  <li>5. استخدم أزرار الإجراءات لتعديل أو حذف المنتجات</li>
                  <li>6. استخدم الاستيراد/التصدير لإدارة المنتجات بالجملة</li>
                  {isRestaurant && (
                    <li>7. استخدم "إدارة الإضافات" لإضافة خيارات إضافية للمنتجات</li>
                  )}
                  {isRetail && (
                    <li>
                      7. ثبّت تطبيق "محرر الصور التفاعلي" من صفحة التطبيقات لتفعيل خريطة الصور
                    </li>
                  )}
                </ol>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={18} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900">أفضل الممارسات</h3>
                </div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• حافظ على تحديث المخزون بانتظام</li>
                  <li>• استخدم الفئات لتنظيم المنتجات بشكل أفضل</li>
                  <li>• راجع المنتجات منخفضة المخزون لإعادة التعبئة</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={18} className="text-amber-500" />
                  <h3 className="font-bold text-slate-900">نصائح</h3>
                </div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• استخدم الاستيراد بالجملة لإضافة العديد من المنتجات دفعة واحدة</li>
                  <li>• راجع الصور للتأكد من جودة العرض</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link2 size={18} className="text-slate-700" />
                  <h3 className="font-bold text-slate-900">روابط ذات صلة</h3>
                </div>
                <ul className="text-sm text-slate-600 space-y-1.5 pr-4">
                  <li>• الفئات</li>
                  <li>• المبيعات</li>
                  <li>• المخزون المنخفض</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Addons Modal (Restaurant only) */}
      {showAddonsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setShowAddonsModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 flex-row-reverse">
              <h2 className="text-xl font-black text-slate-900">إدارة الإضافات</h2>
              <button
                onClick={() => setShowAddonsModal(false)}
                className="p-2 hover:bg-slate-50 rounded-lg"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="text-center py-12">
              <Package size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-bold">إدارة الإضافات قيد التطوير</p>
              <p className="text-slate-400 text-sm mt-2">
                ستتمكن قريباً من إضافة وإدارة الإضافات للمنتجات
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Map Editor Modal */}
      {showImageMapModal && shop && (
        <ImageMapEditorModal
          open={showImageMapModal}
          onClose={() => setShowImageMapModal(false)}
          shopId={shop.id}
          products={products}
          onProductsSynced={fetchProducts}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  saving,
  onClose,
  onSave,
}: {
  product: Product | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(String(product?.price || ''));
  const [stock, setStock] = useState(String(product?.stock ?? ''));
  const [category, setCategory] = useState(
    typeof product?.category === 'string' ? product.category : ''
  );
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || product?.image_url || '');
  const [description, setDescription] = useState(product?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      category: category.trim() || 'عام',
      imageUrl: imageUrl.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 flex-row-reverse">
          <h2 className="text-xl font-black text-slate-900">
            {product ? 'تعديل منتج' : 'إضافة منتج'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">اسم المنتج</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-right">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">السعر (ج.م)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>
            <div className="text-right">
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">المخزون</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">الفئة</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="عام"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">رابط الصورة</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="text-right">
            <label className="text-xs font-bold text-slate-500 mb-1.5 block">الوصف</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>
          <div className="flex gap-3 flex-row-reverse pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
