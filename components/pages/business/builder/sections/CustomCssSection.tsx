import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
};

const CustomCssSection: React.FC<Props> = ({ config, setConfig }) => {
  const value = typeof config?.customCss === 'string' ? config.customCss : '';

  return (
    <div className="space-y-3">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block text-right">CSS مخصص (اختياري)</label>
      <textarea
        value={value}
        onChange={(e) => setConfig({ ...config, customCss: e.target.value })}
        className="w-full min-h-[180px] p-4 rounded-2xl border border-slate-100 bg-white text-right font-mono text-xs outline-none focus:border-[#00E5FF]"
        dir="ltr"
        placeholder={`#shop-profile-root h1 {\n  font-size: 32px;\n}\n\n#shop-profile-root .my-class {\n  opacity: 0.9;\n}`}
      />
      <p className="text-[11px] md:text-xs text-slate-500 font-bold leading-relaxed">
        يتم تطبيق الـ CSS داخل صفحة المتجر فقط.
      </p>
    </div>
  );
};

export default CustomCssSection;
