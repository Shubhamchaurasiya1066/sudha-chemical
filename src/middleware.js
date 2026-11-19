import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/transporters', '/customers', '/purchase-orders', '/sales-orders', '/inventory', '/dispatch-order', '/sheet', '/freight-list', '/company-purchases', '/company-sales', '/sales-order', '/purchase-order', '/payment-advice', '/users'];
const publicRoutes = ['/login'];

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route));

  const cookie = request.cookies.get('session')?.value;
  const session = cookie ? await decrypt(cookie) : null;

  // Agar protected route hai aur login nahi hai
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // ✅ Sirf Admin hi /users page dekh sakta hai
  if (path.startsWith('/users') && session?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

