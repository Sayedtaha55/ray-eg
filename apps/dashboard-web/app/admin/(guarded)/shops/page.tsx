'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Store, Search, Eye, Edit, Check, X, Loader2, ExternalLink,
  MapPin, Phone, Mail, Globe, Ban, ShieldCheck, Truck, LayoutGrid,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useToast } from '@/components/settings/ToastProvider';
import AdminModal from '@/components/admin/AdminModal';

const MotionDiv = motion.div as any;

const fmtDate = (value: any) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ar-EG');
};

export default function AdminShopsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [shopStatusFilter, setShopStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'>('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [selectedShopDetails, setSelectedShopDetails] = useState<any>(null);
  const [actionId, setActionId] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [allS, p] = await Promise.all([
        apiRequest('/shops?status=all').catch(() => []),
        apiRequest('/shops/pending').catch(() => []),
      ]);
      setShops(Array.isArray(allS) ? allS : []);
      setPendingShops(Array.isArray(p) ? p : []);
    } catch {
      if (!silent) {
        toast({ title: 'فشل تحميل المتاجر', variant: 'destructive' });
        setShops([]);
        setPendingShops([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const getShopDeliveryFee = (shop: any): number | null => {
    const raw = shop?.layoutConfig?.deliveryFee;
    const n = typeof raw === 'number' ? raw : raw == null ? NaN : Number(raw);
    return Number.isNaN(n) || n < 0 ? null : n;
  };

  const getEnabledModulesCount = (shop: any) =>
    Array.isArray(shop?.layoutConfig?.enabledModules) ? shop.layoutConfig.enabledModules.length : 0;

  const editShopDeliveryFee = async (shop: any) => {
    try {
      const current = getShopDeliveryFee(shop);
      const raw = window.prompt('رسوم التوصيل (ج.م):', current != null ? String(current) : '');
      if (raw == null) return;
      const fee = Number(String(raw).trim());
      if (Number.isNaN(fee) || fee < 0) return;
      await apiRequest(`/shops/${shop.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ deliveryFee: fee }),
      });
      toast({ title: 'تم تحديث رسوم التوصيل', variant: 'success' });
      await loadData(true);
      if (selectedShop?.id === shop?.id) {
        const refreshed = await apiRequest(`/shops/admin/${shop.id}`);
        setSelectedShopDetails(refreshed);
      }
    } catch {
      toast({ title: 'فشل تحديث رسوم التوصيل', variant: 'destructive' });
    }
  };

  const handleApprovalAction = async (id: string, action: 'approved' | 'rejected' | 'pending') => {
    try {
      setActionId(id);
      await apiRequest(`/shops/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: action }),
      });
      toast({
        title: action === 'approved' ? 'تم قبول المتجر' : action === 'rejected' ? 'تم رفض المتجر' : 'تم الإرجاع للمراجعة',
        variant: 'success',
      });
      await loadData(true);
      if (selectedShop?.id === id) {
        const refreshed = await apiRequest(`/shops/admin/${id}`);
        setSelectedShopDetails(refreshed);
      }
    } catch {
      toast({ title: 'فشل تنفيذ العملية', variant: 'destructive' });
    } finally {
      setActionId('');
    }
  };

  const handleSuspendToggle = async (shop: any, nextStatus: 'approved' | 'suspended') => {
    try {
      setActionId(String(shop?.id || ''));
      await apiRequest(`/shops/${shop?.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus === 'approved' ? 'approved' : 'suspended' }),
      });
      toast({
        title: nextStatus === 'approved' ? 'تم إعادة تفعيل المتجر' : 'تم تعليق المتجر',
        variant: 'success',
      });
      await loadData(true);
      if (selectedShop?.id === shop?.id) {
        const refreshed = await apiRequest(`/shops/admin/${shop.id}`);
        setSelectedShopDetails(refreshed);
      }
    } catch {
      toast({ title: 'فشل تنفيذ العملية', variant: 'destructive' });
    } finally {
      setActionId('');
    }
  };

  const toggleFlag = async (shop: any, key: 'publicDisabled' | 'deliveryDisabled', nextValue: boolean) => {
    try {
      setActionId(String(shop?.id || ''));
      await apiRequest(`/shops/${shop?.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ [key]: nextValue }),
      });
      toast({
        title: key === 'publicDisabled' ? 'تم تحديث الظهور العام' : 'تم تحديث حالة التوصيل',
        variant: 'success',
      });
      await loadData(true);
      if (selectedShop?.id === shop?.id) {
        const refreshed = await apiRequest(`/shops/admin/${shop.id}`);
        setSelectedShopDetails(refreshed);
      }
    } catch (e: any) {
      toast({ title: String(e?.message || 'فشل الحفظ'), variant: 'destructive' });
    } finally {
      setActionId('');
    }
  };

  const toggleShopActive = async (shop: any, nextActive: boolean) => {
    const id = String(shop?.id || '').trim();
    if (!id) return;
    const name = String(shop?.name || '').trim() || 'المتجر';
    const ok = window.confirm(
      nextActive ? `هل تريد إعادة تفعيل "${name}"؟` : `هل تريد تعطيل "${name}" من التطبيق؟`,
    );
    if (!ok) return;
    try {
      setActionId(id);
      await apiRequest(`/shops/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: nextActive }),
      });
      toast({
        title: nextActive ? 'تم إعادة التفعيل' : 'تم التعطيل',
        variant: 'success',
      });
      await loadData(true);
      if (selectedShop?.id === id) {
        const refreshed = await apiRequest(`/shops/admin/${id}`);
        setSelectedShopDetails(refreshed);
      }
    } catch (e: any) {
      toast({ title: String(e?.message || 'فشل تنفيذ العملية'), variant: 'destructive' });
    } finally {
      setActionId('');
    }
  };

  const openShopDetails = async (shop: any) => {
    setSelectedShop(shop);
    setSelectedShopDetails(null);
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const data = await apiRequest(`/shops/admin/${shop?.id || ''}`);
      setSelectedShopDetails(data || null);
    } catch (e: any) {
      toast({ title: String(e?.message || 'فشل تحميل التفاصيل'), variant: 'destructive' });
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        [shop?.name, shop?.email, shop?.phone, shop?.city, shop?.governorate, shop?.slug]
          .some((x) => String(x || '').toLowerCase().includes(q));
      const matchesStatus = shopStatusFilter === 'all' || String(shop?.status || '').toUpperCase() === shopStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shops, searchTerm, shopStatusFilter]);

  const paginatedShops = filteredShops.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredShops.length / pageSize);

  const selected = selectedShopDetails || selectedShop;
  const selectedStatus = String(selected?.status || '').toUpperCase();
  const selectedPublicDisabled = Boolean(selected?.publicDisabled ?? selected?.public_disabled ?? false);
  const selectedDeliveryDisabled = Boolean(selected?.deliveryDisabled ?? selected?.delivery_disabled ?? false);
  const selectedIsActive = Boolean(selected?.isActive ?? selected?.is_active ?? true);
  const enabledModules = Array.isArray(selected?.layoutConfig?.enabledModules) ? selected.layoutConfig.enabledModules : [];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl"><Store size={24} /></div>
          <div>
            <h2 className="text-3xl font-black text-white">إدارة المتاجر</h2>
            <p className="text-slate-500 text-sm font-bold">عرض وإدارة جميع متاجر المنصة</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 px-5 py-4 text-center">
            <div className="text-slate-500 text-xs font-black">الإجمالي</div>
            <div className="mt-2 text-white text-2xl font-black">{shops.length}</div>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 px-5 py-4 text-center">
            <div className="text-slate-500 text-xs font-black">قيد المراجعة</div>
            <div className="mt-2 text-amber-400 text-2xl font-black">{pendingShops.length}</div>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 px-5 py-4 text-center">
            <div className="text-slate-500 text-xs font-black">نشطة</div>
            <div className="mt-2 text-emerald-400 text-2xl font-black">
              {shops.filter((s) => String(s?.status || '').toUpperCase() === 'APPROVED').length}
            </div>
          </div>
        </div>
      </div>

      {pendingShops.length > 0 && (
        <MotionDiv
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-6"
        >
          <h3 className="text-white font-black text-lg mb-4">
            موافقات معلقة ({pendingShops.length})
          </h3>
          <div className="space-y-3">
            {pendingShops.slice(0, 6).map((shop) => (
              <div
                key={shop.id}
                className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-row-reverse">
                  <img
                    src={shop.logoUrl || shop.logo_url || '/default-shop.png'}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-800"
                    loading="lazy"
                  />
                  <div className="text-right">
                    <div className="text-white font-black">{shop.name}</div>
                    <div className="text-slate-500 text-xs font-bold">
                      {shop.governorate} • {shop.city} • {shop.category}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openShopDetails(shop)}
                    className="px-4 py-2 bg-white/5 text-slate-200 rounded-xl font-black text-xs flex items-center gap-2"
                  >
                    <Eye size={16} /> تفاصيل
                  </button>
                  <button
                    onClick={() => handleApprovalAction(shop.id, 'approved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-black text-xs flex items-center gap-2"
                  >
                    <Check size={16} /> قبول
                  </button>
                  <button
                    onClick={() => handleApprovalAction(shop.id, 'rejected')}
                    className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl font-black text-xs flex items-center gap-2"
                  >
                    <X size={16} /> رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        </MotionDiv>
      )}

      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث بالاسم، البريد، الهاتف، المدينة..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
            />
          </div>
          <select
            value={shopStatusFilter}
            onChange={(e) => { setShopStatusFilter(e.target.value as any); setPage(0); }}
            className="px-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
          >
            <option value="all">كل الحالات</option>
            <option value="APPROVED">نشط</option>
            <option value="PENDING">قيد المراجعة</option>
            <option value="REJECTED">مرفوض</option>
            <option value="SUSPENDED">معلّق</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1180px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">المتجر</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">المالك</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">الموقع</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">التوصيل</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">الأزرار</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">الحالة</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedShops.map((shop) => {
                const status = String(shop.status || '').toUpperCase();
                const isActive = Boolean(shop?.isActive ?? shop?.is_active ?? true);
                return (
                  <tr key={shop.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={shop.logoUrl || shop.logo_url || '/default-shop.png'}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-800"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <div className="text-white font-black truncate">{shop.name}</div>
                          <div className="text-slate-500 text-xs font-bold truncate">
                            /{shop.slug || '-'} • {shop.category || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-bold text-sm">
                      <div>{shop?.owner?.name || '-'}</div>
                      <div className="text-slate-500 text-xs mt-1">{shop?.owner?.email || shop?.email || '-'}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-bold text-sm">
                      {shop.governorate || '-'}
                      <div className="text-slate-500 text-xs mt-1">{shop.city || '-'}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-bold text-sm">
                      <button onClick={() => editShopDeliveryFee(shop)} className="hover:text-[#00E5FF] transition-colors">
                        {getShopDeliveryFee(shop) ?? 0} ج.م
                      </button>
                      <div className="text-slate-500 text-xs mt-1">
                        {Boolean(shop?.deliveryDisabled ?? shop?.delivery_disabled) ? 'معطّل' : 'مفعّل'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-bold text-sm">{getEnabledModulesCount(shop)} زر</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black ${
                          status === 'APPROVED'
                            ? 'bg-green-500/20 text-green-400'
                            : status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400'
                            : status === 'SUSPENDED'
                            ? 'bg-fuchsia-500/20 text-fuchsia-300'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {status === 'APPROVED' ? 'نشط' : status === 'REJECTED' ? 'مرفوض' : status === 'SUSPENDED' ? 'معلّق إدارياً' : 'قيد المراجعة'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openShopDetails(shop)}
                          className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                          title="عرض"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => editShopDeliveryFee(shop)}
                          className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                          title="تعديل رسوم التوصيل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {status === 'PENDING' && (
                          <button
                            onClick={() => handleApprovalAction(shop.id, 'approved')}
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300"
                            title="قبول"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {isActive ? (
                          <button
                            disabled={actionId === String(shop?.id)}
                            onClick={() => toggleShopActive(shop, false)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-300"
                            title="تعطيل من التطبيق"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled={actionId === String(shop?.id)}
                            onClick={() => toggleShopActive(shop, true)}
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300"
                            title="إعادة تفعيل"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-12 text-slate-500 font-bold">
            {searchTerm || shopStatusFilter !== 'all' ? 'لا توجد نتائج مطابقة' : 'لا توجد متاجر بعد'}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <span className="text-slate-500 text-xs font-bold">
              صفحة {page + 1} من {totalPages} ({filteredShops.length} متجر)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-200 text-xs font-black disabled:opacity-40"
              >
                السابق
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-200 text-xs font-black disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      <AdminModal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} title="تفاصيل المتجر" size="xl">
        {detailsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#00E5FF]" />
          </div>
        ) : selected ? (
          <div className="space-y-5 text-right">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">{selected?.name || 'متجر'}</h3>
                    <div className="mt-2 space-y-2 text-sm font-bold text-slate-300">
                      <div className="flex items-center gap-2 justify-end"><Globe size={14} className="text-slate-500" /> /{selected?.slug || '-'}</div>
                      <div className="flex items-center gap-2 justify-end"><Mail size={14} className="text-slate-500" /> {selected?.email || selected?.owner?.email || '-'}</div>
                      <div className="flex items-center gap-2 justify-end"><Phone size={14} className="text-slate-500" /> {selected?.phone || '-'}</div>
                      <div className="flex items-center gap-2 justify-end"><MapPin size={14} className="text-slate-500" /> {selected?.governorate || '-'} • {selected?.city || '-'}</div>
                    </div>
                  </div>
                  <img src={selected?.logoUrl || selected?.logo_url || '/default-shop.png'} className="w-20 h-20 rounded-3xl object-cover bg-slate-800" />
                </div>
                {selected?.description ? <div className="mt-4 text-sm font-bold text-slate-300 leading-7">{selected.description}</div> : null}
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-white font-black">إجراءات سريعة</div>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => window.open(`/shop/${selected?.slug || selected?.id}`, '_blank')}
                    className="w-full px-4 py-3 rounded-2xl bg-white/5 text-slate-100 font-black text-sm flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} /> فتح صفحة المتجر
                  </button>
                  {selectedStatus === 'PENDING' && (
                    <>
                      <button
                        disabled={actionId === String(selected?.id)}
                        onClick={() => handleApprovalAction(String(selected?.id), 'approved')}
                        className="w-full px-4 py-3 rounded-2xl bg-green-500 text-white font-black text-sm flex items-center justify-center gap-2"
                      >
                        <Check size={16} /> قبول المتجر
                      </button>
                      <button
                        disabled={actionId === String(selected?.id)}
                        onClick={() => handleApprovalAction(String(selected?.id), 'rejected')}
                        className="w-full px-4 py-3 rounded-2xl bg-red-500/15 text-red-300 font-black text-sm flex items-center justify-center gap-2"
                      >
                        <X size={16} /> رفض الطلب
                      </button>
                    </>
                  )}
                  {selectedStatus === 'APPROVED' && (
                    <button
                      disabled={actionId === String(selected?.id)}
                      onClick={() => handleSuspendToggle(selected, 'suspended')}
                      className="w-full px-4 py-3 rounded-2xl bg-fuchsia-500/15 text-fuchsia-300 font-black text-sm flex items-center justify-center gap-2"
                    >
                      <Ban size={16} /> تعليق المتجر
                    </button>
                  )}
                  {selectedStatus === 'SUSPENDED' && (
                    <button
                      disabled={actionId === String(selected?.id)}
                      onClick={() => handleSuspendToggle(selected, 'approved')}
                      className="w-full px-4 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={16} /> إعادة تفعيل
                    </button>
                  )}
                  {selectedIsActive ? (
                    <button
                      disabled={actionId === String(selected?.id)}
                      onClick={() => toggleShopActive(selected, false)}
                      className="w-full px-4 py-3 rounded-2xl bg-red-500/15 text-red-300 font-black text-sm flex items-center justify-center gap-2"
                    >
                      <Ban size={16} /> تعطيل من التطبيق
                    </button>
                  ) : (
                    <button
                      disabled={actionId === String(selected?.id)}
                      onClick={() => toggleShopActive(selected, true)}
                      className="w-full px-4 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={16} /> إعادة تفعيل المتجر
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ['الحالة', selectedStatus || '-'],
                ['رسوم التوصيل', `ج.م ${Number(getShopDeliveryFee(selected) || 0).toLocaleString()}`],
                ['عدد الأزرار', enabledModules.length],
                ['تاريخ الإنشاء', fmtDate(selected?.createdAt)],
              ].map(([label, value]: any) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <div className="text-slate-500 text-[11px] font-black">{label}</div>
                  <div className="mt-2 text-white font-black">{value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-white font-black flex items-center gap-2 justify-end">
                  <LayoutGrid size={16} /> الظهور والخدمات
                </div>
                <div className="mt-4 space-y-3 text-sm font-bold text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">الظهور العام</span>
                    <button
                      disabled={actionId === String(selected?.id)}
                      onClick={() => toggleFlag(selected, 'publicDisabled', !selectedPublicDisabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-black ${
                        selectedPublicDisabled ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {selectedPublicDisabled ? 'إظهار' : 'إخفاء'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">خدمة التوصيل</span>
                    <button
                      disabled={actionId === String(selected?.id)}
                      onClick={() => toggleFlag(selected, 'deliveryDisabled', !selectedDeliveryDisabled)}
                      className={`px-4 py-2 rounded-xl text-xs font-black ${
                        selectedDeliveryDisabled ? 'bg-amber-500/15 text-amber-300' : 'bg-sky-500/15 text-sky-300'
                      }`}
                    >
                      {selectedDeliveryDisabled ? 'تفعيل' : 'تعطيل'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">وضع اللوحة</span>
                    <span>{String(selected?.layoutConfig?.dashboardMode || '-')}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">مالك المتجر</span>
                    <span>{selected?.owner?.name || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-white font-black flex items-center gap-2 justify-end">
                  <Truck size={16} /> تفاصيل إضافية
                </div>
                <div className="mt-4 space-y-3 text-sm font-bold text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">العنوان المعروض</span>
                    <span>{selected?.displayAddress || selected?.addressDetailed || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">واتساب</span>
                    <span>{selected?.whatsapp || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">عدد الزيارات</span>
                    <span>{Number(selected?.visitors || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">آخر تحديث</span>
                    <span>{fmtDate(selected?.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="text-white font-black mb-4">الأزرار المفعّلة</div>
              <div className="flex flex-wrap gap-2 justify-end">
                {enabledModules.length === 0 ? (
                  <span className="text-slate-500 font-bold">لا توجد أزرار مفعّلة</span>
                ) : (
                  enabledModules.map((moduleId: string) => (
                    <span
                      key={String(moduleId)}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-black"
                    >
                      {String(moduleId)}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 font-bold text-center py-16">لا توجد بيانات</div>
        )}
      </AdminModal>
    </div>
  );
}
