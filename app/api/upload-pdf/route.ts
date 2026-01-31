// ==========================================
// Rwanda Christian University Management System
// PDF Upload API Route
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { uploadPDF } from '@/lib/cloudinary';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;
    const documentName = formData.get('documentName') as string;

    if (!file || !studentId) {
      return NextResponse.json(
        { success: false, error: 'File and studentId are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Students can only upload to their own profile
    if (session.user.role === 'student' && student.userId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${student.studentId}_${timestamp}`;

    // Upload to Cloudinary
    const result = await uploadPDF(buffer, `students/${studentId}`, filename);

    // Save document reference to student
    const pdfDocument = {
      name: documentName || file.name,
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date(),
    };

    student.pdfDocuments.push(pdfDocument);
    await student.save();

    return NextResponse.json({
      success: true,
      data: pdfDocument,
      message: 'PDF uploaded successfully',
    });
  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload PDF' }, { status: 500 });
  }
}

// DELETE - Remove PDF document
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { studentId, publicId } = await request.json();

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Only admin or the student themselves can delete
    if (session.user.role === 'student' && student.userId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Remove from Cloudinary
    const { deletePDF } = await import('@/lib/cloudinary');
    await deletePDF(publicId);

    // Remove from student document
    student.pdfDocuments = student.pdfDocuments.filter(
      (doc) => doc.publicId !== publicId
    );
    await student.save();

    return NextResponse.json({ success: true, message: 'PDF deleted successfully' });
  } catch (error) {
    console.error('PDF delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete PDF' }, { status: 500 });
  }
}
