'use client';

// ==========================================
// Rwanda Christian University Management System
// Schedule Page
// ==========================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';
import Link from 'next/link';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

interface ScheduleItem {
  classId: string;
  className: string;
  classCode: string;
  teacherName?: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export default function SchedulePage() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [currentDay, setCurrentDay] = useState(
    DAYS[new Date().getDay() === 0 ? 5 : new Date().getDay() - 1]
  );

  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ['schedule', session?.user?.id],
    queryFn: async () => {
      const res = await fetch('/api/classes?limit=100&status=active');
      const data = await res.json();
      
      // Transform classes into schedule items
      const scheduleItems: ScheduleItem[] = [];
      data.data?.forEach((cls: any) => {
        cls.schedule?.forEach((sch: any) => {
          scheduleItems.push({
            classId: cls._id,
            className: cls.name,
            classCode: cls.classCode,
            teacherName: cls.teacherId?.name,
            day: sch.day,
            startTime: sch.startTime,
            endTime: sch.endTime,
            room: sch.room,
          });
        });
      });
      return scheduleItems;
    },
  });

  const getScheduleForDay = (day: string) => {
    return scheduleData?.filter((item) => item.day === day).sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    ) || [];
  };

  const getScheduleForHour = (day: string, hour: number) => {
    const hourStr = hour.toString().padStart(2, '0');
    return scheduleData?.filter((item) => {
      const startHour = parseInt(item.startTime.split(':')[0]);
      const endHour = parseInt(item.endTime.split(':')[0]);
      return item.day === day && startHour <= hour && endHour > hour;
    }) || [];
  };

  const changeDay = (direction: number) => {
    const currentIndex = DAYS.indexOf(currentDay);
    const newIndex = (currentIndex + direction + DAYS.length) % DAYS.length;
    setCurrentDay(DAYS[newIndex]);
  };

  const getClassColor = (classCode: string) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
    ];
    const hash = classCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-500">View your weekly class timetable</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week View
          </Button>
          <Button
            variant={viewMode === 'day' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day View
          </Button>
        </div>
      </div>

      {viewMode === 'day' ? (
        // Day View
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => changeDay(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {currentDay}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => changeDay(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {getScheduleForDay(currentDay).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
                <p className="mt-4 text-gray-500">No classes scheduled for {currentDay}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getScheduleForDay(currentDay).map((item, idx) => (
                  <Link key={idx} href={`/dashboard/classes/${item.classId}`}>
                    <div className={`p-4 rounded-lg border-l-4 ${getClassColor(item.classCode)} cursor-pointer hover:shadow-md transition-shadow`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{item.className}</p>
                          <p className="text-sm font-mono opacity-75">{item.classCode}</p>
                        </div>
                        <Badge>{formatTime(item.startTime)} - {formatTime(item.endTime)}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{item.room}</span>
                        </div>
                        {item.teacherName && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{item.teacherName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Week View
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-sm font-medium text-gray-500 w-20">
                    <Clock className="h-4 w-4" />
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className={`p-3 text-center text-sm font-medium ${
                        day === DAYS[new Date().getDay() === 0 ? 5 : new Date().getDay() - 1]
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="border-b">
                    <td className="p-2 text-sm text-gray-500 font-mono">
                      {hour.toString().padStart(2, '0')}:00
                    </td>
                    {DAYS.map((day) => {
                      const items = getScheduleForHour(day, hour);
                      const isToday = day === DAYS[new Date().getDay() === 0 ? 5 : new Date().getDay() - 1];
                      
                      return (
                        <td
                          key={day}
                          className={`p-1 align-top min-h-[60px] ${isToday ? 'bg-blue-50/50' : ''}`}
                        >
                          {items.map((item, idx) => {
                            const startHour = parseInt(item.startTime.split(':')[0]);
                            // Only render if this is the starting hour
                            if (startHour !== hour) return null;
                            
                            return (
                              <Link key={idx} href={`/dashboard/classes/${item.classId}`}>
                                <div
                                  className={`p-2 rounded text-xs ${getClassColor(item.classCode)} cursor-pointer hover:shadow-md transition-shadow mb-1`}
                                >
                                  <p className="font-semibold truncate">{item.className}</p>
                                  <p className="opacity-75">{item.room}</p>
                                  <p className="text-[10px] mt-1">
                                    {formatTime(item.startTime)}-{formatTime(item.endTime)}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Today's Classes Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today's Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const today = DAYS[new Date().getDay() === 0 ? 5 : new Date().getDay() - 1];
            const todayClasses = getScheduleForDay(today);
            
            if (todayClasses.length === 0) {
              return (
                <p className="text-gray-500 text-center py-4">No classes scheduled for today</p>
              );
            }

            return (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {todayClasses.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getClassColor(item.classCode).split(' ')[0]}`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.className}</p>
                      <p className="text-xs text-gray-500">
                        {formatTime(item.startTime)} - {formatTime(item.endTime)} • {item.room}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
