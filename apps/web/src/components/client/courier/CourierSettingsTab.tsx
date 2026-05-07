'use client';

import React from 'react';
import { Navigation, RefreshCw, Settings, Eye, EyeOff } from 'lucide-react';
import { useT } from '@/i18n/useT';

const CourierSettingsTab: React.FC<any> = (props) => {
  const t = useT();
  const {
    courierUser, profileName, profilePhone, profileSaving,
    onProfileNameChange, onProfilePhoneChange, onSaveProfile,
    stateLoading, lastState, onSyncState,
    isAvailable, shareLocation, autoRefresh, refreshSeconds,
    onIsAvailableChange, onShareLocationChange, onAutoRefreshChange, onRefreshSecondsChange,
    geoStatus, geoLastFixAt, onUpdateLocationOnce,
    currentPassword, newPassword, confirmNewPassword, passwordSaving,
    onCurrentPasswordChange, onNewPasswordChange, onConfirmNewPasswordChange, onChangePassword,
    onOpenOrdersNow,
    showCurrentPassword, showNewPassword, showConfirmPassword,
    onShowCurrentPasswordChange, onShowNewPasswordChange, onShowConfirmPasswordChange,
  } = props || {};

  const showLocationWarning = !shareLocation || geoStatus === 'blocked' || geoStatus === 'unsupported';
  const locationWarningText = !shareLocation
    ? t('courier.settingsTab.locationNotShared', 'الموقع غير مُشارَك')
    : geoStatus === 'blocked'
      ? t('courier.settingsTab.locationBlocked', 'الموقع محظور')
      : geoStatus === 'unsupported'
        ? t('courier.settingsTab.locationUnsupported', 'الموقع غير مدعوم')
        : '';

  return (
    <div className="bg-slate-900 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl md:text-2xl font-black">{t('courier.settingsTab.title', 'الإعدادات')}</h3>
          <p className="text-slate-400 text-xs md:text-sm font-bold mt-1">{t('courier.settingsTab.subtitle', 'إعدادات الحساب والتطبيق')}</p>
        </div>
        <Settings size={20} className="text-slate-400" />
      </div>

      {showLocationWarning && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-black text-amber-200">{locationWarningText}</div>
            <button type="button" onClick={onUpdateLocationOnce} className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 text-xs font-black">
              <Navigation size={14} /> {t('courier.settingsTab.enableNow', 'تفعيل الآن')}
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 space-y-4">
          <p className="text-xs text-slate-500 font-black">{t('courier.settingsTab.accountInfo', 'معلومات الحساب')}</p>
          <form onSubmit={onSaveProfile} className="space-y-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">{t('courier.settingsTab.name', 'الاسم')}</label>
              <input value={String(profileName || '')} onChange={e => onProfileNameChange?.(e.target.value)} disabled={!!profileSaving} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-right outline-none focus:border-[#00E5FF]/50 disabled:opacity-60" placeholder={t('courier.settingsTab.namePlaceholder', 'اسمك')} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">{t('courier.settingsTab.phone', 'الهاتف')}</label>
              <input value={String(profilePhone || '')} onChange={e => onProfilePhoneChange?.(e.target.value)} disabled={!!profileSaving} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-right outline-none focus:border-[#00E5FF]/50 disabled:opacity-60" placeholder="01xxxxxxxxx" />
            </div>
            <div className="text-[11px] text-slate-500 font-bold">{t('courier.settingsTab.emailLabel', 'البريد')}: {String(courierUser?.email || '')}</div>
            <button type="submit" disabled={!!profileSaving} className="w-full py-3 rounded-2xl bg-[#00E5FF] text-slate-900 font-black text-sm disabled:opacity-60">
              {profileSaving ? t('courier.settingsTab.saving', 'جاري الحفظ...') : t('courier.settingsTab.saveProfile', 'حفظ البيانات')}
            </button>
          </form>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <p className="text-xs text-slate-500 font-black">{t('courier.settingsTab.serverState', 'حالة السيرفر')}</p>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-300">
                {stateLoading
                  ? t('courier.settingsTab.syncing', 'جاري المزامنة...')
                  : t('courier.settingsTab.availableLabel', 'متاح: {{value}}').replace('{{value}}', typeof lastState?.isAvailable === 'boolean' ? (lastState.isAvailable ? t('courier.common.yes', 'نعم') : t('courier.common.no', 'لا')) : t('courier.common.unknown', 'مجهول'))}
              </div>
              <button type="button" onClick={onSyncState} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-black">
                <RefreshCw size={14} className={stateLoading ? 'animate-spin' : ''} /> {t('courier.common.sync', 'مزامنة')}
              </button>
            </div>
            {lastState?.lastSeenAt && <div className="text-[11px] text-slate-500 font-bold">{t('courier.settingsTab.lastSeen', 'آخر ظهور')}: {new Date(lastState.lastSeenAt).toLocaleString('ar-EG')}</div>}
          </div>
        </div>

        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-4 space-y-4">
          <p className="text-xs text-slate-500 font-black">{t('courier.settingsTab.autoUpdate', 'التحديث التلقائي')}</p>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-black">{t('courier.settingsTab.availableForOrders', 'متاح للطلبات')}</span>
            <input type="checkbox" checked={!!isAvailable} onChange={e => onIsAvailableChange?.(Boolean(e.target.checked))} className="w-5 h-5" />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-black">{t('courier.settingsTab.shareLocation', 'مشاركة الموقع')}</span>
            <input type="checkbox" checked={!!shareLocation} onChange={e => onShareLocationChange?.(Boolean(e.target.checked))} className="w-5 h-5" />
          </label>

          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-200">{t('courier.settingsTab.gpsStatus', 'حالة GPS')}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">
                  {geoStatus === 'unsupported' ? t('courier.settingsTab.gpsUnsupported', 'غير مدعوم') : geoStatus === 'blocked' ? t('courier.settingsTab.gpsBlocked', 'محظور') : geoStatus === 'ok' ? t('courier.settingsTab.gpsWorking', 'يعمل') : t('courier.common.unknown', 'مجهول')}
                  {geoLastFixAt ? ` • ${t('courier.settingsTab.lastUpdate', 'آخر تحديث')}: ${new Date(geoLastFixAt).toLocaleTimeString('ar-EG')}` : ''}
                </p>
              </div>
              <button type="button" onClick={onUpdateLocationOnce} className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 text-xs font-black">
                <Navigation size={14} /> {t('courier.settingsTab.updateLocation', 'تحديث الموقع')}
              </button>
            </div>
          </div>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-black">{t('courier.settingsTab.enableAutoRefresh', 'تحديث تلقائي')}</span>
            <input type="checkbox" checked={!!autoRefresh} onChange={e => onAutoRefreshChange?.(Boolean(e.target.checked))} className="w-5 h-5" />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-black">{t('courier.settingsTab.everySeconds', 'كل (ثانية)')}</span>
            <select value={String(refreshSeconds || '')} disabled={!autoRefresh} onChange={e => onRefreshSecondsChange?.(Number(e.target.value))} className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm font-black disabled:opacity-50">
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="120">120</option>
            </select>
          </label>

          <button type="button" onClick={onOpenOrdersNow} className="w-full mt-2 py-3 rounded-2xl bg-[#00E5FF] text-slate-900 font-black text-sm">
            {t('courier.settingsTab.openOrdersNow', 'فتح الطلبات الآن')}
          </button>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500 font-black mb-3">{t('courier.settingsTab.changePassword', 'تغيير كلمة المرور')}</p>
            <form onSubmit={onChangePassword} className="space-y-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">{t('courier.settingsTab.currentPassword', 'كلمة المرور الحالية')}</label>
                <div className="relative">
                  <input type={showCurrentPassword ? 'text' : 'password'} value={String(currentPassword || '')} onChange={e => onCurrentPasswordChange?.(e.target.value)} disabled={!!passwordSaving} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 pr-10 pl-10 text-sm font-black text-right outline-none focus:border-[#00E5FF]/50 disabled:opacity-60" placeholder={t('courier.settingsTab.currentPasswordPlaceholder', 'كلمة المرور الحالية')} />
                  <button type="button" onClick={() => onShowCurrentPasswordChange?.(!showCurrentPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">{t('courier.settingsTab.newPassword', 'كلمة المرور الجديدة')}</label>
                <div className="relative">
                  <input type={showNewPassword ? 'text' : 'password'} value={String(newPassword || '')} onChange={e => onNewPasswordChange?.(e.target.value)} disabled={!!passwordSaving} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 pr-10 pl-10 text-sm font-black text-right outline-none focus:border-[#00E5FF]/50 disabled:opacity-60" placeholder={t('courier.settingsTab.newPasswordPlaceholder', 'كلمة المرور الجديدة')} />
                  <button type="button" onClick={() => onShowNewPasswordChange?.(!showNewPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">{t('courier.settingsTab.confirmNewPassword', 'تأكيد كلمة المرور')}</label>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} value={String(confirmNewPassword || '')} onChange={e => onConfirmNewPasswordChange?.(e.target.value)} disabled={!!passwordSaving} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 pr-10 pl-10 text-sm font-black text-right outline-none focus:border-[#00E5FF]/50 disabled:opacity-60" placeholder={t('courier.settingsTab.confirmNewPasswordPlaceholder', 'أعد كتابة كلمة المرور')} />
                  <button type="button" onClick={() => onShowConfirmPasswordChange?.(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={!!passwordSaving} className="w-full py-3 rounded-2xl bg-white text-slate-900 font-black text-sm disabled:opacity-60">
                {passwordSaving ? t('courier.settingsTab.changing', 'جاري التغيير...') : t('courier.settingsTab.changePasswordAction', 'تغيير كلمة المرور')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierSettingsTab;
