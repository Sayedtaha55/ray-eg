type ImageCompressionOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
  maxFileSizeBytes?: number;
};

type CompressionResult = {
  blob: Blob;
  width: number;
  height: number;
  format: string;
  originalSize: number;
  compressedSize: number;
};

const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.78,
  format: 'image/webp',
  maxFileSizeBytes: 0,
};

function canUseWebP(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

async function compressImage(
  file: File | Blob,
  options?: ImageCompressionOptions,
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  // Skip compression for non-image files
  const mime = String(file.type || '').toLowerCase();
  if (!mime.startsWith('image/')) {
    return {
      blob: file,
      width: 0,
      height: 0,
      format: mime,
      originalSize,
      compressedSize: originalSize,
    };
  }

  // Skip SVG — vector images shouldn't be rasterized
  if (mime === 'image/svg+xml') {
    return {
      blob: file,
      width: 0,
      height: 0,
      format: mime,
      originalSize,
      compressedSize: originalSize,
    };
  }

  // If file is already small enough, skip compression
  if (opts.maxFileSizeBytes > 0 && originalSize <= opts.maxFileSizeBytes) {
    return {
      blob: file,
      width: 0,
      height: 0,
      format: mime,
      originalSize,
      compressedSize: originalSize,
    };
  }

  // Determine output format
  const outputFormat = opts.format === 'image/webp' && !canUseWebP() ? 'image/jpeg' : opts.format;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if larger than max dimensions
      if (width > opts.maxWidth || height > opts.maxHeight) {
        const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }

      // White background for JPEG (no alpha)
      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          resolve({
            blob,
            width,
            height,
            format: outputFormat,
            originalSize,
            compressedSize: blob.size,
          });
        },
        outputFormat,
        opts.quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

function compressionResultToFile(
  result: CompressionResult,
  originalName: string,
): File {
  const ext = result.format === 'image/webp' ? '.webp'
    : result.format === 'image/jpeg' ? '.jpg'
    : result.format === 'image/png' ? '.png'
    : '';
  const baseName = originalName.replace(/\.[^.]+$/, '');
  return new File([result.blob], `${baseName}${ext}`, {
    type: result.format,
  });
}

export { compressImage, compressionResultToFile, canUseWebP };
export type { ImageCompressionOptions, CompressionResult };
