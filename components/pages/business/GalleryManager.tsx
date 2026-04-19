import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, Plus, Trash2, Image as ImageIcon, 
  Eye, Edit2, Save, Camera, Sparkles, AlertCircle
} from 'lucide-react';
import { ShopGallery } from '@/types';
import { useToast } from '@/components/common/feedback/Toaster';
import { ApiService } from '@/services/api.service';
import { useSmartRefreshListener } from '@/hooks/useSmartRefresh';
import { useTranslation } from 'react-i18next';

interface GalleryManagerProps {
  shopId: string;
  images: ShopGallery[];
  onImagesChange: (images: ShopGallery[]) => void;
  primaryColor: string;
}

const GalleryManager: React.FC<GalleryManagerProps> = ({ 
  shopId, 
  images, 
  onImagesChange, 
  primaryColor 
}) => {
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const { t } = useTranslation();

  const refreshFromBackend = useCallback(async () => {
    try {
      const next = await ApiService.getShopGallery(shopId);
      onImagesChange(next || []);
    } catch {
    }
  }, [onImagesChange, shopId]);

  // Smart event-driven refresh
  useSmartRefreshListener(['shop', 'all'], () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    if (uploading) return;
    refreshFromBackend();
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: ShopGallery[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        try {
          // Upload to backend
          const result = await ApiService.addShopGalleryImage(shopId, {
            file,
            caption: ''
          });
          
          if (!result.error) {
            // Create temporary preview URL
            const previewUrl = URL.createObjectURL(file);

            const newImage: ShopGallery = {
              id: result.id || `temp_${Date.now()}_${i}`,
              shopId,
              imageUrl: result.imageUrl || previewUrl,
              mediaType: result.mediaType,
              thumbUrl: result.thumbUrl,
              mediumUrl: result.mediumUrl,
              caption: result.caption || '',
              createdAt: result.createdAt || Date.now()
            };

            newImages.push(newImage);
          }
        } catch (error) {
          console.error('Upload failed:', error);
          addToast(t('business.gallery.uploadFailed'), 'error');
        }
      }
    }

    if (newImages.length > 0) {
      // Refresh gallery from backend
      setTimeout(() => {
        ApiService.getShopGallery(shopId).then(images => {
          onImagesChange(images || []);
        });
      }, 1000);
      
      addToast(t('business.gallery.filesAdded', { count: newImages.length }), 'success');
    } else {
      addToast(t('business.gallery.imagesOrVideoOnly'), 'error');
    }

    setUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm(t('business.gallery.confirmDelete'))) return;
    
    try {
      await ApiService.deleteShopGalleryImage(imageId);
      addToast(t('business.gallery.imageDeleted'), 'success');
      
      // Refresh gallery from backend
      setTimeout(() => {
        ApiService.getShopGallery(shopId).then(images => {
          onImagesChange(images || []);
        });
      }, 500);
    } catch (error) {
      addToast(t('business.gallery.deleteFailed'), 'error');
    }
  };

  const handleSaveCaption = (imageId: string) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, caption } : img
    );
    onImagesChange(updatedImages);
    setEditingImage(null);
    setCaption('');
    addToast(t('business.gallery.captionSaved'), 'success');
  };

  const handleAddFromUrl = () => {
    const url = prompt(t('business.gallery.enterImageUrl'));
    if (url && url.trim()) {
      const newImage: ShopGallery = {
        id: `url_${Date.now()}`,
        shopId,
        imageUrl: url.trim(),
        caption: '',
        createdAt: Date.now()
      };
      
      onImagesChange([...images, newImage]);
      addToast(t('business.gallery.imageAdded'), 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-3">
          <Camera className="text-[#00E5FF]" />
          {t('business.gallery.title')}
        </h3>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${
            dragActive 
              ? 'border-[#00E5FF] bg-[#00E5FF]/5' 
              : 'border-slate-200 hover:border-slate-300 bg-slate-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center ${
              dragActive ? 'bg-[#00E5FF] text-white' : 'bg-slate-200 text-slate-400'
            }`}>
              {uploading ? (
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload size={24} className="md:w-8 md:h-8" />
              )}
            </div>
            
            <div>
              <h4 className="text-lg md:text-xl font-black mb-2">
                {uploading ? t('business.gallery.uploading') : t('business.gallery.dragAndDrop')}
              </h4>
              <p className="text-slate-500 text-sm md:text-base mb-4">
                {t('business.gallery.orChooseFromDevice')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-black transition-all disabled:opacity-50"
                >
                  {t('business.gallery.chooseFiles')}
                </button>
                
                <button
                  onClick={handleAddFromUrl}
                  disabled={uploading}
                  className="px-6 py-3 border border-slate-200 rounded-xl font-black text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  {t('business.gallery.addFromUrl')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-right">
              <h4 className="font-black text-sm text-blue-900 mb-1">{t('business.gallery.importantTips')}</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• {t('business.gallery.tipResolution')}</li>
                <li>• {t('business.gallery.tipMaxSize')}</li>
                <li>• {t('business.gallery.tipFormats')}</li>
                <li>• {t('business.gallery.tipCaption')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg md:text-xl font-black">
              {t('business.gallery.addedImages', { count: images.length })}
            </h4>
            <div className="text-sm text-slate-500">
              {t('business.gallery.maxImages')}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img 
                    src={image.thumbUrl || image.imageUrl} 
                    alt={t('business.gallery.imageAlt', { num: index + 1 })}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                  <button
                    onClick={() => window.open(image.imageUrl, '_blank')}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white transition-all"
                    title={t('business.gallery.preview')}
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button
                    onClick={() => {
                      setEditingImage(image.id);
                      setCaption(image.caption || '');
                    }}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white transition-all"
                    title={t('business.gallery.editCaption')}
                  >
                    <Edit2 size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition-all"
                    title={t('business.gallery.delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Caption Editor */}
                <AnimatePresence>
                  {editingImage === image.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 bg-white rounded-xl p-3 flex flex-col"
                    >
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={t('business.gallery.captionPlaceholder')}
                        className="flex-1 p-2 text-xs border border-slate-200 rounded-lg resize-none outline-none focus:border-[#00E5FF]"
                        dir="rtl"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveCaption(image.id)}
                          className="flex-1 py-1.5 bg-[#00E5FF] text-white rounded-lg text-xs font-black"
                        >
                          {t('business.gallery.save')}
                        </button>
                        <button
                          onClick={() => {
                            setEditingImage(null);
                            setCaption('');
                          }}
                          className="flex-1 py-1.5 bg-slate-200 rounded-lg text-xs font-black"
                        >
                          {t('business.gallery.cancel')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Add More Button */}
          {images.length < 200 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl hover:border-[#00E5FF] hover:bg-[#00E5FF]/5 transition-all flex items-center justify-center gap-3"
            >
              <Plus size={20} className="text-slate-400" />
              <span className="font-black text-slate-400">{t('business.gallery.addMoreImages')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
