import React, { useState } from 'react';
import { Zap, Plus, X, Bot, Play, Pause, Settings, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = { shopId: string; shop?: any };

type Automation = { id: string; name: string; trigger: string; action: string; status: 'active' | 'paused' | 'draft'; runs: number; lastRun: string };

const STATUS_STYLES: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  active: { ar: 'نشط', en: 'Active', color: 'text-green-600', bg: 'bg-green-100' },
  paused: { ar: 'متوقف', en: 'Paused', color: 'text-amber-600', bg: 'bg-amber-100' },
  draft: { ar: 'مسودة', en: 'Draft', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const AutomationsPage: React.FC<Props> = ({ shopId, shop }) => {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [showModal, setShowModal] = useState(false);
  const [automations, setAutomations] = useState<Automation[]>([
    { id: '1', name: isArabic ? 'رسالة ترحيب للعملاء الجدد' : 'Welcome new customers', trigger: isArabic ? 'عميل جديد' : 'New customer', action: isArabic ? 'إرسال رسالة ترحيب' : 'Send welcome message', status: 'active', runs: 234, lastRun: '2026-07-28' },
    { id: '2', name: isArabic ? 'تذكير السلة المتروكة' : 'Abandoned cart reminder', trigger: isArabic ? 'سلة متروكة 24 ساعة' : 'Cart abandoned 24h', action: isArabic ? 'إرسال إيميل تذكير' : 'Send reminder email', status: 'active', runs: 89, lastRun: '2026-07-28' },
    { id: '3', name: isArabic ? 'إعادة طلب المخزون' : 'Auto reorder stock', trigger: isArabic ? 'مخزون أقل من 10' : 'Stock below 10', action: isArabic ? 'تنبيه المدير' : 'Alert manager', status: 'paused', runs: 45, lastRun: '2026-07-25' },
    { id: '4', name: isArabic ? 'عرض عيد ميلاد' : 'Birthday offer', trigger: isArabic ? 'عيد ميلاد عميل' : 'Customer birthday', action: isArabic ? 'إرسال كوبون خصم' : 'Send discount coupon', status: 'draft', runs: 0, lastRun: '---' },
  ]);

  return (
    <div className="bg-white p-4 sm:p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white"><Zap size={24} /></div>
          <div><h3 className="text-xl sm:text-2xl md:text-3xl font-black">{isArabic ? 'الأتمتة' : 'Automations'}</h3><p className="mt-1 text-xs sm:text-sm font-bold text-slate-400">{isArabic ? 'أتمتة المهام المتكررة' : 'Automate repetitive tasks'}</p></div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors"><Plus size={18} /> {isArabic ? 'أتمتة جديدة' : 'New Automation'}</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: isArabic ? 'إجمالي الأتمتة' : 'Total Automations', value: automations.length, color: 'bg-blue-50 text-blue-600' },
          { label: isArabic ? 'نشطة' : 'Active', value: automations.filter(a => a.status === 'active').length, color: 'bg-green-50 text-green-600' },
          { label: isArabic ? 'متوقفة' : 'Paused', value: automations.filter(a => a.status === 'paused').length, color: 'bg-amber-50 text-amber-600' },
          { label: isArabic ? 'إجمالي التشغيل' : 'Total Runs', value: automations.reduce((s, a) => s + a.runs, 0), color: 'bg-purple-50 text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100">
            <div className={`p-2 rounded-xl ${s.color}`}><Zap size={20} /></div>
            <div><p className="text-xs font-bold text-slate-400">{s.label}</p><p className="text-lg font-black">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {automations.map((a) => {
          const st = STATUS_STYLES[a.status] || STATUS_STYLES.draft;
          return (
            <div key={a.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><Bot size={20} /></div>
                  <div>
                    <p className="font-bold text-sm">{a.name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{isArabic ? 'عند' : 'When'}: {a.trigger}</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-600">{isArabic ? 'فعل' : 'Do'}: {a.action}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10} /> {a.runs} {isArabic ? 'تشغيل' : 'runs'}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${st.bg} ${st.color}`}>{isArabic ? st.ar : st.en}</span>
                  {a.status === 'active' ? <Pause size={16} className="text-slate-400 hover:text-amber-500 cursor-pointer" /> : <Play size={16} className="text-slate-400 hover:text-green-500 cursor-pointer" />}
                  <Settings size={16} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h4 className="text-lg font-black">{isArabic ? 'أتمتة جديدة' : 'New Automation'}</h4><button onClick={() => setShowModal(false)}><X size={20} className="text-slate-400" /></button></div>
            <div className="space-y-3">
              <input placeholder={isArabic ? 'اسم الأتمتة' : 'Automation name'} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <div><label className="text-xs font-bold text-slate-400">{isArabic ? 'المحفز (عند)' : 'Trigger (When)'}</label><input placeholder={isArabic ? 'مثال: عميل جديد' : 'e.g. New customer'} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <div><label className="text-xs font-bold text-slate-400">{isArabic ? 'الإجراء (فعل)' : 'Action (Do)'}</label><input placeholder={isArabic ? 'مثال: إرسال رسالة' : 'e.g. Send message'} className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2"><Zap size={16} /> {isArabic ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationsPage;
