// ==========================================
// Rwanda Technology Institute Management System
// Middleware for Route Protection and Role-Based Access Control
// ==========================================

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define role-based route access
const roleRoutes = {
  '/dashboard/students': ['admin', 'teacher'],
  '/dashboard/teachers': ['admin'],
  '/dashboard/classes': ['admin', 'teacher', 'student'],
  '/dashboard/grades': ['admin', 'teacher', 'student'],
  '/dashboard/attendance': ['admin', 'teacher'],
  '/dashboard/schedule': ['admin', 'teacher', 'student'],
  '/dashboard/documents': ['admin', 'teacher', 'student'],
  '/dashboard/notifications': ['admin', 'teacher', 'student'],
  '/dashboard/settings': ['admin', 'teacher', 'student'],
  '/dashboard': ['admin', 'teacher', 'student'],
};

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/*',
];

// Routes that are public (no auth required)
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/error',
  '/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route =>
    route === pathname || (route.endsWith('/*') && pathname.startsWith(route.slice(0, -1)))
  );

  // If public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiresAuth = protectedRoutes.some(route =>
    route === pathname || (route.endsWith('/*') && pathname.startsWith(route.slice(0, -1)))
  );

  if (requiresAuth) {
    const session = await auth();

    // If no session, redirect to login
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const allowedRoles = roleRoutes[pathname as keyof typeof roleRoutes];
    if (allowedRoles && session.user && !allowedRoles.includes(session.user.role)) {
      // User doesn't have permission, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
  runtime: 'nodejs',
};