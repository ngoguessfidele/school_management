'use client';

// ==========================================
// Rwanda Technology Institute Management System
// Add/Edit Student Form
// ==========================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DEPARTMENTS, PROGRAMS } from '@/lib/utils';

export default function NewStudentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    department: '',
    program: '',
    year: '1',
    semester: '1',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create student');
      }
      return res.json();
    },
    onSuccess: (data) => {
      router.push(`/dashboard/students/${data.data._id}`);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-gray-500">Register a new student in the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="Enter student's full name"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="student@rcu.edu.rw"
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+250 7XX XXX XXX"
              />
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Kigali, Rwanda"
              />
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Select
                label="Program"
                value={formData.program}
                onChange={(e) => handleChange('program', e.target.value)}
                required
                options={[
                  { value: '', label: 'Select Program' },
                  ...PROGRAMS.map((p) => ({ value: p, label: p })),
                ]}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Year"
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  options={[
                    { value: '1', label: 'Year 1' },
                    { value: '2', label: 'Year 2' },
                    { value: '3', label: 'Year 3' },
                    { value: '4', label: 'Year 4' },
                    { value: '5', label: 'Year 5' },
                  ]}
                />
                <Select
                  label="Semester"
                  value={formData.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  options={[
                    { value: '1', label: 'Semester 1' },
                    { value: '2', label: 'Semester 2' },
                  ]}
                />
              </div>
              <Input
                label="Enrollment Date"
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => handleChange('enrollmentDate', e.target.value)}
                required
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'graduated', label: 'Graduated' },
                  { value: 'withdrawn', label: 'Withdrawn' },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/dashboard/students">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            isLoading={createMutation.isPending}
          >
            Create Student
          </Button>
        </div>
      </form>
    </div>
  );
}
