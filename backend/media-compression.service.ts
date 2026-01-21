import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';

@Injectable()
export class MediaCompressionService {
  private runFfmpeg(args: string[]) {
    const ffmpegExe = typeof ffmpegPath === 'string' && ffmpegPath.trim() ? ffmpegPath : null;
    if (!ffmpegExe) {
      throw new BadRequestException('Video processing is not available (ffmpeg not found)');
    }

    return new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegExe, args, { windowsHide: true });
      let stderr = '';
      proc.stderr.on('data', (d) => {
        stderr += String(d || '');
      });
      proc.on('error', reject);
      proc.on('close', (code) => {
        if (code === 0) return resolve();
        reject(new Error(stderr || `ffmpeg exited with code ${code}`));
      });
    });
  }

  private getSharpMaxPixels() {
    const raw = String(process.env.SHARP_MAX_INPUT_PIXELS || '40000000').trim();
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) return 40000000;
    return Math.floor(n);
  }

  private createSharp(buffer: Buffer) {
    return sharp(buffer, { limitInputPixels: this.getSharpMaxPixels() });
  }

  async optimizeVideoMp4(inputPath: string, outputPath: string) {
    await this.runFfmpeg([
      '-y',
      '-i',
      inputPath,
      '-map',
      '0:v:0',
      '-map',
      '0:a?',
      '-vf',
      'scale=1280:-2:force_original_aspect_ratio=decrease',
      '-r',
      '30',
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '28',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-c:a',
      'aac',
      '-b:a',
      '96k',
      outputPath,
    ]);
  }

  async optimizeVideoWebm(inputPath: string, outputPath: string) {
    await this.runFfmpeg([
      '-y',
      '-i',
      inputPath,
      '-map',
      '0:v:0',
      '-map',
      '0:a?',
      '-vf',
      'scale=1280:-2:force_original_aspect_ratio=decrease',
      '-r',
      '30',
      '-c:v',
      'libvpx-vp9',
      '-b:v',
      '0',
      '-crf',
      '36',
      '-row-mt',
      '1',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'libopus',
      '-b:a',
      '96k',
      outputPath,
    ]);
  }

  async getVideoDuration(inputPath: string): Promise<number | null> {
    const ffmpegExe = typeof ffmpegPath === 'string' && ffmpegPath.trim() ? ffmpegPath : null;
    if (!ffmpegExe) {
      return null;
    }

    return new Promise((resolve) => {
      const proc = spawn(ffmpegExe, ['-i', inputPath, '-f', 'null', '-'], { windowsHide: true });
      let stderr = '';
      
      proc.stderr.on('data', (d) => {
        stderr += String(d || '');
      });
      
      proc.on('close', () => {
        // Parse duration from stderr
        const durationMatch = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
        if (durationMatch) {
          const hours = parseInt(durationMatch[1]);
          const minutes = parseInt(durationMatch[2]);
          const seconds = parseFloat(durationMatch[3]);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          resolve(Math.round(totalSeconds));
        } else {
          resolve(null);
        }
      });
      
      proc.on('error', () => {
        resolve(null);
      });
    });
  }

  async generateVideoThumbnailWebp(inputPath: string, outputPath: string) {
    await this.runFfmpeg([
      '-y',
      '-ss',
      '00:00:01',
      '-i',
      inputPath,
      '-frames:v',
      '1',
      '-vf',
      'scale=640:-2:force_original_aspect_ratio=decrease',
      outputPath,
    ]);
  }

  ensureDir(dirPath: string) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch {
      return;
    }
  }

  async writeWebpVariants(params: {
    input: Buffer;
    outDir: string;
    baseName: string;
    variants: {
      key: 'opt' | 'md' | 'thumb';
      width: number;
      height: number;
      fit: 'inside' | 'cover';
      quality: number;
    }[];
  }) {
    this.ensureDir(params.outDir);

    const written: Record<string, string> = {};

    for (const v of params.variants) {
      const filename = `${params.baseName}-${v.key}.webp`;
      const filePath = path.join(params.outDir, filename);
      await this.createSharp(params.input)
        .rotate()
        .resize({
          width: v.width,
          height: v.height,
          fit: v.fit,
          withoutEnlargement: true,
        })
        .webp({ quality: v.quality })
        .toFile(filePath);
      written[v.key] = filePath;
    }

    return written;
  }
}
