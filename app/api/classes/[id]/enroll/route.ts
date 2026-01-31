// ==========================================
// Rwanda Christian University Management System
// Enroll Student in Class API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Class from '@/models/Class';
import Student from '@/models/Student';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Enroll student in class
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role === 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { studentId } = await request.json();

    const classData = await Class.findById(id);
    if (!classData) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Check if already enrolled
    if (classData.students.includes(studentId)) {
      return NextResponse.json({ success: false, error: 'Student already enrolled' }, { status: 400 });
    }

    // Check if class is full
    if (classData.students.length >= classData.maxStudents) {
      return NextResponse.json({ success: false, error: 'Class is full' }, { status: 400 });
    }

    // Enroll student
    classData.students.push(studentId);
    await classData.save();

    student.enrolledClasses.push(classData._id);
    await student.save();

    return NextResponse.json({ success: true, message: 'Student enrolled successfully' });
  } catch (error) {
    console.error('Enroll student error:', error);
    return NextResponse.json({ success: false, error: 'Failed to enroll student' }, { status: 500 });
  }
}

// DELETE - Remove student from class
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role === 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { studentId } = await request.json();

    await Class.findByIdAndUpdate(id, { $pull: { students: studentId } });
    await Student.findByIdAndUpdate(studentId, { $pull: { enrolledClasses: id } });

    return NextResponse.json({ success: true, message: 'Student removed from class' });
  } catch (error) {
    console.error('Remove student error:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove student' }, { status: 500 });
  }
}
