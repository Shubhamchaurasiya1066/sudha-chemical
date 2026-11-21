
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import { verifyOrigin } from '@/lib/verifyOrigin';
import bcrypt from 'bcryptjs';


function apiError(error) {
  console.error('Users API error:', error);

  return NextResponse.json(
    { success: false, message: 'Internal server error' },
    { status: 500 }
  );
}

function invalid(message) {
  return NextResponse.json(
    { success: false, message },
    { status: 400 }
  );
}

function validId(value) {
  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// 1. GET: Only Admin can fetch users
export async function GET() {
  try {
    const { error } = await requireAuth(['admin']);
    if (error) return error;

    const users = await query({
      query: `
        SELECT id, username, name, role, created_at
        FROM users
        ORDER BY created_at DESC
      `
    });

    return NextResponse.json(
      { success: true, users },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return apiError(error);
  }
}

// 2. POST: Only Admin can create users
export async function POST(request) {
  try {
    const { error } = await requireAuth(['admin']);
    if (error) return error;

    const originError = verifyOrigin(request);
    if (originError) return originError;

    const body = await request.json();

    const username = body?.username;
    const password = body?.password;
    const name = body?.name;
    const role = body?.role ?? 'staff';

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      typeof name !== 'string' ||
      !username.trim() ||
      !name.trim()
    ) {
      return invalid('All fields are required');
    }

    if (
      username.trim().length > 100 ||
      name.trim().length > 150 ||
      password.length < 12 ||
      password.length > 72
    ) {
      return invalid(
        'Invalid details. Password must be 12-72 characters.'
      );
    }

    if (!['admin', 'staff'].includes(role)) {
      return invalid('Invalid role');
    }

    const existing = await query({
      query: 'SELECT id FROM users WHERE username = ? LIMIT 1',
      values: [username.trim()]
    });

    if (existing.length > 0) {
      return invalid('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await query({
      query: `
        INSERT INTO users (username, password, name, role)
        VALUES (?, ?, ?, ?)
      `,
      values: [
        username.trim(),
        hashedPassword,
        name.trim(),
        role
      ]
    });

    return NextResponse.json(
      { success: true, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
      return invalid('Username already exists');
    }

    return apiError(error);
  }
}

// 3. PUT: Only Admin can reset passwords
export async function PUT(request) {
  try {
    const { user, error } = await requireAuth(['admin']);
    if (error) return error;

    const originError = verifyOrigin(request);
    if (originError) return originError;

    const body = await request.json();
    const id = validId(body?.id);
    const newPassword = body?.newPassword;

    if (
      !id ||
      typeof newPassword !== 'string' ||
      newPassword.length < 12 ||
      newPassword.length > 72
    ) {
      return invalid(
        'Valid user ID and password (12-72 characters) required'
      );
    }

    // Admin cannot reset their own password through
    // this management endpoint.
    if (String(id) === String(user.id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Use a dedicated change-password flow'
        },
        { status: 403 }
      );
    }

    const existing = await query({
      query: 'SELECT id FROM users WHERE id = ? LIMIT 1',
      values: [id]
    });

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await query({
      query: 'UPDATE users SET password = ? WHERE id = ?',
      values: [hashedPassword, id]
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    return apiError(error);
  }
}

// 4. DELETE: Only Admin can delete users
export async function DELETE(request) {
  try {
    const { user: currentUser, error } =
      await requireAuth(['admin']);

    if (error) return error;

    const originError = verifyOrigin(request);
    if (originError) return originError;

    const { searchParams } = new URL(request.url);
    const id = validId(searchParams.get('id'));

    if (!id) {
      return invalid('Valid user ID required');
    }

    if (String(id) === String(currentUser.id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'You cannot delete your own account'
        },
        { status: 403 }
      );
    }

    const users = await query({
      query: 'SELECT id, username FROM users WHERE id = ? LIMIT 1',
      values: [id]
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (users[0].username === 'admin') {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete super admin'
        },
        { status: 403 }
      );
    }

    await query({
      query: 'DELETE FROM users WHERE id = ?',
      values: [id]
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    return apiError(error);
  }
}
