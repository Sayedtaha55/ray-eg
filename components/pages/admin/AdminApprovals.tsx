import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Loader2, Store, MapPin, ShieldAlert, Truck } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { BackendRequestError } from '@/services/api/httpClient';
import { useSmartRefreshListener } from '@/hooks/useSmartRefresh';
import { useTranslation } from 'react-i18next';

const MotionDiv = motion.div as any;

const { Link } = ReactRouterDOM as any;

const AdminApprovals: React.FC = () => {
  const { t } = useTranslation();
  const [shops, setShops] = useState<any[]>([]);
  const [moduleRequests, setModuleRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);
  const { addToast } = useToast();

  const loadShops = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [data] = await Promise.all([
        ApiService.getPendingShops(),
      ]);
      setShops(data);
    } catch {
      if (!silent) addToast(t('admin.approvals.loadFailed'), 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadModuleRequests = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setModuleLoading(true);
    try {
      const res = await (ApiService as any).adminListModuleUpgradeRequests?.({ status: 'PENDING', take: 100 });
      setModuleRequests(Array.isArray(res) ? res : []);
    } catch (e) {
      if (!silent) {
        const status = e instanceof BackendRequestError ? e.status : undefined;
        if (status === 401 || status === 403) {
          addToast(t('admin.approvals.noPermissionModuleRequests'), 'error');
        } else {
          addToast(t('admin.approvals.loadModuleRequestsFailed'), 'error');
        }
      }
    } finally {
      if (!silent) setModuleLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
    loadModuleRequests();
  }, []);

  // Smart event-driven refresh
  useSmartRefreshListener(['shop', 'all'], () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    loadShops({ silent: true });
    loadModuleRequests({ silent: true });
  });

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await ApiService.updateShopStatus(id, action);
      addToast(action === 'approved' ? t('admin.approvals.shopApproved') : t('admin.approvals.requestRejected'), 'success');
      loadShops();
    } catch (e) {
      addToast(t('admin.approvals.actionError'), 'error');
    }
  };

  const handleModuleRequestApprove = async (id: string) => {
    try {
      await (ApiService as any).adminApproveModuleUpgradeRequest?.(id);
      addToast(t('admin.approvals.moduleApproved'), 'success');
      loadModuleRequests();
    } catch {
      addToast(t('admin.approvals.moduleApproveError'), 'error');
    }
  };

  const handleModuleRequestReject = async (id: string) => {
    const note = prompt(t('admin.approvals.rejectReasonPrompt')) || '';
    try {
      await (ApiService as any).adminRejectModuleUpgradeRequest?.(id, { note: note || null });
      addToast(t('admin.approvals.moduleRejected'), 'success');
      loadModuleRequests();
    } catch {
      addToast(t('admin.approvals.moduleRejectError'), 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">{t('admin.approvals.title')}</h2>
          <p className="text-slate-500 text-sm font-bold">{t('admin.approvals.subtitle')}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
      ) : (
        <div className="space-y-10">
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">{t('admin.approvals.moduleRequestsTitle')}</h3>
            {moduleLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : moduleRequests.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">{t('admin.approvals.noModuleRequests')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {moduleRequests.map((r: any) => {
                  const shopName = r?.shop?.name || '';
                  const shopSlug = r?.shop?.slug || '';
                  const modules = Array.isArray(r?.requestedModules) ? r.requestedModules : [];
                  const createdAt = r?.createdAt ? String(r.createdAt) : '';
                  return (
                    <MotionDiv
                      key={r.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                      <div className="text-right flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xl font-black text-white">{shopName || t('admin.approvals.shop')}</h4>
                            <div className="text-slate-500 text-xs font-bold mt-1">{shopSlug ? `/${shopSlug}` : ''}</div>
                          </div>
                          <div className="text-slate-500 text-xs font-bold">{createdAt ? new Date(createdAt).toLocaleString() : ''}</div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                          {(modules || []).map((m: any) => (
                            <span key={String(m)} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-black">
                              {String(m)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleModuleRequestApprove(String(r.id))}
                          className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
                        >
                          <Check size={18} /> {t('admin.approvals.approve')}
                        </button>
                        <button
                          onClick={() => handleModuleRequestReject(String(r.id))}
                          className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"
                        >
                          <X size={18} /> {t('admin.approvals.reject')}
                        </button>
                      </div>
                    </MotionDiv>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">{t('admin.approvals.merchantRequestsTitle')}</h3>
            {shops.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">{t('admin.approvals.noMerchantRequests')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {shops.map((shop) => (
                  <MotionDiv
                    key={shop.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6 flex-row-reverse">
                      <img src={shop.logo_url} className="w-20 h-20 rounded-2xl object-cover bg-slate-800" loading="lazy" decoding="async" fetchPriority="low" />
                      <div className="text-right">
                        <h4 className="text-xl font-black text-white">{shop.name}</h4>
                        <div className="flex items-center gap-4 text-slate-500 text-xs font-bold mt-1">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {shop.governorate}</span>
                          <span className="flex items-center gap-1"><Store size={12} /> {shop.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(shop.id, 'approved')}
                        className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
                      >
                        <Check size={18} /> {t('admin.approvals.acceptMerchant')}
                      </button>
                      <button
                        onClick={() => handleAction(shop.id, 'rejected')}
                        className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"
                      >
                        <X size={18} /> {t('admin.approvals.rejectRequest')}
                      </button>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">{t('admin.approvals.courierRequestsTitle')}</h3>
            <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
              <div className="flex items-center justify-center gap-3 flex-row-reverse text-slate-300 font-black">
                <Truck size={18} className="text-[#00E5FF]" />
                {t('admin.approvals.courierRequestsMoved')}
              </div>
              <Link
                to="/admin/delivery?tab=pending"
                className="inline-flex items-center gap-2 px-6 py-3 mt-6 rounded-2xl bg-[#00E5FF] text-black font-black text-sm"
              >
                {t('admin.approvals.openDeliveryMgmt')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
