// ==========================================
// Rwanda Technology Institute Management System
// Dashboard Stats API
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import Class from '@/models/Class';
import Attendance from '@/models/Attendance';
import Notification from '@/models/Notification';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get counts
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      activeClasses,
    ] = await Promise.all([
      Student.countDocuments({ status: 'active' }),
      Teacher.countDocuments({ status: 'active' }),
      Class.countDocuments(),
      Class.countDocuments({ status: 'active' }),
    ]);

    // Calculate attendance rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAttendance = await Attendance.find({
      date: { $gte: thirtyDaysAgo },
    });

    let totalPresent = 0;
    let totalRecords = 0;
    recentAttendance.forEach((att) => {
      att.records.forEach((record) => {
        totalRecords++;
        if (record.status === 'present' || record.status === 'late') {
          totalPresent++;
        }
      });
    });

    const attendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

    // Calculate average grade
    const studentsWithGrades = await Student.find({ 'grades.0': { $exists: true } });
    let totalScore = 0;
    let gradeCount = 0;
    studentsWithGrades.forEach((student) => {
      student.grades.forEach((grade) => {
        totalScore += grade.score;
        gradeCount++;
      });
    });
    const averageGrade = gradeCount > 0 ? Math.round(totalScore / gradeCount) : 0;

    // Get unread notifications count for user
    const pendingNotifications = await Notification.countDocuments({
      $or: [
        { 'recipients.type': 'all' },
        { 'recipients.roles': session.user.role },
        { 'recipients.userIds': session.user.id },
      ],
      readBy: { $ne: session.user.id },
    });

    // Role-specific stats
    let roleSpecificData = {};

    if (session.user.role === 'student') {
      const student = await Student.findOne({ userId: session.user.id });
      if (student) {
        roleSpecificData = {
          enrolledClasses: student.enrolledClasses.length,
          completedCourses: student.grades.length,
          myAverageGrade: student.grades.length > 0
            ? Math.round(student.grades.reduce((acc, g) => acc + g.score, 0) / student.grades.length)
            : 0,
        };
      }
    } else if (session.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: session.user.id });
      if (teacher) {
        const myClasses = await Class.countDocuments({ teacherId: teacher._id });
        const myStudents = await Class.aggregate([
          { $match: { teacherId: teacher._id } },
          { $project: { studentCount: { $size: '$students' } } },
          { $group: { _id: null, total: { $sum: '$studentCount' } } },
        ]);
        roleSpecificData = {
          myClasses,
          myStudents: myStudents[0]?.total || 0,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        activeClasses,
        attendanceRate,
        averageGrade,
        pendingNotifications,
        ...roleSpecificData,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
