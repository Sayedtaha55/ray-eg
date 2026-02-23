import React from 'react';

interface GalleryPreviewProps {
  config: any;
  shop: any;
  logoDataUrl: string;
}

const GalleryPreview: React.FC<GalleryPreviewProps> = ({ config }) => {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between flex-row-reverse">
        <h2 className="text-lg md:text-xl font-black text-slate-900">معرض الصور</h2>
        <span className="text-xs font-black text-slate-400">PREVIEW</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(GalleryPreview);
