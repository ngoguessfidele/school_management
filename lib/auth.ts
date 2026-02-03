// ==========================================
// Rwanda Technology Institute Management System
// Auth.js Configuration
// ==========================================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select('+password');

        if (!user) {
          throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
          throw new Error('Your account has been deactivated');
        }

        const isPasswordValid = await user.comparePassword(credentials.password as string);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
});

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    role?: string;
    avatar?: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
    };
  }
}
