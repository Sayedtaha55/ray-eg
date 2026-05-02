import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable()
export class GeminiVisionService {
  private getApiKey() {
    const key = String(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
    if (!key) throw new BadRequestException('Gemini API key is not configured');
    return key;
  }

  private resolveSelfUrl(url: string) {
    const u = String(url || '').trim();
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    if (!u.startsWith('/')) return u;
    const baseRaw = String(
      process.env.API_BASE_URL ||
        process.env.BACKEND_BASE_URL ||
        `http://127.0.0.1:${process.env.PORT || 4000}`,
    ).trim();

    try {
      const baseUrl = new URL(baseRaw);
      return `${baseUrl.origin}${u}`;
    } catch {
      const cleaned = baseRaw.replace(/\/+$/, '');
      const withoutApi = cleaned.replace(/\/(api\/v1|api)\/?$/i, '');
      return `${withoutApi}${u}`;
    }
  }

  private async fetchAsBase64(url: string) {
    const raw = String(url || '').trim();
    if (!raw) throw new BadRequestException('imageUrl مطلوب');

    // Local driver returns URLs like /uploads/<key>. Reading from disk is more reliable than fetching over HTTP,
    // and avoids env misconfiguration (API_BASE_URL including /api/v1, wrong host, etc.).
    if (raw.startsWith('/uploads/')) {
      const relativeKey = raw.replace(/^\/uploads\//, '');
      const uploadsRoot = path.resolve(process.cwd(), 'uploads');
      const filePath = path.resolve(uploadsRoot, relativeKey);
      if (!filePath.startsWith(uploadsRoot)) {
        throw new BadRequestException('Invalid imageUrl');
      }

      let buf: Buffer;
      try {
        buf = await fs.promises.readFile(filePath);
      } catch {
        throw new BadRequestException('Failed to download image (404)');
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeType =
        ext === '.png'
          ? 'image/png'
          : ext === '.webp'
            ? 'image/webp'
            : ext === '.avif'
              ? 'image/avif'
              : 'image/jpeg';

      return { base64: buf.toString('base64'), mimeType };
    }

    const resolved = this.resolveSelfUrl(raw);
    if (!resolved) throw new BadRequestException('imageUrl مطلوب');

    const res = await fetch(resolved);
    if (!res.ok) throw new BadRequestException(`Failed to download image (${res.status})`);

    const mimeType = String(res.headers.get('content-type') || 'image/jpeg');
    const ab = await res.arrayBuffer();
    const b64 = Buffer.from(ab).toString('base64');
    return { base64: b64, mimeType };
  }

  async analyzeShopImageMap(params: { imageUrl: string; language?: string }) {
    const { base64, mimeType } = await this.fetchAsBase64(params.imageUrl);

    const ai = new GoogleGenAI({ apiKey: this.getApiKey() });

    const schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        hotspots: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
            },
            required: ['label', 'x', 'y'],
          },
        },
      },
      required: ['hotspots'],
    };

    const language = String(params.language || 'ar').trim().toLowerCase();
    const prompt =
      language === 'en'
        ? 'Analyze this shop shelf image and propose clickable hotspots. Return hotspots with label and approximate x/y positions in percent (0-100). Do not invent products that are not visible.'
        : 'حلّل صورة الرف/المتجر واقترح نقاط تفاعل (Hotspots) للشراء. ارجع قائمة hotspots تحتوي label و x و y كنِسَب مئوية من 0 إلى 100. لا تخترع منتجات غير ظاهرة.';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) throw new BadRequestException('No response from AI');

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new BadRequestException('Invalid AI response');
    }

    const hotspots = Array.isArray(data?.hotspots) ? data.hotspots : [];
    const normalized = hotspots
      .map((h: any) => ({
        label: typeof h?.label === 'string' ? h.label : '',
        x: Math.max(0, Math.min(100, Number(h?.x))),
        y: Math.max(0, Math.min(100, Number(h?.y))),
        confidence: typeof h?.confidence === 'number' ? h.confidence : null,
      }))
      .filter((h: any) => h.label && Number.isFinite(h.x) && Number.isFinite(h.y));

    return {
      summary: typeof data?.summary === 'string' ? data.summary : null,
      hotspots: normalized,
    };
  }
}
