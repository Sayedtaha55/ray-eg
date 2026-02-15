import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  logoDataUrl: string;
  setLogoDataUrl: React.Dispatch<React.SetStateAction<string>>;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
};

const HEADER_TYPES = [
  { id: 'centered', label: 'في المنتصف' },
  { id: 'side', label: 'يمين الصفحة' },
];

const HeaderTypeSection: React.FC<Props> = ({ config, setConfig, logoDataUrl, setLogoDataUrl, setLogoFile }) => (
  <div className="space-y-3">
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">لوجو المتجر</label>
      <div className="flex gap-4 items-center flex-row-reverse">
        <label
          className="w-28 h-28 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shrink-0 cursor-pointer"
        >
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (logoDataUrl && logoDataUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(logoDataUrl);
                }
              } catch {
              }
              setLogoFile(file);
              setLogoDataUrl(URL.createObjectURL(file));
            }}
          />
          {logoDataUrl ? (
            <img src={logoDataUrl} className="w-full h-full object-cover" alt="logo" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs">LOGO</div>
          )}
        </label>
        <div className="flex-1 flex flex-col gap-3">
          <label className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all cursor-pointer text-center">
            اختيار صورة من الجهاز
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (logoDataUrl && logoDataUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(logoDataUrl);
                  }
                } catch {
                }
                setLogoFile(file);
                setLogoDataUrl(URL.createObjectURL(file));
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              try {
                if (logoDataUrl && logoDataUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(logoDataUrl);
                }
              } catch {
              }
              setLogoFile(null);
              setLogoDataUrl('');
            }}
            className="w-full py-4 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-sm hover:bg-slate-100 transition-all"
          >
            حذف الصورة
          </button>
        </div>
      </div>
    </div>

    {HEADER_TYPES.map((item) => (
      <button
        key={item.id}
        onClick={() => setConfig({ ...config, headerType: item.id })}
        className={`w-full p-4 rounded-2xl border-2 text-right transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.99] ${String(config.headerType || 'centered') === item.id ? 'border-[#00E5FF] bg-cyan-50' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
      >
        <p className="font-black text-sm">{item.label}</p>
      </button>
    ))}
  </div>
);

export default HeaderTypeSection;
