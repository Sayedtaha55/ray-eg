'use client';

import { clientFetch } from './client';

export type PresignResult = {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
};

export type CompleteResult = {
  jobId: string;
  state: string;
  queued: boolean;
};

export type UploadResult = {
  key: string;
  publicUrl: string;
  jobId?: string;
  queued?: boolean;
};

export type UploadOptions = {
  /** e.g. 'images', 'gallery', 'banner', 'logo', 'product', 'videos' */
  purpose?: string;
  /** Override shopId (admin impersonation); otherwise read from session */
  shopId?: string;
  /** Called with progress 0-100 (only for local fallback) */
  onProgress?: (percent: number) => void;
};

/**
 * Production-grade media upload: presign → direct PUT to R2 → complete.
 * Falls back to local upload in dev mode.
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const { purpose, shopId, onProgress } = options;

  // Step 1: Get presigned URL from backend
  const presign = await clientFetch<PresignResult>('/v1/media/presign', {
    method: 'POST',
    body: JSON.stringify({
      mimeType: file.type || 'application/octet-stream',
      fileName: file.name,
      purpose: purpose || 'images',
      size: file.size,
      shopId: shopId || undefined,
    }),
  });

  const { uploadUrl, key, publicUrl } = presign;

  // Step 2: Upload the file
  const isR2Direct = uploadUrl.startsWith('https://');

  if (isR2Direct) {
    // Direct PUT to R2 via presigned URL — no backend in the path
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });

    if (!res.ok) {
      throw new Error(`R2 upload failed: ${res.status} ${res.statusText}`);
    }
  } else {
    // Local dev fallback: PUT through backend proxy
    await uploadLocal(uploadUrl, file, onProgress);
  }

  // Step 3: Notify backend that upload is complete (triggers optimization)
  let completeResult: CompleteResult | null = null;
  try {
    completeResult = await clientFetch<CompleteResult>('/v1/media/complete', {
      method: 'POST',
      body: JSON.stringify({
        key,
        mimeType: file.type || 'application/octet-stream',
        purpose: purpose || 'images',
      }),
    });
  } catch {
    // Complete is best-effort; the file is already uploaded
  }

  return {
    key,
    publicUrl,
    jobId: completeResult?.jobId,
    queued: completeResult?.queued,
  };
}

/**
 * Upload multiple files in parallel (max 3 concurrent to avoid overwhelming R2).
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {},
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const concurrency = 3;
  let idx = 0;

  async function next(): Promise<void> {
    while (idx < files.length) {
      const i = idx++;
      results[i] = await uploadFile(files[i], options);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, files.length) }, () => next());
  await Promise.all(workers);

  return results;
}

/**
 * Local dev upload: PUT raw body to backend endpoint.
 */
async function uploadLocal(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Local upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Local upload network error'));
    xhr.send(file);
  });
}
