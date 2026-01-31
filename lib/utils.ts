// ==========================================
// Rwanda Christian University Management System
// Utility Functions
// ==========================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

export function calculateGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 65) return 'D+';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: 'text-green-600 bg-green-100',
    'B+': 'text-green-500 bg-green-50',
    B: 'text-blue-600 bg-blue-100',
    'C+': 'text-blue-500 bg-blue-50',
    C: 'text-yellow-600 bg-yellow-100',
    'D+': 'text-yellow-500 bg-yellow-50',
    D: 'text-orange-600 bg-orange-100',
    E: 'text-orange-500 bg-orange-50',
    F: 'text-red-600 bg-red-100',
  };
  return colors[grade] || 'text-gray-600 bg-gray-100';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-green-600 bg-green-100',
    present: 'text-green-600 bg-green-100',
    completed: 'text-blue-600 bg-blue-100',
    suspended: 'text-yellow-600 bg-yellow-100',
    late: 'text-yellow-600 bg-yellow-100',
    'on-leave': 'text-yellow-600 bg-yellow-100',
    absent: 'text-red-600 bg-red-100',
    cancelled: 'text-red-600 bg-red-100',
    withdrawn: 'text-red-600 bg-red-100',
    retired: 'text-gray-600 bg-gray-100',
    graduated: 'text-purple-600 bg-purple-100',
    excused: 'text-blue-600 bg-blue-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
}

export function generateStudentId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `RCU${year}${random}`;
}

export function generateTeacherId(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `TCH${year}${random}`;
}

export function generateClassCode(department: string): string {
  const deptCode = department.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${deptCode}${random}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export const DEPARTMENTS = [
  'Computer Science',
  'Business Administration',
  'Theology',
  'Education',
  'Nursing',
  'Engineering',
  'Law',
  'Agriculture',
  'Social Sciences',
  'Languages',
];

export const PROGRAMS = [
  'Bachelor of Science',
  'Bachelor of Arts',
  'Master of Science',
  'Master of Arts',
  'Doctor of Philosophy',
  'Diploma',
  'Certificate',
];

export const ACADEMIC_YEARS = [
  '2024-2025',
  '2025-2026',
  '2026-2027',
];

export const SEMESTERS = ['Semester 1', 'Semester 2', 'Summer'];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
