'use client';

// ==========================================
// Rwanda Technology Institute Management System
// Header Component
// ==========================================

import { useSession } from 'next-auth/react';
import { Bell, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 hover:bg-muted lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Search Bar */}
      <div className="hidden flex-1 max-w-md md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students, classes, teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative rounded-lg p-2 hover:bg-muted"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            3
          </span>
        </Link>

        {/* User Info */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{session?.user?.role}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
