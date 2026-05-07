import { NextResponse } from 'next/server';

/**
 * POST /api/auth/clear-cookie
 *
 * Called on logout to clear all session cookies.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });

  const cookieOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set('ray_session', '', { ...cookieOptions, httpOnly: true });
  response.cookies.set('ray_role', '', cookieOptions);
  response.cookies.set('ray_user_id', '', cookieOptions);
  response.cookies.set('ray_user_email', '', { ...cookieOptions, httpOnly: true });
  response.cookies.set('ray_user_name', '', cookieOptions);
  response.cookies.set('ray_shop_id', '', cookieOptions);

  return response;
}
