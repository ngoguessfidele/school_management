// ==========================================
// Rwanda Christian University Management System
// Single Teacher API Routes
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Teacher from '@/models/Teacher';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single teacher
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const teacher = await Teacher.findById(id).populate('assignedClasses', 'name classCode schedule students');

    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: teacher });
  } catch (error) {
    console.error('Get teacher error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch teacher' }, { status: 500 });
  }
}

// PUT - Update teacher
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    // Teachers can update their own profile, admin can update all
    if (session.user.role === 'teacher' && teacher.userId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    return NextResponse.json({ success: true, data: updatedTeacher });
  } catch (error) {
    console.error('Update teacher error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update teacher' }, { status: 500 });
  }
}

// DELETE - Delete teacher
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete teacher' }, { status: 500 });
  }
}
