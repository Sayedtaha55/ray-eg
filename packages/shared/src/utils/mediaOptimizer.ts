/**
 * Client-side Media Optimization Utilities
 * Optimizes images and videos in the browser to reduce server load
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  enableAvif?: boolean;
}

export interface VideoOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webm' | 'mp4';
}

export class MediaOptimizer {
  /**
   * Check if AVIF is supported in the browser
   */
  static supportsAvif(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/avif').startsWith('data:image/avif');
  }

  /**
   * Check if WebP is supported in the browser
   */
  static supportsWebP(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  }

  /**
   * Get the best image format for the current browser
   */
  static getBestFormat(preferredFormat?: 'webp' | 'jpeg' | 'png' | 'avif'): string {
    if (preferredFormat) {
      if (preferredFormat === 'avif' && this.supportsAvif()) return 'avif';
      if (preferredFormat === 'webp' && this.supportsWebP()) return 'webp';
      return preferredFormat;
    }

    if (this.supportsAvif()) return 'avif';
    if (this.supportsWebP()) return 'webp';
    return 'jpeg';
  }

  /**
   * Optimize an image in the browser
   */
  static async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format,
      enableAvif = true,
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        // Calculate dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Determine format
        const bestFormat = this.getBestFormat(format);
        const mimeType = `image/${bestFormat}`;

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image to blob'));
            }
          },
          mimeType,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Create multiple responsive image variants
   */
  static async createResponsiveVariants(
    file: File,
    sizes: number[] = [320, 640, 960, 1280, 1920],
    options: Omit<ImageOptimizationOptions, 'maxWidth' | 'maxHeight'> = {}
  ): Promise<Map<number, Blob>> {
    const variants = new Map<number, Blob>();

    for (const size of sizes) {
      try {
        const blob = await this.optimizeImage(file, {
          ...options,
          maxWidth: size,
          maxHeight: size,
        });
        variants.set(size, blob);
      } catch (error) {
        console.warn(`Failed to create ${size}px variant:`, error);
      }
    }

    return variants;
  }

  /**
   * Optimize a video in the browser
   */
  static async optimizeVideo(
    file: File,
    options: VideoOptimizationOptions = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1280,
      maxHeight = 720,
      quality = 0.8,
      format = 'webm',
    } = options;

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        // Calculate dimensions
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Capture frames and create video
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: format === 'webm' ? 'video/webm;codecs=vp9' : 'video/mp4',
          videoBitsPerSecond: Math.round(quality * 5000000),
        });

        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: format === 'webm' ? 'video/webm' : 'video/mp4' });
          resolve(blob);
        };

        mediaRecorder.onerror = () => {
          reject(new Error('MediaRecorder error'));
        };

        video.play();
        mediaRecorder.start();

        // Draw frames
        const drawFrame = () => {
          if (video.ended || video.paused) {
            mediaRecorder.stop();
            return;
          }
          ctx.drawImage(video, 0, 0, width, height);
          requestAnimationFrame(drawFrame);
        };

        drawFrame();

        // Stop after video ends
        video.onended = () => {
          mediaRecorder.stop();
        };
      };

      video.onerror = () => {
        reject(new Error('Failed to load video'));
      };

      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate a thumbnail from a video
   */
  static async generateVideoThumbnail(
    file: File,
    time: number = 1,
    width: number = 320,
    height: number = 320
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        video.currentTime = time;
      };

      video.onseeked = () => {
        canvas.width = width;
        canvas.height = height;

        // Calculate aspect ratio
        const ratio = Math.min(width / video.videoWidth, height / video.videoHeight);
        const drawWidth = Math.round(video.videoWidth * ratio);
        const drawHeight = Math.round(video.videoHeight * ratio);
        const offsetX = Math.round((width - drawWidth) / 2);
        const offsetY = Math.round((height - drawHeight) / 2);

        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/webp',
          0.8
        );
      };

      video.onerror = () => {
        reject(new Error('Failed to load video'));
      };

      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Compress an image using canvas
   */
  static async compressImage(
    file: File,
    quality: number = 0.8,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<Blob> {
    return this.optimizeImage(file, { maxWidth, maxHeight, quality });
  }

  /**
   * Get file size reduction percentage
   */
  static getReductionPercentage(originalSize: number, optimizedSize: number): number {
    if (originalSize === 0) return 0;
    return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
