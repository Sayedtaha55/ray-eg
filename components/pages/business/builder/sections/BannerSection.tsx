import React from 'react';
import { Layout, X } from 'lucide-react';

type Props = {
  config: any;
  setConfig: React.Dispatch<React.SetStateAction<any>>;
  bannerFile: File | null;
  setBannerFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerPreview: string;
  setBannerPreview: React.Dispatch<React.SetStateAction<string>>;
};

const BannerSection: React.FC<Props> = ({
  config,
  setConfig,
  bannerFile,
  setBannerFile,
  bannerPreview,
  setBannerPreview,
}) => (
  <div className="space-y-3">
    <div className="relative">
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setBannerFile(file);
            const url = URL.createObjectURL(file);
            setBannerPreview(url);
            // Don't store blob URL in config, only use it for preview
          }
        }}
        className="hidden"
        id="banner-upload"
      />
      <label
        htmlFor="banner-upload"
        className="w-full bg-slate-50 rounded-2xl py-4 px-5 font-bold outline-none border border-slate-100 text-right cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between"
      >
        <span className="text-slate-400">{bannerFile ? bannerFile.name : 'اختر صورة أو فيديو من الجهاز'}</span>
        <Layout size={20} className="text-slate-400" />
      </label>
    </div>

    {(bannerPreview || config.bannerUrl) && (
      <div className="relative rounded-2xl overflow-hidden bg-slate-100">
        {bannerFile && bannerFile.type.startsWith('video/') ? (
          <video src={bannerPreview || config.bannerUrl} className="w-full h-32 object-cover" controls />
        ) : (
          <img src={bannerPreview || config.bannerUrl} className="w-full h-32 object-cover" alt="Banner preview" />
        )}
        <button
          onClick={() => {
            setBannerFile(null);
            setBannerPreview('');
            setConfig({ ...config, bannerUrl: '' });
          }}
          className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <X size={16} />
        </button>
      </div>
    )}
  </div>
);

export default BannerSection;
