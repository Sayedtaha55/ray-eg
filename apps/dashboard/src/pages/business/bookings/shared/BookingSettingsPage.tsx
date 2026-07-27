/**
 * ═══════════════════════════════════════════
 * bookings/shared/BookingSettingsPage.tsx
 * صفحة إعدادات الحجوزات — تبويبات فرعية مشتركة
 * ═══════════════════════════════════════════
 */
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Loader2, Check, Clock, Bell, Shield, Home, User, Store, CreditCard, Puzzle, LayoutGrid } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import type { BookingActivityType } from '../config';
import { getLocalizedVocabulary } from '../config';
import { ApiService } from '@/services/api.service';
import { getEffectiveShop } from './utils';
import { useTranslation } from 'react-i18next';
import { RayDB } from '@/constants';

import Overview from '../../../../components/MerchantDashboard/Settings/Overview';
import Account from '../../../../components/MerchantDashboard/Settings/Account';
import Security from '../../../../components/MerchantDashboard/Settings/Security';
import StoreSettings from '../../../../components/MerchantDashboard/Settings/StoreSettings';
import Payments from '../../../../components/MerchantDashboard/Settings/Payments';
import ModulesSettings from '../../../../components/MerchantDashboard/Settings/Modules';
import AppsTab from '@/components/pages/business/merchant-dashboard/tabs/AppsTab';

type SettingsTab = 'overview' | 'account' | 'security' | 'store' | 'booking_settings' | 'modules' | 'apps' | 'receipt_theme' | 'payments' | 'notifications';

type Props = {
  activityType: BookingActivityType;
  shop?: any;
  onSaved?: () => void;
  adminShopId?: string;
};

const { useLocation, useNavigate } = ReactRouterDOM as any;

const BookingSettingsContent: React.FC<{ shop: any; isEn: boolean }> = ({ shop, isEn }) => {
  const effectiveShop = getEffectiveShop(shop);
  const pd = effectiveShop?.pageDesign || {};

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [slotDuration, setSlotDuration] = useState<number>(pd.bookingSlotDuration || 30);
  const [advanceDays, setAdvanceDays] = useState<number>(pd.bookingAdvanceDays || 14);
  const [autoConfirm, setAutoConfirm] = useState<boolean>(pd.bookingAutoConfirm ?? false);
  const [notifyOwner, setNotifyOwner] = useState<boolean>(pd.bookingNotifyOwner ?? true);
  const [notifyCustomer, setNotifyCustomer] = useState<boolean>(pd.bookingNotifyCustomer ?? true);
  const [workingHoursStart, setWorkingHoursStart] = useState(pd.bookingWorkStart || '09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState(pd.bookingWorkEnd || '21:00');
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] = useState<number>(pd.bookingMaxPerSlot || 1);
  const [bookingManualOpen, setBookingManualOpen] = useState<'auto' | 'open' | 'closed'>(
    pd.bookingManualOpen === true ? 'open' : pd.bookingManualOpen === false ? 'closed' : 'auto'
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await ApiService.updateMyShop({
        pageDesign: {
          ...pd,
          bookingSlotDuration: slotDuration,
          bookingAdvanceDays: advanceDays,
          bookingAutoConfirm: autoConfirm,
          bookingNotifyOwner: notifyOwner,
          bookingNotifyCustomer: notifyCustomer,
          bookingWorkStart: workingHoursStart,
          bookingWorkEnd: workingHoursEnd,
          bookingMaxPerSlot: maxBookingsPerSlot,
          bookingManualOpen: bookingManualOpen === 'auto' ? null : bookingManualOpen === 'open',
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const Toggle = ({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <div className="font-black text-sm text-slate-900">{label}</div>
        {description && <div className="text-xs text-slate-400 font-bold mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-[#00E5FF]' : 'bg-slate-200'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${value ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Schedule' : 'الجدول الزمني'}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Slot duration (min)' : 'مدة كل موعد (دقيقة)'}</label>
            <select value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300">
              {[15, 20, 30, 45, 60, 90, 120].map(d => (<option key={d} value={d}>{d} {isEn ? 'min' : 'دقيقة'}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Max bookings per slot' : 'أقصى حجوزات في نفس الموعد'}</label>
            <input type="number" min={1} max={20} value={maxBookingsPerSlot} onChange={e => setMaxBookingsPerSlot(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Work start time' : 'بداية وقت العمل'}</label>
            <input type="time" value={workingHoursStart} onChange={e => setWorkingHoursStart(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Work end time' : 'نهاية وقت العمل'}</label>
            <input type="time" value={workingHoursEnd} onChange={e => setWorkingHoursEnd(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-right focus:outline-none focus:border-cyan-300" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-slate-600 mb-1.5">{isEn ? 'Advance booking (days)' : 'الحجز المسبق بـ (أيام)'}</label>
            <div className="flex items-center gap-3">
              <input type="range" min={1} max={60} value={advanceDays} onChange={e => setAdvanceDays(Number(e.target.value))} className="flex-1" />
              <span className="font-black text-slate-900 text-sm w-16 text-center">{advanceDays} {isEn ? 'days' : 'يوم'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Booking Availability' : 'فتح/قفل الحجز'}</h3>
        </div>
        <div className="py-3">
          <label className="block text-xs font-black text-slate-600 mb-2">{isEn ? 'Booking status mode' : 'وضع حالة الحجز'}</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'auto', label: isEn ? 'Auto (Working Hours)' : 'تلقائي (ساعات العمل)' },
              { id: 'open', label: isEn ? 'Always Open' : 'مفتوح دائماً' },
              { id: 'closed', label: isEn ? 'Always Closed' : 'مقفول دائماً' },
            ] as const).map(opt => (
              <button key={opt.id} onClick={() => setBookingManualOpen(opt.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-black border transition-all ${bookingManualOpen === opt.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-2">
            {isEn
              ? 'Auto: opens/closes based on working hours. Manual override: always open or always closed.'
              : 'تلقائي: يفتح ويقفل حسب ساعات العمل. تحكم يدوي: مفتوح دائماً أو مقفول دائماً.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Automation & Confirmation' : 'الأتمتة والتأكيد'}</h3>
        </div>
        <div className="divide-y divide-slate-50">
          <Toggle value={autoConfirm} onChange={setAutoConfirm}
            label={isEn ? 'Auto-confirm bookings' : 'تأكيد تلقائي للحجوزات'}
            description={isEn ? 'Bookings are confirmed immediately upon receipt without review' : 'يتم تأكيد الحجوزات فور استلامها بدون مراجعة'} />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-[#00E5FF]" />
          <h3 className="font-black text-slate-900 text-sm">{isEn ? 'Notifications' : 'الإشعارات'}</h3>
        </div>
        <div className="divide-y divide-slate-50">
          <Toggle value={notifyOwner} onChange={setNotifyOwner}
            label={isEn ? 'Notify shop owner' : 'إشعار صاحب المتجر'}
            description={isEn ? 'Receive a notification for each new booking' : 'تلقي إشعار عند كل حجز جديد'} />
          <Toggle value={notifyCustomer} onChange={setNotifyCustomer}
            label={isEn ? 'Notify customer' : 'إشعار العميل'}
            description={isEn ? 'Send automatic confirmation to customer after booking' : 'إرسال تأكيد تلقائي للعميل بعد الحجز'} />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
        {saved ? (isEn ? 'Settings saved ✓' : 'تم حفظ الإعدادات ✓') : saving ? (isEn ? 'Saving...' : 'جاري الحفظ...') : (isEn ? 'Save Settings' : 'حفظ الإعدادات')}
      </button>
    </div>
  );
};

const NotificationsContent: React.FC<{ shop: any; adminShopId?: string; isEn: boolean }> = ({ shop, adminShopId, isEn }) => {
  const { t } = useTranslation();
  const [sounds, setSounds] = useState(RayDB.getNotificationSounds());
  const layout = shop?.layoutConfig && typeof shop.layoutConfig === 'object' ? shop.layoutConfig : undefined;
  const serverSoundId = String((layout as any)?.notificationSoundId || '').trim() || 'default';
  const [savedSoundId, setSavedSoundId] = useState(serverSoundId);
  const [pendingSoundId, setPendingSoundId] = useState(serverSoundId);

  useEffect(() => {
    setSavedSoundId(serverSoundId);
    setPendingSoundId(prev => prev || serverSoundId);
  }, [serverSoundId]);

  useEffect(() => {
    const onSoundsUpdate = () => {
      setSounds(RayDB.getNotificationSounds());
      setPendingSoundId(prev => prev || serverSoundId);
    };
    window.addEventListener('notification-sounds-update', onSoundsUpdate);
    RayDB.syncNotificationSoundsFromPublic();
    return () => window.removeEventListener('notification-sounds-update', onSoundsUpdate);
  }, [serverSoundId]);

  const handleSave = async () => {
    const idToSave = String(pendingSoundId || '').trim();
    if (!idToSave) return;
    try {
      await ApiService.updateMyShop({ ...(adminShopId ? { shopId: adminShopId } : {}), notificationSoundId: idToSave });
      setSavedSoundId(idToSave);
    } catch { /* silent */ }
  };

  return (
    <div className={`space-y-6 ${isEn ? 'text-left' : 'text-right'}`} dir={isEn ? 'ltr' : 'rtl'}>
      <h3 className="text-2xl font-black">{t('settingsIndex.notifications')}</h3>
      <div className="space-y-6">
        <h3 className="text-2xl font-black">{t('settingsIndex.notificationSounds')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">{t('settingsIndex.chooseSound')}</label>
            <div className="space-y-3">
              {sounds.map((s: any) => (
                <button key={s.id} onClick={() => setPendingSoundId(String(s.id))}
                  className={`w-full px-6 py-4 rounded-2xl border font-black text-sm flex items-center justify-between ${pendingSoundId === String(s.id) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-900 border-slate-100 hover:bg-slate-100'}`}>
                  <span>{String(s.name || t('settingsIndex.sound'))}</span>
                  <span className="text-[10px] opacity-70">{savedSoundId === String(s.id) ? t('settingsIndex.savedLabel') : pendingSoundId === String(s.id) ? t('settingsIndex.selected') : ''}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={() => {
                const url = pendingSoundId ? (sounds.find((s: any) => String(s.id) === String(pendingSoundId))?.url || '') : '';
                if (!url) return;
                new Audio(String(url)).play().catch(() => {});
              }} className="flex-1 py-4 bg-[#00E5FF] text-slate-900 rounded-2xl font-black text-sm">{t('settingsIndex.testSound')}</button>
              <button onClick={handleSave} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm">{t('settingsIndex.save')}</button>
            </div>
          </div>
          <div />
        </div>
      </div>
    </div>
  );
};

const BookingSettingsPage: React.FC<Props> = ({ activityType, shop, onSaved, adminShopId }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isEn = String(lang || '').toLowerCase().startsWith('en');
  const vocab = getLocalizedVocabulary(activityType, lang);
  const effectiveShop = getEffectiveShop(shop);
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(String(location?.search || ''));
  const requestedTab = String(params.get('settingsTab') || '').trim().toLowerCase();

  const settingsTabs = React.useMemo(() => {
    const list = [
      { id: 'overview' as const, icon: <Home className="w-5 h-5" /> },
      { id: 'account' as const, icon: <User className="w-5 h-5" /> },
      { id: 'security' as const, icon: <Shield className="w-5 h-5" /> },
      { id: 'store' as const, icon: <Store className="w-5 h-5" /> },
      { id: 'booking_settings' as const, icon: <Clock className="w-5 h-5" /> },
      { id: 'modules' as const, icon: <Puzzle className="w-5 h-5" /> },
      { id: 'apps' as const, icon: <LayoutGrid className="w-5 h-5" /> },
      { id: 'payments' as const, icon: <CreditCard className="w-5 h-5" /> },
      { id: 'notifications' as const, icon: <Bell className="w-5 h-5" /> },
    ];
    return list.map(item => ({
      ...item,
      label: item.id === 'booking_settings'
        ? (isEn ? 'Booking Settings' : 'إعدادات الحجوزات')
        : t(`settingsIndex.tab${item.id.charAt(0).toUpperCase() + item.id.slice(1)}`),
    }));
  }, [isEn, t]);

  const allowedTabs = new Set(settingsTabs.map(tab => String(tab.id)));
  const activeTab = (allowedTabs.has(requestedTab) ? requestedTab : 'overview') as SettingsTab;

  const handleSaved = onSaved || (() => {});

  const renderTabContent = (tabId: SettingsTab) => {
    switch (tabId) {
      case 'overview':
        return <Overview shop={effectiveShop} />;
      case 'account':
        return <Account shop={effectiveShop} onSaved={handleSaved} adminShopId={adminShopId} />;
      case 'security':
        return <Security shop={effectiveShop} onSaved={handleSaved} />;
      case 'store':
        return <StoreSettings shop={effectiveShop} onSaved={handleSaved} adminShopId={adminShopId} />;
      case 'booking_settings':
        return <BookingSettingsContent shop={effectiveShop} isEn={isEn} />;
      case 'modules':
        return <ModulesSettings shop={effectiveShop} onSaved={handleSaved} adminShopId={adminShopId} />;
      case 'apps':
        return <AppsTab />;
      case 'payments':
        return <Payments shop={effectiveShop} onSaved={handleSaved} adminShopId={adminShopId} />;
      case 'notifications':
        return <NotificationsContent shop={effectiveShop} adminShopId={adminShopId} isEn={isEn} />;
      default:
        return <Overview shop={effectiveShop} />;
    }
  };

  return (
    <div className="space-y-5 text-right" dir={isEn ? 'ltr' : 'rtl'}>
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-7 h-7 text-[#00E5FF]" />
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900">{isEn ? `${vocab.dashboardTitle} Settings` : `إعدادات ${vocab.dashboardTitle}`}</h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">{isEn ? 'Configure your booking activity' : 'ضبط نشاط الحجوزات'}</p>
        </div>
      </div>

      <div className="space-y-3">
        {settingsTabs.map(tab => (
          <div key={tab.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => {
                const nextParams = new URLSearchParams(String(location?.search || ''));
                nextParams.set('settingsTab', String(tab.id));
                navigate(`/business/dashboard?${nextParams.toString()}`);
              }}
              className={`w-full flex items-center justify-between px-4 py-4 text-right transition-colors ${String(activeTab) === String(tab.id) ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center space-x-3">
                <span className="ml-2">{tab.icon}</span>
                <span className="font-medium text-gray-900">{tab.label}</span>
              </div>
              {String(activeTab) === String(tab.id) && <Check className="w-4 h-4 text-[#00E5FF]" />}
            </button>
            {String(activeTab) === String(tab.id) && (
              <div className="p-4 border-t border-gray-100">{renderTabContent(activeTab)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingSettingsPage;