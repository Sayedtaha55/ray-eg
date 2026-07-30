import { Metadata } from 'next';
import { Globe, Plus, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { getDomains } from '@/lib/platform/services';

export const metadata: Metadata = {
  title: 'إدارة النطاقات',
  robots: { index: false, follow: false },
};

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  active: { icon: CheckCircle, color: 'text-green-500', label: 'نشط' },
  verified: { icon: CheckCircle, color: 'text-green-500', label: 'مؤكد' },
  pending: { icon: Clock, color: 'text-amber-500', label: 'قيد الانتظار' },
  verifying: { icon: Clock, color: 'text-amber-500', label: 'جاري التحقق' },
  failed: { icon: AlertCircle, color: 'text-red-500', label: 'فشل' },
  'ssl-pending': { icon: Clock, color: 'text-amber-500', label: 'SSL قيد الإصدار' },
};

export default async function BuilderDomainsPage() {
  let domains: any[] = [];
  try {
    domains = await getDomains('current');
  } catch {
    domains = [];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-black py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">إدارة النطاقات</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-2">اربط نطاق مخصص بموقعك</p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-gradient text-white font-black text-sm hover:shadow-glow-cyan transition-all">
            <Plus className="w-5 h-5" />
            نطاق جديد
          </button>
        </div>

        {/* Domains List */}
        {domains.length > 0 ? (
          <div className="space-y-4">
            {domains.map((domain) => {
              const status = statusConfig[domain.status] || statusConfig.pending;
              return (
                <div key={domain.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-black text-sm" dir="ltr">{domain.domain}</p>
                        <p className="text-xs text-slate-400 font-bold mt-0.5">
                          {domain.isCustom ? 'نطاق مخصص' : 'نطاق فرعي'}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-black ${status.color}`}>
                      <status.icon className="w-4 h-4" />
                      {status.label}
                    </div>
                  </div>

                  {domain.status === 'pending' && domain.dnsRecords && (
                    <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-3">سجلات DNS المطلوبة:</p>
                      <div className="space-y-2">
                        {domain.dnsRecords.map((record: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 text-xs font-bold">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black">{record.type}</span>
                            <span className="text-slate-500" dir="ltr">{record.host}</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-slate-600 dark:text-slate-300" dir="ltr">{record.value}</span>
                            {record.verified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <button className="text-xs font-black text-brand-cyan hover:underline">تحقق</button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button className="text-xs font-black text-red-500 hover:underline">حذف</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="font-black text-lg mb-2">لا توجد نطاقات</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-6">اربط نطاقك المخصص أو استخدم نطاق فرعي مجاني</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-gradient text-white font-black text-sm hover:shadow-glow-cyan transition-all">
              <Plus className="w-5 h-5" />
              إضافة نطاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
