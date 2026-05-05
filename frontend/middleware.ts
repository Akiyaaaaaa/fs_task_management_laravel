import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for protecting routes.
 *
 * - Unauthenticated users are redirected from protected routes to /login.
 * - Authenticated users are redirected from /login to /tasks.
 *
 * Since JWT is stored in localStorage (client-side only), we use a simple
 * cookie-based auth flag "auth_flag" that AuthContext sets/clears alongside
 * the localStorage token. This allows middleware to run server-side checks.
 *
 * ⚠️ This flag is not the JWT itself — it's just a presence indicator.
 *    Actual API calls still use the Bearer token from localStorage.
 */

const PROTECTED_PATHS = ['/tasks', '/profile', '/'];
const AUTH_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  // The route protection logic has been moved to the client-side
  // because we are relying on localStorage for the JWT.

  /*
  const { pathname } = request.nextUrl;
  const isAuthed = request.cookies.has('auth_flag');

  // Redirect authenticated users away from login
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && isAuthed) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  // Redirect unauthenticated users from protected routes
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
  if (isProtected && !isAuthed) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  */

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
