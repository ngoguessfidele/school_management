// ==========================================
// Rwanda Technology Institute Management System
// Notifications API Routes
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';
import { auth } from '@/lib/auth';

// GET - List notifications
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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Build query based on user role
    const query: Record<string, unknown> = {
      $or: [
        { 'recipients.type': 'all' },
        { 'recipients.roles': session.user.role },
        { 'recipients.userIds': session.user.id },
        { isGlobal: true },
      ],
    };

    if (unreadOnly) {
      query.readBy = { $ne: session.user.id };
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Add isRead field to each notification
    const notificationsWithReadStatus = notifications.map(n => ({
      ...n.toObject(),
      isRead: n.readBy.some(id => id.toString() === session.user.id),
    }));

    return NextResponse.json({
      success: true,
      data: notificationsWithReadStatus,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST - Create notification
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role === 'student') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const notification = await Notification.create({
      ...body,
      createdBy: session.user.id,
    });

    return NextResponse.json({ success: true, data: notification }, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}
