'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Settings as SettingsIcon, User, Shield, Store, CreditCard,
  Home, Bell, FileText, Image as ImageIcon, Loader2, ChevronDown,
  Puzzle, LayoutGrid, CheckCircle, Clock, AlertTriangle, Info,
  Lock, Eye, EyeOff, MapPin, Mail, Phone, Download, Trash2, Power, PowerOff,
} from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import * as merchantApi from '@/lib/api/merchant';
import { useToast } from '@/lib/hooks/useToast';

type SettingsTab = 'overview' | 'account' | 'security' | 'store' | 'modules' | 'apps' | 'receipt_theme' | 'payments' | 'notifications';

const SETTINGS_TAB_IDS: { id: SettingsTab; icon: React.ReactNode }[] = [
  { id: 'overview', icon: <Home className="w-5 h-5" /> },
  { id: 'account', icon: <User className="w-5 h-5" /> },
  { id: 'security', icon: <Shield className="w-5 h-5" /> },
  { id: 'store', icon: <Store className="w-5 h-5" /> },
  { id: 'modules', icon: <Puzzle className="w-5 h-5" /> },
  { id: 'apps', icon: <LayoutGrid className="w-5 h-5" /> },
  { id: 'receipt_theme', icon: <FileText className="w-5 h-5" /> },
  { id: 'payments', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'notifications', icon: <Bell className="w-5 h-5" /> },
];

type Props = { shop: any; onSaved?: () => void; settingsTab?: string; onSettingsTabChange?: (tab: string) => void };

/* ── Overview ──────────────────────────────────────── */
const Overview: React.FC<{ shop: any }> = ({ shop }) => {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const formatEGP = (v: unknown) => {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return t('overviewSettings.notAvailable', 'غير متاح');
    try { return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(n); }
    catch { return `EGP ${Math.round(n).toLocaleString(locale)}`; }
  };
  const status = String(shop?.status || '').toLowerCase();
  const isApproved = status === 'approved';
  const isPending = status === 'pending';
  const hasPaymentConfig = Boolean(String(shop?.paymentConfig?.merchantId || '').trim());
  const paidUntilRaw = shop?.paidUntil ?? shop?.paid_until;
  const paidUntilDate = paidUntilRaw ? new Date(paidUntilRaw) : null;
  const paidUntilText = paidUntilDate && !Number.isNaN(paidUntilDate.getTime()) ? paidUntilDate.toLocaleDateString(locale) : '';
  const nextDueAmount = shop?.nextDueAmount ?? shop?.next_due_amount;

  const stats = [
    { title: t('overviewSettings.accountStatus', 'حالة الحساب'), value: isApproved ? t('overviewSettings.active', 'نشط') : isPending ? t('overviewSettings.underReview', 'قيد المراجعة') : t('overviewSettings.unknown', 'غير معروف'), icon: isApproved ? CheckCircle : isPending ? Clock : Info, color: isApproved ? 'text-green-500' : isPending ? 'text-blue-500' : 'text-slate-400' },
    { title: t('overviewSettings.paymentStatus', 'حالة الدفع'), value: hasPaymentConfig ? t('overviewSettings.enabled', 'مفعل') : t('overviewSettings.notEnabled', 'غير مفعل'), icon: hasPaymentConfig ? CheckCircle : AlertTriangle, color: hasPaymentConfig ? 'text-green-500' : 'text-yellow-500' },
    { title: t('overviewSettings.upcomingDues', 'المستحقات القادمة'), value: formatEGP(nextDueAmount ?? 0), icon: Clock, color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black">{t('overviewSettings.dashboard', 'لوحة التحكم')}</h2><p className="text-slate-400 text-sm">{t('overviewSettings.dashboardDesc', 'نظرة عامة على إعدادات حسابك')}</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3"><span className="text-sm font-black text-slate-500">{s.title}</span><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div className="text-xl font-black text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Account ───────────────────────────────────────── */
const Account: React.FC<{ shop: any; onSaved?: () => void }> = ({ shop, onSaved }) => {
  const t = useT();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState({
    name: shop?.name || '', governorate: shop?.governorate || '', city: shop?.city || '',
    email: shop?.email || '', phone: shop?.phone || '',
    address: shop?.addressDetailed || shop?.address_detailed || '', description: shop?.description || '',
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };
  const saveAccount = async () => {
    setSaving(true);
    try {
      await merchantApi.merchantUpdateMyShop({ name: form.name, governorate: form.governorate, city: form.city, email: form.email, phone: form.phone, addressDetailed: form.address, description: form.description });
      addToast(t('accountSettings.saved', 'تم الحفظ'), t('accountSettings.accountUpdated', 'تم تحديث بيانات الحساب'), 'success');
      onSaved?.();
    } catch { addToast(t('accountSettings.error', 'خطأ'), t('accountSettings.saveChangesFailed', 'فشل حفظ التغييرات'), 'destructive'); }
    finally { setSaving(false); }
  };
  const deactivateAccount = async () => {
    if (isDeleting) return;
    const expected = t('accountSettings.deleteKeyword', 'حذف');
    if (String(deleteConfirmText || '').trim() !== expected) {
      addToast(t('accountSettings.confirmRequired', 'تأكيد مطلوب'), t('accountSettings.typeKeywordToConfirm', `اكتب "${expected}" للتأكيد`), 'destructive');
      return;
    }
    setIsDeleting(true);
    try {
      await merchantApi.merchantDeactivateAccount();
      addToast(t('accountSettings.accountDeleted', 'تم حذف الحساب'), '', 'success');
      window.location.href = '/login';
    } catch (e: any) {
      addToast(t('accountSettings.error', 'خطأ'), e?.message || t('accountSettings.deleteAccountFailed', 'فشل حذف الحساب'), 'destructive');
    } finally { setIsDeleting(false); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black">{t('accountSettings.title', 'الحساب')}</h2><p className="text-slate-400 text-sm">{t('accountSettings.subtitle', 'بيانات الحساب الأساسية')}</p></div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-slate-700">{t('accountSettings.basicInfo', 'المعلومات الأساسية')}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('accountSettings.shopName', 'اسم المحل')}</label><div className="relative"><User className="absolute right-3 top-3 w-4 h-4 text-slate-300" /><input name="name" value={form.name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 font-bold text-slate-900 text-right" /></div></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('accountSettings.email', 'البريد')}</label><div className="relative"><Mail className="absolute right-3 top-3 w-4 h-4 text-slate-300" /><input name="email" type="email" value={form.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 font-bold text-slate-900 text-right" /></div></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('accountSettings.governorate', 'المحافظة')}</label><input name="governorate" value={form.governorate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('accountSettings.city', 'المدينة')}</label><input name="city" value={form.city} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('accountSettings.phone', 'الهاتف')}</label><div className="relative"><Phone className="absolute right-3 top-3 w-4 h-4 text-slate-300" /><input name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 font-bold text-slate-900 text-right" /></div></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('accountSettings.address', 'العنوان')}</label><div className="relative"><MapPin className="absolute right-3 top-3 w-4 h-4 text-slate-300" /><input name="address" value={form.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 font-bold text-slate-900 text-right" /></div></div>
        </div>
        <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('accountSettings.description', 'الوصف')}</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right resize-none" /></div>
        <button onClick={saveAccount} disabled={saving} className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black disabled:opacity-60 transition-all">{saving ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : t('common.save', 'حفظ')}</button>
      </div>
      <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-red-600">{t('accountSettings.deleteAccount', 'حذف الحساب')}</h3>
        <p className="text-sm text-slate-500">{t('accountSettings.deleteAccountDesc', 'سيتم تعطيل حسابك نهائياً')}</p>
        <input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} disabled={isDeleting} placeholder={t('accountSettings.typeDeleteToConfirm', `اكتب "${t('accountSettings.deleteKeyword', 'حذف')}" للتأكيد`)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" />
        <button onClick={deactivateAccount} disabled={isDeleting} className="w-full py-3 rounded-xl bg-red-600 text-white font-black text-sm hover:bg-red-700 disabled:opacity-60 transition-all">{isDeleting ? t('accountSettings.deleting', 'جاري الحذف...') : t('accountSettings.deleteAccount', 'حذف الحساب')}</button>
      </div>
    </div>
  );
};

/* ── Security ──────────────────────────────────────── */
const Security: React.FC<{ shop: any; onSaved?: () => void }> = ({ shop, onSaved }) => {
  const t = useT();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const saveSecurity = async () => {
    if (!currentPassword) { addToast(t('securitySettings.error', 'خطأ'), t('securitySettings.currentPasswordRequired', 'أدخل كلمة المرور الحالية'), 'destructive'); return; }
    if (!newPassword || newPassword.length < 8) { addToast(t('securitySettings.error', 'خطأ'), t('securitySettings.newPasswordMinLength', 'كلمة المرور الجديدة لا تقل عن 8 أحرف'), 'destructive'); return; }
    if (newPassword !== confirmPassword) { addToast(t('securitySettings.error', 'خطأ'), t('securitySettings.passwordsDoNotMatch', 'كلمتا المرور غير متطابقتين'), 'destructive'); return; }
    setSaving(true);
    try {
      await merchantApi.merchantChangePassword({ currentPassword, newPassword });
      addToast(t('securitySettings.updated', 'تم التحديث'), t('securitySettings.passwordChanged', 'تم تغيير كلمة المرور'), 'success');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      onSaved?.();
    } catch { addToast(t('securitySettings.error', 'خطأ'), t('securitySettings.saveSecurityFailed', 'فشل حفظ الإعدادات الأمنية'), 'destructive'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black">{t('securitySettings.title', 'الأمان')}</h2><p className="text-slate-400 text-sm">{t('securitySettings.subtitle', 'إعدادات الأمان والحماية')}</p></div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-slate-700">{t('securitySettings.changePassword', 'تغيير كلمة المرور')}</h3>
        <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('securitySettings.currentPassword', 'كلمة المرور الحالية')}</label><div className="relative"><Lock className="absolute right-3 top-3 w-4 h-4 text-slate-300" /><input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 font-bold text-slate-900 text-right" /><button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute left-3 top-3 text-slate-400">{showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('securitySettings.newPassword', 'كلمة المرور الجديدة')}</label><div className="relative"><Lock className="absolute right-3 top-3 w-4 h-4 text-slate-300" /><input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 font-bold text-slate-900 text-right" /><button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-3 top-3 text-slate-400">{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('securitySettings.confirmNewPassword', 'تأكيد كلمة المرور')}</label><div className="relative"><Lock className="absolute right-3 top-3 w-4 h-4 text-slate-300" /><input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 font-bold text-slate-900 text-right" /><button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3 top-3 text-slate-400">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
        </div>
        <button onClick={saveSecurity} disabled={saving} className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black disabled:opacity-60 transition-all">{saving ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : t('securitySettings.changePassword', 'تغيير كلمة المرور')}</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-slate-700">{t('securitySettings.twoFactorAuth', 'المصادقة الثنائية')}</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">{twoFactorEnabled ? t('securitySettings.twoFactorEnabledDesc', 'المصادقة الثنائية مفعلة') : t('securitySettings.twoFactorDisabledDesc', 'المصادقة الثنائية غير مفعلة')}</p>
          <button onClick={() => twoFactorEnabled ? setTwoFactorEnabled(false) : setShowTwoFactorSetup(true)} className={`px-4 py-2 rounded-xl font-black text-xs ${twoFactorEnabled ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{twoFactorEnabled ? t('securitySettings.disable', 'تعطيل') : t('securitySettings.enable', 'تفعيل')}</button>
        </div>
        {showTwoFactorSetup && (
          <div className="p-4 bg-slate-50 rounded-xl space-y-3">
            <p className="text-sm text-slate-500">{t('securitySettings.enterCodeStep', 'أدخل رمز التحقق')}</p>
            <div className="flex gap-3"><input value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} maxLength={6} placeholder="123456" className="max-w-[180px] bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-center" /><button onClick={() => { setTwoFactorEnabled(true); setShowTwoFactorSetup(false); setTwoFactorCode(''); }} className="px-4 py-3 bg-slate-900 text-white rounded-xl font-black text-xs">{t('securitySettings.activate', 'تفعيل')}</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Store Settings ────────────────────────────────── */
const StoreSettingsTab: React.FC<{ shop: any; onSaved?: () => void }> = ({ shop, onSaved }) => {
  const t = useT();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(Boolean(shop?.isActive));
  const [publicDisabled, setPublicDisabled] = useState(Boolean(shop?.publicDisabled ?? shop?.public_disabled));
  const [deliveryDisabled, setDeliveryDisabled] = useState(Boolean(shop?.deliveryDisabled ?? shop?.delivery_disabled));
  const [form, setForm] = useState({
    whatsapp: String(shop?.layoutConfig?.whatsapp || ''),
    customDomain: String(shop?.layoutConfig?.customDomain || ''),
    openingHours: String(shop?.openingHours || shop?.opening_hours || ''),
    displayAddress: String(shop?.displayAddress || shop?.display_address || ''),
    mapLabel: String(shop?.mapLabel || shop?.map_label || ''),
  });
  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [key]: e.target.value }));
  const [latitude, setLatitude] = useState<number | null>(typeof shop?.latitude === 'number' ? shop.latitude : null);
  const [longitude, setLongitude] = useState<number | null>(typeof shop?.longitude === 'number' ? shop.longitude : null);
  const [locatingShop, setLocatingShop] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocatingShop(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); setLocatingShop(false); },
      () => { setLocatingShop(false); },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const toggleActive = async () => {
    const next = !isActive;
    try { await merchantApi.merchantUpdateMyShop({ isActive: next }); setIsActive(next); addToast(t('storeSettings.updated', 'تم التحديث'), next ? t('storeSettings.shopOpened', 'المحل مفتوح') : t('storeSettings.shopClosed', 'المحل مغلق'), 'success'); onSaved?.(); }
    catch { addToast(t('storeSettings.error', 'خطأ'), '', 'destructive'); }
  };
  const togglePublic = async () => {
    const next = !publicDisabled;
    try { await merchantApi.merchantUpdateMyShop({ publicDisabled: next }); setPublicDisabled(next); addToast(t('storeSettings.updated', 'تم التحديث'), '', 'success'); onSaved?.(); }
    catch { addToast(t('storeSettings.error', 'خطأ'), '', 'destructive'); }
  };
  const toggleDelivery = async () => {
    const next = !deliveryDisabled;
    try { await merchantApi.merchantUpdateMyShop({ deliveryDisabled: next }); setDeliveryDisabled(next); addToast(t('storeSettings.updated', 'تم التحديث'), '', 'success'); onSaved?.(); }
    catch { addToast(t('storeSettings.error', 'خطأ'), '', 'destructive'); }
  };
  const saveStore = async () => {
    setSaving(true);
    try {
      await merchantApi.merchantUpdateMyShop({ whatsapp: form.whatsapp, customDomain: form.customDomain, openingHours: form.openingHours, displayAddress: form.displayAddress || null, mapLabel: form.mapLabel || null, latitude, longitude });
      addToast(t('storeSettings.saved', 'تم الحفظ'), '', 'success'); onSaved?.();
    } catch { addToast(t('storeSettings.error', 'خطأ'), '', 'destructive'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black">{t('storeSettings.title', 'إعدادات المحل')}</h2></div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
        <div><h3 className="font-black text-slate-700">{t('storeSettings.shopStatus', 'حالة المحل')}</h3><p className="text-sm text-slate-400">{isActive ? t('storeSettings.shopOpenDesc', 'المحل مفتوح') : t('storeSettings.shopClosedDesc', 'المحل مغلق')}</p></div>
        <button onClick={toggleActive} className={`px-5 py-3 rounded-xl font-black text-xs ${isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{isActive ? t('storeSettings.closeShop', 'إغلاق') : t('storeSettings.openShop', 'فتح')}</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
        <div><h3 className="font-black text-slate-700">{t('storeSettings.publicPageAndMap', 'الصفحة العامة')}</h3><p className="text-sm text-slate-400">{publicDisabled ? t('storeSettings.publicPageDisabledDesc', 'الصفحة معطلة') : t('storeSettings.publicPageEnabledDesc', 'الصفحة مفعلة')}</p></div>
        <button onClick={togglePublic} className={`px-5 py-3 rounded-xl font-black text-xs ${publicDisabled ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{publicDisabled ? t('storeSettings.enablePublicPage', 'تفعيل') : t('storeSettings.disablePublicPage', 'تعطيل')}</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
        <div><h3 className="font-black text-slate-700">{t('storeSettings.delivery', 'التوصيل')}</h3><p className="text-sm text-slate-400">{deliveryDisabled ? t('storeSettings.deliveryDisabledDesc', 'التوصيل معطل') : t('storeSettings.deliveryEnabledDesc', 'التوصيل مفعل')}</p></div>
        <button onClick={toggleDelivery} className={`px-5 py-3 rounded-xl font-black text-xs ${deliveryDisabled ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{deliveryDisabled ? t('storeSettings.enableDelivery', 'تفعيل') : t('storeSettings.disableDelivery', 'تعطيل')}</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-slate-700">{t('storeSettings.contact', 'التواصل')}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('storeSettings.whatsapp', 'واتساب')}</label><input value={form.whatsapp} onChange={onChange('whatsapp')} placeholder="+2010..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('storeSettings.customDomain', 'نطاق مخصص')}</label><input value={form.customDomain} onChange={onChange('customDomain')} placeholder="shop.example.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('storeSettings.openingHours', 'ساعات العمل')}</label><input value={form.openingHours} onChange={onChange('openingHours')} placeholder="10:00 - 22:00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('storeSettings.shortAddress', 'عنوان مختصر')}</label><input value={form.displayAddress} onChange={onChange('displayAddress')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-slate-700">{t('storeSettings.shopLocationOnMap', 'موقع المحل على الخريطة')}</h3>
        <div className="flex justify-end"><button onClick={handleUseMyLocation} disabled={locatingShop} className="px-4 py-3 bg-slate-100 rounded-xl font-black text-xs">{locatingShop ? t('storeSettings.locatingMe', 'جاري التحديد...') : t('storeSettings.useMyLocation', 'استخدم موقعي')}</button></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3"><div className="text-xs text-slate-400">Latitude</div><div className="font-bold text-slate-900">{latitude == null ? '—' : latitude.toFixed(6)}</div></div>
          <div className="bg-slate-50 rounded-xl p-3"><div className="text-xs text-slate-400">Longitude</div><div className="font-bold text-slate-900">{longitude == null ? '—' : longitude.toFixed(6)}</div></div>
        </div>
      </div>
      <button onClick={saveStore} disabled={saving} className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black disabled:opacity-60 transition-all">{saving ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : t('common.save', 'حفظ')}</button>
    </div>
  );
};

/* ── Modules ───────────────────────────────────────── */
type ModuleId = 'overview' | 'products' | 'reservations' | 'invoice' | 'pos' | 'sales' | 'promotions' | 'reports' | 'customers' | 'gallery' | 'abandonedCart' | 'builder' | 'settings';
const CORE_IDS: ModuleId[] = ['overview', 'products', 'promotions', 'builder', 'settings'];

const ModulesSettings: React.FC<{ shop: any; onSaved?: () => void }> = ({ shop, onSaved }) => {
  const t = useT();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const MODULES: { id: ModuleId; label: string; kind: 'core' | 'optional' }[] = useMemo(() => [
    { id: 'overview', label: t('modulesSettings.moduleOverview', 'نظرة عامة'), kind: 'core' },
    { id: 'products', label: t('modulesSettings.moduleProducts', 'المنتجات'), kind: 'core' },
    { id: 'promotions', label: t('modulesSettings.modulePromotions', 'العروض'), kind: 'core' },
    { id: 'builder', label: t('modulesSettings.moduleBuilder', 'بناء الصفحة'), kind: 'core' },
    { id: 'settings', label: t('modulesSettings.moduleSettings', 'الإعدادات'), kind: 'core' },
    { id: 'gallery', label: t('modulesSettings.moduleGallery', 'المعرض'), kind: 'optional' },
    { id: 'reservations', label: t('modulesSettings.moduleReservations', 'الحجوزات'), kind: 'optional' },
    { id: 'invoice', label: t('modulesSettings.moduleInvoice', 'الفواتير'), kind: 'optional' },
    { id: 'pos', label: t('modulesSettings.modulePos', 'نقطة البيع'), kind: 'optional' },
    { id: 'sales', label: t('modulesSettings.moduleSales', 'المبيعات'), kind: 'optional' },
    { id: 'customers', label: t('modulesSettings.moduleCustomers', 'العملاء'), kind: 'optional' },
    { id: 'reports', label: t('modulesSettings.moduleReports', 'التقارير'), kind: 'optional' },
    { id: 'abandonedCart', label: t('modulesSettings.moduleAbandonedCart', 'السلات المتروكة'), kind: 'optional' },
  ], [t]);

  const activeEnabled = useMemo(() => {
    const raw = shop?.layoutConfig?.enabledModules;
    if (!Array.isArray(raw)) return Array.from(new Set(CORE_IDS)).sort();
    return Array.from(new Set([...raw.map((x: any) => String(x).trim()).filter(Boolean), ...CORE_IDS])).sort();
  }, [shop]);

  const [enabled, setEnabled] = useState<Set<ModuleId>>(() => new Set(activeEnabled as any));
  useEffect(() => { setEnabled(new Set(activeEnabled as any)); }, [activeEnabled]);

  const toggleOptional = (id: ModuleId) => {
    if (CORE_IDS.includes(id)) return;
    setEnabled((prev) => { const next = new Set(prev); if (next.has(id)) { next.delete(id); if (id === 'sales') { next.delete('customers'); next.delete('reports'); } } else { if ((id === 'customers' || id === 'reports') && !next.has('sales')) { addToast(t('modulesSettings.notAllowed', 'غير مسموح'), t('modulesSettings.customersRequiresSales', 'العملاء والتقارير تتطلب تفعيل المبيعات'), 'destructive'); return prev; } next.add(id); } return next; });
  };

  const getRemoveDetailsKey = (id: ModuleId) => {
    if (id === 'invoice') return 'modulesSettings.removeInvoiceDetail';
    if (id === 'reservations') return 'modulesSettings.removeReservationsDetail';
    if (id === 'gallery') return 'modulesSettings.removeGalleryDetail';
    if (id === 'customers') return 'modulesSettings.removeCustomersDetail';
    if (id === 'reports') return 'modulesSettings.removeReportsDetail';
    if (id === 'pos') return 'modulesSettings.removePosDetail';
    if (id === 'sales') return 'modulesSettings.removeSalesDetail';
    return 'modulesSettings.removeDefaultDetail';
  };

  const buildRemoveConfirmText = (id: ModuleId) => {
    const label = MODULES.find((m) => m.id === id)?.label || String(id);
    const details = t(getRemoveDetailsKey(id), '');
    const base = t('modulesSettings.removeConfirm', 'هل أنت متأكد من حذف هذا الزر؟');
    return base
      .replace('{{label}}', label)
      .replace('{{details}}', details);
  };

  const removeActiveModule = async (id: ModuleId) => {
    if (CORE_IDS.includes(id) || !activeEnabled.includes(id)) return;
    if (!window.confirm(buildRemoveConfirmText(id))) return;
    setSaving(true);
    try {
      const next = new Set<ModuleId>(activeEnabled as any); next.delete(id);
      if (id === 'sales') { next.delete('customers'); next.delete('reports'); }
      const list = Array.from(next).map(String).sort();
      await merchantApi.merchantUpdateMyShop({ enabledModules: list });
      setEnabled(new Set(list as any));
      addToast(t('modulesSettings.deleted', 'تم الحذف'), t('modulesSettings.moduleDeletedDesc', ''), 'success');
      onSaved?.();
    } catch (e: any) {
      const msg = String(e?.message || '');
      addToast(t('modulesSettings.error', 'خطأ'), t('modulesSettings.removeModuleFailed', msg ? `فشل حذف الزر: ${msg}` : 'فشل حذف الزر'), 'destructive');
    }
    finally { setSaving(false); }
  };

  const saveModules = async () => {
    setSaving(true);
    try {
      const list = Array.from(enabled).map(String).sort();
      const requested = list.filter((id) => !activeEnabled.includes(id as any) && !CORE_IDS.includes(id as any));
      if (requested.length > 0) {
        await merchantApi.merchantCreateModuleUpgradeRequest({ requestedModules: requested });
        addToast(t('modulesSettings.requestSent', 'تم إرسال الطلب'), t('modulesSettings.requestSentDesc', ''), 'success');
      } else {
        addToast(t('modulesSettings.nothingNew', 'لا تغييرات جديدة'), t('modulesSettings.noNewModulesSelected', ''), 'success');
      }
      onSaved?.();
    } catch (e: any) {
      const msg = String(e?.message || '');
      addToast(t('modulesSettings.error', 'خطأ'), t('modulesSettings.saveModulesFailed', msg ? `فشل حفظ الأزرار: ${msg}` : 'فشل حفظ الأزرار'), 'destructive');
    }
    finally { setSaving(false); }
  };

  const coreModules = MODULES.filter((m) => m.kind === 'core');
  const optionalModules = MODULES.filter((m) => m.kind === 'optional');

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black">{t('modulesSettings.upgrade', 'ترقية الوحدات')}</h2><p className="text-sm text-slate-400">{t('modulesSettings.upgradeDesc', 'إدارة وحدات المحل')}</p></div>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-2">
        <h3 className="font-black text-slate-900 mb-3">{t('modulesSettings.coreModules', 'الوحدات الأساسية')}</h3>
        {coreModules.map((m) => (<div key={m.id} className="flex items-center justify-between px-5 py-4 rounded-xl bg-slate-50 border border-slate-100"><span className="font-black text-slate-900">{m.label}</span><span className="text-[10px] font-black text-slate-400">{t('modulesSettings.core', 'أساسي')}</span></div>))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
        <h3 className="font-black text-slate-900 mb-3">{t('modulesSettings.optionalModules', 'وحدات اختيارية')}</h3>
        {optionalModules.map((m) => {
          const checked = enabled.has(m.id);
          const isActiveMod = activeEnabled.includes(m.id);
          const disabled = isActiveMod || ((m.id === 'customers' || m.id === 'reports') && !enabled.has('sales'));
          return (
            <div key={m.id} className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all ${checked ? 'border-[#00E5FF] bg-[#00E5FF]/5' : 'border-slate-100 bg-slate-50'} ${disabled ? 'opacity-60' : ''}`}>
              <button onClick={() => !disabled && toggleOptional(m.id)} className="flex-1 flex items-center justify-between"><span className="font-black text-slate-900">{m.label}</span><span className={`w-6 h-6 rounded-lg border ${checked ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-white border-slate-200'}`} /></button>
              {isActiveMod && <button onClick={() => removeActiveModule(m.id)} disabled={saving} className="shrink-0 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-black text-xs">{t('modulesSettings.delete', 'حذف')}</button>}
            </div>
          );
        })}
        <button onClick={saveModules} disabled={saving} className="w-full py-4 rounded-xl bg-slate-900 text-white font-black hover:bg-black disabled:opacity-60 transition-all">{saving ? t('modulesSettings.saving', 'جاري الحفظ...') : t('modulesSettings.saveModules', 'حفظ الوحدات')}</button>
      </div>
    </div>
  );
};

/* ── Apps ──────────────────────────────────────────── */
const AppsTab: React.FC = () => {
  const t = useT();
  const { addToast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const [allApps, myApps] = await Promise.all([merchantApi.merchantListApps(), merchantApi.merchantListMyApps()]);
      const installedMap = new Map<string, any>();
      for (const sa of Array.isArray(myApps) ? myApps : []) { if (sa.status === 'INSTALLED') installedMap.set(sa.appId, sa); }
      const merged = (Array.isArray(allApps) ? allApps : []).map((app: any) => { const shopApp = installedMap.get(app.id); return { ...app, installed: !!shopApp, isActive: shopApp?.isActive ?? false, shopAppId: shopApp?.id }; });
      setApps(merged);
    } catch { addToast(t('business.dashboard.dataLoadError', 'خطأ في تحميل البيانات'), '', 'destructive'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleInstall = async (app: any) => { setActionLoading((p) => ({ ...p, [app.key]: true })); try { await merchantApi.merchantInstallApp(app.key); addToast(t('business.apps.installSuccess', 'تم التثبيت'), '', 'success'); await loadData(); } catch { addToast(t('business.apps.installFailed', 'فشل التثبيت'), '', 'destructive'); } finally { setActionLoading((p) => ({ ...p, [app.key]: false })); } };
  const handleUninstall = async (app: any) => { setActionLoading((p) => ({ ...p, [app.key]: true })); try { await merchantApi.merchantUninstallApp(app.key); addToast(t('business.apps.uninstallSuccess', 'تم إلغاء التثبيت'), '', 'success'); await loadData(); } catch { addToast(t('business.apps.uninstallFailed', 'فشل إلغاء التثبيت'), '', 'destructive'); } finally { setActionLoading((p) => ({ ...p, [app.key]: false })); } };
  const handleToggle = async (app: any) => { setActionLoading((p) => ({ ...p, [app.key]: true })); try { if (app.isActive) { await merchantApi.merchantDisableApp(app.key); } else { await merchantApi.merchantEnableApp(app.key); } await loadData(); } catch { addToast(t('business.apps.actionFailed', 'فشلت العملية'), '', 'destructive'); } finally { setActionLoading((p) => ({ ...p, [app.key]: false })); } };

  if (loading) return <div className="py-20 flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-[#00E5FF] w-10 h-10" /><p className="font-bold text-slate-400">{t('business.dashboard.loadingSection', 'جاري التحميل...')}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3"><Store className="text-[#00E5FF]" size={24} /><h2 className="text-2xl font-black">{t('business.apps.title', 'التطبيقات')}</h2></div>
      {apps.length === 0 ? <div className="text-center py-16"><Store size={48} className="mx-auto text-slate-300 mb-4" /><p className="text-slate-400 font-bold">{t('business.apps.noApps', 'لا توجد تطبيقات')}</p></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => { const busy = !!actionLoading[app.key]; return (
            <div key={app.id} className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
              {app.installed && app.isActive && <div className="absolute top-3 left-3"><CheckCircle size={18} className="text-green-500" /></div>}
              <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-slate-100 flex items-center justify-center text-[#00E5FF] shrink-0"><Store size={20} /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-slate-900 text-sm truncate">{app.name}</h3><span className="text-[10px] text-slate-400 font-mono">v{app.version}</span></div></div>
              {app.description && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{app.description}</p>}
              <div className="mt-auto flex items-center gap-2 pt-2">
                {!app.installed ? <button onClick={() => handleInstall(app)} disabled={busy} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#00E5FF] text-black font-bold text-xs disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}{t('business.apps.install', 'تثبيت')}</button> : (<>
                  <button onClick={() => handleToggle(app)} disabled={busy} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs disabled:opacity-50 ${app.isActive ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>{busy ? <Loader2 size={14} className="animate-spin" /> : app.isActive ? <PowerOff size={14} /> : <Power size={14} />}{app.isActive ? t('business.apps.disable', 'تعطيل') : t('business.apps.enable', 'تفعيل')}</button>
                  <button onClick={() => handleUninstall(app)} disabled={busy} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}{t('business.apps.uninstall', 'إلغاء')}</button>
                </>)}
              </div>
            </div>
          ); })}
        </div>
      )}
    </div>
  );
};

/* ── Receipt Theme ─────────────────────────────────── */
const ReceiptThemeSettings: React.FC<{ shop: any }> = ({ shop }) => {
  const t = useT();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [receiptShopName, setReceiptShopName] = useState('');
  const [receiptPhone, setReceiptPhone] = useState('');
  const [receiptCity, setReceiptCity] = useState('');
  const [receiptAddress, setReceiptAddress] = useState('');
  const [receiptFooterNote, setReceiptFooterNote] = useState('');
  const [receiptVatRatePercent, setReceiptVatRatePercent] = useState('0');
  const [receiptLogoDataUrl, setReceiptLogoDataUrl] = useState('');
  const receiptLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const theme = shop?.layoutConfig?.receiptTheme || {};
    setReceiptShopName(String(theme.shopName || shop?.name || ''));
    setReceiptPhone(String(theme.phone || shop?.phone || ''));
    setReceiptCity(String(theme.city || shop?.city || ''));
    setReceiptAddress(String(theme.address || shop?.addressDetailed || ''));
    setReceiptFooterNote(String(theme.footerNote || ''));
    setReceiptVatRatePercent(String(theme.vatRatePercent ?? 0));
    setReceiptLogoDataUrl(String(theme.logoDataUrl || ''));
  }, [shop]);

  const handleReceiptLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 2 * 1024 * 1024) { addToast(t('settingsIndex.error', 'خطأ'), t('settingsIndex.imageTooLarge', 'الصورة كبيرة جداً'), 'destructive'); return; }
    const reader = new FileReader(); reader.onloadend = () => setReceiptLogoDataUrl(reader.result as string); reader.readAsDataURL(file);
  };

  const saveReceiptTheme = async () => {
    setSaving(true);
    try {
      await merchantApi.merchantUpdateMyShop({ receiptTheme: { shopName: receiptShopName, phone: receiptPhone, city: receiptCity, address: receiptAddress, footerNote: receiptFooterNote, vatRatePercent: Number(receiptVatRatePercent) || 0, logoDataUrl: receiptLogoDataUrl } });
      addToast(t('settingsIndex.saved', 'تم الحفظ'), '', 'success');
    } catch { addToast(t('settingsIndex.error', 'خطأ'), '', 'destructive'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black">{t('settingsIndex.receiptTheme', 'تصميم الإيصال')}</h2><p className="text-sm text-slate-400">{t('settingsIndex.receiptThemeDesc', 'تخصيص شكل ومحتوى الإيصال')}</p></div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('settingsIndex.receiptShopName', 'اسم المحل')}</label><input value={receiptShopName} onChange={(e) => setReceiptShopName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('settingsIndex.receiptPhone', 'الهاتف')}</label><input value={receiptPhone} onChange={(e) => setReceiptPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('settingsIndex.receiptCity', 'المدينة')}</label><input value={receiptCity} onChange={(e) => setReceiptCity(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('settingsIndex.vatRatePercent', 'نسبة الضريبة %')}</label><input type="number" min={0} max={100} value={receiptVatRatePercent} onChange={(e) => setReceiptVatRatePercent(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
        </div>
        <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('settingsIndex.receiptAddress', 'العنوان')}</label><input value={receiptAddress} onChange={(e) => setReceiptAddress(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('settingsIndex.receiptLogoOptional', 'شعار الإيصال')}</label><div className="flex items-center gap-3"><div onClick={() => receiptLogoInputRef.current?.click()} className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 cursor-pointer flex items-center justify-center">{receiptLogoDataUrl ? <img src={receiptLogoDataUrl} className="w-full h-full object-cover" alt="logo" /> : <ImageIcon className="text-slate-300" />}</div><div className="flex flex-col gap-2"><button onClick={() => receiptLogoInputRef.current?.click()} className="px-3 py-2 bg-slate-100 rounded-xl font-black text-xs">{t('settingsIndex.chooseLogo', 'اختر شعار')}</button><button onClick={() => setReceiptLogoDataUrl('')} className="px-3 py-2 bg-slate-100 rounded-xl font-black text-xs">{t('settingsIndex.deleteLogo', 'حذف')}</button></div><input ref={receiptLogoInputRef} type="file" hidden accept="image/*" onChange={handleReceiptLogoChange} /></div></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('settingsIndex.receiptFooterNote', 'ملاحظة أسفل الإيصال')}</label><input value={receiptFooterNote} onChange={(e) => setReceiptFooterNote(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
        </div>
        <button onClick={saveReceiptTheme} disabled={saving} className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black disabled:opacity-60 transition-all">{saving ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : t('common.save', 'حفظ')}</button>
      </div>
    </div>
  );
};

/* ── Payments ──────────────────────────────────────── */
const Payments: React.FC<{ shop: any; onSaved?: () => void }> = ({ shop, onSaved }) => {
  const t = useT();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [merchantId, setMerchantId] = useState(String(shop?.paymentConfig?.merchantId || ''));
  const [publicKey, setPublicKey] = useState(String(shop?.paymentConfig?.publicKey || ''));

  useEffect(() => { setMerchantId(String(shop?.paymentConfig?.merchantId || '')); setPublicKey(String(shop?.paymentConfig?.publicKey || '')); }, [shop?.paymentConfig]);

  const savePayments = async () => {
    setSaving(true);
    try { await merchantApi.merchantUpdateMyShop({ paymentConfig: { merchantId, publicKey } }); addToast(t('paymentsSettings.saved', 'تم الحفظ'), '', 'success'); onSaved?.(); }
    catch { addToast(t('paymentsSettings.error', 'خطأ'), '', 'destructive'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black">{t('paymentsSettings.title', 'إعدادات الدفع')}</h2><p className="text-sm text-slate-400">{t('paymentsSettings.subtitle', 'إعدادات بوابة الدفع')}</p></div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Merchant ID</label><input value={merchantId} onChange={(e) => setMerchantId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
        <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Public Key</label><input value={publicKey} onChange={(e) => setPublicKey(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 text-right" /></div>
        <button onClick={savePayments} disabled={saving} className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black disabled:opacity-60 transition-all">{saving ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : t('common.save', 'حفظ')}</button>
      </div>
    </div>
  );
};

/* ── Notifications Settings ────────────────────────── */
const NotificationsSettings: React.FC<{ shop: any }> = ({ shop }) => {
  const t = useT();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [pendingSoundId, setPendingSoundId] = useState(String(shop?.layoutConfig?.notificationSoundId || 'default'));
  const savedSoundId = String(shop?.layoutConfig?.notificationSoundId || 'default');
  const sounds = [
    { id: 'default', name: t('settingsIndex.defaultSound', 'الصوت الافتراضي'), url: '' },
    { id: 'chime', name: t('settingsIndex.chime', 'رنين'), url: '/sounds/chime.mp3' },
    { id: 'ding', name: t('settingsIndex.ding', 'دينج'), url: '/sounds/ding.mp3' },
    { id: 'none', name: t('settingsIndex.silent', 'صامت'), url: '' },
  ];

  const saveNotifications = async () => {
    setSaving(true);
    try { await merchantApi.merchantUpdateMyShop({ notificationSoundId: pendingSoundId }); addToast(t('settingsIndex.saved', 'تم الحفظ'), '', 'success'); }
    catch { addToast(t('settingsIndex.error', 'خطأ'), '', 'destructive'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-black">{t('settingsIndex.notifications', 'الإشعارات')}</h2></div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-slate-700">{t('settingsIndex.notificationSounds', 'أصوات الإشعارات')}</h3>
        <div className="space-y-3">
          {sounds.map((s) => (
            <button key={s.id} onClick={() => setPendingSoundId(s.id)} className={`w-full px-6 py-4 rounded-2xl border font-black text-sm flex items-center justify-between ${pendingSoundId === s.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-900 border-slate-100 hover:bg-slate-100'}`}>
              <span>{s.name}</span>
              <span className="text-[10px] opacity-70">{savedSoundId === s.id ? t('settingsIndex.savedLabel', 'محفوظ') : pendingSoundId === s.id ? t('settingsIndex.selected', 'مختار') : ''}</span>
            </button>
          ))}
        </div>
        <button onClick={() => { const s = sounds.find((s) => s.id === pendingSoundId); if (s?.url) new Audio(s.url).play().catch(() => {}); }} className="w-full py-3 bg-[#00E5FF] text-black rounded-2xl font-black text-sm">{t('settingsIndex.testSound', 'اختبار الصوت')}</button>
        <button onClick={saveNotifications} disabled={saving} className="w-full py-3 rounded-xl bg-slate-900 text-white font-black text-sm hover:bg-black disabled:opacity-60 transition-all">{saving ? <Loader2 className="animate-spin w-4 h-4 mx-auto" /> : t('common.save', 'حفظ')}</button>
      </div>
    </div>
  );
};

/* ── Main Settings Page ────────────────────────────── */
const SettingsPage: React.FC<Props> = ({ shop, onSaved, settingsTab, onSettingsTabChange }) => {
  const t = useT();
  const { dir } = useLocale();
  const isArabic = dir === 'rtl';

  const tabs = SETTINGS_TAB_IDS.map((item) => ({
    ...item,
    label: t(`settingsIndex.tab${item.id.charAt(0).toUpperCase() + item.id.slice(1)}`, item.id.replace(/_/g, ' ')),
  }));

  const activeTab = (tabs.some((tab) => tab.id === settingsTab) ? settingsTab : 'overview') as SettingsTab;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview shop={shop} />;
      case 'account': return <Account shop={shop} onSaved={onSaved} />;
      case 'security': return <Security shop={shop} onSaved={onSaved} />;
      case 'store': return <StoreSettingsTab shop={shop} onSaved={onSaved} />;
      case 'modules': return <ModulesSettings shop={shop} onSaved={onSaved} />;
      case 'apps': return <AppsTab />;
      case 'receipt_theme': return <ReceiptThemeSettings shop={shop} />;
      case 'payments': return <Payments shop={shop} onSaved={onSaved} />;
      case 'notifications': return <NotificationsSettings shop={shop} />;
      default: return <Overview shop={shop} />;
    }
  };

  return (
    <div className={`space-y-6 ${isArabic ? 'text-right' : 'text-left'}`} dir={dir}>
      <div className="flex items-center gap-3 mb-2">
        <SettingsIcon className="w-6 h-6 text-slate-400" />
        <h2 className="text-2xl font-black">{t('settingsIndex.settings', 'الإعدادات')}</h2>
      </div>

      {/* Sub-tab pills */}
      <div className="flex gap-2 p-2 bg-slate-50/60 backdrop-blur-xl rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSettingsTabChange?.(tab.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default SettingsPage;
