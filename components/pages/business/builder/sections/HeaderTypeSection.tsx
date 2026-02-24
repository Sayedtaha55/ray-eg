import React from 'react';
import SmartImage from '@/components/common/ui/SmartImage';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  logoDataUrl: string;
  setLogoDataUrl: React.Dispatch<React.SetStateAction<string>>;
  logoFile: File | null;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  logoSaving: boolean;
  onSaveLogo: () => void;
};

const HeaderTypeSection: React.FC<Props> = ({
  config,
  setConfig,
  logoDataUrl,
  setLogoDataUrl,
  logoFile,
  setLogoFile,
  logoSaving,
  onSaveLogo,
}) => (
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
            <SmartImage
              src={logoDataUrl}
              alt="logo"
              className="w-full h-full"
              imgClassName="object-cover"
              loading="eager"
              fetchPriority="high"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-xs">LOGO</div>
          )}
        </label>
        <div className="flex-1 flex flex-col gap-3">
          <button
            type="button"
            onClick={onSaveLogo}
            disabled={logoSaving || !logoFile}
            className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all disabled:opacity-60 disabled:pointer-events-none"
          >
            {logoSaving ? 'جاري حفظ اللوجو...' : 'حفظ اللوجو'}
          </button>
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
              try {
                setConfig({ ...config, logoUrl: '' });
              } catch {
              }
            }}
            className="w-full py-4 bg-slate-50 text-slate-500 rounded-[1.5rem] font-black text-sm hover:bg-slate-100 transition-all"
          >
            حذف الصورة
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default HeaderTypeSection;
