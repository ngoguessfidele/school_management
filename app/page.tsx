// ==========================================
// Rwanda Technology Institute Management System
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
import { ThemeToggle } from '@/components/theme-toggle';

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
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      {/* Navigation */}
      <nav className="border-b bg-card/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <School className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-foreground">Rwanda Technology Institute</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
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
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <School className="h-4 w-4" />
            <span>Rwanda Technology Institute Management System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Building Leaders for
            <span className="block gradient-text">Christian Service</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10">
            A comprehensive management system designed to streamline academic operations,
            enhance student success, and empower educators at Rwanda Technology Institute.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Start Managing Today
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-card-foreground font-medium hover:bg-muted transition-colors"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything You Need to Manage Your University
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
                  className="p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all card-hover bg-card"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
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
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
              <div className="text-center">
                <School className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-2xl font-bold mb-2">Rwanda Technology Institute</h3>
                <p className="text-primary-foreground/80 mb-6">
                  Empowering education through technology
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold">500+</div>
                    <div className="text-sm text-primary-foreground/70">Students</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">50+</div>
                    <div className="text-sm text-primary-foreground/70">Teachers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">100+</div>
                    <div className="text-sm text-primary-foreground/70">Courses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <School className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="font-bold text-foreground">Rwanda Technology Institute</span>
                <p className="text-sm text-muted-foreground">Management System</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Rwanda Technology Institute. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
