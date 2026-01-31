// ==========================================
// Rwanda Christian University Management System
// API Route Protection Utilities
// ==========================================

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { UserRole } from '@/lib/role-access';

export interface AuthenticatedRequest {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
}

export async function requireAuth(): Promise<AuthenticatedRequest | NextResponse> {
  const session = await auth();

  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role as UserRole,
      avatar: session.user.avatar,
    },
  };
}

export async function requireRole(roles: UserRole[]): Promise<AuthenticatedRequest | NextResponse> {
  const authResult = await requireAuth();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  if (!roles.includes(authResult.user.role)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  return authResult;
}

export async function requireAdmin(): Promise<AuthenticatedRequest | NextResponse> {
  return requireRole(['admin']);
}

export async function requireTeacher(): Promise<AuthenticatedRequest | NextResponse> {
  return requireRole(['admin', 'teacher']);
}

export async function requireStudent(): Promise<AuthenticatedRequest | NextResponse> {
  return requireRole(['admin', 'teacher', 'student']);
}