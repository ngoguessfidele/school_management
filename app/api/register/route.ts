// ==========================================
// Rwanda Technology Institute Management System
// Register API Route
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'teacher', 'admin']),
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== REGISTRATION API CALLED ===');
    const body = await request.json();
    console.log('Request body:', body);
    const { name, email, password, role } = registerSchema.parse(body);
    console.log('Parsed data:', { name, email, role });

    await connectDB();
    console.log('Database connected');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    console.log('Creating new user...');
    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
    });

    console.log('Saving user...');
    const savedUser = await user.save();
    console.log('User saved successfully:', savedUser._id);

    console.log('Returning success response');
    return NextResponse.json(
      { message: 'User registered successfully', userId: savedUser._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===', error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}