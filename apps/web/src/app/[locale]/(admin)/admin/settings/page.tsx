'use client';

import { useState } from 'react';
import { Settings, Shield, Globe, Save, RefreshCw, Play, AlertTriangle, Loader2 } from 'lucide-react';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { adminUpgradeDashboardConfig } from '@/lib/api/admin';

export default function AdminSettingsPage() {
  const t = useT();
  const { dir } = useLocale();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<any>(null);

  const runUpgrade = async (dryRun: boolean) => {
    setUpgradeLoading(true);
    try {
      const res = await adminUpgradeDashboardConfig({ dryRun });
      setUpgradeResult(res);
    } catch (e: any) {
      alert(String(e?.message || t('admin.settings.upgradeFailed', 'فشل التحديث')));
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl" dir={dir}>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">{t('admin.settings.title', 'الإعدادات')}</h2>
          <p className="text-slate-500 text-sm font-bold">{t('admin.settings.subtitle', 'إعدادات المنصة')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Upgrade Dashboard Config */}
        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse">
            <RefreshCw size={20} className="text-[#00E5FF]" />
            {t('admin.settings.upgradeDashboardConfig', 'تحديث إعدادات لوحة التحكم')}
          </h3>
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 flex-row-reverse">
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <div className="text-right">
              <p className="text-amber-200 font-bold text-sm">{t('admin.settings.upgradeSafe1', 'هذا الإجراء آمن – لن يحذف بيانات')}</p>
              <p className="text-amber-200/70 font-bold text-xs mt-1">{t('admin.settings.upgradeSafe2', 'يُنصح بتجربة جافة أولاً')}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              disabled={upgradeLoading}
              onClick={() => runUpgrade(true)}
              className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Play size={18} />
              {t('admin.settings.dryRun', 'تجربة جافة')}
            </button>
            <button
              disabled={upgradeLoading}
              onClick={() => {
                if (!confirm(t('admin.settings.confirmUpgrade', 'هل أنت متأكد من تنفيذ التحديث؟'))) return;
                runUpgrade(false);
              }}
              className="flex-1 py-4 bg-[#00E5FF] text-black rounded-2xl font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              {t('admin.settings.executeUpgrade', 'تنفيذ التحديث')}
            </button>
          </div>

          {upgradeResult && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</div>
                  <div className="text-2xl font-black text-white">{Number(upgradeResult?.total ?? 0)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updated</div>
                  <div className="text-2xl font-black text-white">{Number(upgradeResult?.updated ?? 0)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dry Run</div>
                  <div className="text-2xl font-black text-white">{String(Boolean(upgradeResult?.dryRun))}</div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Content Settings */}
        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse">
            <Globe size={20} className="text-[#00E5FF]" />
            {t('admin.settings.contentSettings', 'إعدادات المحتوى')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-4">
                {t('admin.settings.platformName', 'اسم المنصة')}
              </label>
              <input
                className="w-full bg-slate-800 border-none rounded-xl py-4 px-6 text-white font-bold outline-none"
                defaultValue={t('admin.settings.defaultPlatformName', 'من مكانك')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-4">
                {t('admin.settings.defaultLanguage', 'اللغة الافتراضية')}
              </label>
              <select className="w-full bg-slate-800 border-none rounded-xl py-4 px-6 text-white font-bold outline-none appearance-none">
                <option>{t('admin.settings.arabicEgypt', 'العربية – مصر')}</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse">
            <Shield size={20} className="text-red-500" />
            {t('admin.settings.security', 'الأمان')}
          </h3>
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl">
            <div className="text-right">
              <p className="text-white font-bold">{t('admin.settings.enable2fa', 'تفعيل المصادقة الثنائية')}</p>
              <p className="text-slate-500 text-xs">{t('admin.settings.enable2faDesc', 'حماية إضافية لحساب المسؤول')}</p>
            </div>
            <div className="w-12 h-6 bg-[#00E5FF] rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full translate-x-6" />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button className="w-full py-6 bg-[#00E5FF] text-black rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3">
          <Save size={24} />
          {t('admin.settings.saveChanges', 'حفظ التغييرات')}
        </button>
      </div>
    </div>
  );
}
