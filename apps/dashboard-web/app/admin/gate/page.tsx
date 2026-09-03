'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldAlert, Loader2, KeyRound, ArrowRight, Eye, EyeOff, Store, MapPin,
  Utensils, ShoppingBag, Layout, Type, Scissors, LayoutGrid, Armchair, Moon,
  DoorOpen, Package, Sparkles, Building2, Wrench, Map as MapIcon, MapPin as MapPinIcon,
  Ticket, ClipboardList, CalendarHeart, ShieldAlert as ShieldAlertIcon, FileText, Home,
  HelpCircle, ChevronDown, Calendar, Activity, Hotel, Car, Dumbbell, GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { DEV_ACTIVITY_GROUPS, DEV_BOOKING_ACTIVITIES, type DevActivityCategory } from '@/lib/devActivities';

const isProd = process.env.NODE_ENV === 'production';
const showDevLogins = !isProd;
const allowBootstrapUi = !isProd && String(process.env.NEXT_PUBLIC_SHOW_ADMIN_BOOTSTRAP_UI || '').toLowerCase() === 'true';

const DEV_ACTIVITY_GROUP_ICON_MAP: Record<string, React.ComponentType<any>> = {
  food_market: Utensils,
  fashion_home: Package,
  jewelry_luxury: Sparkles,
  real_estate: Building2,
  vehicles: MapPin,
  agriculture: MapPinIcon,
  services: Wrench,
  electronics_health: ShieldAlertIcon,
  bookings: CalendarHeart,
  factories: Building2,
  trade_companies: Store,
  tourism_travel: Ticket,
  livestock: ClipboardList,
  fisheries: CalendarHeart,
  energy: ShieldAlertIcon,
  professional_services: FileText,
  home_services: Home,
  other: HelpCircle,
};

const DEV_ACTIVITY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  restaurant: Utensils,
  grocery: ShoppingBag,
  fashion: Layout,
  homeTextiles: Type,
  fabricStore: Scissors,
  curtainsBlinds: LayoutGrid,
  sofasUpholstery: Armchair,
  mattressesBedding: Moon,
  furniture: DoorOpen,
  homeGoods: Package,
  goldJewelry: Sparkles,
  silverAccessories: Sparkles,
  watchesGifts: Sparkles,
  realEstate: Building2,
  lands: MapPin,
  contractors: Wrench,
  building_supplies: Package,
  carShowroom: MapPin,
  auto_services: Wrench,
  auto_parts: Package,
  agri_supplies: MapIcon,
  nurseries_landscaping: MapIcon,
  serviceCompanies: Building2,
  individualTechnicians: Wrench,
  workshops: Wrench,
  electronics: Layout,
  health: ShieldAlertIcon,
  bookings: CalendarHeart,
  factories: Building2,
  tradeCompanies: Store,
  tourismTravel: Ticket,
  livestock: ClipboardList,
  fisheries: CalendarHeart,
  energy: ShieldAlertIcon,
  professionalServices: FileText,
  homeServices: Home,
  other: HelpCircle,
};

const BOOKING_ACTIVITY_ICONS: Record<string, React.ComponentType<any>> = {
  clinic: Activity,
  salon_barber: Scissors,
  wellness_spa: Sparkles,
  chalets_resorts: Home,
  hotels_rooms: Hotel,
  restaurants_tables: Utensils,
  events_venues: Ticket,
  vehicle_rental: Car,
  sports_trainers: Dumbbell,
  education_courses: GraduationCap,
  maintenance_services: Wrench,
  general_appointments: Calendar,
};

const getDevActivityGroupIcon = (id: string) => DEV_ACTIVITY_GROUP_ICON_MAP[id] || Store;
const getDevActivityIcon = (id: string) => DEV_ACTIVITY_ICON_MAP[id] || Package;

export default function AdminGatePage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Dev menus
  const [isDevActivityMenuOpen, setIsDevActivityMenuOpen] = useState(false);
  const [isDevBookingMenuOpen, setIsDevBookingMenuOpen] = useState(false);
  const [expandedDevGroup, setExpandedDevGroup] = useState<string | null>(null);

  // Bootstrap
  const [bootstrapOpen, setBootstrapOpen] = useState(false);
  const [bootstrapToken, setBootstrapToken] = useState('');
  const [bootstrapEmail, setBootstrapEmail] = useState('admin@mnmknk.com');
  const [bootstrapPassword, setBootstrapPassword] = useState('');
  const [bootstrapName, setBootstrapName] = useState('Admin');
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [showBootstrapToken, setShowBootstrapToken] = useState(false);
  const [showBootstrapPassword, setShowBootstrapPassword] = useState(false);

  const devActivityGroups = useMemo(
    () => DEV_ACTIVITY_GROUPS.filter((g) => Array.isArray(g.activities) && g.activities.length > 0),
    [],
  );

  const goToAdminArea = (returnTo?: string) => {
    const target = returnTo && returnTo.startsWith('/admin') ? returnTo : '/admin/dashboard';
    router.replace(target);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      const user = data?.user || data?.data?.user || { id: data?.id, email: data?.email, name: data?.name, role: data?.role };
      const role = String(user?.role || data?.role || '').toLowerCase();
      if (role !== 'admin') throw new Error('الأدمن فقط يمكنه الدخول من هنا');
      const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '';
      goToAdminArea(returnTo);
    } catch (err: any) {
      console.error('[AdminGate] login error:', err);
      setError(err?.message || 'بيانات غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const persistDevSession = (data: any) => {
    const user = data?.user || data?.data?.user || { id: data?.id, email: data?.email, name: data?.name, role: data?.role };
    const rawToken = data?.access_token || data?.accessToken || data?.data?.token?.accessToken || data?.data?.token?.access_token || data?.data?.accessToken || data?.data?.access_token || data?.token || data?.session?.access_token;
    const token = typeof rawToken === 'string' ? rawToken : rawToken?.accessToken || rawToken?.access_token;
    if (user && user.id) {
      localStorage.setItem('ray_user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('ray_token', token);
        localStorage.setItem('token', token);
      }
    }
    return user;
  };

  const handleDevMerchantLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/dev-merchant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'فشل');
      persistDevSession(data);
      try { localStorage.removeItem('ray_dev_shop_category'); } catch {}
      await refreshUser();
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'فشل دخول المطور');
    } finally {
      setLoading(false);
    }
  };

  const handleDevMerchantLoginWithCategory = async (shopCategory?: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/dev-merchant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(shopCategory ? { shopCategory } : {}),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'فشل');
      persistDevSession(data);
      try {
        if (shopCategory) localStorage.setItem('ray_dev_shop_category', String(shopCategory).toUpperCase());
        else localStorage.removeItem('ray_dev_shop_category');
      } catch {}
      await refreshUser();
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'فشل دخول المطور');
    } finally {
      setLoading(false);
    }
  };

  const handleDevActivitySelect = useCallback((activityId: string, category: DevActivityCategory) => {
    setIsDevActivityMenuOpen(false);
    try {
      if (activityId) localStorage.setItem('ray_dev_activity_id', activityId);
      else localStorage.removeItem('ray_dev_activity_id');
    } catch {}
    handleDevMerchantLoginWithCategory(String(category || '').toUpperCase());
  }, [handleDevMerchantLoginWithCategory]);

  const handleDevBookingSelect = useCallback((activityType: string) => {
    setIsDevBookingMenuOpen(false);
    try {
      localStorage.setItem('ray_dev_booking_activity_type', activityType);
      localStorage.setItem('ray_dev_activity_id', activityType);
    } catch {}
    handleDevMerchantLoginWithCategory('SERVICE');
  }, [handleDevMerchantLoginWithCategory]);

  const handleDevCourierLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/dev-courier-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'فشل');
      persistDevSession(data);
      await refreshUser();
      router.replace('/courier/orders');
    } catch (err: any) {
      setError(err?.message || 'فشل دخول المندوب');
    } finally {
      setLoading(false);
    }
  };

  const handleDevPortalLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/portal/auth/dev-portal-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'فشل');
      if (data?.access_token) {
        localStorage.setItem('portal_token', data.access_token);
        localStorage.setItem('portal_owner', JSON.stringify(data.owner));
        window.open('/portal', '_blank');
      }
    } catch (err: any) {
      setError(err?.message || 'فشل دخول البورتال');
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setBootstrapLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/bootstrap-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token: bootstrapToken,
          email: bootstrapEmail,
          password: bootstrapPassword,
          name: bootstrapName,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'فشل البوتستراب');
      setEmail(bootstrapEmail);
      setPassword(bootstrapPassword);
      setBootstrapOpen(false);
      setError('تم إنشاء الأدمن بنجاح، يمكنك الدخول الآن');
    } catch (err: any) {
      setError(err?.message || 'فشل البوتستراب');
    } finally {
      setBootstrapLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-right" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900 border border-white/5 p-12 rounded-[4rem] shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#BD00FF] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(189,0,255,0.4)]">
            <ShieldAlert size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">بوابة الأدمن</h1>
          <p className="text-slate-500 font-bold mt-2">دخول مخصص للمسؤولين فقط</p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-8 text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">اسم المستخدم</label>
            <input
              required
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              className="w-full bg-slate-800 border-none rounded-2xl py-5 px-8 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">كلمة المرور</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-800 border-none rounded-2xl py-5 px-8 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            disabled={loading}
            className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-xl hover:bg-[#BD00FF] hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <KeyRound />}
            دخول الأدمن
          </button>

          {showDevLogins && (
            <>
              {/* Dev merchant login with activity menu */}
              <div className="relative">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsDevActivityMenuOpen((v) => !v)}
                  className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                >
                  <Store size={18} />
                  دخول مطور (تاجر)
                </button>

                {isDevActivityMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDevActivityMenuOpen(false)} />
                    <div className="absolute z-50 left-0 right-0 mt-3 bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl max-h-[70vh]">
                      <div className="px-6 pt-3 pb-2 sticky top-0 bg-slate-900">
                        <div className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.25em]">أنشطة المتجر</div>
                        <p className="text-[9px] font-bold text-slate-500 mt-1">اختر نشاط المتجر للدخول كتاجر</p>
                      </div>
                      <div className="overflow-y-auto">
                        {devActivityGroups.map((group) => {
                          const GroupIcon = getDevActivityGroupIcon(group.id);
                          const isExpanded = expandedDevGroup === group.id;
                          return (
                            <div key={group.id}>
                              <button
                                type="button"
                                disabled={loading}
                                onClick={() => setExpandedDevGroup(isExpanded ? null : group.id)}
                                className="w-full py-3 px-6 text-right flex items-center gap-3 border-b border-white/5 hover:bg-slate-800/60 transition-all"
                              >
                                <GroupIcon className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="text-xs font-black text-white flex-1">{group.title}</span>
                                <span className="text-[9px] font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded-md">{group.activities.length}</span>
                                <ChevronDown size={12} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              {isExpanded && (
                                <div className="bg-slate-900/80">
                                  {group.activities.map((activity) => {
                                    const IconComp = getDevActivityIcon(activity.id);
                                    return (
                                      <button
                                        key={activity.id}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleDevActivitySelect(activity.id, activity.category)}
                                        className="w-full py-2.5 pr-8 pl-6 text-right flex items-center gap-3 border-b border-white/5 hover:bg-slate-800 transition-all"
                                      >
                                        <IconComp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <span className="text-[11px] font-bold text-slate-100">{activity.title}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => { setIsDevActivityMenuOpen(false); handleDevMerchantLogin(); }}
                          className="w-full py-3 px-6 text-right flex items-center gap-3 hover:bg-slate-800 transition-all border-t border-white/10"
                        >
                          <Store className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-xs font-black text-white">تاجر افتراضي (بدون نشاط محدد)</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dev booking login menu */}
              <div className="relative">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsDevBookingMenuOpen((v) => !v)}
                  className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                >
                  <Calendar size={18} />
                  دخول مطور حجوزات
                </button>

                {isDevBookingMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDevBookingMenuOpen(false)} />
                    <div className="absolute z-50 left-0 right-0 mt-3 bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl max-h-[70vh]">
                      <div className="px-6 pt-3 pb-2 sticky top-0 bg-slate-900">
                        <div className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.25em]">أنشطة الحجوزات</div>
                        <p className="text-[9px] font-bold text-slate-500 mt-1">اختر نشاط الحجز للدخول كتاجر</p>
                      </div>
                      <div className="overflow-y-auto">
                        {DEV_BOOKING_ACTIVITIES.map((activity) => {
                          const IconComp = BOOKING_ACTIVITY_ICONS[activity.id] || Calendar;
                          return (
                            <button
                              key={activity.id}
                              type="button"
                              disabled={loading}
                              onClick={() => handleDevBookingSelect(activity.id)}
                              className="w-full py-3 px-6 text-right flex items-center gap-3 border-b border-white/5 hover:bg-slate-800 transition-all"
                            >
                              <IconComp className="w-4 h-4 text-slate-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-black text-white block">{activity.title}</span>
                                <span className="text-[9px] font-bold text-slate-500 block truncate">{activity.description}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dev courier login */}
              <button
                type="button"
                disabled={loading}
                onClick={handleDevCourierLogin}
                className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
              >
                <MapPin size={18} />
                دخول مطور (مندوب)
              </button>

              {/* Dev portal login */}
              <button
                type="button"
                disabled={loading}
                onClick={handleDevPortalLogin}
                className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
              >
                <Store size={18} />
                دخول مطور بورتال (نشاط خارجي)
              </button>
            </>
          )}

          {allowBootstrapUi && (
            <>
              <button
                type="button"
                onClick={() => setBootstrapOpen((v) => !v)}
                className="w-full py-4 bg-slate-800 text-white/80 rounded-[2rem] font-black text-sm hover:text-white hover:bg-slate-700 transition-all"
              >
                تهيئة أدمن جديد (Bootstrap)
              </button>

              {bootstrapOpen && (
                <div className="p-6 bg-slate-950/40 border border-white/5 rounded-[2.5rem] space-y-4">
                  <div className="text-[11px] font-black text-slate-400">
                    استخدم توكن البوتستراب لإنشاء حساب أدمن جديد. هذا الخيار متاح فقط في بيئة التطوير.
                  </div>
                  <form onSubmit={handleBootstrap} className="space-y-4">
                    <div className="relative">
                      <input
                        required
                        type={showBootstrapToken ? 'text' : 'password'}
                        value={bootstrapToken}
                        onChange={(e) => setBootstrapToken(e.target.value)}
                        placeholder="ADMIN_BOOTSTRAP_TOKEN"
                        className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBootstrapToken(!showBootstrapToken)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showBootstrapToken ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <input
                      required
                      type="email"
                      value={bootstrapEmail}
                      onChange={(e) => setBootstrapEmail(e.target.value)}
                      placeholder="admin@mnmknk.com"
                      className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                    />
                    <div className="relative">
                      <input
                        required
                        type={showBootstrapPassword ? 'text' : 'password'}
                        value={bootstrapPassword}
                        onChange={(e) => setBootstrapPassword(e.target.value)}
                        placeholder="كلمة مرور الأدمن"
                        className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBootstrapPassword(!showBootstrapPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showBootstrapPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={bootstrapName}
                      onChange={(e) => setBootstrapName(e.target.value)}
                      placeholder="اسم الأدمن"
                      className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#BD00FF]/50 transition-all"
                    />
                    <button
                      disabled={bootstrapLoading}
                      className="w-full py-4 bg-[#BD00FF] text-white rounded-[2rem] font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                      {bootstrapLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldAlert size={18} />}
                      تنفيذ التهيئة
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full py-4 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 hover:text-white transition-colors"
          >
            <ArrowRight size={16} /> العودة لتسجيل الدخول
          </button>
        </form>
      </motion.div>
    </div>
  );
}
