import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// 1. GET: Saare users fetch karo
export async function GET() {
  try {
    const users = await query({ 
      query: 'SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC' 
    });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. POST: Naya user banao
export async function POST(request) {
  try {
    const { username, password, name, role } = await request.json();

    if (!username || !password || !name) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const existing = await query({ query: 'SELECT id FROM users WHERE username = ?', values: [username] });
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await query({
      query: 'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
      values: [username, hashedPassword, name, role || 'staff']
    });

    return NextResponse.json({ success: true, message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ✅ 3. PUT: Password Reset karne ke liye (Naya add kiya)
export async function PUT(request) {
  try {
    const { id, newPassword } = await request.json();

    if (!id || !newPassword || newPassword.length < 4) {
      return NextResponse.json({ success: false, message: 'Valid ID and password (min 4 chars) required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query({
      query: 'UPDATE users SET password = ? WHERE id = ?',
      values: [hashedPassword, id]
    });

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 4. DELETE: User delete karo
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    const user = await query({ query: 'SELECT username FROM users WHERE id = ?', values: [id] });
    if (user[0]?.username === 'admin') {
      return NextResponse.json({ success: false, message: 'Cannot delete super admin' }, { status: 403 });
    }

    await query({ query: 'DELETE FROM users WHERE id = ?', values: [id] });
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}