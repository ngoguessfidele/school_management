// ==========================================
// Rwanda Technology Institute Management System
// Attendance Model
// ==========================================

import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IAttendanceRecord {
  studentId: mongoose.Types.ObjectId;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  date: Date;
  records: IAttendanceRecord[];
  takenBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
    remarks: String,
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    date: { type: Date, required: true },
    records: [AttendanceRecordSchema],
    takenBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ classId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1 });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
