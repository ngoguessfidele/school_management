'use client';

// ==========================================
// Rwanda Technology Institute Management System
// PDF Upload Component
// ==========================================

import { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PDFUploadProps {
  studentId?: string;
  onUploadSuccess?: (document: { name: string; url: string; publicId: string }) => void;
  onUploadError?: (error: string) => void;
}

export function PDFUpload({ studentId, onUploadSuccess, onUploadError }: PDFUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setDocumentName(droppedFile.name.replace('.pdf', ''));
      } else {
        onUploadError?.('Only PDF files are allowed');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setDocumentName(selectedFile.name.replace('.pdf', ''));
      } else {
        onUploadError?.('Only PDF files are allowed');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (studentId) {
        formData.append('studentId', studentId);
      }
      formData.append('documentName', documentName || file.name);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUploadSuccess?.(result.data);
        setFile(null);
        setDocumentName('');
      } else {
        onUploadError?.(result.error || 'Upload failed');
      }
    } catch (error) {
      onUploadError?.('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setDocumentName('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">
            Drag and drop a PDF file, or click to select
          </p>
          <p className="mt-1 text-xs text-gray-500">PDF files only, max 10MB</p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-10 w-10 text-red-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={clearFile}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Name
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Enter document name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleUpload}
            isLoading={uploading}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Upload Document
          </Button>
        </div>
      )}
    </div>
  );
}
