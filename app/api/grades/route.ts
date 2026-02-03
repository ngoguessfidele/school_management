// ==========================================
// Rwanda Technology Institute Management System
// Grades API Routes
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { auth } from '@/lib/auth';
import { calculateGrade } from '@/lib/utils';

// GET - Get grades (filtered by student or class)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || '';
    const classId = searchParams.get('classId') || '';

    if (studentId) {
      const student = await Student.findById(studentId)
        .select('name studentId grades')
        .populate('grades.classId', 'name classCode credits');

      if (!student) {
        return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
      }

      // Students can only view their own grades
      if (session.user.role === 'student' && student.userId?.toString() !== session.user.id) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }

      return NextResponse.json({ success: true, data: student.grades });
    }

    if (classId) {
      const students = await Student.find({ 'grades.classId': classId })
        .select('name studentId grades')
        .populate('grades.classId', 'name classCode');

      const classGrades = students.map(student => {
        const grade = student.grades.find(g => g.classId?._id?.toString() === classId);
        return {
          studentId: student._id,
          studentName: student.name,
          studentCode: student.studentId,
          score: grade?.score ?? null,
          grade: grade?.grade ?? '-',
          semester: grade?.semester,
          academicYear: grade?.academicYear,
          remarks: grade?.remarks,
        };
      });

      return NextResponse.json({ success: true, data: classGrades });
    }

    return NextResponse.json({ success: false, error: 'Please provide studentId or classId' }, { status: 400 });
  } catch (error) {
    console.error('Get grades error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch grades' }, { status: 500 });
  }
}

// POST - Add/Update grade
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role === 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { studentId, classId, score, semester, academicYear, remarks } = body;

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const grade = calculateGrade(score);

    // Check if grade for this class already exists
    const existingGradeIndex = student.grades.findIndex(
      g => g.classId.toString() === classId && g.semester === semester && g.academicYear === academicYear
    );

    if (existingGradeIndex !== -1) {
      // Update existing grade
      student.grades[existingGradeIndex] = {
        classId,
        score,
        grade,
        semester,
        academicYear,
        remarks,
      };
    } else {
      // Add new grade
      student.grades.push({
        classId,
        score,
        grade,
        semester,
        academicYear,
        remarks,
      });
    }

    await student.save();

    return NextResponse.json({ success: true, data: student.grades });
  } catch (error) {
    console.error('Save grade error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save grade' }, { status: 500 });
  }
}
