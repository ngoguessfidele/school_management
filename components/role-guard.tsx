// ==========================================
// Rwanda Christian University Management System
// Role-Based Access Control Components
// ==========================================

'use client';

import { useRoleAccess, UserRole } from '@/lib/role-access';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { hasRole } = useRoleAccess();

  if (!hasRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  children: ReactNode;
  permission: keyof ReturnType<typeof useRoleAccess>['permissions'];
  fallback?: ReactNode;
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  const { hasPermission } = useRoleAccess();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  return (
    <RoleGuard roles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface TeacherOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function TeacherOnly({ children, fallback = null }: TeacherOnlyProps) {
  return (
    <RoleGuard roles={['teacher']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface StudentOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function StudentOnly({ children, fallback = null }: StudentOnlyProps) {
  return (
    <RoleGuard roles={['student']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

interface StaffOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function StaffOnly({ children, fallback = null }: StaffOnlyProps) {
  return (
    <RoleGuard roles={['admin', 'teacher']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}