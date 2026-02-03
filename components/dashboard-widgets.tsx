'use client';

// ==========================================
// Rwanda Technology Institute Management System
// Dashboard Widgets
// ==========================================

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  School,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  Bell,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoleAccess } from '@/lib/role-access';

// Stats Widget Component
export function StatsWidget() {
  const { userRole, isAdmin, isTeacher, isStudent } = useRoleAccess();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      return data.data;
    },
  });

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
      href: '/dashboard/students',
      roles: ['admin', 'teacher'],
    },
    {
      title: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      icon: Users,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase',
      href: '/dashboard/teachers',
      roles: ['admin'],
    },
    {
      title: 'Active Classes',
      value: stats?.activeClasses || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'increase',
      href: '/dashboard/classes',
      roles: ['admin', 'teacher'],
    },
    {
      title: 'Attendance Rate',
      value: `${stats?.attendanceRate || 0}%`,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: '+3%',
      changeType: 'increase',
      href: '/dashboard/attendance',
      roles: ['admin', 'teacher'],
    },
    {
      title: 'Average Grade',
      value: `${stats?.averageGrade || 0}%`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      change: '+2%',
      changeType: 'increase',
      href: '/dashboard/grades',
      roles: ['admin', 'teacher'],
    },
    {
      title: 'Notifications',
      value: stats?.pendingNotifications || 0,
      icon: Bell,
      color: 'bg-red-500',
      change: 'New',
      changeType: 'neutral',
      href: '/dashboard/notifications',
      roles: ['admin', 'teacher', 'student'],
    },
  ];

  // Student-specific cards
  const studentCards = [
    {
      title: 'Enrolled Classes',
      value: stats?.enrolledClasses || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '',
      changeType: 'neutral' as const,
      href: '/dashboard/classes',
    },
    {
      title: 'Completed Courses',
      value: stats?.completedCourses || 0,
      icon: GraduationCap,
      color: 'bg-green-500',
      change: '',
      changeType: 'neutral' as const,
      href: '/dashboard/grades',
    },
    {
      title: 'My Average',
      value: `${stats?.myAverageGrade || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '',
      changeType: 'neutral' as const,
      href: '/dashboard/grades',
    },
  ];

  // Teacher-specific cards
  const teacherCards = [
    {
      title: 'My Classes',
      value: stats?.myClasses || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '',
      changeType: 'neutral' as const,
      href: '/dashboard/classes',
    },
    {
      title: 'My Students',
      value: stats?.myStudents || 0,
      icon: GraduationCap,
      color: 'bg-green-500',
      change: '',
      changeType: 'neutral' as const,
      href: '/dashboard/students',
    },
  ];

  const displayCards =
    isStudent
      ? studentCards
      : isTeacher
      ? [...teacherCards, ...statCards.filter((c) => c.roles.includes('teacher'))]
      : statCards.filter((c) => c.roles.includes('admin'));

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {displayCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Link key={index} href={stat.href || '#'}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <div className="flex items-center gap-1 mt-2">
                        {stat.changeType === 'increase' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : stat.changeType === 'decrease' ? (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        ) : null}
                        <span
                          className={`text-xs font-medium ${
                            stat.changeType === 'increase'
                              ? 'text-green-600'
                              : stat.changeType === 'decrease'
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

// Quick Actions Widget
export function QuickActionsWidget() {
  const { userRole, isAdmin, isTeacher, isStudent } = useRoleAccess();

  const actions = [
    {
      title: 'Add Student',
      description: 'Register a new student',
      icon: Plus,
      href: '/dashboard/students/new',
      roles: ['admin'],
    },
    {
      title: 'Add Teacher',
      description: 'Register a new teacher',
      icon: Plus,
      href: '/dashboard/teachers/new',
      roles: ['admin'],
    },
    {
      title: 'Create Class',
      description: 'Set up a new class',
      icon: BookOpen,
      href: '/dashboard/classes/new',
      roles: ['admin', 'teacher'],
    },
    {
      title: 'Take Attendance',
      description: 'Mark student attendance',
      icon: CheckCircle,
      href: '/dashboard/attendance',
      roles: ['admin', 'teacher'],
    },
    {
      title: 'Upload Document',
      description: 'Add academic documents',
      icon: FileText,
      href: '/dashboard/documents',
      roles: ['admin', 'teacher', 'student'],
    },
    {
      title: 'View Grades',
      description: 'Check academic performance',
      icon: TrendingUp,
      href: '/dashboard/grades',
      roles: ['admin', 'teacher', 'student'],
    },
  ];

  const userActions = actions.filter(action => action.roles.includes(userRole || 'student'));

  return (
    <div className="space-y-4">
      {userActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link key={index} href={action.href}>
            <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{action.title}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// Recent Activity Widget
export function RecentActivityWidget() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // This would typically fetch from an API
      // For now, return mock data
      return [
        { title: 'New student registered', time: '2 hours ago', type: 'info' },
        { title: 'Grade submitted for Math 101', time: '4 hours ago', type: 'success' },
        { title: 'Class schedule updated', time: '1 day ago', type: 'warning' },
        { title: 'Attendance marked for CS 201', time: '2 days ago', type: 'success' },
      ];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities?.map((activity: any, index: number) => (
        <div key={index} className="flex items-start gap-3">
          <div className={`p-1 rounded-full ${
            activity.type === 'success' ? 'bg-green-100 text-green-600' :
            activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            {activity.type === 'success' ? <CheckCircle className="h-3 w-3" /> :
             activity.type === 'warning' ? <AlertCircle className="h-3 w-3" /> :
             <Bell className="h-3 w-3" />}
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground">{activity.title}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Welcome Widget
export function WelcomeWidget() {
  const { userRole, isAdmin, isTeacher, isStudent } = useRoleAccess();

  const getWelcomeMessage = () => {
    if (isAdmin) return 'Welcome to the administration dashboard.';
    if (isTeacher) return 'Welcome to your teaching dashboard.';
    return 'Welcome to your student dashboard.';
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20">
            <School className="h-8 w-8 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              Rwanda Technology Institute
            </h2>
            <p className="text-primary-foreground/80 mt-1">
              {getWelcomeMessage()}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/80">
        <Clock className="h-4 w-4" />
        <span>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}