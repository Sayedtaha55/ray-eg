'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Store, Search, Eye, Edit, Check, X, Loader2,
  ExternalLink, MapPin, Phone, Mail, Globe, Ban, ShieldCheck,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import {
  adminGetShops, adminGetPendingShops, adminGetShopById,
  adminUpdateShopStatus, adminUpdateShop,
} from '@/lib/api/admin';

export default function AdminShopsPage() {
  const t = useT();
  const { locale, dir } = useLocale();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<any[]>([]);
  const [pendingShops, setPendingShops] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'>('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [shopDetails, setShopDetails] = useState<any>(null);
  const [actionId, setActionId] = useState('');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [allS, p] = await Promise.all([adminGetShops('all'), adminGetPendingShops()]);
      setShops(Array.isArray(allS) ? allS : []);
      setPendingShops(Array.isArray(p) ? p : []);
    } catch {
      if (!silent) { setShops([]); setPendingShops([]); }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprovalAction = async (id: string, action: string) => {
    try {
      setActionId(id);
      await adminUpdateShopStatus(id, action);
      await loadData(true);
      if (selectedShop?.id === id && detailsOpen) {
        const refreshed = await adminGetShopById(String(id));
        setShopDetails(refreshed);
      }
    } catch {
      // error
    } finally {
      setActionId('');
    }
  };

  const toggleShopActive = async (shop: any, nextActive: boolean) => {
    const ok = confirm(
      nextActive
        ? t('admin.shops.confirmReactivate', `تفعيل ${shop.name || 'المتجر'}؟`)
        : t('admin.shops.confirmDisable', `تعطيل ${shop.name || 'المتجر'}؟`)
    );
    if (!ok) return;
    try {
      setActionId(String(shop.id));
      await adminUpdateShop(String(shop.id), { isActive: nextActive });
      await loadData(true);
    } catch {
      // error
    } finally {
      setActionId('');
    }
  };

  const openShopDetails = async (shop: any) => {
    setSelectedShop(shop);
    setShopDetails(null);
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const data = await adminGetShopById(String(shop.id));
      setShopDetails(data || null);
    } catch {
      // error
    } finally {
      setDetailsLoading(false);
    }
  };

  const editDeliveryFee = async (shop: any) => {
    const current = shop?.layoutConfig?.deliveryFee ?? null;
    const raw = prompt(t('admin.shops.deliveryFeePrompt', 'رسوم التوصيل:'), current != null ? String(current) : '');
    if (raw == null) return;
    const fee = Number(String(raw).trim());
    if (Number.isNaN(fee) || fee < 0) return;
    try {
      await adminUpdateShop(String(shop.id), { deliveryFee: fee });
      await loadData(true);
    } catch {
      // error
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter((shop: any) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || [shop?.name, shop?.email, shop?.phone, shop?.city, shop?.governorate, shop?.slug]
        .some((x) => String(x || '').toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || String(shop?.status || '').toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shops, searchTerm, statusFilter]);

  const statusLabel = (s: string) => {
    const upper = String(s || '').toUpperCase();
    if (upper === 'APPROVED') return t('admin.shops.statusActive', 'نشط');
    if (upper === 'REJECTED') return t('admin.shops.statusRejected', 'مرفوض');
    if (upper === 'SUSPENDED') return t('admin.shops.statusSuspended', 'معلّق');
    return t('admin.shops.statusPending', 'قيد المراجعة');
  };

  const statusClass = (s: string) => {
    const upper = String(s || '').toUpperCase();
    if (upper === 'APPROVED') return 'bg-green-500/20 text-green-400';
    if (upper === 'REJECTED') return 'bg-red-500/20 text-red-400';
    if (upper === 'SUSPENDED') return 'bg-fuchsia-500/20 text-fuchsia-300';
    return 'bg-amber-500/20 text-amber-400';
  };

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" /></div>;
  }

  const selected = shopDetails || selectedShop;

  return (
    <div className="space-y-8" dir={dir}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl"><Store size={24} /></div>
          <div>
            <h2 className="text-3xl font-black text-white">{t('admin.shops.title', 'المتاجر')}</h2>
            <p className="text-slate-500 text-sm font-bold">{t('admin.shops.subtitle', 'إدارة متاجر المنصة')}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 px-5 py-4 text-center">
            <div className="text-slate-500 text-xs font-black">{t('admin.shops.total', 'الكل')}</div>
            <div className="mt-2 text-white text-2xl font-black">{shops.length}</div>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 px-5 py-4 text-center">
            <div className="text-slate-500 text-xs font-black">{t('admin.shops.pending', 'معلّق')}</div>
            <div className="mt-2 text-amber-400 text-2xl font-black">{pendingShops.length}</div>
          </div>
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 px-5 py-4 text-center">
            <div className="text-slate-500 text-xs font-black">{t('admin.shops.active', 'نشط')}</div>
            <div className="mt-2 text-emerald-400 text-2xl font-black">{shops.filter((s: any) => String(s?.status || '').toUpperCase() === 'APPROVED').length}</div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Quick View */}
      {pendingShops.length > 0 && (
        <div className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-6">
          <h3 className="text-white font-black text-lg mb-4">
            {t('admin.shops.pendingApprovalsTitle', `${pendingShops.length} طلب معلّق`)}
          </h3>
          <div className="space-y-3">
            {pendingShops.slice(0, 6).map((shop: any) => (
              <div key={shop.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="flex items-center gap-4 flex-row-reverse">
                  <img
                    src={shop.logoUrl || shop.logo_url || '/default-shop.png'}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-800"
                    loading="lazy"
                    alt=""
                  />
                  <div className="text-right">
                    <div className="text-white font-black">{shop.name}</div>
                    <div className="text-slate-500 text-xs font-bold">{shop.governorate} • {shop.city} • {shop.category}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => openShopDetails(shop)} className="px-4 py-2 bg-white/5 text-slate-200 rounded-xl font-black text-xs flex items-center gap-2"><Eye size={16} /> {t('admin.shops.details', 'تفاصيل')}</button>
                  <button onClick={() => handleApprovalAction(shop.id, 'approved')} className="px-4 py-2 bg-green-500 text-white rounded-xl font-black text-xs flex items-center gap-2"><Check size={16} /> {t('admin.shops.approve', 'قبول')}</button>
                  <button onClick={() => handleApprovalAction(shop.id, 'rejected')} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl font-black text-xs flex items-center gap-2"><X size={16} /> {t('admin.shops.reject', 'رفض')}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shops Table */}
      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder={t('admin.shops.searchPlaceholder', 'ابحث بالاسم أو المحافظة...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
          >
            <option value="all">{t('admin.shops.allStatuses', 'كل الحالات')}</option>
            <option value="APPROVED">{t('admin.shops.statusActive', 'نشط')}</option>
            <option value="PENDING">{t('admin.shops.statusPending', 'قيد المراجعة')}</option>
            <option value="REJECTED">{t('admin.shops.statusRejected', 'مرفوض')}</option>
            <option value="SUSPENDED">{t('admin.shops.statusSuspended', 'معلّق')}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.shop', 'المتجر')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.owner', 'المالك')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.location', 'الموقع')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.status', 'الحالة')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.actions', 'إجراءات')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop: any) => {
                const status = String(shop.status || '').toUpperCase();
                const isActive = Boolean(shop?.isActive ?? true);
                return (
                  <tr key={shop.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={shop.logoUrl || shop.logo_url || '/default-shop.png'} className="w-10 h-10 rounded-xl object-cover bg-slate-800" loading="lazy" alt="" />
                        <div className="min-w-0">
                          <div className="text-white font-black truncate">{shop.name}</div>
                          <div className="text-slate-500 text-xs font-bold truncate">/{shop.slug || '-'} • {shop.category || '-'}</div>
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
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-xl text-xs font-black ${statusClass(status)}`}>
                        {statusLabel(status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openShopDetails(shop)} className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white" title={t('admin.shops.view', 'عرض')}><Eye className="w-4 h-4" /></button>
                        <button onClick={() => editDeliveryFee(shop)} className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white" title={t('admin.shops.editDeliveryFee', 'رسوم التوصيل')}><Edit className="w-4 h-4" /></button>
                        {status === 'PENDING' && (
                          <button onClick={() => handleApprovalAction(shop.id, 'approved')} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300" title={t('admin.shops.approve', 'قبول')}><Check className="w-4 h-4" /></button>
                        )}
                        {isActive ? (
                          <button disabled={actionId === String(shop?.id)} onClick={() => toggleShopActive(shop, false)} className="p-2 rounded-xl bg-red-500/10 text-red-300" title={t('admin.shops.disable', 'تعطيل')}><Ban className="w-4 h-4" /></button>
                        ) : (
                          <button disabled={actionId === String(shop?.id)} onClick={() => toggleShopActive(shop, true)} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300" title={t('admin.shops.reactivate', 'تفعيل')}><ShieldCheck className="w-4 h-4" /></button>
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
            {searchTerm || statusFilter !== 'all' ? t('admin.shops.noResults', 'لا توجد نتائج') : t('admin.shops.noShops', 'لا توجد متاجر')}
          </div>
        )}
      </div>

      {/* Shop Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDetailsOpen(false)} />
          <div className="relative bg-slate-900 border border-white/5 rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-y-auto p-8 z-[210]">
            <button onClick={() => setDetailsOpen(false)} className="absolute left-6 top-6 text-slate-500 hover:text-white text-2xl">&times;</button>

            {detailsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : selected ? (
              <div className="space-y-6 text-right">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">{selected?.name || t('admin.shops.shop', 'متجر')}</h3>
                    <div className="mt-2 space-y-2 text-sm font-bold text-slate-300">
                      <div className="flex items-center gap-2 justify-end"><Globe size={14} className="text-slate-500" /> /{selected?.slug || '-'}</div>
                      <div className="flex items-center gap-2 justify-end"><Mail size={14} className="text-slate-500" /> {selected?.email || selected?.owner?.email || '-'}</div>
                      <div className="flex items-center gap-2 justify-end"><Phone size={14} className="text-slate-500" /> {selected?.phone || '-'}</div>
                      <div className="flex items-center gap-2 justify-end"><MapPin size={14} className="text-slate-500" /> {selected?.governorate || '-'} • {selected?.city || '-'}</div>
                    </div>
                  </div>
                  <img src={selected?.logoUrl || selected?.logo_url || '/default-shop.png'} className="w-20 h-20 rounded-3xl object-cover bg-slate-800" alt="" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {String(selected?.status || '').toUpperCase() === 'PENDING' && (
                    <>
                      <button disabled={actionId === String(selected?.id)} onClick={() => handleApprovalAction(String(selected?.id), 'approved')} className="px-6 py-3 rounded-2xl bg-green-500 text-white font-black text-sm flex items-center gap-2"><Check size={16} /> {t('admin.shops.acceptShop', 'قبول المتجر')}</button>
                      <button disabled={actionId === String(selected?.id)} onClick={() => handleApprovalAction(String(selected?.id), 'rejected')} className="px-6 py-3 rounded-2xl bg-red-500/15 text-red-300 font-black text-sm flex items-center gap-2"><X size={16} /> {t('admin.shops.rejectRequest', 'رفض الطلب')}</button>
                    </>
                  )}
                  <button onClick={() => window.open(`/${locale}/shop/${selected?.slug || selected?.id}`, '_blank')} className="px-6 py-3 rounded-2xl bg-white/5 text-slate-100 font-black text-sm flex items-center gap-2"><ExternalLink size={16} /> {t('admin.shops.openShopPage', 'فتح صفحة المتجر')}</button>
                </div>

                {selected?.description && (
                  <div className="text-sm font-bold text-slate-300 leading-7">{selected.description}</div>
                )}
              </div>
            ) : (
              <div className="text-slate-400 font-bold text-center py-16">{t('admin.shops.noData', 'لا توجد بيانات')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
