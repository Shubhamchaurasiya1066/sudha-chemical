import { query } from '@/lib/db';
import { encrypt } from '@/lib/auth';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const users = await query({
      query: 'SELECT * FROM users WHERE username = ?',
      values: [username]
    });

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const user = users[0];

    // Password check (Bcrypt ya master bypass)
    const isMatch = await bcrypt.compare(password, user.password);
    const isMaster = (username === 'admin' && password === 'admin123'); 

    if (!isMatch && !isMaster) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // ✅ Token me role add karo
    const token = await encrypt({ 
      userId: user.id, 
      username: user.username, 
      name: user.name,
      role: user.role || 'staff' // Agar role nahi hai toh staff maan lo
    });

    const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
    response.cookies.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}