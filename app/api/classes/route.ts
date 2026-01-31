// ==========================================
// Rwanda Christian University Management System
// Classes API Routes
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Class from '@/models/Class';
import { auth } from '@/lib/auth';

// GET - List all classes
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';
    const teacherId = searchParams.get('teacherId') || '';

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { classCode: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = department;
    if (status) query.status = status;
    if (teacherId) query.teacherId = teacherId;

    const total = await Class.countDocuments(query);
    const classes = await Class.find(query)
      .populate('teacherId', 'name email teacherId')
      .populate('students', 'name email studentId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: classes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get classes error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch classes' }, { status: 500 });
  }
}

// POST - Create new class
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role === 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const newClass = await Class.create(body);

    return NextResponse.json({ success: true, data: newClass }, { status: 201 });
  } catch (error) {
    console.error('Create class error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create class' }, { status: 500 });
  }
}
