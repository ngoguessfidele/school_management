// ==========================================
// Rwanda Technology Institute Management System
// Notification Model
// ==========================================

import mongoose, { Schema, Model, Document } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'academic' | 'administrative' | 'event' | 'system';
  recipients: {
    type: 'all' | 'role' | 'specific';
    roles?: ('admin' | 'teacher' | 'student')[];
    userIds?: mongoose.Types.ObjectId[];
  };
  readBy: mongoose.Types.ObjectId[];
  isGlobal: boolean;
  expiresAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    message: { type: String, required: [true, 'Message is required'], maxlength: 2000 },
    type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
    category: { type: String, enum: ['academic', 'administrative', 'event', 'system'], default: 'system' },
    recipients: {
      type: { type: String, enum: ['all', 'role', 'specific'], default: 'all' },
      roles: [{ type: String, enum: ['admin', 'teacher', 'student'] }],
      userIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isGlobal: { type: Boolean, default: false },
    expiresAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ 'recipients.type': 1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ isGlobal: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
