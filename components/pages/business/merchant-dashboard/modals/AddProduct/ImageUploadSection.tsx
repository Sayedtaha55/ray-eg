import React from 'react';
import { Upload } from 'lucide-react';
import SmartImage from '@/components/common/ui/SmartImage';

interface ImageUploadSectionProps {
  imagePreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRestaurant?: boolean;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  imagePreview,
  fileInputRef,
  handleImageChange,
  isRestaurant
}) => {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-4">صورة المنتج</label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`relative aspect-square md:aspect-video rounded-[2.5rem] border-4 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group ${
          imagePreview ? 'border-transparent' : 'border-slate-100 hover:border-[#00E5FF] hover:bg-cyan-50'
        }`}
      >
        {imagePreview ? (
          <>
            <SmartImage
              src={imagePreview}
              alt="preview"
              className="w-full h-full"
              imgClassName="object-contain sm:object-cover"
              loading="eager"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/90 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2">
                <Upload size={16} /> تغيير الصورة
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 group-hover:text-[#00E5FF] transition-colors">
              <Upload size={32} />
            </div>
            <p className="font-black text-slate-900 mb-1">اضغط لرفع صورة</p>
            <p className="text-xs text-slate-400 font-bold">JPG, PNG, WebP, AVIF</p>
          </div>
        )}
        <input 
          type="file" 
          hidden 
          accept="image/jpeg,image/png,image/webp,image/avif" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
        />
      </div>
    </div>
  );
};

export default ImageUploadSection;
