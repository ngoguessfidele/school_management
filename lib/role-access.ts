// ==========================================
// Rwanda Technology Institute Management System
// Role-Based Access Control Hook
// ==========================================

import { useSession } from 'next-auth/react';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface RolePermissions {
  canViewStudents: boolean;
  canEditStudents: boolean;
  canViewTeachers: boolean;
  canEditTeachers: boolean;
  canViewClasses: boolean;
  canEditClasses: boolean;
  canViewGrades: boolean;
  canEditGrades: boolean;
  canViewAttendance: boolean;
  canEditAttendance: boolean;
  canViewReports: boolean;
  canSendNotifications: boolean;
  canManageSettings: boolean;
}

export function useRoleAccess() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole;

  const permissions: RolePermissions = {
    canViewStudents: ['admin', 'teacher'].includes(userRole),
    canEditStudents: ['admin'].includes(userRole),
    canViewTeachers: ['admin'].includes(userRole),
    canEditTeachers: ['admin'].includes(userRole),
    canViewClasses: ['admin', 'teacher', 'student'].includes(userRole),
    canEditClasses: ['admin', 'teacher'].includes(userRole),
    canViewGrades: ['admin', 'teacher', 'student'].includes(userRole),
    canEditGrades: ['admin', 'teacher'].includes(userRole),
    canViewAttendance: ['admin', 'teacher'].includes(userRole),
    canEditAttendance: ['admin', 'teacher'].includes(userRole),
    canViewReports: ['admin', 'teacher'].includes(userRole),
    canSendNotifications: ['admin', 'teacher'].includes(userRole),
    canManageSettings: ['admin'].includes(userRole),
  };

  const hasRole = (roles: UserRole[]) => {
    return userRole && roles.includes(userRole);
  };

  const hasPermission = (permission: keyof RolePermissions) => {
    return permissions[permission];
  };

  return {
    userRole,
    permissions,
    hasRole,
    hasPermission,
    isAdmin: userRole === 'admin',
    isTeacher: userRole === 'teacher',
    isStudent: userRole === 'student',
  };
}