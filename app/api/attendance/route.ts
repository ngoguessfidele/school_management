// ==========================================
// Rwanda Christian University Management System
// Attendance API Routes
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import Attendance from '@/models/Attendance';
import { auth } from '@/lib/auth';

// GET - List attendance records
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId') || '';
    const date = searchParams.get('date') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: Record<string, unknown> = {};
    if (classId) query.classId = classId;
    if (date) query.date = new Date(date);

    const total = await Attendance.countDocuments(query);
    const attendance = await Attendance.find(query)
      .populate('classId', 'name classCode')
      .populate('records.studentId', 'name studentId')
      .populate('takenBy', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: attendance,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST - Create/Update attendance
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role === 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { classId, date, records } = body;

    // Check if attendance already exists for this class and date
    const existingAttendance = await Attendance.findOne({
      classId,
      date: new Date(date),
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.records = records;
      existingAttendance.takenBy = new Types.ObjectId(session.user.id);
      await existingAttendance.save();
      return NextResponse.json({ success: true, data: existingAttendance });
    }

    // Create new attendance
    const attendance = await Attendance.create({
      classId: new Types.ObjectId(classId),
      date: new Date(date),
      records,
      takenBy: new Types.ObjectId(session.user.id),
    });

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error) {
    console.error('Create attendance error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save attendance' }, { status: 500 });
  }
}
