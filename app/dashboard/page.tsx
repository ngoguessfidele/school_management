'use client';

// ==========================================
// Rwanda Christian University Management System
// Dashboard Page
// ==========================================

import { useSession, signOut } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { RoleGuard, AdminOnly, StaffOnly } from '@/components/role-guard';
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
  const { data: session } = useSession();
  const { userRole, isAdmin, isTeacher, isStudent } = useRoleAccess();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
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
      href: '/dashboard/classes',
      change: undefined as string | undefined,
      changeType: undefined as 'increase' | 'decrease' | 'neutral' | undefined,
    },
    {
      title: 'Completed Courses',
      value: stats?.completedCourses || 0,
      icon: GraduationCap,
      color: 'bg-green-500',
      href: '/dashboard/grades',
      change: undefined as string | undefined,
      changeType: undefined as 'increase' | 'decrease' | 'neutral' | undefined,
    },
    {
      title: 'My Average',
      value: `${stats?.myAverageGrade || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/dashboard/grades',
      change: undefined as string | undefined,
      changeType: undefined as 'increase' | 'decrease' | 'neutral' | undefined,
    },
    {
      title: 'Notifications',
      value: stats?.pendingNotifications || 0,
      icon: Bell,
      color: 'bg-red-500',
      href: '/dashboard/notifications',
      change: undefined as string | undefined,
      changeType: undefined as 'increase' | 'decrease' | 'neutral' | undefined,
    },
  ];

  // Teacher-specific cards
  const teacherCards = [
    {
      title: 'My Classes',
      value: stats?.myClasses || 0,
      icon: BookOpen,
      color: 'bg-blue-500',
      href: '/dashboard/classes',
      change: undefined as string | undefined,
      changeType: undefined as 'increase' | 'decrease' | 'neutral' | undefined,
    },
    {
      title: 'My Students',
      value: stats?.myStudents || 0,
      icon: GraduationCap,
      color: 'bg-green-500',
      href: '/dashboard/students',
      change: undefined as string | undefined,
      changeType: undefined as 'increase' | 'decrease' | 'neutral' | undefined,
    },
  ];

  const displayCards =
    isStudent
      ? studentCards
      : isTeacher
      ? [...teacherCards, ...statCards.filter((c) => c.roles.includes('teacher'))]
      : statCards.filter((c) => c.roles.includes('admin'));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20">
              <School className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Welcome to Rwanda Christian University
              </h1>
              <RoleGuard roles={['admin']} fallback={
                <RoleGuard roles={['teacher']} fallback={
                  <p className="text-blue-100 mt-1">
                    Hello, {session?.user?.name}! Welcome to your student dashboard.
                  </p>
                }>
                  <p className="text-blue-100 mt-1">
                    Hello, {session?.user?.name}! Welcome to your teaching dashboard.
                  </p>
                </RoleGuard>
              }>
                <p className="text-blue-100 mt-1">
                  Hello, {session?.user?.name}! Welcome to the administration dashboard.
                </p>
              </RoleGuard>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
            Sign Out
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-200">
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

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded" />
                  </CardContent>
                </Card>
              ))
          : displayCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link key={index} href={stat.href || '#'}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {stat.value}
                          </p>
                          {'change' in stat && (
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
                                    : 'text-gray-500'
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

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <AdminOnly>
                <Link
                  href="/dashboard/students?action=add"
                  className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                >
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Add Student</span>
                </Link>
                <Link
                  href="/dashboard/teachers?action=add"
                  className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Add Teacher</span>
                </Link>
              </AdminOnly>
              <StaffOnly>
                <Link
                  href="/dashboard/classes?action=add"
                  className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Create Class</span>
                </Link>
                <Link
                  href="/dashboard/attendance"
                  className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">Take Attendance</span>
                </Link>
              </StaffOnly>
              <Link
                href="/dashboard/schedule"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
              >
                <Clock className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium">View Schedule</span>
              </Link>
              <Link
                href="/dashboard/notifications"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
              >
                <Bell className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium">Notifications</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: 'New student enrolled',
                  description: 'John Doe enrolled in Computer Science',
                  time: '2 hours ago',
                  type: 'success',
                },
                {
                  action: 'Grades updated',
                  description: 'CS101 midterm grades posted',
                  time: '4 hours ago',
                  type: 'info',
                },
                {
                  action: 'Attendance recorded',
                  description: 'Morning classes attendance completed',
                  time: '6 hours ago',
                  type: 'default',
                },
                {
                  action: 'New notification',
                  description: 'Academic calendar updated',
                  time: '1 day ago',
                  type: 'warning',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success'
                        ? 'bg-green-500'
                        : activity.type === 'info'
                        ? 'bg-blue-500'
                        : activity.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Today&apos;s Schedule</CardTitle>
          <Link
            href="/dashboard/schedule"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View Full Schedule
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                time: '08:00 - 10:00',
                class: 'Introduction to Programming',
                room: 'Room A101',
                status: 'completed',
              },
              {
                time: '10:30 - 12:30',
                class: 'Database Systems',
                room: 'Room B203',
                status: 'ongoing',
              },
              {
                time: '14:00 - 16:00',
                class: 'Web Development',
                room: 'Lab C105',
                status: 'upcoming',
              },
              {
                time: '16:30 - 18:00',
                class: 'Software Engineering',
                room: 'Room A102',
                status: 'upcoming',
              },
            ].map((schedule, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50"
              >
                <div className="text-sm font-medium text-gray-900 w-32">
                  {schedule.time}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {schedule.class}
                  </p>
                  <p className="text-xs text-gray-500">{schedule.room}</p>
                </div>
                <Badge
                  variant={
                    schedule.status === 'completed'
                      ? 'success'
                      : schedule.status === 'ongoing'
                      ? 'info'
                      : 'default'
                  }
                  size="sm"
                >
                  {schedule.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
