'use client';

// ==========================================
// Rwanda Technology Institute Management System
// Notifications Page
// ==========================================

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Mail,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipientId?: { _id: string; name: string; email: string };
  senderId?: { _id: string; name: string };
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    recipientId: '',
  });

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', filter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter === 'unread') params.set('isRead', 'false');
      if (filter === 'read') params.set('isRead', 'true');
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/notifications?${params}`);
      return res.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (data: typeof newNotification) => {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setShowComposeModal(false);
      setNewNotification({ title: '', message: '', type: 'info', recipientId: '' });
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
      info: 'info',
      warning: 'warning',
      success: 'success',
      error: 'danger',
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  const unreadCount = notificationsData?.data?.filter((n: Notification) => !n.isRead).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              leftIcon={<CheckCheck className="h-4 w-4" />}
              onClick={() => markAllAsReadMutation.mutate()}
              isLoading={markAllAsReadMutation.isPending}
            >
              Mark All Read
            </Button>
          )}
          {(session?.user?.role === 'admin' || session?.user?.role === 'teacher') && (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowComposeModal(true)}
            >
              Send Notification
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'info', label: 'Info' },
                { value: 'warning', label: 'Warning' },
                { value: 'success', label: 'Success' },
                { value: 'error', label: 'Error' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-500">Loading notifications...</p>
          </CardContent>
        </Card>
      ) : notificationsData?.data?.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="mt-4 text-gray-500">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notificationsData?.data?.map((notification: Notification) => (
            <Card
              key={notification._id}
              className={`transition-all ${
                !notification.isRead
                  ? 'border-l-4 border-l-blue-500 bg-blue-50/30'
                  : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {getTypeBadge(notification.type)}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                      {notification.senderId && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>From: {notification.senderId.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(notification._id)}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(notification._id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Compose Modal */}
      <Modal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        title="Send Notification"
        description="Send a notification to users"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={newNotification.title}
            onChange={(e) => setNewNotification((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Notification title"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={newNotification.message}
              onChange={(e) => setNewNotification((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Notification message..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Select
            label="Type"
            value={newNotification.type}
            onChange={(e) => setNewNotification((prev) => ({ ...prev, type: e.target.value }))}
            options={[
              { value: 'info', label: 'Info' },
              { value: 'warning', label: 'Warning' },
              { value: 'success', label: 'Success' },
              { value: 'error', label: 'Error' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowComposeModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendNotificationMutation.mutate(newNotification)}
              isLoading={sendNotificationMutation.isPending}
              disabled={!newNotification.title || !newNotification.message}
            >
              Send Notification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
