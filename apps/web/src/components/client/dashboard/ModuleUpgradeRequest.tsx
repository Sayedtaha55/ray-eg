'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';
import * as merchantApi from '@/lib/api/merchant';
import { useToast } from '@/lib/hooks/useToast';
import { useT } from '@/i18n/useT';
import { useLocale } from '@/i18n/LocaleProvider';
import { MerchantDashboardTabId } from '@/lib/dashboard/activity-config';

type Props = {
  moduleId: MerchantDashboardTabId;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  onRequested?: () => void;
};

const ModuleUpgradeRequest: React.FC<Props> = ({ moduleId, icon, title, description, onRequested }) => {
  const t = useT();
  const { dir } = useLocale();
  const toast = useToast();
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleRequestUpgrade = async () => {
    setRequesting(true);
    try {
      await merchantApi.merchantCreateModuleUpgradeRequest({ requestedModules: [moduleId] });
      setRequestSent(true);
      toast.addToast(t('business.modules.requestSent', 'تم إرسال طلب الترقية'), undefined, 'success');
      onRequested?.();
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.includes('already') || msg.includes('بالفعل') || msg.includes('pending') || msg.includes('PENDING')) {
        setRequestSent(true);
        toast.addToast(t('business.modules.requestAlreadySent', 'تم إرسال الطلب بالفعل'), undefined, 'success');
      } else {
        toast.addToast(msg || t('business.modules.requestFailed', 'فشل إرسال الطلب'), undefined, 'destructive');
      }
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 py-16" dir={dir}>
      <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-400">
        {icon || <Lock size={36} />}
      </div>
      <h2 className="text-2xl font-black text-slate-900 text-center">{title}</h2>
      {description && (
        <p className="text-sm font-bold text-slate-500 text-center max-w-md">{description}</p>
      )}
      {requestSent ? (
        <div className="flex items-center gap-3 px-6 py-4 rounded-[2rem] bg-emerald-50 border border-emerald-200">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <span className="font-black text-emerald-700 text-sm">{t('business.modules.requestSentMsg', 'تم إرسال طلب التفعيل للأدمن. سيتم تفعيل الميزة بعد الموافقة.')}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleRequestUpgrade}
          disabled={requesting}
          className="px-8 py-4 rounded-[2rem] bg-slate-900 text-white font-black text-sm hover:bg-black transition-all disabled:opacity-60 flex items-center gap-3"
        >
          {requesting ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} className="text-amber-400" />}
          {requesting ? t('common.loading', 'جاري التحميل...') : t('business.modules.requestActivation', 'طلب تفعيل الميزة')}
        </button>
      )}
    </div>
  );
};

export default ModuleUpgradeRequest;
