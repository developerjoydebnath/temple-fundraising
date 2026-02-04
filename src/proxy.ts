import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your_strong_secret_key'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't need authentication
  if (
    pathname === '/' ||
    pathname.startsWith('/api/public') ||
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Admin routes protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // Role-based access control can be added here
      // For example, if it's a super admin only route:
      // if (pathname.startsWith('/admin/admins') && payload.role !== 'Super Admin') {
      //   return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      // }

      return NextResponse.next();
    } catch (error) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Config to match the proxy_middleware to specific paths
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/login'],
};
