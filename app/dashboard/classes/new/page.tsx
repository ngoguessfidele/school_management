'use client';

// ==========================================
// Rwanda Technology Institute Management System
// Create New Class Form
// ==========================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, Plus, Trash2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DEPARTMENTS } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface ScheduleItem {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export default function NewClassPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    classCode: '',
    department: '',
    credits: '3',
    semester: 'Semester 1',
    academicYear: '2025-2026',
    maxStudents: '50',
    teacherId: '',
    description: '',
    status: 'active',
  });

  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { day: 'Monday', startTime: '08:00', endTime: '10:00', room: '' },
  ]);

  // Fetch teachers for dropdown
  const { data: teachersData } = useQuery({
    queryKey: ['teachers-dropdown'],
    queryFn: async () => {
      const res = await fetch('/api/teachers?limit=100&status=active');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create class');
      }
      return res.json();
    },
    onSuccess: (data) => {
      router.push(`/dashboard/classes/${data.data._id}`);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      credits: parseInt(formData.credits),
      maxStudents: parseInt(formData.maxStudents),
      schedule: schedule.filter((s) => s.room), // Only include complete schedule items
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addScheduleItem = () => {
    setSchedule((prev) => [
      ...prev,
      { day: 'Monday', startTime: '08:00', endTime: '10:00', room: '' },
    ]);
  };

  const removeScheduleItem = (index: number) => {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/classes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Class</h1>
          <p className="text-gray-500">Set up a new course for the semester</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Course Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="e.g., Introduction to Computer Science"
              />
              <Input
                label="Class Code"
                value={formData.classCode}
                onChange={(e) => handleChange('classCode', e.target.value.toUpperCase())}
                required
                placeholder="e.g., CS101"
              />
              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                required
                options={[
                  { value: '', label: 'Select Department' },
                  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
                ]}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Course description..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Credits"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.credits}
                  onChange={(e) => handleChange('credits', e.target.value)}
                  required
                />
                <Input
                  label="Max Students"
                  type="number"
                  min="1"
                  value={formData.maxStudents}
                  onChange={(e) => handleChange('maxStudents', e.target.value)}
                  required
                />
              </div>
              <Select
                label="Semester"
                value={formData.semester}
                onChange={(e) => handleChange('semester', e.target.value)}
                options={[
                  { value: 'Semester 1', label: 'Semester 1' },
                  { value: 'Semester 2', label: 'Semester 2' },
                  { value: 'Summer', label: 'Summer' },
                ]}
              />
              <Select
                label="Academic Year"
                value={formData.academicYear}
                onChange={(e) => handleChange('academicYear', e.target.value)}
                options={[
                  { value: '2025-2026', label: '2025-2026' },
                  { value: '2024-2025', label: '2024-2025' },
                  { value: '2026-2027', label: '2026-2027' },
                ]}
              />
              <Select
                label="Assigned Teacher"
                value={formData.teacherId}
                onChange={(e) => handleChange('teacherId', e.target.value)}
                options={[
                  { value: '', label: 'Select Teacher (Optional)' },
                  ...(teachersData?.data?.map((t: any) => ({
                    value: t._id,
                    label: `${t.name} - ${t.department}`,
                  })) || []),
                ]}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Schedule */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Class Schedule</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addScheduleItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.map((item, index) => (
                <div key={index} className="flex items-end gap-4 p-4 bg-gray-50 rounded-lg">
                  <Select
                    label="Day"
                    value={item.day}
                    onChange={(e) => updateScheduleItem(index, 'day', e.target.value)}
                    options={DAYS.map((d) => ({ value: d, label: d }))}
                  />
                  <Input
                    label="Start Time"
                    type="time"
                    value={item.startTime}
                    onChange={(e) => updateScheduleItem(index, 'startTime', e.target.value)}
                  />
                  <Input
                    label="End Time"
                    type="time"
                    value={item.endTime}
                    onChange={(e) => updateScheduleItem(index, 'endTime', e.target.value)}
                  />
                  <Input
                    label="Room"
                    value={item.room}
                    onChange={(e) => updateScheduleItem(index, 'room', e.target.value)}
                    placeholder="e.g., Room 101"
                  />
                  {schedule.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeScheduleItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/dashboard/classes">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            isLoading={createMutation.isPending}
          >
            Create Class
          </Button>
        </div>
      </form>
    </div>
  );
}
