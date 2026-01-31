'use client';

// ==========================================
// Rwanda Christian University Management System
// Attendance Tracker Page
// ==========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  studentCode: string;
  status: AttendanceStatus;
}

export default function AttendancePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editedAttendance, setEditedAttendance] = useState<Record<string, AttendanceStatus>>({});

  // Fetch classes
  const { data: classesData } = useQuery({
    queryKey: ['classes-dropdown'],
    queryFn: async () => {
      const res = await fetch('/api/classes?limit=100&status=active');
      return res.json();
    },
  });

  // Fetch attendance for selected class and date
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', selectedClass, selectedDate],
    queryFn: async () => {
      if (!selectedClass) return null;
      const params = new URLSearchParams({
        classId: selectedClass,
        date: selectedDate,
      });
      const res = await fetch(`/api/attendance?${params}`);
      return res.json();
    },
    enabled: !!selectedClass,
  });

  // Save attendance mutation
  const saveMutation = useMutation({
    mutationFn: async (records: Array<{ studentId: string; status: AttendanceStatus }>) => {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          records,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setEditedAttendance({});
      alert('Attendance saved successfully!');
    },
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setEditedAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(editedAttendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));
    if (records.length > 0) {
      saveMutation.mutate(records);
    }
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const allRecords: Record<string, AttendanceStatus> = {};
    attendanceData?.data?.forEach((record: AttendanceRecord) => {
      allRecords[record.studentId] = status;
    });
    setEditedAttendance(allRecords);
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
    setEditedAttendance({});
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, 'success' | 'danger' | 'warning' | 'info'> = {
      present: 'success',
      absent: 'danger',
      late: 'warning',
      excused: 'info',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const canEditAttendance = session?.user?.role === 'admin' || session?.user?.role === 'teacher';

  // Calculate statistics
  const stats = attendanceData?.data?.reduce(
    (acc: Record<string, number>, record: AttendanceRecord) => {
      const status = editedAttendance[record.studentId] || record.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0 }
  ) || { present: 0, absent: 0, late: 0, excused: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
          <p className="text-gray-500">Track and manage class attendance</p>
        </div>
        {canEditAttendance && Object.keys(editedAttendance).length > 0 && (
          <Button
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSaveAttendance}
            isLoading={saveMutation.isPending}
          >
            Save Changes ({Object.keys(editedAttendance).length})
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Select
                label="Class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setEditedAttendance({});
                }}
                options={[
                  { value: '', label: 'Select a class' },
                  ...(classesData?.data?.map((c: any) => ({
                    value: c._id,
                    label: `${c.classCode} - ${c.name}`,
                  })) || []),
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => changeDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setEditedAttendance({});
                  }}
                  className="bg-transparent border-none focus:outline-none text-sm font-medium"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => changeDate(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {selectedClass && attendanceData?.data?.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Excused</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance List */}
      {!selectedClass ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">Select a class to track attendance</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-500">Loading attendance...</p>
          </CardContent>
        </Card>
      ) : attendanceData?.data?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">No students enrolled in this class</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>
                Attendance for {formatDate(selectedDate)}
              </CardTitle>
              {canEditAttendance && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll('present')}
                  >
                    Mark All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll('absent')}
                  >
                    Mark All Absent
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceData?.data?.map((record: AttendanceRecord) => {
                const currentStatus = editedAttendance[record.studentId] || record.status;
                const hasChanged = editedAttendance[record.studentId] !== undefined;

                return (
                  <div
                    key={record.studentId}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      hasChanged ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {record.studentName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{record.studentName}</p>
                        <p className="text-sm text-gray-500 font-mono">{record.studentCode}</p>
                      </div>
                    </div>

                    {canEditAttendance ? (
                      <div className="flex gap-2">
                        {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(record.studentId, status)}
                              className={`p-2 rounded-lg transition-colors ${
                                currentStatus === status
                                  ? status === 'present'
                                    ? 'bg-green-100 ring-2 ring-green-500'
                                    : status === 'absent'
                                    ? 'bg-red-100 ring-2 ring-red-500'
                                    : status === 'late'
                                    ? 'bg-yellow-100 ring-2 ring-yellow-500'
                                    : 'bg-blue-100 ring-2 ring-blue-500'
                                  : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                              title={status.charAt(0).toUpperCase() + status.slice(1)}
                            >
                              {getStatusIcon(status)}
                            </button>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(currentStatus)}
                        {getStatusBadge(currentStatus)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
