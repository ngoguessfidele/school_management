// ==========================================
// Rwanda Technology Institute Management System
// Single Student API Routes
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single student
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const student = await Student.findById(id)
      .populate('enrolledClasses', 'name classCode schedule teacherId')
      .populate('grades.classId', 'name classCode');

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Students can only view their own data
    if (session.user.role === 'student' && student.userId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch student' }, { status: 500 });
  }
}

// PUT - Update student
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Only admin can update all fields, students can only update certain fields
    if (session.user.role === 'student' && student.userId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Restrict fields students can update
    const allowedFields = session.user.role === 'admin' 
      ? body 
      : { phone: body.phone, address: body.address };

    const updatedStudent = await Student.findByIdAndUpdate(id, allowedFields, { new: true, runValidators: true });

    return NextResponse.json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update student' }, { status: 500 });
  }
}

// DELETE - Delete student
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete student' }, { status: 500 });
  }
}
