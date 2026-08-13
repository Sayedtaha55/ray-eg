'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check, X, Loader2, Store, MapPin, ShieldAlert, Truck, Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/lib/auth';
import { useToast } from '@/components/settings/ToastProvider';

const MotionDiv = motion.div as any;

const MODULE_LABELS: Record<string, string> = {
  gallery: 'معرض الصور',
  reservations: 'الحجوزات',
  invoice: 'فاتورة',
  pos: 'الكاشير',
  sales: 'الطلبات / المبيعات',
  customers: 'العملاء',
  reports: 'التقارير',
  abandonedCart: 'السلة المتروكة',
};

export default function AdminApprovalsPage() {
  const { toast } = useToast();
  const [shops, setShops] = useState<any[]>([]);
  const [moduleRequests, setModuleRequests] = useState<any[]>([]);
  const [mapListings, setMapListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [mapListingLoading, setMapListingLoading] = useState(false);

  const loadShops = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiRequest('/shops/pending');
      setShops(Array.isArray(data) ? data : []);
    } catch {
      if (!silent) toast({ title: 'فشل تحميل طلبات المتاجر', variant: 'destructive' });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const loadModuleRequests = async (silent = false) => {
    if (!silent) setModuleLoading(true);
    try {
      const res = await apiRequest('/admin/module-requests?status=PENDING&take=100');
      setModuleRequests(Array.isArray(res) ? res : []);
    } catch {
      if (!silent) toast({ title: 'فشل تحميل طلبات الأزرار', variant: 'destructive' });
    } finally {
      if (!silent) setModuleLoading(false);
    }
  };

  const loadMapListings = async (silent = false) => {
    if (!silent) setMapListingLoading(true);
    try {
      const res = await apiRequest('/map-listings/pending?limit=100');
      setMapListings(Array.isArray(res?.items) ? res.items : []);
    } catch {
      if (!silent) toast({ title: 'فشل تحميل طلبات الخريطة', variant: 'destructive' });
    } finally {
      if (!silent) setMapListingLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
    loadModuleRequests();
    loadMapListings();
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      await apiRequest(`/shops/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: action }),
      });
      toast({
        title: action === 'approved' ? 'تم قبول المتجر' : 'تم رفض الطلب',
        variant: 'success',
      });
      loadShops();
    } catch {
      toast({ title: 'فشل تنفيذ العملية', variant: 'destructive' });
    }
  };

  const handleModuleApprove = async (id: string) => {
    try {
      await apiRequest(`/admin/module-requests/${id}/approve`, { method: 'POST' });
      toast({ title: 'تم قبول الطلب', variant: 'success' });
      loadModuleRequests();
    } catch {
      toast({ title: 'فشل قبول الطلب', variant: 'destructive' });
    }
  };

  const handleModuleReject = async (id: string) => {
    const note = prompt('سبب الرفض:') || '';
    try {
      await apiRequest(`/admin/module-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note: note || null }),
      });
      toast({ title: 'تم رفض الطلب', variant: 'success' });
      loadModuleRequests();
    } catch {
      toast({ title: 'فشل رفض الطلب', variant: 'destructive' });
    }
  };

  const handleMapListingApprove = async (id: string) => {
    try {
      await apiRequest(`/map-listings/${id}/approve`, { method: 'POST' });
      toast({ title: 'تم قبول الموقع', variant: 'success' });
      loadMapListings();
    } catch {
      toast({ title: 'فشل تنفيذ العملية', variant: 'destructive' });
    }
  };

  const handleMapListingReject = async (id: string) => {
    const note = prompt('سبب الرفض:') || '';
    try {
      await apiRequest(`/map-listings/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
      toast({ title: 'تم رفض الموقع', variant: 'success' });
      loadMapListings();
    } catch {
      toast({ title: 'فشل تنفيذ العملية', variant: 'destructive' });
    }
  };

  const getModuleLabel = (id: string) => MODULE_LABELS[id] || id;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">الموافقات</h2>
          <p className="text-slate-500 text-sm font-bold">مراجعة واعتماد طلبات الانضمام والميزات</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
      ) : (
        <div className="space-y-10">
          {/* Module Upgrade Requests */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">طلبات تفعيل الأزرار</h3>
            {moduleLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : moduleRequests.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">لا توجد طلبات معلقة</p>
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
                            <h4 className="text-xl font-black text-white">{shopName || 'متجر'}</h4>
                            <div className="text-slate-500 text-xs font-bold mt-1">{shopSlug ? `/${shopSlug}` : ''}</div>
                          </div>
                          <div className="text-slate-500 text-xs font-bold">
                            {createdAt ? new Date(createdAt).toLocaleString('ar-EG') : ''}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                          {modules.map((m: any) => (
                            <span key={String(m)} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-black">
                              {getModuleLabel(String(m))}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleModuleApprove(String(r.id))}
                          className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
                        >
                          <Check size={18} /> قبول
                        </button>
                        <button
                          onClick={() => handleModuleReject(String(r.id))}
                          className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"
                        >
                          <X size={18} /> رفض
                        </button>
                      </div>
                    </MotionDiv>
                  );
                })}
              </div>
            )}
          </div>

          {/* Merchant Requests */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">طلبات الانضمام كتاجر</h3>
            {shops.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">لا توجد طلبات معلقة</p>
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
                      <img
                        src={shop.logoUrl || shop.logo_url || '/default-shop.png'}
                        className="w-20 h-20 rounded-2xl object-cover bg-slate-800"
                        loading="lazy"
                      />
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
                        <Check size={18} /> قبول
                      </button>
                      <button
                        onClick={() => handleAction(shop.id, 'rejected')}
                        className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"
                      >
                        <X size={18} /> رفض
                      </button>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            )}
          </div>

          {/* Map Listings */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">طلبات إضافة مواقع على الخريطة</h3>
            {mapListingLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
            ) : mapListings.length === 0 ? (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
                <p className="text-slate-500 font-bold">لا توجد طلبات معلقة</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {mapListings.map((ml: any) => {
                  const branches = Array.isArray(ml?.branches) ? ml.branches : [];
                  const primaryBranch = branches.find((b: any) => b.isPrimary) || branches[0];
                  return (
                    <MotionDiv
                      key={ml.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-900 border border-white/5 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-6 flex-row-reverse">
                        {ml.logoUrl ? (
                          <img src={ml.logoUrl} className="w-16 h-16 rounded-2xl object-cover bg-slate-800" loading="lazy" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                            <MapPin className="text-amber-400" size={24} />
                          </div>
                        )}
                        <div className="text-right">
                          <h4 className="text-xl font-black text-white">{ml.title}</h4>
                          <div className="flex items-center gap-4 text-slate-500 text-xs font-bold mt-1">
                            {ml.category && <span>{ml.category}</span>}
                            {primaryBranch?.governorate && (
                              <span className="flex items-center gap-1"><MapPin size={12} /> {primaryBranch.governorate}</span>
                            )}
                            {ml.phone && <span>{ml.phone}</span>}
                          </div>
                          {primaryBranch?.addressLabel && (
                            <p className="text-slate-600 text-xs font-bold mt-1">{primaryBranch.addressLabel}</p>
                          )}
                          {ml.websiteUrl && (
                            <a href={ml.websiteUrl} target="_blank" rel="noopener" className="text-[#00E5FF] text-xs font-bold mt-1 block">
                              {ml.websiteUrl}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleMapListingApprove(String(ml.id))}
                          className="px-8 py-4 bg-green-500 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-green-600 transition-all"
                        >
                          <Check size={18} /> قبول
                        </button>
                        <button
                          onClick={() => handleMapListingReject(String(ml.id))}
                          className="px-8 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"
                        >
                          <X size={18} /> رفض
                        </button>
                      </div>
                    </MotionDiv>
                  );
                })}
              </div>
            )}
          </div>

          {/* Courier Requests Link */}
          <div className="space-y-4">
            <h3 className="text-white font-black text-lg">طلبات المندوبين</h3>
            <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
              <div className="flex items-center justify-center gap-3 flex-row-reverse text-slate-300 font-black">
                <Truck size={18} className="text-[#00E5FF]" />
                تم نقل طلبات المندوبين إلى صفحة إدارة التوصيل
              </div>
              <Link
                href="/admin/delivery?tab=pending"
                className="inline-flex items-center gap-2 px-6 py-3 mt-6 rounded-2xl bg-[#00E5FF] text-black font-black text-sm"
              >
                <LinkIcon size={16} /> فتح إدارة التوصيل
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
