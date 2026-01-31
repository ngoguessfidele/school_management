// ==========================================
// Rwanda Christian University Management System
// Single Class API Routes
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Class from '@/models/Class';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single class
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const classData = await Class.findById(id)
      .populate('teacherId', 'name email teacherId department')
      .populate('students', 'name email studentId year');

    if (!classData) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: classData });
  } catch (error) {
    console.error('Get class error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch class' }, { status: 500 });
  }
}

// PUT - Update class
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role === 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const updatedClass = await Class.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      .populate('teacherId', 'name email')
      .populate('students', 'name email studentId');

    if (!updatedClass) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error('Update class error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update class' }, { status: 500 });
  }
}

// DELETE - Delete class
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const classData = await Class.findByIdAndDelete(id);
    if (!classData) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 });
    }

    // Remove class from students' enrolledClasses
    await Student.updateMany(
      { enrolledClasses: id },
      { $pull: { enrolledClasses: id } }
    );

    // Remove class from teacher's assignedClasses
    await Teacher.updateMany(
      { assignedClasses: id },
      { $pull: { assignedClasses: id } }
    );

    return NextResponse.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete class' }, { status: 500 });
  }
}
