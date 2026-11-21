import { query } from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';


export async function POST(request) {
  try {
    const body = await request.json();

    const username = body?.username;
    const password = body?.password;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const users = await query({
      query: `
        SELECT id, username, name, role, password
        FROM users
        WHERE username = ?
        LIMIT 1
      `,
      values: [username.trim()]
    });

    const user = users[0];

    const validPassword =
      user &&
      typeof user.password === 'string' &&
      await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const role = user.role || 'staff';

    if (!['admin', 'staff'].includes(role)) {
      return NextResponse.json(
        { error: 'Account role is not permitted' },
        { status: 403 }
      );
    }

    const token = await encrypt({
      userId: user.id,
      username: user.username,
      name: user.name,
      role
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully'
    });

    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error) {
    console.error('Login failed:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}