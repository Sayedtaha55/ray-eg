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

/**
 * Variant sizes in CSS pixels.
 * Used for srcset generation.
 */
export const VARIANT_WIDTHS: Record<'thumb' | 'md' | 'opt', number> = {
  thumb: 320,
  md: 768,
  opt: 1200,
};

/**
 * Build-time detection of image format support.
 * Memoized because feature detection is moderately expensive.
 */
let _formatSupportCache: { avif: boolean; webp: boolean } | null = null;

export function detectImageFormatSupport(): { avif: boolean; webp: boolean } {
  if (_formatSupportCache) return _formatSupportCache;

  if (typeof document === 'undefined' || !document.createElement) {
    _formatSupportCache = { avif: false, webp: true };
    return _formatSupportCache;
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;

  let avif = false;
  let webp = false;
  try {
    avif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch {}
  try {
    webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {}

  _formatSupportCache = { avif, webp };
  return _formatSupportCache;
}

/**
 * Detect the base file path and extension of an optimized-variant image URL.
 * Returns null if the URL does not look like a local upload that has variants.
 */
function parseVariantUrl(url: string): { base: string; ext: string } | null {
  if (!url) return null;

  const isLocalUpload = url.includes('/uploads/') || url.includes('.r2.cloudflarestorage.com');
  if (!isLocalUpload) return null;

  // Strip any -opt.webp / -md.webp / -thumb.webp suffix to get the base.
  const variantMatch = url.match(/^(.*?)(?:-(opt|md|thumb))?\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  if (!variantMatch) return null;

  const base = variantMatch[1].replace(/-(opt|md|thumb)$/, '');
  const ext = String(variantMatch[3] || '').toLowerCase();
  return { base, ext };
}

/**
 * Produce the URL for a given variant + format combination.
 * If the source is not a local upload, return the original URL unchanged.
 *
 * @param url         Source image URL
 * @param variant     Image variant (thumb | md | opt)
 * @param format      Target format (webp | avif | original)
 */
export function getVariantUrl(
  url: string | null | undefined,
  variant: 'opt' | 'md' | 'thumb' = 'opt',
  format: 'webp' | 'avif' | 'original' = 'webp',
): string {
  if (!url) return '';

  const parsed = parseVariantUrl(url);
  if (!parsed) return url;

  if (format === 'original') {
    // Return the source as-is, but try to map to the requested width if a variant hint exists.
    return url;
  }

  return `${parsed.base}-${variant}.${format}`;
}

/**
 * Build a srcset string for a given URL and format, across all variants.
 * Widths are defined in VARIANT_WIDTHS.
 *
 * @param url     Source image URL
 * @param format  Target format (webp | avif)
 */
export function buildSrcSet(
  url: string | null | undefined,
  format: 'webp' | 'avif' = 'webp',
): string {
  if (!url) return '';

  const parsed = parseVariantUrl(url);
  if (!parsed) return '';

  const parts: string[] = [];
  (['thumb', 'md', 'opt'] as const).forEach((v) => {
    const variantUrl = `${parsed.base}-${v}.${format}`;
    parts.push(`${variantUrl} ${VARIANT_WIDTHS[v]}w`);
  });

  return parts.join(', ');
}

/**
 * Returns the best single URL to use for a given variant.
 * Picks the most modern format the browser supports, falling back to the source.
 *
 * @param url         Source image URL
 * @param variant     Image variant (thumb | md | opt)
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  variant: 'opt' | 'md' | 'thumb' = 'opt',
): string {
  if (!url) return '';

  const parsed = parseVariantUrl(url);
  if (!parsed) return url;

  // Fast path: source already has a variant suffix.
  const variantMatch = url.match(/-(opt|md|thumb)\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  if (variantMatch) {
    // Re-route the source variant to the requested one (same format).
    const fmt = String(variantMatch[2] || '').toLowerCase();
    return `${parsed.base}-${variant}.${fmt}`;
  }

  return `${parsed.base}-${variant}.webp`;
}

/**
 * Build a `<source>` list for use inside a `<picture>` element.
 * Returns an array of { type, srcset } entries ordered by preference.
 */
export function buildPictureSources(
  url: string | null | undefined,
): Array<{ type: string; srcset: string }> {
  if (!url) return [];

  const sources: Array<{ type: string; srcset: string }> = [];
  const avifSet = buildSrcSet(url, 'avif');
  const webpSet = buildSrcSet(url, 'webp');

  if (avifSet) sources.push({ type: 'image/avif', srcset: avifSet });
  if (webpSet) sources.push({ type: 'image/webp', srcset: webpSet });

  return sources;
}

/**
 * Default responsive sizes attribute.
 * Tweak as needed for hero / grid / card layouts.
 */
export const DEFAULT_RESPONSIVE_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
