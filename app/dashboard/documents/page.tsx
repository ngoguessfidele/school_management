'use client';

// ==========================================
// Rwanda Technology Institute Management System
// Documents Page
// ==========================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Search,
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Filter,
  FolderOpen,
  File,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { PDFViewer } from '@/components/pdf/pdf-viewer';
import { PDFUpload } from '@/components/pdf/pdf-upload';
import { formatDate } from '@/lib/utils';

interface Document {
  _id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  studentId?: { _id: string; name: string; studentId: string };
  category: string;
}

const DOCUMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'report-card', label: 'Report Card' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'admission', label: 'Admission Letter' },
  { value: 'other', label: 'Other' },
];

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // For admin/teacher, fetch all documents; for students, fetch their own
  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ['documents', search, docType],
    queryFn: async () => {
      // This would need a dedicated documents API endpoint
      // For now, we'll simulate with student documents
      const endpoint = session?.user?.role === 'student'
        ? `/api/students/${session.user.id}`
        : '/api/students?limit=100';
      const res = await fetch(endpoint);
      const data = await res.json();
      
      // Transform student PDF documents into a flat list
      if (session?.user?.role === 'student') {
        return data.data?.pdfDocuments || [];
      }
      
      const allDocs: any[] = [];
      data.data?.forEach((student: any) => {
        student.pdfDocuments?.forEach((doc: any) => {
          allDocs.push({
            ...doc,
            studentId: {
              _id: student._id,
              name: student.name,
              studentId: student.studentId,
            },
          });
        });
      });
      return allDocs;
    },
  });

  const filteredDocs = documentsData?.filter((doc: Document) => {
    const matchesSearch = !search || 
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.studentId?.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !docType || doc.type === docType;
    return matchesSearch && matchesType;
  }) || [];

  const handleViewDocument = (doc: Document) => {
    setSelectedDoc(doc);
    setShowViewerModal(true);
  };

  const getDocTypeIcon = (type: string) => {
    switch (type) {
      case 'transcript':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'report-card':
        return <File className="h-5 w-5 text-green-500" />;
      case 'certificate':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDocTypeBadge = (type: string) => {
    const variants: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
      transcript: 'info',
      'report-card': 'success',
      certificate: 'warning',
    };
    return <Badge variant={variants[type] || 'default'}>{type || 'document'}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500">Manage and view PDF documents</p>
        </div>
        {(session?.user?.role === 'admin' || session?.user?.role === 'teacher') && (
          <Button
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => setShowUploadModal(true)}
          >
            Upload Document
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <Select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              options={DOCUMENT_TYPES}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {session?.user?.role === 'admin' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Generate Transcripts</p>
                  <p className="text-sm text-gray-500">Bulk generate for students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <File className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Report Cards</p>
                  <p className="text-sm text-gray-500">Generate semester reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Document Archive</p>
                  <p className="text-sm text-gray-500">Browse all documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-500">Loading documents...</p>
          </CardContent>
        </Card>
      ) : filteredDocs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FolderOpen className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">No documents found</p>
            {(session?.user?.role === 'admin' || session?.user?.role === 'teacher') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowUploadModal(true)}
              >
                Upload First Document
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocs.map((doc: Document, index: number) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    {getDocTypeIcon(doc.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                    {doc.studentId && (
                      <p className="text-sm text-gray-500 truncate">
                        {doc.studentId.name} ({doc.studentId.studentId})
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {getDocTypeBadge(doc.type)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    {session?.user?.role === 'admin' && (
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        description="Upload a PDF document to the system"
      >
        <PDFUpload
          onUploadSuccess={() => {
            setShowUploadModal(false);
            refetch();
          }}
          onUploadError={(error) => alert(error)}
        />
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        isOpen={showViewerModal}
        onClose={() => setShowViewerModal(false)}
        title={selectedDoc?.name || 'Document Viewer'}
        size="xl"
      >
        {selectedDoc && (
          <div className="h-[600px]">
            <PDFViewer url={selectedDoc.url} title={selectedDoc.name} />
          </div>
        )}
      </Modal>
    </div>
  );
}
