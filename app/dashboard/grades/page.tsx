'use client';

// ==========================================
// Rwanda Christian University Management System
// Grades / Gradebook Page
// ==========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Search,
  Download,
  Save,
  BookOpen,
  GraduationCap,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { calculateGrade, getGradeColor } from '@/lib/utils';

interface GradeEntry {
  studentId: string;
  studentName: string;
  studentCode: string;
  score: number | null;
  grade: string;
}

export default function GradesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [editedGrades, setEditedGrades] = useState<Record<string, number>>({});

  // Fetch classes for the dropdown
  const { data: classesData } = useQuery({
    queryKey: ['classes-dropdown'],
    queryFn: async () => {
      const res = await fetch('/api/classes?limit=100&status=active');
      return res.json();
    },
  });

  // Fetch grades for selected class
  const { data: gradesData, isLoading } = useQuery({
    queryKey: ['grades', selectedClass, semester, academicYear],
    queryFn: async () => {
      if (!selectedClass) return null;
      const params = new URLSearchParams({
        classId: selectedClass,
        semester,
        academicYear,
      });
      const res = await fetch(`/api/grades?${params}`);
      return res.json();
    },
    enabled: !!selectedClass,
  });

  // Save grades mutation
  const saveMutation = useMutation({
    mutationFn: async (grades: Array<{ studentId: string; score: number }>) => {
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClass,
          semester,
          academicYear,
          grades,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setEditedGrades({});
      alert('Grades saved successfully!');
    },
  });

  const handleScoreChange = (studentId: string, score: string) => {
    const numScore = parseInt(score);
    if (!isNaN(numScore) && numScore >= 0 && numScore <= 100) {
      setEditedGrades((prev) => ({ ...prev, [studentId]: numScore }));
    }
  };

  const handleSaveGrades = () => {
    const grades = Object.entries(editedGrades).map(([studentId, score]) => ({
      studentId,
      score,
    }));
    if (grades.length > 0) {
      saveMutation.mutate(grades);
    }
  };

  const handleExportGrades = () => {
    if (selectedClass) {
      window.open(
        `/api/generate-report?classId=${selectedClass}&type=report-card&semester=${semester}&academicYear=${academicYear}`,
        '_blank'
      );
    }
  };

  const canEditGrades = session?.user?.role === 'admin' || session?.user?.role === 'teacher';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gradebook</h1>
          <p className="text-gray-500">View and manage student grades</p>
        </div>
        {canEditGrades && Object.keys(editedGrades).length > 0 && (
          <Button
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSaveGrades}
            isLoading={saveMutation.isPending}
          >
            Save Changes ({Object.keys(editedGrades).length})
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Class"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setEditedGrades({});
              }}
              options={[
                { value: '', label: 'Select a class' },
                ...(classesData?.data?.map((c: any) => ({
                  value: c._id,
                  label: `${c.classCode} - ${c.name}`,
                })) || []),
              ]}
            />
            <Select
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              options={[
                { value: 'Semester 1', label: 'Semester 1' },
                { value: 'Semester 2', label: 'Semester 2' },
                { value: 'Summer', label: 'Summer' },
              ]}
            />
            <Select
              label="Academic Year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              options={[
                { value: '2025-2026', label: '2025-2026' },
                { value: '2024-2025', label: '2024-2025' },
                { value: '2023-2024', label: '2023-2024' },
              ]}
            />
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleExportGrades}
                disabled={!selectedClass}
              >
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      {!selectedClass ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">Select a class to view grades</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-500">Loading grades...</p>
          </CardContent>
        </Card>
      ) : gradesData?.data?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">No students enrolled in this class</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {classesData?.data?.find((c: any) => c._id === selectedClass)?.name || 'Class'} - Grades
              </CardTitle>
              <Badge variant="info">
                {gradesData?.data?.length || 0} students
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead className="text-center">Score (0-100)</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradesData?.data?.map((entry: GradeEntry) => {
                  const currentScore = editedGrades[entry.studentId] ?? entry.score;
                  const currentGrade = currentScore !== null ? calculateGrade(currentScore) : '-';
                  const hasChanged = editedGrades[entry.studentId] !== undefined;

                  return (
                    <TableRow key={entry.studentId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {entry.studentName.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{entry.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.studentCode}
                      </TableCell>
                      <TableCell className="text-center">
                        {canEditGrades ? (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={currentScore ?? ''}
                            onChange={(e) => handleScoreChange(entry.studentId, e.target.value)}
                            className={`w-20 mx-auto text-center ${hasChanged ? 'border-yellow-400 bg-yellow-50' : ''}`}
                          />
                        ) : (
                          <span>{currentScore ?? '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(currentGrade)}`}>
                          {currentGrade}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {currentScore !== null ? (
                          currentScore >= 50 ? (
                            <Badge variant="success">Pass</Badge>
                          ) : (
                            <Badge variant="danger">Fail</Badge>
                          )
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Grade Scale Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Grade Scale Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {[
              { grade: 'A', range: '90-100', color: 'bg-green-100 text-green-800' },
              { grade: 'B', range: '80-89', color: 'bg-blue-100 text-blue-800' },
              { grade: 'C', range: '70-79', color: 'bg-yellow-100 text-yellow-800' },
              { grade: 'D', range: '60-69', color: 'bg-orange-100 text-orange-800' },
              { grade: 'E', range: '50-59', color: 'bg-red-100 text-red-800' },
              { grade: 'F', range: '0-49', color: 'bg-red-200 text-red-900' },
            ].map((item) => (
              <div key={item.grade} className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-sm font-medium ${item.color}`}>
                  {item.grade}
                </span>
                <span className="text-sm text-gray-500">{item.range}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
