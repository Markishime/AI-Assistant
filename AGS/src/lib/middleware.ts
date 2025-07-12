import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/analytics',
  '/reports',
  '/documents',
  '/fields',
  '/insights',
  '/history',
  '/settings',
  '/admin'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/help'
];

// Define admin-only routes
const adminRoutes = [
  '/admin'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and API routes (except specific API routes)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  try {
    // Get auth token from cookies - Supabase uses these cookie names
    const accessToken = request.cookies.get('sb-access-token')?.value ||
                       request.cookies.get('supabase-auth-token')?.value ||
                       request.cookies.get('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')?.value;
    
    // Also check for session cookies
    const refreshToken = request.cookies.get('sb-refresh-token')?.value ||
                        request.cookies.get('supabase-refresh-token')?.value ||
                        request.cookies.get('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-refresh-token')?.value;

    // User is authenticated if they have either token
    const isAuthenticated = !!(accessToken || refreshToken);

    // Check if the current route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // Handle authentication logic
    if (isProtectedRoute && !isAuthenticated) {
      // Redirect to login if accessing protected route without session
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      // Redirect authenticated users away from auth pages
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    // Handle admin route protection
    if (isAdminRoute && isAuthenticated) {
      // For admin routes, we'll verify the role on the server side
      // This middleware just ensures there's an auth token
      // The actual role verification happens in the page components
    }

    // Rate limiting for API routes
    if (pathname.startsWith('/api/')) {
      const rateLimitResult = await checkRateLimit(request);
      if (!rateLimitResult.allowed) {
        return new NextResponse(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            },
          }
        );
      }
    }

    // Add security headers
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    
    // CSP header for security (relaxed for development)
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
    );

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // If there's an error and it's a protected route, redirect to login
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (isProtectedRoute) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    return NextResponse.next();
  }
}

// Simple in-memory rate limiter (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

async function checkRateLimit(request: NextRequest): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // Get IP address from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // 100 requests per minute

  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // First request or window has reset
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: now + windowMs,
    };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      reset: current.resetTime,
    };
  }

  // Increment count
  current.count += 1;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - current.count,
    reset: current.resetTime,
  };
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 