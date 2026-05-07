import { NextResponse } from 'next/server';

/**
 * POST /api/auth/set-cookie
 *
 * Called after successful login/signup to set httpOnly session cookie.
 * The client sends the access token + user info from the backend response,
 * and this route sets secure cookies.
 *
 * Security: Only accepts requests from same-origin (checks Origin header).
 */
export async function POST(request: Request) {
  // ── Origin check (CSRF mitigation) ──────────────────────────
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const isDev = process.env.NODE_ENV !== 'production';

  const isLocalhostOrigin = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const originMatchesHost = origin && host && (origin.includes(host) || origin.replace(/^https?:\/\//, '') === host);

  if (!origin || (!originMatchesHost && !(isDev && isLocalhostOrigin))) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { accessToken, user } = body as {
      accessToken: string;
      user: {
        id: string;
        email: string;
        role: string;
        name?: string;
        shopId?: string;
      };
    };

    if (!accessToken || !user?.id || !user?.role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({ ok: true });

    // httpOnly cookie — cannot be read by JavaScript (XSS protection)
    response.cookies.set('ray_session', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Readable cookies for middleware (not httpOnly, but no sensitive data)
    response.cookies.set('ray_role', String(user.role || '').toUpperCase(), {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookies.set('ray_user_id', user.id, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    if (user.email) {
      response.cookies.set('ray_user_email', encodeURIComponent(user.email), {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    if (user.name) {
      response.cookies.set('ray_user_name', encodeURIComponent(user.name), {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    if (user.shopId) {
      response.cookies.set('ray_shop_id', user.shopId, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
