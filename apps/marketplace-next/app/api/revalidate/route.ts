import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Cache invalidation webhook called by the dashboard after a website publish.
 * The public site pages (/site/[slug]) are cached with the `site:<slug>` tag —
 * publishing must invalidate them so visitors see changes immediately instead
 * of waiting for the 120s ISR window.
 *
 * POST { "slug": "my-shop", "secret": "..." }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET || 'dev-revalidate-secret';
  let slug = '';
  try {
    const body = await req.json();
    slug = String((body as any)?.slug || '').trim();
    if (String((body as any)?.secret || '') !== secret) {
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'invalid_body' }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ success: false, error: 'slug_required' }, { status: 400 });
  }

  revalidateTag(`site:${slug}`);
  return NextResponse.json({ success: true, revalidated: `site:${slug}` });
}
