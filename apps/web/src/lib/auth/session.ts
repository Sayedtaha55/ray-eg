import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'COURIER';
  name?: string;
  shopId?: string;
}

/**
 * Read the current session from httpOnly cookies.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<{
  user: SessionUser | null;
  token: string | null;
}> {
  const cookieStore = await cookies();

  const token = cookieStore.get('ray_session')?.value || null;
  const role = cookieStore.get('ray_role')?.value || null;
  const userId = cookieStore.get('ray_user_id')?.value || null;
  const userEmail = cookieStore.get('ray_user_email')?.value || null;
  const userName = cookieStore.get('ray_user_name')?.value || null;
  const shopId = cookieStore.get('ray_shop_id')?.value || null;

  if (!token || !userId || !role) {
    return { user: null, token: null };
  }

  return {
    token,
    user: {
      id: userId,
      email: userEmail || '',
      role: role as SessionUser['role'],
      name: userName || undefined,
      shopId: shopId || undefined,
    },
  };
}

/**
 * Check if the current session has the required role.
 */
export async function requireRole(...roles: SessionUser['role'][]): Promise<SessionUser | null> {
  const { user } = await getSession();

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return user;
}
