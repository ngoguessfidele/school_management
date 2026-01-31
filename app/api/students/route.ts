// ==========================================
// Rwanda Christian University Management System
// Students API Routes
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { requireTeacher, requireAdmin } from '@/lib/api-auth';

// GET - List all students or filter
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireTeacher();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = department;
    if (status) query.status = status;

    // Students can only view their own data
    if (authResult.user.role === 'student') {
      const student = await Student.findOne({ userId: authResult.user.id });
      return NextResponse.json({ success: true, data: student ? [student] : [] });
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('enrolledClasses', 'name classCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST - Create new student
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    await connectDB();

    const body = await request.json();
    const student = await Student.create(body);

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create student' }, { status: 500 });
  }
}
