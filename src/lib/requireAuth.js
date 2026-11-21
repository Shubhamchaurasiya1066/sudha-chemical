import 'server-only';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  const session = await decrypt(token);

  if (!session) return null;

  const users = await query({
    query: `
      SELECT id, username, role
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    values: [session.userId]
  });

  const user = users[0];

  if (!user || user.username !== session.username) {
    return null;
  }

  const role = user.role || 'staff';

  if (!['admin', 'staff'].includes(role)) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role
  };
}

export async function requireAuth(allowedRoles = ['admin', 'staff']) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      )
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    };
  }

  return { user, error: null };
}