'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2, Store, Phone, MessageCircle, Lock, Unlock, RefreshCw, Search,
  Sparkles, CheckCircle2,
} from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useToast } from '@/components/settings/ToastProvider';

const MotionDiv = motion.div as any;

// Newest merchants first — the ops team calls them right after they sign up
// (self-serve onboarding) to welcome them and check they're real businesses.
export default function AdminNewShopsPage() {
  const { toast } = useToast();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState('');
  const [daysFilter, setDaysFilter] = useState<'3' | '7' | '30' | 'all'>('3');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiRequest('/shops/admin?status=all&take=200');
      const list = Array.isArray(data) ? data : (data?.items || []);
      setShops(list);
    } catch (err: any) {
      console.error('Failed to load shops:', err);
      if (!silent) toast({ title: `فشل تحميل المتاجر: ${err?.message || 'خطأ غير معروف'}`, variant: 'destructive' });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const toggleLock = async (shop: any) => {
    const current = String(shop?.status || '').toUpperCase();
    const next = current === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    setActionId(String(shop?.id || ''));
    try {
      await apiRequest(`/shops/${shop?.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      toast({
        title: next === 'SUSPENDED' ? `تم قفل "${shop?.name}" — التاجر مش هيقدر يدخل` : `تم فتح "${shop?.name}" ورجوع تفعيله`,
        variant: 'success',
      });
      await load(true);
    } catch (err: any) {
      toast({ title: `فشل تنفيذ العملية: ${err?.message || 'خطأ'}`, variant: 'destructive' });
    } finally {
      setActionId('');
    }
  };

  const filtered = shops
    .filter((s) => {
      const createdAt = s?.createdAt ? new Date(String(s.createdAt)) : null;
      if (daysFilter !== 'all' && createdAt) {
        const days = (Date.now() - createdAt.getTime()) / 86400000;
        if (days > Number(daysFilter)) return false;
      }
      if (!search) return true;
      const q = search.trim().toLowerCase();
      return (
        String(s?.name || '').toLowerCase().includes(q) ||
        String(s?.phone || '').includes(q) ||
        String(s?.owner_email || s?.ownerEmail || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(String(b?.createdAt || 0)).getTime() - new Date(String(a?.createdAt || 0)).getTime());

  const ownerPhone = (s: any) => {
    const raw = String(s?.phone || s?.owner_phone || s?.ownerPhone || '');
    const digits = raw.replace(/[^\d+]/g, '');
    if (!digits) return '';
    if (digits.startsWith('+')) return digits;
    if (digits.startsWith('20')) return `+${digits}`;
    if (digits.startsWith('0')) return `+2${digits}`;
    return digits;
  };

  const formatPhone = (p: string) => {
    const m = p.match(/^\+20(1[0125])(\d{4})(\d{4})$/);
    if (m) return `+20 ${m[1]} ${m[2]} ${m[3]}`;
    return p;
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'الآن';
    if (hours < 24) return `من ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `من ${days} يوم`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-black text-white">المتاجر الجديدة</h2>
          <p className="text-slate-500 text-sm font-bold">التجار الجدد اللي سجلوا نفسهم — كلّمهم عشان ترحب وتتأكد إن النشاط حقيقي، واقفل أي حد في أي وقت</p>
        </div>
        <button onClick={() => load()} className="p-3 bg-slate-900 border border-white/10 text-slate-300 rounded-2xl hover:text-white transition-colors">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الرقم أو الإيميل..."
            className="w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-600 font-bold outline-none focus:border-[#00E5FF]/50 text-sm"
          />
        </div>
        {(['3', '7', '30', 'all'] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDaysFilter(d)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all ${
              daysFilter === d ? 'bg-[#00E5FF] text-black' : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {d === 'all' ? 'الكل' : `آخر ${d} يوم`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#00E5FF]" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-12 text-center">
          <Store className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-500 font-bold">مفيش متاجر جديدة في الفترة المحددة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((shop, idx) => {
            const status = String(shop?.status || '').toUpperCase();
            const locked = status === 'SUSPENDED';
            const phone = ownerPhone(shop);
            const busy = actionId === String(shop?.id || '');
            return (
              <MotionDiv
                key={shop?.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                className={`bg-slate-900 border p-5 rounded-[2rem] ${locked ? 'border-red-500/30' : 'border-white/5'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${locked ? 'bg-red-500/10' : 'bg-[#00E5FF]/10'}`}>
                      {locked ? <Lock size={22} className="text-red-400" /> : <Store size={22} className="text-[#00E5FF]" />}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white flex items-center gap-2">
                        {shop?.name || 'متجر'}
                        {status === 'APPROVED' && <CheckCircle2 size={15} className="text-emerald-400" />}
                      </h4>
                      <div className="text-slate-500 text-[11px] font-bold mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{shop?.category || '—'}</span>
                        {shop?.createdAt && <span>· {timeAgo(String(shop.createdAt))}</span>}
                        {locked && <span className="text-red-400">· مقفول</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleLock(shop)}
                    disabled={busy}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all disabled:opacity-50 ${
                      locked
                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    {busy ? <Loader2 size={15} className="animate-spin" /> : locked ? <><Unlock size={15} /> فتح</> : <><Lock size={15} /> قفل</>}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-950/50 rounded-2xl px-4 py-3 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-[#00E5FF]" />
                    <span dir="ltr" className="text-white font-black text-sm tracking-wide">
                      {phone ? formatPhone(phone) : 'مفيش رقم'}
                    </span>
                  </div>
                  {phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${phone}`}
                        className="px-3 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-[11px] font-black flex items-center gap-1.5"
                      >
                        <Phone size={13} /> اتصال
                      </a>
                      <a
                        href={`https://wa.me/${phone.replace('+', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors text-[11px] font-black flex items-center gap-1.5"
                      >
                        <MessageCircle size={13} /> واتساب
                      </a>
                    </div>
                  )}
                </div>

                {shop?.owner_email || shop?.ownerEmail ? (
                  <div className="text-[11px] font-bold text-slate-500 mt-2.5" dir="ltr">
                    {String(shop.owner_email || shop.ownerEmail)}
                  </div>
                ) : null}
              </MotionDiv>
            );
          })}
        </div>
      )}
    </div>
  );
}
