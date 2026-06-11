import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Middleware to protect API routes with role-based authentication
 * 
 * Protected routes (staff only):
 * - /api/admin/*
 * - /api/operations/*
 * - /api/claims-assessor/*
 * - /api/finance/*
 * - /api/compliance/*
 * - /api/call-centre/*
 * - /api/broker/*
 * - /api/marketing/*
 * 
 * Unprotected routes (in development):
 * - /api/member/* (custom email and PIN auth)
 * - /api/provider/* (custom provider auth - not ready)
 * - /api/applications (public application submission)
 * - /api/products (public product listing)
 * - /api/feedback (public feedback)
 * - /api/ocr (public OCR processing)
 * - /api/leads (public lead capture)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Define protected route prefixes (staff routes only)
  const protectedPrefixes = [
    '/api/admin',
    '/api/operations',
    '/api/claims-assessor',
    '/api/finance',
    '/api/compliance',
    '/api/call-centre',
    '/api/broker',
    '/api/marketing',
  ];

  // Check if this route needs protection
  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (!isProtected) {
    // Allow unprotected routes (member, provider, public routes)
    return NextResponse.next();
  }

  // Get authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Create Supabase client with the user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify token and get user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Get user data from custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, is_active')
      .eq('email', authUser.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found in database', code: 'USER_NOT_FOUND' },
        { status: 403 }
      );
    }

    if (!userData.is_active) {
      return NextResponse.json(
        { error: 'User account is inactive', code: 'USER_INACTIVE' },
        { status: 403 }
      );
    }

    // Get user roles
    const { data: userRolesData } = await supabase
      .from('user_roles')
      .select('role_id, roles(name)')
      .eq('user_id', userData.id);

    const roles: string[] = userRolesData?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];

    if (roles.length === 0) {
      return NextResponse.json(
        { error: 'User has no assigned roles', code: 'NO_ROLES' },
        { status: 403 }
      );
    }

    // Role-based route access control
    const routeRoleMap: Record<string, string[]> = {
      '/api/admin': ['admin', 'system_admin'],
      '/api/operations': ['operations_manager', 'finance_manager', 'admin', 'system_admin'],
      '/api/claims-assessor': ['claims', 'admin', 'system_admin'],
      '/api/finance': ['finance_manager', 'admin', 'system_admin'],
      '/api/compliance': ['compliance_officer', 'admin', 'system_admin'],
      '/api/call-centre': ['call_centre_agent', 'operations_manager', 'admin', 'system_admin'],
      '/api/broker': ['broker', 'admin', 'system_admin'],
      '/api/marketing': ['marketing_manager', 'admin', 'system_admin'],
    };

    // Check if user has required role for this route
    const requiredRoles = Object.entries(routeRoleMap).find(([prefix]) => 
      pathname.startsWith(prefix)
    )?.[1] || [];

    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));

    if (!hasRequiredRole) {
      return NextResponse.json(
        { 
          error: 'Access denied', 
          code: 'INSUFFICIENT_PERMISSIONS'
        },
        { status: 403 }
      );
    }

    // Add user info to request headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', userData.id);
    response.headers.set('x-user-email', userData.email);
    response.headers.set('x-user-roles', roles.join(','));

    return response;

  } catch (error: any) {
    console.error('Middleware authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', code: 'AUTH_ERROR', details: error.message },
      { status: 500 }
    );
  }
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/operations/:path*',
    '/api/claims-assessor/:path*',
    '/api/finance/:path*',
    '/api/compliance/:path*',
    '/api/call-centre/:path*',
    '/api/broker/:path*',
    '/api/marketing/:path*',
  ]
};
