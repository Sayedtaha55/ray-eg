'use client';

import React, { useState } from 'react';
import { Settings, Shield, Globe, Save, RefreshCw, Play, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/auth';
import { useToast } from '@/components/settings/ToastProvider';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [platformName, setPlatformName] = useState('منصة نمّي أعمالك');
  const [defaultLanguage, setDefaultLanguage] = useState('ar-EG');
  const [enable2fa, setEnable2fa] = useState(false);

  const runUpgrade = async (dryRun: boolean) => {
    setUpgradeLoading(true);
    try {
      const res = await apiRequest('/admin/upgrade-dashboard-config', {
        method: 'POST',
        body: JSON.stringify({ dryRun }),
      });
      setUpgradeResult(res);
      toast({ title: dryRun ? 'تم التشغيل التجريبي بنجاح' : 'تم الترقية بنجاح', variant: 'success' });
    } catch (e: any) {
      toast({ title: String(e?.message || 'فشل الترقية'), variant: 'destructive' });
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ platformName, defaultLanguage, enable2fa }),
      });
      toast({ title: 'تم حفظ الإعدادات', variant: 'success' });
    } catch (e: any) {
      toast({ title: e?.message || 'فشل الحفظ', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">الإعدادات</h2>
          <p className="text-slate-500 text-sm font-bold">إعدادات النظام والمنصة</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Upgrade Dashboard Config */}
        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse">
            <RefreshCw size={20} className="text-[#00E5FF]" />
            ترقية إعدادات اللوحات
          </h3>
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 flex-row-reverse">
            <AlertTriangle size={20} className="text-amber-400 shrink-0" />
            <div className="text-right">
              <p className="text-amber-200 font-bold text-sm">الترقية آمنة ولا تؤثر على البيانات الحالية.</p>
              <p className="text-amber-200/70 font-bold text-xs mt-1">يُنصح بتشغيل التجربة أولاً قبل التنفيذ الفعلي.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              disabled={upgradeLoading}
              onClick={() => runUpgrade(true)}
              className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Play size={18} />
              تشغيل تجريبي
            </button>
            <button
              disabled={upgradeLoading}
              onClick={() => {
                if (!confirm('هل أنت متأكد من تنفيذ الترقية؟')) return;
                runUpgrade(false);
              }}
              className="flex-1 py-4 bg-[#00E5FF] text-black rounded-2xl font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw size={18} />
              تنفيذ الترقية
            </button>
          </div>

          {upgradeResult && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-right">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الإجمالي</div>
                  <div className="text-2xl font-black text-white">{Number(upgradeResult?.total ?? 0)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تم تحديثه</div>
                  <div className="text-2xl font-black text-white">{Number(upgradeResult?.updated ?? 0)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تجريبي</div>
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
            إعدادات المحتوى
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-4">اسم المنصة</label>
              <input
                className="w-full bg-slate-800 border-none rounded-xl py-4 px-6 text-white font-bold outline-none focus:ring-2 focus:ring-[#00E5FF]/30"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-4">اللغة الافتراضية</label>
              <select
                className="w-full bg-slate-800 border-none rounded-xl py-4 px-6 text-white font-bold outline-none appearance-none"
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
              >
                <option value="ar-EG">العربية (مصر)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse">
            <Shield size={20} className="text-red-500" />
            الأمان
          </h3>
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl">
            <div className="text-right">
              <p className="text-white font-bold">تفعيل المصادقة الثنائية (2FA)</p>
              <p className="text-slate-500 text-xs">إضافة طبقة حماية إضافية لحسابات الأدمن</p>
            </div>
            <button
              onClick={() => setEnable2fa(!enable2fa)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${enable2fa ? 'bg-[#00E5FF]' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enable2fa ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-6 bg-[#00E5FF] text-black rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-60"
        >
          <Save size={24} /> {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>
    </div>
  );
}
