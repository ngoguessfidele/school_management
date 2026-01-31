'use client';

// ==========================================
// Rwanda Christian University Management System
// Student Profile Page
// ==========================================

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  FileText,
  Download,
  Eye,
  GraduationCap,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, getStatusColor, getGradeColor } from '@/lib/utils';
import { PDFUpload } from '@/components/pdf/pdf-upload';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { PDFViewer } from '@/components/pdf/pdf-viewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; name: string } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: student, isLoading, refetch } = useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const res = await fetch(`/api/students/${id}`);
      const data = await res.json();
      return data.data;
    },
  });

  const handleGenerateTranscript = async () => {
    window.open(`/api/generate-report?studentId=${id}&type=transcript`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-12 w-12 text-gray-300 mx-auto" />
        <h2 className="mt-4 text-lg font-medium text-gray-900">Student not found</h2>
        <Link href="/dashboard/students">
          <Button className="mt-4">Back to Students</Button>
        </Link>
      </div>
    );
  }

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
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {student.name.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                  <p className="text-gray-500 font-mono">{student.studentId}</p>
                  <div className="mt-2">
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/students/${id}/edit`}>
                    <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />}>
                      Edit Profile
                    </Button>
                  </Link>
                  <Button
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={handleGenerateTranscript}
                  >
                    Download Transcript
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{student.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">{student.department}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Enrolled {formatDate(student.enrollmentDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="text-gray-500">Program</dt>
                <dd className="font-medium">{student.program}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Department</dt>
                <dd className="font-medium">{student.department}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Year</dt>
                <dd className="font-medium">Year {student.year}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Semester</dt>
                <dd className="font-medium">Semester {student.semester}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Enrolled Classes</dt>
                <dd className="font-medium">{student.enrolledClasses?.length || 0}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Grades Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grades</CardTitle>
            <Link href={`/dashboard/grades?studentId=${id}`}>
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {student.grades?.length > 0 ? (
              <div className="space-y-3">
                {student.grades.slice(0, 5).map((grade: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {grade.classId?.name || 'Unknown Course'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {grade.semester} - {grade.academicYear}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{grade.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No grades recorded yet</p>
            )}
          </CardContent>
        </Card>

        {/* Enrolled Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {student.enrolledClasses?.length > 0 ? (
              <div className="space-y-3">
                {student.enrolledClasses.map((cls: any) => (
                  <Link
                    key={cls._id}
                    href={`/dashboard/classes/${cls._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{cls.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{cls.classCode}</p>
                    </div>
                    <BookOpen className="h-4 w-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Not enrolled in any classes</p>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Documents</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUploadModal(true)}
            >
              Upload PDF
            </Button>
          </CardHeader>
          <CardContent>
            {student.pdfDocuments?.length > 0 ? (
              <div className="space-y-3">
                {student.pdfDocuments.map((doc: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPdf({ url: doc.url, name: doc.name });
                          setShowPdfViewer(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No documents uploaded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PDF Viewer Modal */}
      <Modal
        isOpen={showPdfViewer}
        onClose={() => setShowPdfViewer(false)}
        title={selectedPdf?.name || 'Document Viewer'}
        size="xl"
      >
        {selectedPdf && (
          <div className="h-[600px]">
            <PDFViewer url={selectedPdf.url} title={selectedPdf.name} />
          </div>
        )}
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        description="Upload a PDF document to the student's profile"
      >
        <PDFUpload
          studentId={id}
          onUploadSuccess={() => {
            setShowUploadModal(false);
            refetch();
          }}
          onUploadError={(error) => alert(error)}
        />
      </Modal>
    </div>
  );
}
