/**
 * useImageUpload — hook for uploading images with client-side compression
 * Compresses images to max width/height, converts to WebP, then uploads via media API
 */
import { useState, useCallback } from 'react';
import { ApiService } from '@/services/api.service';

type UploadState = 'idle' | 'compressing' | 'uploading' | 'done' | 'error';

interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  purpose?: string;
  shopId?: string;
}

interface UploadResult {
  url: string;
  key: string;
  thumbUrl?: string;
  mediumUrl?: string;
}

const DEFAULTS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.82,
  purpose: 'booking',
};

async function compressImage(
  file: File,
  opts: { maxWidth: number; maxHeight: number; quality: number },
): Promise<File> {
  // If it's already a small webp/avif, skip compression
  const isWebp = file.type === 'image/webp';
  const isAvif = file.type === 'image/avif';
  if (isWebp || isAvif) {
    if (file.size < 500 * 1024) return file;
  }

  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      const { maxWidth, maxHeight, quality } = opts;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: 'image/webp',
          });
          resolve(compressed);
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export function useImageUpload() {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, options?: UploadOptions): Promise<UploadResult | null> => {
      const opts = { ...DEFAULTS, ...options };
      setError(null);
      setProgress(0);

      try {
        // Step 1: Compress
        setState('compressing');
        setProgress(20);
        const compressed = await compressImage(file, {
          maxWidth: opts.maxWidth!,
          maxHeight: opts.maxHeight!,
          quality: opts.quality!,
        });

        // Step 2: Upload via media API
        setState('uploading');
        setProgress(50);
        const result = await ApiService.uploadMediaRobust({
          file: compressed,
          purpose: opts.purpose,
          shopId: opts.shopId,
        });

        setProgress(100);
        setState('done');
        return {
          url: result.url,
          key: result.key,
          ...(result as any).thumbUrl ? { thumbUrl: (result as any).thumbUrl } : {},
          ...(result as any).mediumUrl ? { mediumUrl: (result as any).mediumUrl } : {},
        };
      } catch (e: any) {
        const msg = e?.message ? String(e.message) : 'Upload failed';
        setError(msg);
        setState('error');
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState('idle');
    setProgress(0);
    setError(null);
  }, []);

  return { state, progress, error, upload, reset };
}
