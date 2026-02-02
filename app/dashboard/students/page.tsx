'use client';

// ==========================================
// Rwanda Christian University Management System
// Students List Page
// ==========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  GraduationCap,
  Mail,
  Phone,
} from 'lucide-react';
import { AdvancedSearch } from '@/components/advanced-search';
import { BulkOperations, useBulkSelection } from '@/components/bulk-operations';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { DEPARTMENTS } from '@/lib/utils';

interface Student {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  department: string;
  program: string;
  year: number;
  semester: number;
  status: string;
  phone?: string;
  enrolledClasses: Array<{ _id: string; name: string; classCode: string }>;
}

export default function StudentsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { selectedIds, setSelectedIds, toggleSelection, clearSelection } = useBulkSelection();

  const [filters, setFilters] = useState<Record<string, any>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['students', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters,
      });
      const res = await fetch(`/api/students?${params}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setShowDeleteModal(false);
      setSelectedStudent(null);
    },
  });

  const handleDelete = () => {
    if (selectedStudent) {
      deleteMutation.mutate(selectedStudent._id);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      active: 'success',
      suspended: 'warning',
      withdrawn: 'danger',
      graduated: 'info',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const bulkOperations = [
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      action: async (ids: string[]) => {
        // Implement export functionality
        console.log('Exporting students:', ids);
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'danger' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Delete Students',
      confirmationMessage: 'Are you sure you want to delete the selected students? This action cannot be undone.',
      action: async (ids: string[]) => {
        // Implement bulk delete
        for (const id of ids) {
          await fetch(`/api/students/${id}`, { method: 'DELETE' });
        }
        queryClient.invalidateQueries({ queryKey: ['students'] });
        clearSelection();
      },
    },
  ];

  const searchFields = [
    {
      name: 'department',
      label: 'Department',
      type: 'select' as const,
      options: DEPARTMENTS.map((d) => ({ value: d, label: d })),
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'graduated', label: 'Graduated' },
        { value: 'withdrawn', label: 'Withdrawn' },
      ],
    },
    {
      name: 'year',
      label: 'Year',
      type: 'select' as const,
      options: [
        { value: '1', label: 'Year 1' },
        { value: '2', label: 'Year 2' },
        { value: '3', label: 'Year 3' },
        { value: '4', label: 'Year 4' },
      ],
    },
    {
      name: 'program',
      label: 'Program',
      type: 'text' as const,
      placeholder: 'Enter program name',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage student records and profiles</p>
        </div>
        {session?.user?.role === 'admin' && (
          <Link href="/dashboard/students/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Student</Button>
          </Link>
        )}
      </div>

      {/* Advanced Search */}
      <AdvancedSearch
        onSearch={setFilters}
        searchFields={searchFields}
        initialFilters={filters}
      />

      {/* Students Table */}
      <Card>
        <BulkOperations
          items={data?.data || []}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          getItemId={(student: Student) => student._id}
          operations={bulkOperations}
        />

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-2 text-gray-500">Loading students...</p>
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="p-8 text-center">
              <GraduationCap className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-2 text-gray-500">No students found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === data?.data?.length && data?.data?.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(data?.data?.map((s: Student) => s._id) || []);
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-border"
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((student: Student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(student._id)}
                        onChange={() => toggleSelection(student._id)}
                        className="rounded border-border"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {student.studentId}
                    </TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>Year {student.year}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/students/${student._id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {session?.user?.role === 'admin' && (
                          <>
                            <Link href={`/dashboard/students/${student._id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {(page - 1) * 10 + 1} to{' '}
              {Math.min(page * 10, data.pagination.total)} of{' '}
              {data.pagination.total} students
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
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Student"
        description="Are you sure you want to delete this student? This action cannot be undone."
      >
        <div className="space-y-4">
          {selectedStudent && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedStudent.name}</p>
              <p className="text-sm text-gray-500">{selectedStudent.studentId}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
