import { NextResponse } from 'next/server';

export function verifyOrigin(request) {
  const origin = request.headers.get('origin');

  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: 'Invalid request origin' },
      { status: 403 }
    );
  }

  return null;
}