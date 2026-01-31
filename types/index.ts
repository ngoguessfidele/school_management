// ==========================================
// Rwanda Christian University Management System
// Type Definitions
// ==========================================

import { Types } from 'mongoose';

// Base Types
export interface BaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User & Auth Types
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User extends BaseDocument {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  studentProfile?: string;
  teacherProfile?: string;
}

// Student Types
export interface PDFDocument {
  name: string;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface Grade {
  classId: string;
  className?: string;
  score: number;
  grade: string;
  semester: string;
  academicYear: string;
  remarks?: string;
}

export interface Student extends BaseDocument {
  userId: string;
  studentId: string;
  name: string;
  email: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  enrollmentDate: Date;
  department: string;
  program: string;
  year: number;
  semester: number;
  enrolledClasses: string[];
  grades: Grade[];
  pdfDocuments: PDFDocument[];
  status: 'active' | 'suspended' | 'graduated' | 'withdrawn';
}

// Teacher Types
export interface Teacher extends BaseDocument {
  userId: string;
  teacherId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  specialization: string;
  qualification: string;
  assignedClasses: string[];
  officeHours?: string;
  bio?: string;
  status: 'active' | 'on-leave' | 'retired';
}

// Class Types
export interface ClassSchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  room: string;
}

export interface Class extends BaseDocument {
  classCode: string;
  name: string;
  description?: string;
  department: string;
  credits: number;
  semester: string;
  academicYear: string;
  teacherId: string;
  teacher?: Teacher;
  students: string[];
  schedule: ClassSchedule[];
  maxStudents: number;
  status: 'active' | 'completed' | 'cancelled';
}

// Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  studentId: string;
  studentName?: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface Attendance extends BaseDocument {
  classId: string;
  className?: string;
  date: Date;
  records: AttendanceRecord[];
  takenBy: string;
}

// Notification Types
export type NotificationType = 'info' | 'warning' | 'success' | 'error';
export type NotificationCategory = 'academic' | 'administrative' | 'event' | 'system';

export interface Notification extends BaseDocument {
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  recipients: {
    type: 'all' | 'role' | 'specific';
    roles?: UserRole[];
    userIds?: string[];
  };
  readBy: string[];
  isGlobal: boolean;
  expiresAt?: Date;
  createdBy: string;
}

// Schedule Types
export interface ScheduleEvent {
  id: string;
  title: string;
  classId?: string;
  className?: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'class' | 'exam' | 'event';
  color?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface StudentFormData {
  name: string;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  department: string;
  program: string;
  year: number;
  semester: number;
}

export interface TeacherFormData {
  name: string;
  email: string;
  phone?: string;
  department: string;
  specialization: string;
  qualification: string;
  officeHours?: string;
  bio?: string;
}

export interface ClassFormData {
  name: string;
  classCode: string;
  description?: string;
  department: string;
  credits: number;
  semester: string;
  academicYear: string;
  teacherId: string;
  maxStudents: number;
  schedule: ClassSchedule[];
}

// Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  attendanceRate: number;
  averageGrade: number;
  upcomingEvents: number;
  pendingNotifications: number;
}

// Session Types (Auth.js)
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
