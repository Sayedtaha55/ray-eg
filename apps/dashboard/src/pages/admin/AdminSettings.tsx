
import React, { useState } from 'react';
import { Settings, Shield, Globe, Save, RefreshCw, Play, AlertTriangle } from 'lucide-react';
import { ApiService } from '@/services/api.service';
import { useToast } from '@/components/common/feedback/Toaster';
import { useTranslation } from 'react-i18next';

const AdminSettings: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<any>(null);
  const runUpgrade = async (dryRun: boolean) => {
    setUpgradeLoading(true);
    try {
      const res = await (ApiService as any).upgradeDashboardConfig?.({ dryRun });
      setUpgradeResult(res);
      addToast(dryRun ? t('admin.settings.dryRunSuccess') : t('admin.settings.upgradeSuccess'), 'success');
    } catch (e: any) {
      const msg = String(e?.message || t('admin.settings.upgradeFailed'));
      addToast(msg, 'error');
    } finally {
      setUpgradeLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">{t('admin.settings.title')}</h2>
          <p className="text-slate-500 text-sm font-bold">{t('admin.settings.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse">
            <RefreshCw size={20} className="text-[#00E5FF]" />
            {t('admin.settings.upgradeDashboardConfig')}
          </h3>
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 flex-row-reverse">
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <div className="text-right">
              <p className="text-amber-200 font-bold text-sm">{t('admin.settings.upgradeSafe1')}</p>
              <p className="text-amber-200/70 font-bold text-xs mt-1">{t('admin.settings.upgradeSafe2')}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              disabled={upgradeLoading}
              onClick={() => runUpgrade(true)}
              className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Play size={18} />
              {t('admin.settings.dryRun')}
            </button>
            <button
              disabled={upgradeLoading}
              onClick={() => {
                if (!confirm(t('admin.settings.confirmUpgrade'))) return;
                runUpgrade(false);
              }}
              className="flex-1 py-4 bg-[#00E5FF] text-black rounded-2xl font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              {t('admin.settings.executeUpgrade')}
            </button>
          </div>

          {upgradeResult ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</div>
                  <div className="text-2xl font-black text-white">{Number((upgradeResult as any)?.total ?? 0)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updated</div>
                  <div className="text-2xl font-black text-white">{Number((upgradeResult as any)?.updated ?? 0)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dry Run</div>
                  <div className="text-2xl font-black text-white">{String(Boolean((upgradeResult as any)?.dryRun))}</div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse"><Globe size={20} className="text-[#00E5FF]" /> {t('admin.settings.contentSettings')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-4">{t('admin.settings.platformName')}</label>
              <input className="w-full bg-slate-800 border-none rounded-xl py-4 px-6 text-white font-bold outline-none" defaultValue={t('admin.settings.defaultPlatformName')} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-4">{t('admin.settings.defaultLanguage')}</label>
              <select className="w-full bg-slate-800 border-none rounded-xl py-4 px-6 text-white font-bold outline-none appearance-none">
                <option>{t('admin.settings.arabicEgypt')}</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse"><Shield size={20} className="text-red-500" /> {t('admin.settings.security')}</h3>
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl">
            <div className="text-right">
              <p className="text-white font-bold">{t('admin.settings.enable2fa')}</p>
              <p className="text-slate-500 text-xs">{t('admin.settings.enable2faDesc')}</p>
            </div>
            <div className="w-12 h-6 bg-[#00E5FF] rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full translate-x-6" />
            </div>
          </div>
        </section>

        <button className="w-full py-6 bg-[#00E5FF] text-black rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3">
          <Save size={24} /> {t('admin.settings.saveChanges')}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
