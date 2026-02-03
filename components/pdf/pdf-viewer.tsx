'use client';

// ==========================================
// Rwanda Technology Institute Management System
// PDF Viewer Component
// ==========================================

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
}

export function PDFViewer({ url, title, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white border-b px-4 py-2">
        <div className="flex items-center gap-2">
          {title && <h3 className="font-medium text-gray-900">{title}</h3>}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <Button variant="ghost" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Page Navigation */}
          <div className="flex items-center gap-1 mx-2">
            <Button variant="ghost" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              {pageNumber} / {numPages || '-'}
            </span>
            <Button variant="ghost" size="sm" onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Download */}
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>

          {/* Close */}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        {loading && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null}
          error={
            <div className="text-center text-red-600">
              <p>Failed to load PDF</p>
              <p className="text-sm text-gray-500 mt-1">Please try again later</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            className="shadow-lg"
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
}
