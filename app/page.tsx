// ==========================================
// Rwanda Christian University Management System
// Landing Page
// ==========================================

import Link from 'next/link';
import { 
  School, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  FileText,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: GraduationCap,
      title: 'Student Management',
      description: 'Comprehensive student profiles, enrollment tracking, and academic records.',
    },
    {
      icon: Users,
      title: 'Teacher Portal',
      description: 'Manage faculty information, class assignments, and teaching schedules.',
    },
    {
      icon: BookOpen,
      title: 'Class Management',
      description: 'Create and manage courses, schedules, and student enrollments.',
    },
    {
      icon: Calendar,
      title: 'Attendance Tracking',
      description: 'Digital attendance system with real-time reporting and analytics.',
    },
    {
      icon: FileText,
      title: 'Grade Management',
      description: 'Record, calculate, and generate transcripts and report cards.',
    },
    {
      icon: School,
      title: 'Document Center',
      description: 'Upload, store, and manage academic documents securely.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900">Rwanda Christian University</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm text-blue-700 mb-6">
            <School className="h-4 w-4" />
            <span>Rwanda Christian University Management System</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Building Leaders for
            <span className="block gradient-text">Christian Service</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10">
            A comprehensive management system designed to streamline academic operations,
            enhance student success, and empower educators at Rwanda Christian University.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Start Managing Today
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your University
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools needed to efficiently
              manage academic operations and student success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all card-hover"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Our Management System?
              </h2>
              <div className="space-y-4">
                {[
                  'Role-based access for administrators, teachers, and students',
                  'Real-time attendance tracking and reporting',
                  'Automated grade calculation and transcript generation',
                  'Secure document management with cloud storage',
                  'Mobile-friendly interface for on-the-go access',
                  'Comprehensive notification system',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
              <div className="text-center">
                <School className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-2xl font-bold mb-2">Rwanda Christian University</h3>
                <p className="text-blue-100 mb-6">
                  Empowering education through technology
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold">500+</div>
                    <div className="text-sm text-blue-200">Students</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">50+</div>
                    <div className="text-sm text-blue-200">Teachers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">100+</div>
                    <div className="text-sm text-blue-200">Courses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <School className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <span className="font-bold">Rwanda Christian University</span>
                <p className="text-sm text-gray-400">Management System</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Rwanda Christian University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
