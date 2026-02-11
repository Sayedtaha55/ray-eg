import React from 'react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  headerBackgroundFile: File | null;
  setHeaderBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
  headerBackgroundPreview: string;
  setHeaderBackgroundPreview: React.Dispatch<React.SetStateAction<string>>;
};

const HEADER_BACKGROUND_PRESETS: { id: string; label: string; url: string }[] = [
  {
    id: 'mountains',
    label: 'جبال',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&auto=format&fit=crop',
  },
  {
    id: 'ice',
    label: 'ثلج',
    url: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1600&auto=format&fit=crop',
  },
  {
    id: 'forest',
    label: 'أشجار',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&auto=format&fit=crop',
  },
];

const HeaderFooterSection: React.FC<Props> = ({
  config,
  setConfig,
  headerBackgroundFile,
  setHeaderBackgroundFile,
  headerBackgroundPreview,
  setHeaderBackgroundPreview,
}) => (
  <div className="space-y-6">
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-black text-sm">أعلى العرض شفاف</span>
        <input
          type="checkbox"
          checked={Boolean(config.headerTransparent)}
          onChange={(e) => {
            const checked = e.target.checked;
            setConfig({ ...config, headerTransparent: checked, headerOpacity: checked ? 0 : config.headerOpacity });
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون الخلفية</label>
          <input
            type="color"
            value={String(config.headerBackgroundColor || '#FFFFFF')}
            onChange={(e) => setConfig({ ...config, headerBackgroundColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون النص</label>
          <input
            type="color"
            value={String(config.headerTextColor || '#0F172A')}
            onChange={(e) => setConfig({ ...config, headerTextColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">شفافية الخلفية</label>
        <input
          type="range"
          min={0}
          max={100}
          value={Number(config.headerOpacity ?? 60)}
          onChange={(e) => setConfig({ ...config, headerOpacity: Number(e.target.value) })}
          className="w-full"
          disabled={Boolean(config.headerTransparent)}
        />
      </div>

      <div className="h-px bg-slate-100" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">حذف الخلفية</span>
          <button
            type="button"
            onClick={() => {
              if (headerBackgroundPreview && headerBackgroundPreview.startsWith('blob:')) {
                URL.revokeObjectURL(headerBackgroundPreview);
              }
              setHeaderBackgroundFile(null);
              setHeaderBackgroundPreview('');
              setConfig({ ...config, headerBackgroundImageUrl: '' });
            }}
            className="text-xs font-black text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2"
            disabled={!Boolean(headerBackgroundPreview || (config as any)?.headerBackgroundImageUrl)}
          >
            حذف
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {HEADER_BACKGROUND_PRESETS.map((p) => {
            const active = !headerBackgroundPreview && String((config as any)?.headerBackgroundImageUrl || '') === p.url;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (headerBackgroundPreview && headerBackgroundPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(headerBackgroundPreview);
                  }
                  setHeaderBackgroundFile(null);
                  setHeaderBackgroundPreview('');
                  setConfig({ ...config, headerTransparent: false, headerBackgroundImageUrl: p.url });
                }}
                className={`h-16 rounded-2xl border overflow-hidden relative transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.98] ${active ? 'ring-2 ring-slate-200 border-white shadow-lg' : 'border-slate-100 hover:shadow-sm'}`}
              >
                <img src={p.url} alt={p.label} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute bottom-1 right-2 text-[10px] font-black text-white drop-shadow">{p.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (headerBackgroundPreview && headerBackgroundPreview.startsWith('blob:')) {
                URL.revokeObjectURL(headerBackgroundPreview);
              }

              setHeaderBackgroundFile(file);
              const url = URL.createObjectURL(file);
              setHeaderBackgroundPreview(url);
              setConfig({ ...config, headerTransparent: false, headerBackgroundImageUrl: '' });
            }}
            className="hidden"
            id="header-background-upload"
          />
          <label
            htmlFor="header-background-upload"
            className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold outline-none border border-slate-100 text-right cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between"
          >
            <span className="text-slate-400">{headerBackgroundFile ? headerBackgroundFile.name : 'رفع صورة خلفية للهيدر من الجهاز'}</span>
            <span className="text-slate-500 text-xs font-black">UPLOAD</span>
          </label>
        </div>
      </div>
    </div>

    <div className="h-px bg-slate-100" />

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-black text-sm">أسفل العرض شفاف</span>
        <input
          type="checkbox"
          checked={Boolean(config.footerTransparent)}
          onChange={(e) => {
            const checked = e.target.checked;
            setConfig({ ...config, footerTransparent: checked, footerOpacity: checked ? 0 : config.footerOpacity });
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون الخلفية</label>
          <input
            type="color"
            value={String(config.footerBackgroundColor || '#FFFFFF')}
            onChange={(e) => setConfig({ ...config, footerBackgroundColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">لون النص</label>
          <input
            type="color"
            value={String(config.footerTextColor || '#0F172A')}
            onChange={(e) => setConfig({ ...config, footerTextColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">شفافية الخلفية</label>
        <input
          type="range"
          min={0}
          max={100}
          value={Number(config.footerOpacity ?? 90)}
          onChange={(e) => setConfig({ ...config, footerOpacity: Number(e.target.value) })}
          className="w-full"
          disabled={Boolean(config.footerTransparent)}
        />
      </div>
    </div>
  </div>
);

export default HeaderFooterSection;
