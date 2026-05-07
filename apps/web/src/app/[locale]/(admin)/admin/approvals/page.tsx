'use client';

import { useState, useEffect } from 'react';
import { Check, X, Loader2, Store, MapPin, ShieldAlert, Truck } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import {
  adminGetPendingShops, adminUpdateShopStatus,
  adminGetPendingMapListings, adminApproveMapListing, adminRejectMapListing,
  adminListModuleUpgradeRequests, adminApproveModuleUpgradeRequest, adminRejectModuleUpgradeRequest,
} from '@/lib/api/admin';

export default function AdminApprovalsPage() {
  const t = useT();
  const { locale, dir } = useLocale();
  const [shops, setShops] = useState<any[]>([]);
  const [moduleRequests, setModuleRequests] = useState<any[]>([]);
  const [mapListings, setMapListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);

  const loadShops = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await adminGetPendingShops();
      setShops(Array.isArray(data) ? data : []);
    } catch {
      if (!silent) setShops([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadModuleRequests = async (silent = false) => {
    if (!silent) setModuleLoading(true);
    try {
      const res = await adminListModuleUpgradeRequests({ status: 'PENDING', take: 100 });
      setModuleRequests(Array.isArray(res) ? res : []);
    } catch {
      if (!silent) setModuleRequests([]);
    } finally {
      if (!silent) setModuleLoading(false);
    }
  };

  const loadMapListings = async (silent = false) => {
    if (!silent) setMapLoading(true);
    try {
      const res = await adminGetPendingMapListings(100);
      setMapListings(Array.isArray(res?.items) ? res.items : []);
    } catch {
      if (!silent) setMapListings([]);
    } finally {
      if (!silent) setMapLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
    loadModuleRequests();
    loadMapListings();
  }, []);

  const handleShopAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await adminUpdateShopStatus(id, action);
      loadShops();
    } catch {
      // error
    }
  };

  const handleModuleApprove = async (id: string) => {
    try {
      await adminApproveModuleUpgradeRequest(id);
      loadModuleRequests();
    } catch {
      // error
    }
  };

  const handleModuleReject = async (id: string) => {
    const note = prompt(t('admin.approvals.rejectReasonPrompt', 'سبب الرفض:')) || '';
    try {
      await adminRejectModuleUpgradeRequest(id, { note: note || null });
      loadModuleRequests();
    } catch {
      // error
    }
  };

  const handleMapApprove = async (id: string) => {
    try {
      await adminApproveMapListing(id);
      loadMapListings();
    } catch {
      // error
    }
  };

  const handleMapReject = async (id: string) => {
    const note = prompt(t('admin.approvals.rejectReasonPrompt', 'سبب الرفض:')) || '';
    try {
      await adminRejectMapListing(id, note);
      loadMapListings();
    } catch {
      // error
    }
  };

  return (
    <div className="space-y-8" dir={dir}>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">{t('admin.approvals.title', 'الموافقات')}</h2>
          <p className="text-slate-500 text-sm font-bold">{t('admin.approvals.subtitle', 'مراجعة الطلبات المعلّقة')}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
      ) : (
        <div className="space-y-10">
          {/* Module Upgrade Requests */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">{t('admin.approvals.moduleRequestsTitle', 'طلبات ترقية الأزرار')}</h3>
            {moduleLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : moduleRequests.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">{t('admin.approvals.noModuleRequests', 'لا توجد طلبات ترقية')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {moduleRequests.map((r: any) => {
                  const shopName = r?.shop?.name || '';
                  const shopSlug = r?.shop?.slug || '';
                  const modules = Array.isArray(r?.requestedModules) ? r.requestedModules : [];
                  return (
                    <div key={r.id} className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-right flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xl font-black text-white">{shopName || t('admin.approvals.shop', 'متجر')}</h4>
                            <div className="text-slate-500 text-xs font-bold mt-1">{shopSlug ? `/${shopSlug}` : ''}</div>
                          </div>
                          <div className="text-slate-500 text-xs font-bold">
                            {r?.createdAt ? new Date(r.createdAt).toLocaleString('ar-EG') : ''}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                          {modules.map((m: any) => (
                            <span key={String(m)} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-black">
                              {String(m)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleModuleApprove(String(r.id))} className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all">
                          <Check size={18} /> {t('admin.approvals.approve', 'قبول')}
                        </button>
                        <button onClick={() => handleModuleReject(String(r.id))} className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all">
                          <X size={18} /> {t('admin.approvals.reject', 'رفض')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Merchant Requests */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">{t('admin.approvals.merchantRequestsTitle', 'طلبات الانضمام')}</h3>
            {shops.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">{t('admin.approvals.noMerchantRequests', 'لا توجد طلبات معلّقة')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {shops.map((shop) => (
                  <div key={shop.id} className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-row-reverse">
                      <img src={shop.logo_url || shop.logoUrl} className="w-20 h-20 rounded-2xl object-cover bg-slate-800" loading="lazy" alt="" />
                      <div className="text-right">
                        <h4 className="text-xl font-black text-white">{shop.name}</h4>
                        <div className="flex items-center gap-4 text-slate-500 text-xs font-bold mt-1">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {shop.governorate}</span>
                          <span className="flex items-center gap-1"><Store size={12} /> {shop.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleShopAction(shop.id, 'approved')} className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all">
                        <Check size={18} /> {t('admin.approvals.acceptMerchant', 'قبول النشاط')}
                      </button>
                      <button onClick={() => handleShopAction(shop.id, 'rejected')} className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all">
                        <X size={18} /> {t('admin.approvals.rejectRequest', 'رفض الطلب')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map Listings */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">{t('admin.approvals.mapListingsTitle', 'إدراجات الخريطة')}</h3>
            {mapLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : mapListings.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">{t('admin.approvals.noMapListings', 'لا توجد إدراجات معلّقة')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {mapListings.map((ml: any) => {
                  const branches = Array.isArray(ml?.branches) ? ml.branches : [];
                  const primaryBranch = branches.find((b: any) => b.isPrimary) || branches[0];
                  return (
                    <div key={ml.id} className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-row-reverse">
                        {ml.logoUrl ? (
                          <img src={ml.logoUrl} className="w-16 h-16 rounded-2xl object-cover bg-slate-800" loading="lazy" alt="" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <MapPin className="text-amber-400" size={24} />
                          </div>
                        )}
                        <div className="text-right">
                          <h4 className="text-xl font-black text-white">{ml.title}</h4>
                          <div className="flex items-center gap-4 text-slate-500 text-xs font-bold mt-1">
                            {ml.category && <span>{ml.category}</span>}
                            {primaryBranch?.governorate && <span className="flex items-center gap-1"><MapPin size={12} /> {primaryBranch.governorate}</span>}
                            {ml.phone && <span>{ml.phone}</span>}
                          </div>
                          {primaryBranch?.addressLabel && (
                            <p className="text-slate-600 text-xs font-bold mt-1">{primaryBranch.addressLabel}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleMapApprove(String(ml.id))} className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all">
                          <Check size={18} /> {t('admin.approvals.approve', 'قبول')}
                        </button>
                        <button onClick={() => handleMapReject(String(ml.id))} className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all">
                          <X size={18} /> {t('admin.approvals.reject', 'رفض')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Courier Requests Placeholder */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">{t('admin.approvals.courierRequestsTitle', 'طلبات المندوبين')}</h3>
            <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
              <div className="flex items-center justify-center gap-3 flex-row-reverse text-slate-300 font-black">
                <Truck size={18} className="text-[#00E5FF]" />
                {t('admin.approvals.courierRequestsMoved', 'طلبات المندوبين تُدار من صفحة التوصيل')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
