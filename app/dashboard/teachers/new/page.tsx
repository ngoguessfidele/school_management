'use client';

// ==========================================
// Rwanda Christian University Management System
// Add/Edit Teacher Form
// ==========================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DEPARTMENTS } from '@/lib/utils';

const QUALIFICATIONS = [
  "Bachelor's Degree",
  "Master's Degree",
  "Ph.D.",
  "Professor",
  "Associate Professor",
];

export default function NewTeacherPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    specialization: '',
    qualification: '',
    hireDate: new Date().toISOString().split('T')[0],
    officeLocation: '',
    status: 'active',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create teacher');
      }
      return res.json();
    },
    onSuccess: (data) => {
      router.push(`/dashboard/teachers/${data.data._id}`);
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
        <Link href="/dashboard/teachers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Teacher</h1>
          <p className="text-gray-500">Register a new faculty member</p>
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
                placeholder="Enter teacher's full name"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="teacher@rcu.edu.rw"
              />
              <Input
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+250 7XX XXX XXX"
              />
              <Input
                label="Office Location"
                value={formData.officeLocation}
                onChange={(e) => handleChange('officeLocation', e.target.value)}
                placeholder="Building A, Room 101"
              />
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
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
              <Input
                label="Specialization"
                value={formData.specialization}
                onChange={(e) => handleChange('specialization', e.target.value)}
                required
                placeholder="e.g., Software Engineering, Data Science"
              />
              <Select
                label="Qualification"
                value={formData.qualification}
                onChange={(e) => handleChange('qualification', e.target.value)}
                required
                options={[
                  { value: '', label: 'Select Qualification' },
                  ...QUALIFICATIONS.map((q) => ({ value: q, label: q })),
                ]}
              />
              <Input
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleChange('hireDate', e.target.value)}
                required
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'on-leave', label: 'On Leave' },
                  { value: 'retired', label: 'Retired' },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/dashboard/teachers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            leftIcon={<Save className="h-4 w-4" />}
            isLoading={createMutation.isPending}
          >
            Create Teacher
          </Button>
        </div>
      </form>
    </div>
  );
}
