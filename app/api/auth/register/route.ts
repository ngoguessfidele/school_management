// ==========================================
// Rwanda Technology Institute Management System
// Register API Route
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';

export async function POST(request: NextRequest) {
  try {
    console.log('=== AUTH REGISTER API CALLED ===');
    await connectDB();

    const body = await request.json();
    console.log('Auth register request body:', body);
    const { name, email, password, role, ...profileData } = body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    console.log('Creating user...');
    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
    });
    console.log('User created:', user._id);

    // For now, skip profile creation to avoid errors
    // TODO: Add profile creation later

    console.log('Returning success response');
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
    console.error('=== AUTH REGISTER ERROR ===', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
