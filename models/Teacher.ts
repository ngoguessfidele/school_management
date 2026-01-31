// ==========================================
// Rwanda Christian University Management System
// Teacher Model
// ==========================================

import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITeacher extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  teacherId: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  specialization: string;
  qualification: string;
  assignedClasses: mongoose.Types.ObjectId[];
  officeHours?: string;
  bio?: string;
  status: 'active' | 'on-leave' | 'retired';
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: String, required: true, unique: true },
    name: { type: String, required: [true, 'Teacher name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
    phone: String,
    department: { type: String, required: [true, 'Department is required'] },
    specialization: { type: String, required: [true, 'Specialization is required'] },
    qualification: { type: String, required: [true, 'Qualification is required'] },
    assignedClasses: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    officeHours: String,
    bio: String,
    status: { type: String, enum: ['active', 'on-leave', 'retired'], default: 'active' },
  },
  { timestamps: true }
);

TeacherSchema.index({ teacherId: 1 });
TeacherSchema.index({ email: 1 });
TeacherSchema.index({ department: 1 });
TeacherSchema.index({ userId: 1 });

TeacherSchema.pre('save', async function (this: ITeacher) {
  if (this.isNew && !this.teacherId) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await mongoose.models.Teacher.countDocuments();
    this.teacherId = `TCH${year}${String(count + 1).padStart(4, '0')}`;
  }
});

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);

export default Teacher;
