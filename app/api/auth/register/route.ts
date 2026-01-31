// ==========================================
// Rwanda Christian University Management System
// Register API Route
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, role, ...profileData } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
    });

    // Create associated profile based on role
    if (role === 'student' || !role) {
      const student = await Student.create({
        userId: user._id,
        name,
        email: email.toLowerCase(),
        studentId: '', // Will be auto-generated
        dateOfBirth: profileData.dateOfBirth || new Date(),
        gender: profileData.gender || 'other',
        department: profileData.department || 'Undeclared',
        program: profileData.program || 'Undeclared',
        year: profileData.year || 1,
        semester: profileData.semester || 1,
      });

      user.studentProfile = student._id;
      await user.save();
    } else if (role === 'teacher') {
      const teacher = await Teacher.create({
        userId: user._id,
        name,
        email: email.toLowerCase(),
        teacherId: '', // Will be auto-generated
        department: profileData.department || 'Undeclared',
        specialization: profileData.specialization || 'General',
        qualification: profileData.qualification || 'Bachelor',
      });

      user.teacherProfile = teacher._id;
      await user.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
