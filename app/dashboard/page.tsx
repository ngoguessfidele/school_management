'use client';

// ==========================================
// Rwanda Technology Institute Management System
// Dashboard Page
// ==========================================

import { CustomizableDashboard } from '@/components/customizable-dashboard';
import {
  StatsWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  WelcomeWidget,
} from '@/components/dashboard-widgets';
import { useRoleAccess } from '@/lib/role-access';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  attendanceRate: number;
  averageGrade: number;
  pendingNotifications: number;
  enrolledClasses?: number;
  completedCourses?: number;
  myAverageGrade?: number;
  myClasses?: number;
  myStudents?: number;
}

export default function DashboardPage() {
  const { userRole } = useRoleAccess();

  // Define available dashboard widgets
  const availableWidgets = [
    {
      id: 'welcome',
      title: 'Welcome',
      component: WelcomeWidget,
      roles: ['admin', 'teacher', 'student'],
      defaultVisible: true,
      category: 'Overview',
      description: 'Personalized welcome message and current date',
    },
    {
      id: 'stats',
      title: 'Statistics',
      component: StatsWidget,
      roles: ['admin', 'teacher', 'student'],
      defaultVisible: true,
      category: 'Overview',
      description: 'Key metrics and statistics overview',
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      component: QuickActionsWidget,
      roles: ['admin', 'teacher', 'student'],
      defaultVisible: true,
      category: 'Actions',
      description: 'Common tasks and shortcuts',
    },
    {
      id: 'recent-activity',
      title: 'Recent Activity',
      component: RecentActivityWidget,
      roles: ['admin', 'teacher', 'student'],
      defaultVisible: true,
      category: 'Activity',
      description: 'Latest system activities and updates',
    },
  ];

  // Define default layouts for each role
  const getDefaultLayout = (role: string) => {
    switch (role) {
      case 'admin':
        return ['welcome', 'stats', 'quick-actions', 'recent-activity'];
      case 'teacher':
        return ['welcome', 'stats', 'quick-actions', 'recent-activity'];
      case 'student':
        return ['welcome', 'stats', 'quick-actions', 'recent-activity'];
      default:
        return ['welcome', 'stats', 'quick-actions'];
    }
  };

  return (
    <CustomizableDashboard
      availableWidgets={availableWidgets}
      defaultLayout={getDefaultLayout(userRole || 'student')}
    />
  );
}
