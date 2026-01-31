'use client';

// ==========================================
// Rwanda Christian University Management System
// Classes Page
// ==========================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Search,
  Plus,
  BookOpen,
  Users,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS, formatTime } from '@/lib/utils';

interface ClassData {
  _id: string;
  classCode: string;
  name: string;
  department: string;
  credits: number;
  semester: string;
  academicYear: string;
  status: string;
  maxStudents: number;
  students: Array<{ _id: string; name: string }>;
  teacherId: { _id: string; name: string; email: string };
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }>;
}

export default function ClassesPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['classes', search, department, status, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(department && { department }),
        ...(status && { status }),
      });
      const res = await fetch(`/api/classes?${params}`);
      return res.json();
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'success' | 'warning' | 'danger'> = {
      active: 'success',
      completed: 'info' as 'success',
      cancelled: 'danger',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500">Manage courses and class schedules</p>
        </div>
        {(session?.user?.role === 'admin' || session?.user?.role === 'teacher') && (
          <Link href="/dashboard/classes/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Create Class</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search classes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={[
                { value: '', label: 'All Departments' },
                ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
              ]}
            />
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-2 text-gray-500">No classes found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((cls: ClassData) => (
            <Link key={cls._id} href={`/dashboard/classes/${cls._id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-mono text-xs text-gray-500">{cls.classCode}</p>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{cls.name}</h3>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(cls.status)}>{cls.status}</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>{cls.students?.length || 0} / {cls.maxStudents} students</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>{cls.semester} - {cls.academicYear}</span>
                    </div>

                    {cls.teacherId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{cls.teacherId.name}</span>
                      </div>
                    )}

                    {cls.schedule && cls.schedule.length > 0 && (
                      <div className="pt-3 border-t space-y-1">
                        {cls.schedule.slice(0, 2).map((sch, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>
                              {sch.day} {formatTime(sch.startTime)} - {formatTime(sch.endTime)}
                            </span>
                            <MapPin className="h-3 w-3 ml-2" />
                            <span>{sch.room}</span>
                          </div>
                        ))}
                        {cls.schedule.length > 2 && (
                          <p className="text-xs text-gray-400">
                            +{cls.schedule.length - 2} more sessions
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-xs text-gray-500">{cls.credits} credits</span>
                    <span className="text-xs text-gray-500">{cls.department}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, data.pagination.total)} of {data.pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
