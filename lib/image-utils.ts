import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

export const compressImage = async (file: File, customOptions?: CompressionOptions) => {
  const options = {
    maxSizeMB: customOptions?.maxSizeMB || 0.4, 
    maxWidthOrHeight: customOptions?.maxWidthOrHeight || 1200,
    useWebWorker: true,
    fileType: customOptions?.fileType || 'image/webp',
    initialQuality: customOptions?.initialQuality || 0.8,
    alwaysKeepResolution: false,
  };
  
  try {
    let compressedFile = await imageCompression(file, options);
    
    // Safety check: If compressed file is still somehow larger than original (rare but possible with very small files)
    if (compressedFile.size > file.size) {
      return file;
    }

    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file;
  }
};

export const generateVideoThumbnail = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      video.currentTime = 1; // Capture at 1 second
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const thumbnailFile = new File([blob], 'thumbnail.webp', { type: 'image/webp' });
          const compressedThumbnail = await compressImage(thumbnailFile, { maxSizeMB: 0.1, maxWidthOrHeight: 400 });
          resolve(compressedThumbnail as File);
        } else {
          reject(new Error('Thumbnail generation failed'));
        }
      }, 'image/webp', 0.7);
    };
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
};

export const getOptimizedImageUrl = (url: string | null | undefined, variant: 'opt' | 'md' | 'thumb' = 'opt') => {
  if (!url) return '';

  // If it's already an optimized variant or not a local upload, return as is
  const isLocalUpload = url.includes('/uploads/') || url.includes('.r2.cloudflarestorage.com');
  const isAlreadyVariant = url.match(/-(opt|md|thumb)\.webp$/);

  if (isAlreadyVariant || !isLocalUpload) {
    return url;
  }

  // Try to find extension and replace with variant
  const lastDot = url.lastIndexOf('.');
  if (lastDot <= 0) return url;

  const base = url.substring(0, lastDot);
  return `${base}-${variant}.webp`;
};
