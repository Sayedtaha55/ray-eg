
import React from 'react';
import { Settings, Shield, Bell, Zap, Globe, Save } from 'lucide-react';

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">إعدادات النظام</h2>
          <p className="text-slate-500 text-sm font-bold">تخصيص القواعد العامة وبيئة عمل المنصة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse"><Globe size={20} className="text-[#00E5FF]" /> إعدادات المحتوى</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-4">اسم المنصة</label>
              <input className="w-full bg-slate-800 border-none rounded-xl py-4 px-6 text-white font-bold outline-none" defaultValue="Ray - منصة التجارة الذكية" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pr-4">لغة النظام الافتراضية</label>
              <select className="w-full bg-slate-800 border-none rounded-xl py-4 px-6 text-white font-bold outline-none appearance-none">
                <option>العربية (مصر)</option>
                <option>English</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3 flex-row-reverse"><Shield size={20} className="text-red-500" /> الحماية والآمان</h3>
          <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl">
            <div className="text-right">
              <p className="text-white font-bold">تفعيل التحقق بخطوتين للتجار</p>
              <p className="text-slate-500 text-xs">إضافة طبقة حماية إضافية عند سحب الأرباح.</p>
            </div>
            <div className="w-12 h-6 bg-[#00E5FF] rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full translate-x-6" />
            </div>
          </div>
        </section>

        <button className="w-full py-6 bg-[#00E5FF] text-black rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-3">
          <Save size={24} /> حفظ التغييرات الجذرية
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
