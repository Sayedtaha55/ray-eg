import React from 'react';
import { X } from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';

interface AdditionalImagesSectionProps {
  extraImagePreviews: string[];
  extraFilesInputRef: React.RefObject<HTMLInputElement>;
  handleExtraImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setExtraImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setExtraImageUploadFiles: React.Dispatch<React.SetStateAction<File[]>>;
  imageUrl?: string;
}

const AdditionalImagesSection: React.FC<AdditionalImagesSectionProps> = ({
  extraImagePreviews,
  extraFilesInputRef,
  handleExtraImagesChange,
  setExtraImagePreviews,
  setExtraImageUploadFiles
}) => {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">صور إضافية (اختياري)</label>
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => extraFilesInputRef.current?.click()}
          className="w-full py-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem] font-black text-slate-500 hover:border-[#00E5FF]/40 hover:bg-white transition-all"
        >
          إضافة صور (حد أقصى 5)
        </button>
        <input
          type="file"
          hidden
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          ref={extraFilesInputRef}
          onChange={handleExtraImagesChange}
        />

        {extraImagePreviews.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {extraImagePreviews.map((p, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100">
                <SmartImage src={p} className="w-full h-full" imgClassName="object-cover" loading="lazy" />
                <button
                  type="button"
                  onClick={() => {
                    const isBlob = typeof p === 'string' && p.startsWith('blob:');
                    if (isBlob) {
                      try {
                        URL.revokeObjectURL(p);
                      } catch {}
                    }

                    setExtraImagePreviews((prev) => prev.filter((_, i) => i !== idx));

                    if (isBlob) {
                      const blobIndex = extraImagePreviews
                        .slice(0, idx + 1)
                        .filter((x) => typeof x === 'string' && x.startsWith('blob:')).length - 1;
                      if (blobIndex >= 0) {
                        setExtraImageUploadFiles((prev) => prev.filter((_, i) => i !== blobIndex));
                      }
                    }
                  }}
                  className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 border border-slate-100 flex items-center justify-center shadow-sm hover:bg-white"
                  aria-label="remove"
                >
                  <X size={16} className="text-slate-700" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdditionalImagesSection;
