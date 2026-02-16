import React from 'react';
import { Check } from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  backgroundFile: File | null;
  setBackgroundFile: React.Dispatch<React.SetStateAction<File | null>>;
  backgroundPreview: string;
  setBackgroundPreview: React.Dispatch<React.SetStateAction<string>>;
};

const BACKGROUNDS = ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#0F172A', '#111827', '#FAFAFA', '#FFF7ED', '#F0FDFA', '#FDF2F8', '#ECFEFF'];

const BACKGROUND_PRESETS: { id: string; label: string; url: string }[] = [
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

const BackgroundSection: React.FC<Props> = ({
  config,
  setConfig,
  backgroundFile,
  setBackgroundFile,
  backgroundPreview,
  setBackgroundPreview,
}) => {
  const selectedBackgroundColor = config.pageBackgroundColor || config.backgroundColor;
  const selectedBackgroundImageUrl = String((config as any)?.backgroundImageUrl || '');
  const hasAnyBackgroundImage = Boolean(backgroundPreview || selectedBackgroundImageUrl);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-black text-sm">صورة خلفية</span>
          <button
            type="button"
            onClick={() => {
              if (backgroundPreview && backgroundPreview.startsWith('blob:')) {
                URL.revokeObjectURL(backgroundPreview);
              }
              setBackgroundFile(null);
              setBackgroundPreview('');
              setConfig({ ...config, backgroundImageUrl: '' });
            }}
            className="text-xs font-black text-slate-500 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2"
            disabled={!hasAnyBackgroundImage}
          >
            حذف خلفية
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {BACKGROUND_PRESETS.map((p) => {
            const active = !backgroundPreview && selectedBackgroundImageUrl === p.url;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (backgroundPreview && backgroundPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(backgroundPreview);
                  }
                  setBackgroundFile(null);
                  setBackgroundPreview('');
                  setConfig({ ...config, backgroundImageUrl: p.url });
                }}
                className={`h-16 rounded-2xl border overflow-hidden relative transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.98] ${active ? 'ring-2 ring-slate-200 border-white shadow-lg' : 'border-slate-100 hover:shadow-sm'}`}
              >
                <SmartImage
                  src={p.url}
                  alt={p.label}
                  className="absolute inset-0 w-full h-full"
                  imgClassName="object-cover"
                  loading="lazy"
                />
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

              if (backgroundPreview && backgroundPreview.startsWith('blob:')) {
                URL.revokeObjectURL(backgroundPreview);
              }

              setBackgroundFile(file);
              const url = URL.createObjectURL(file);
              setBackgroundPreview(url);
            }}
            className="hidden"
            id="background-upload"
          />
          <label
            htmlFor="background-upload"
            className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold outline-none border border-slate-100 text-right cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between"
          >
            <span className="text-slate-400">{backgroundFile ? backgroundFile.name : 'رفع صورة خلفية من الجهاز'}</span>
            <span className="text-slate-500 text-xs font-black">UPLOAD</span>
          </label>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="space-y-2">
        <span className="font-black text-sm">لون الخلفية</span>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right">اختيار لون</label>
          <input
            type="color"
            value={String(selectedBackgroundColor || '#FFFFFF')}
            onChange={(e) => setConfig({ ...config, pageBackgroundColor: e.target.value, backgroundColor: e.target.value })}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white"
          />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {BACKGROUNDS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setConfig({ ...config, pageBackgroundColor: color, backgroundColor: color })}
              className={`aspect-square rounded-xl border-2 transition-all relative hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:ring-offset-2 active:scale-[0.98] ${selectedBackgroundColor === color ? 'scale-110 shadow-lg border-white ring-2 ring-slate-200' : 'border-transparent opacity-60'}`}
              style={{ backgroundColor: color }}
            >
              {selectedBackgroundColor === color && <Check className="w-4 h-4 text-slate-900 mx-auto" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BackgroundSection;
