// ==========================================
// Rwanda Technology Institute Management System
// Class Model
// ==========================================

import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IClassSchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  room: string;
}

export interface IClass extends Document {
  _id: mongoose.Types.ObjectId;
  classCode: string;
  name: string;
  description?: string;
  department: string;
  credits: number;
  semester: string;
  academicYear: string;
  teacherId: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  schedule: IClassSchedule[];
  maxStudents: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ClassScheduleSchema = new Schema<IClassSchedule>(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, required: true },
  },
  { _id: false }
);

const ClassSchema = new Schema<IClass>(
  {
    classCode: { type: String, required: true, unique: true },
    name: { type: String, required: [true, 'Class name is required'], trim: true },
    description: String,
    department: { type: String, required: [true, 'Department is required'] },
    credits: { type: Number, required: true, min: 1, max: 10 },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    schedule: [ClassScheduleSchema],
    maxStudents: { type: Number, default: 50 },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

ClassSchema.index({ classCode: 1 });
ClassSchema.index({ department: 1 });
ClassSchema.index({ teacherId: 1 });
ClassSchema.index({ status: 1 });
ClassSchema.index({ academicYear: 1, semester: 1 });

ClassSchema.virtual('enrolledCount').get(function () {
  return this.students?.length || 0;
});

ClassSchema.set('toJSON', { virtuals: true });
ClassSchema.set('toObject', { virtuals: true });

const Class: Model<IClass> =
  mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);

export default Class;
