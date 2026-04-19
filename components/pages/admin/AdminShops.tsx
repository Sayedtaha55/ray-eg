import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Search, Eye, Edit, Check, X, Loader2, ExternalLink, MapPin, Phone, Mail, Globe, Ban, ShieldCheck, Truck, LayoutGrid } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { useSmartRefreshListener } from '@/hooks/useSmartRefresh';
import Modal from '@/components/common/ui/Modal';
import { useTranslation } from 'react-i18next';

const MotionDiv = motion.div as any;

const fmtDate = (value: any) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('ar-EG');
};

const AdminShops: React.FC = () => {
  const { t } = useTranslation();
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
  const { addToast } = useToast();

  const loadData = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [allS, p] = await Promise.all([ApiService.getShops('all'), ApiService.getPendingShops()]);
      setShops(Array.isArray(allS) ? allS : []);
      setPendingShops(Array.isArray(p) ? p : []);
    } catch {
      if (!silent) {
        addToast(t('admin.shops.loadFailed'), 'error');
        setShops([]);
        setPendingShops([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useSmartRefreshListener(['shop', 'all'], () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    loadData({ silent: true });
  });

  const getShopDeliveryFee = (shop: any): number | null => {
    const raw = (shop?.layoutConfig as any)?.deliveryFee;
    const n = typeof raw === 'number' ? raw : raw == null ? NaN : Number(raw);
    return Number.isNaN(n) || n < 0 ? null : n;
  };

  const getEnabledModulesCount = (shop: any) => Array.isArray((shop?.layoutConfig as any)?.enabledModules) ? (shop.layoutConfig.enabledModules || []).length : 0;

  const editShopDeliveryFee = async (shop: any) => {
    try {
      const current = getShopDeliveryFee(shop);
      const raw = window.prompt(t('admin.shops.deliveryFeePrompt'), current != null ? String(current) : '');
      if (raw == null) return;
      const fee = Number(String(raw).trim());
      if (Number.isNaN(fee) || fee < 0) return;
      await ApiService.updateMyShop({ shopId: String(shop.id), deliveryFee: fee });
      addToast(t('admin.shops.deliveryFeeUpdated'), 'success');
      await loadData({ silent: true });
      if (selectedShop?.id === shop?.id) {
        const refreshed = await ApiService.getShopAdminById(String(shop.id));
        setSelectedShopDetails(refreshed);
      }
    } catch {
      addToast(t('admin.shops.deliveryFeeUpdateFailed'), 'error');
    }
  };

  const handleApprovalAction = async (id: string, action: 'approved' | 'rejected' | 'pending') => {
    try {
      setActionId(id);
      await (ApiService as any).updateShopStatus(id, action);
      addToast(
        action === 'approved'
          ? t('admin.shops.approved')
          : action === 'rejected'
            ? t('admin.shops.rejected')
            : t('admin.shops.backToReview'),
        'success',
      );
      await loadData({ silent: true });
      if (selectedShop?.id === id) {
        const refreshed = await ApiService.getShopAdminById(String(id));
        setSelectedShopDetails(refreshed);
      }
    } catch {
      addToast(t('admin.shops.actionFailed'), 'error');
    } finally {
      setActionId('');
    }
  };

  const handleSuspendToggle = async (shop: any, nextStatus: 'approved' | 'suspended') => {
    try {
      setActionId(String(shop?.id || ''));
      await (ApiService as any).updateShopStatus(String(shop?.id || ''), nextStatus === 'approved' ? 'approved' : 'suspended');
      addToast(nextStatus === 'approved' ? t('admin.shops.reactivated') : t('admin.shops.suspended'), 'success');
      await loadData({ silent: true });
      if (selectedShop?.id === shop?.id) {
        const refreshed = await ApiService.getShopAdminById(String(shop.id));
        setSelectedShopDetails(refreshed);
      }
    } catch {
      addToast(t('admin.shops.actionFailed'), 'error');
    } finally {
      setActionId('');
    }
  };

  const toggleFlag = async (shop: any, key: 'publicDisabled' | 'deliveryDisabled', nextValue: boolean) => {
    try {
      setActionId(String(shop?.id || ''));
      await ApiService.updateMyShop({ shopId: String(shop?.id || ''), [key]: nextValue });
      addToast(key === 'publicDisabled' ? t('admin.shops.publicVisibilityUpdated') : t('admin.shops.deliveryStatusUpdated'), 'success');
      await loadData({ silent: true });
      if (selectedShop?.id === shop?.id) {
        const refreshed = await ApiService.getShopAdminById(String(shop.id));
        setSelectedShopDetails(refreshed);
      }
    } catch (e: any) {
      addToast(String(e?.message || t('admin.shops.saveFailed')), 'error');
    } finally {
      setActionId('');
    }
  };

  const toggleShopActive = async (shop: any, nextActive: boolean) => {
    const id = String(shop?.id || '').trim();
    if (!id) return;
    const name = String(shop?.name || '').trim() || t('admin.shops.shop');
    const ok = window.confirm(
      nextActive ? t('admin.shops.confirmReactivate', { name }) : t('admin.shops.confirmDisable', { name }),
    );
    if (!ok) return;

    try {
      setActionId(id);
      await ApiService.updateMyShop({ shopId: id, isActive: nextActive });
      addToast(nextActive ? t('admin.shops.reactivated') : t('admin.shops.disabled'), 'success');
      await loadData({ silent: true });
      if (selectedShop?.id === id) {
        const refreshed = await ApiService.getShopAdminById(String(id));
        setSelectedShopDetails(refreshed);
      }
    } catch (e: any) {
      addToast(String(e?.message || t('admin.shops.actionFailed')), 'error');
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
      const data = await ApiService.getShopAdminById(String(shop?.id || ''));
      setSelectedShopDetails(data || null);
    } catch (e: any) {
      addToast(String(e?.message || t('admin.shops.loadDetailsFailed')), 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredShops = useMemo(() => {
    return shops.filter((shop: any) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || [shop?.name, shop?.email, shop?.phone, shop?.city, shop?.governorate, shop?.slug].some((x) => String(x || '').toLowerCase().includes(q));
      const matchesStatus = shopStatusFilter === 'all' || String(shop?.status || '').toUpperCase() === shopStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shops, searchTerm, shopStatusFilter]);

  const selected = selectedShopDetails || selectedShop;
  const selectedStatus = String(selected?.status || '').toUpperCase();
  const selectedPublicDisabled = Boolean(selected?.publicDisabled ?? selected?.public_disabled ?? false);
  const selectedDeliveryDisabled = Boolean(selected?.deliveryDisabled ?? selected?.delivery_disabled ?? false);
  const selectedIsActive = Boolean(selected?.isActive ?? selected?.is_active ?? true);
  const enabledModules = Array.isArray((selected?.layoutConfig as any)?.enabledModules) ? selected.layoutConfig.enabledModules : [];

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl"><Store size={24} /></div>
          <div>
            <h2 className="text-3xl font-black text-white">{t('admin.shops.title')}</h2>
            <p className="text-slate-500 text-sm font-bold">{t('admin.shops.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 px-5 py-4 text-center"><div className="text-slate-500 text-xs font-black">{t('admin.shops.total')}</div><div className="mt-2 text-white text-2xl font-black">{shops.length}</div></div>
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 px-5 py-4 text-center"><div className="text-slate-500 text-xs font-black">{t('admin.shops.pending')}</div><div className="mt-2 text-amber-400 text-2xl font-black">{pendingShops.length}</div></div>
          <div className="rounded-2xl bg-slate-900/70 border border-white/5 px-5 py-4 text-center"><div className="text-slate-500 text-xs font-black">{t('admin.shops.active')}</div><div className="mt-2 text-emerald-400 text-2xl font-black">{shops.filter((s: any) => String(s?.status || '').toUpperCase() === 'APPROVED').length}</div></div>
        </div>
      </div>

      {pendingShops.length > 0 && (
        <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-6">
          <h3 className="text-white font-black text-lg mb-4">{t('admin.shops.pendingApprovalsTitle', { count: pendingShops.length })}</h3>
          <div className="space-y-3">
            {pendingShops.slice(0, 6).map((shop: any) => (
              <div key={shop.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="flex items-center gap-4 flex-row-reverse">
                  <img src={shop.logoUrl || shop.logo_url || '/default-shop.png'} className="w-12 h-12 rounded-xl object-cover bg-slate-800" loading="lazy" decoding="async" fetchPriority="low" />
                  <div className="text-right">
                    <div className="text-white font-black">{shop.name}</div>
                    <div className="text-slate-500 text-xs font-bold">{shop.governorate} • {shop.city} • {shop.category}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => openShopDetails(shop)} className="px-4 py-2 bg-white/5 text-slate-200 rounded-xl font-black text-xs flex items-center gap-2"><Eye size={16} /> {t('admin.shops.details')}</button>
                  <button onClick={() => handleApprovalAction(shop.id, 'approved')} className="px-4 py-2 bg-green-500 text-white rounded-xl font-black text-xs flex items-center gap-2"><Check size={16} /> {t('admin.shops.approve')}</button>
                  <button onClick={() => handleApprovalAction(shop.id, 'rejected')} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl font-black text-xs flex items-center gap-2"><X size={16} /> {t('admin.shops.reject')}</button>
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
            <input type="text" placeholder={t('admin.shops.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30" />
          </div>
          <select value={shopStatusFilter} onChange={(e) => setShopStatusFilter(e.target.value as any)} className="px-4 py-3 bg-slate-800/50 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30">
            <option value="all">{t('admin.shops.allStatuses')}</option>
            <option value="APPROVED">{t('admin.shops.statusActive')}</option>
            <option value="PENDING">{t('admin.shops.statusPending')}</option>
            <option value="REJECTED">{t('admin.shops.statusRejected')}</option>
            <option value="SUSPENDED">{t('admin.shops.statusSuspended')}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1180px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.shop')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.owner')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.location')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.delivery')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.buttons')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.status')}</th>
                <th className="p-4 text-slate-400 font-black text-xs uppercase tracking-widest">{t('admin.shops.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop: any) => {
                const status = String(shop.status || '').toUpperCase();
                const isActive = Boolean(shop?.isActive ?? shop?.is_active ?? true);
                return (
                  <tr key={shop.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={shop.logoUrl || shop.logo_url || '/default-shop.png'} className="w-10 h-10 rounded-xl object-cover bg-slate-800" loading="lazy" decoding="async" fetchPriority="low" />
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
                    <td className="p-4 text-slate-300 font-bold text-sm">{shop.governorate || '-'}<div className="text-slate-500 text-xs mt-1">{shop.city || '-'}</div></td>
                    <td className="p-4 text-slate-300 font-bold text-sm">
                      <button onClick={() => editShopDeliveryFee(shop)} className="hover:text-[#00E5FF] transition-colors">{getShopDeliveryFee(shop) ?? 0} {t('admin.shops.egp')}</button>
                      <div className="text-slate-500 text-xs mt-1">{Boolean(shop?.deliveryDisabled ?? shop?.delivery_disabled) ? t('admin.shops.deliveryDisabled') : t('admin.shops.deliveryEnabled')}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-bold text-sm">{t('admin.shops.buttonsCount', { count: getEnabledModulesCount(shop) })}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-xl text-xs font-black ${status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : status === 'REJECTED' ? 'bg-red-500/20 text-red-400' : status === 'SUSPENDED' ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-amber-500/20 text-amber-400'}`}>{status === 'APPROVED' ? t('admin.shops.statusActive') : status === 'REJECTED' ? t('admin.shops.statusRejected') : status === 'SUSPENDED' ? t('admin.shops.statusAdminSuspended') : t('admin.shops.statusPending')}</span></td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openShopDetails(shop)} className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white" title={t('admin.shops.view')}><Eye className="w-4 h-4" /></button>
                        <button onClick={() => editShopDeliveryFee(shop)} className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white" title={t('admin.shops.editDeliveryFee')}><Edit className="w-4 h-4" /></button>
                        {status === 'PENDING' ? <button onClick={() => handleApprovalAction(shop.id, 'approved')} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300" title={t('admin.shops.approve')}><Check className="w-4 h-4" /></button> : null}
                        {isActive ? (
                          <button
                            disabled={actionId === String(shop?.id)}
                            onClick={() => toggleShopActive(shop, false)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-300"
                            title={t('admin.shops.disableFromApp')}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            disabled={actionId === String(shop?.id)}
                            onClick={() => toggleShopActive(shop, true)}
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300"
                            title={t('admin.shops.reactivate')}
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

        {filteredShops.length === 0 && <div className="text-center py-12 text-slate-500 font-bold">{searchTerm || shopStatusFilter !== 'all' ? t('admin.shops.noResults') : t('admin.shops.noShops')}</div>}
      </div>

      <Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} title={t('admin.shops.shopDetails')} size="xl">
        {detailsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
        ) : selected ? (
          <div className="space-y-5 text-right">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">{selected?.name || t('admin.shops.shop')}</h3>
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
                <div className="text-white font-black">{t('admin.shops.quickActions')}</div>
                <div className="mt-4 space-y-3">
                  <button onClick={() => window.open(`/shop/${selected?.slug || selected?.id}`, '_blank')} className="w-full px-4 py-3 rounded-2xl bg-white/5 text-slate-100 font-black text-sm flex items-center justify-center gap-2"><ExternalLink size={16} /> {t('admin.shops.openShopPage')}</button>
                  {selectedStatus === 'PENDING' ? <button disabled={actionId === String(selected?.id)} onClick={() => handleApprovalAction(String(selected?.id), 'approved')} className="w-full px-4 py-3 rounded-2xl bg-green-500 text-white font-black text-sm flex items-center justify-center gap-2"><Check size={16} /> {t('admin.shops.acceptShop')}</button> : null}
                  {selectedStatus === 'PENDING' ? <button disabled={actionId === String(selected?.id)} onClick={() => handleApprovalAction(String(selected?.id), 'rejected')} className="w-full px-4 py-3 rounded-2xl bg-red-500/15 text-red-300 font-black text-sm flex items-center justify-center gap-2"><X size={16} /> {t('admin.shops.rejectRequest')}</button> : null}
                  {selectedStatus === 'APPROVED' ? <button disabled={actionId === String(selected?.id)} onClick={() => handleSuspendToggle(selected, 'suspended')} className="w-full px-4 py-3 rounded-2xl bg-fuchsia-500/15 text-fuchsia-300 font-black text-sm flex items-center justify-center gap-2"><Ban size={16} /> {t('admin.shops.suspendShop')}</button> : null}
                  {selectedStatus === 'SUSPENDED' ? <button disabled={actionId === String(selected?.id)} onClick={() => handleSuspendToggle(selected, 'approved')} className="w-full px-4 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2"><ShieldCheck size={16} /> {t('admin.shops.reactivate')}</button> : null}
                  {selectedIsActive ? (
                    <button
                      disabled={actionId === String(selected?.id)}
                      onClick={() => toggleShopActive(selected, false)}
                      className="w-full px-4 py-3 rounded-2xl bg-red-500/15 text-red-300 font-black text-sm flex items-center justify-center gap-2"
                    >
                      <Ban size={16} /> {t('admin.shops.disableFromApp')}
                    </button>
                  ) : (
                    <button
                      disabled={actionId === String(selected?.id)}
                      onClick={() => toggleShopActive(selected, true)}
                      className="w-full px-4 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={16} /> {t('admin.shops.reactivateShop')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                [t('admin.shops.summary.status'), selectedStatus || '-'],
                [t('admin.shops.summary.deliveryFee'), `${t('admin.shops.egp')} ${Number(getShopDeliveryFee(selected) || 0).toLocaleString()}`],
                [t('admin.shops.summary.buttonsCount'), enabledModules.length],
                [t('admin.shops.summary.createdAt'), fmtDate(selected?.createdAt)],
              ].map(([label, value]: any) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center"><div className="text-slate-500 text-[11px] font-black">{label}</div><div className="mt-2 text-white font-black">{value}</div></div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-white font-black flex items-center gap-2 justify-end"><LayoutGrid size={16} /> {t('admin.shops.visibilityAndServices')}</div>
                <div className="mt-4 space-y-3 text-sm font-bold text-slate-300">
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{t('admin.shops.publicVisibility')}</span><button disabled={actionId === String(selected?.id)} onClick={() => toggleFlag(selected, 'publicDisabled', !selectedPublicDisabled)} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedPublicDisabled ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}>{selectedPublicDisabled ? t('admin.shops.hiddenShow') : t('admin.shops.visibleHide')}</button></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{t('admin.shops.deliveryService')}</span><button disabled={actionId === String(selected?.id)} onClick={() => toggleFlag(selected, 'deliveryDisabled', !selectedDeliveryDisabled)} className={`px-4 py-2 rounded-xl text-xs font-black ${selectedDeliveryDisabled ? 'bg-amber-500/15 text-amber-300' : 'bg-sky-500/15 text-sky-300'}`}>{selectedDeliveryDisabled ? t('admin.shops.disabledEnable') : t('admin.shops.enabledDisable')}</button></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{t('admin.shops.dashboardMode')}</span><span>{String((selected?.layoutConfig as any)?.dashboardMode || '-')}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{t('admin.shops.shopOwner')}</span><span>{selected?.owner?.name || '-'}</span></div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="text-white font-black flex items-center gap-2 justify-end"><Truck size={16} /> {t('admin.shops.extraDetails')}</div>
                <div className="mt-4 space-y-3 text-sm font-bold text-slate-300">
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{t('admin.shops.displayAddress')}</span><span>{selected?.displayAddress || selected?.addressDetailed || '-'}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{t('admin.shops.whatsapp')}</span><span>{selected?.whatsapp || '-'}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{t('admin.shops.visitsCount')}</span><span>{Number(selected?.visitors || 0).toLocaleString()}</span></div>
                  <div className="flex items-center justify-between gap-3"><span className="text-slate-500">{t('admin.shops.lastUpdated')}</span><span>{fmtDate(selected?.updatedAt)}</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
              <div className="text-white font-black mb-4">{t('admin.shops.enabledModulesTitle')}</div>
              <div className="flex flex-wrap gap-2 justify-end">
                {enabledModules.length === 0 ? <span className="text-slate-500 font-bold">{t('admin.shops.noEnabledModulesYet')}</span> : enabledModules.map((moduleId: any) => <span key={String(moduleId)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-black">{String(moduleId)}</span>)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 font-bold text-center py-16">{t('admin.shops.noData')}</div>
        )}
      </Modal>
    </div>
  );
};

export default AdminShops;
