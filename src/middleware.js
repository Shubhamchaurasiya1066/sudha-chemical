import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized. Please login.' },
    { status: 401 }
  );
}

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  const isApi = path.startsWith('/api/');

  const isLoginPage = path === '/login';

  const isLoginApi = path === '/api/auth/login';

  const isLogoutApi = path === '/api/auth/logout';

  const isPublicPage =
    path === '/' ||
    path === '/about' ||
    path === '/products' ||
    path.startsWith('/products/') ||
    path === '/clients' ||
    path === '/contact';

  // Future public website endpoints
  const isPublicApi =
    path === '/api/public' ||
    path.startsWith('/api/public/');

  // Public endpoints ke liye authentication nahi
  if (isLoginApi || isPublicApi || isPublicPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;
  const session = await decrypt(token);

  // Logout route apni cookie clear kar sake
  if (isLogoutApi) {
    return NextResponse.next();
  }

  if (isLoginPage) {
    if (session) {
      return NextResponse.redirect(
        new URL('/dashboard', request.url)
      );
    }

    return NextResponse.next();
  }

  if (!session) {
    if (isApi) {
      return unauthorized();
    }

    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }

  // Admin-only page
  if (
    (path === '/users' || path.startsWith('/users/')) &&
    session.role !== 'admin'
  ) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
};
