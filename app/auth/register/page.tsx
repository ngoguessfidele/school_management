'use client';

// ==========================================
// Rwanda Christian University Management System
// Registration Page
// ==========================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { School, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <School className="h-20 w-20 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-3xl font-bold mb-4">Rwanda Christian University</h2>
          <p className="text-xl text-blue-100 mb-2">Management System</p>
          <p className="text-blue-200">
            Building Leaders for Christian Service
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-left bg-white/10 rounded-lg p-4">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <span className="text-sm">Access your academic records</span>
            </div>
            <div className="flex items-center gap-3 text-left bg-white/10 rounded-lg p-4">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <span className="text-sm">View class schedules and assignments</span>
            </div>
            <div className="flex items-center gap-3 text-left bg-white/10 rounded-lg p-4">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <span className="text-sm">Download transcripts and documents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <School className="h-7 w-7 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">
              Join Rwanda Christian University Management System
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              leftIcon={<User className="h-4 w-4" />}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <Select
              label="Account Type"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              options={[
                { value: 'student', label: '👨‍🎓 Student' },
                { value: 'teacher', label: '👨‍🏫 Teacher' },
                { value: 'admin', label: '👨‍💼 Administrator' },
              ]}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                leftIcon={<Lock className="h-4 w-4" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              leftIcon={<Lock className="h-4 w-4" />}
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
