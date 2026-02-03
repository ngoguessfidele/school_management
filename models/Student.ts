// ==========================================
// Rwanda Technology Institute Management System
// Student Model
// ==========================================

import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IPDFDocument {
  name: string;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface IGrade {
  classId: mongoose.Types.ObjectId;
  score: number;
  grade: string;
  semester: string;
  academicYear: string;
  remarks?: string;
}

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  studentId: string;
  name: string;
  email: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  enrollmentDate: Date;
  department: string;
  program: string;
  year: number;
  semester: number;
  enrolledClasses: mongoose.Types.ObjectId[];
  grades: IGrade[];
  pdfDocuments: IPDFDocument[];
  status: 'active' | 'suspended' | 'graduated' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

const PDFDocumentSchema = new Schema<IPDFDocument>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const GradeSchema = new Schema<IGrade>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String, required: true, enum: ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'E', 'F'] },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    remarks: String,
  },
  { _id: true }
);

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: [true, 'Student name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
    dateOfBirth: { type: Date, required: [true, 'Date of birth is required'] },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phone: String,
    address: String,
    enrollmentDate: { type: Date, default: Date.now },
    department: { type: String, required: [true, 'Department is required'] },
    program: { type: String, required: [true, 'Program is required'] },
    year: { type: Number, required: true, min: 1, max: 6 },
    semester: { type: Number, required: true, min: 1, max: 2 },
    enrolledClasses: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    grades: [GradeSchema],
    pdfDocuments: [PDFDocumentSchema],
    status: { type: String, enum: ['active', 'suspended', 'graduated', 'withdrawn'], default: 'active' },
  },
  { timestamps: true }
);

StudentSchema.index({ studentId: 1 });
StudentSchema.index({ email: 1 });
StudentSchema.index({ department: 1 });
StudentSchema.index({ status: 1 });
StudentSchema.index({ userId: 1 });

StudentSchema.pre('save', async function (this: IStudent) {
  if (this.isNew && !this.studentId) {
    const year = new Date().getFullYear().toString().slice(-2);
    const count = await mongoose.models.Student.countDocuments();
    this.studentId = `RCU${year}${String(count + 1).padStart(5, '0')}`;
  }
});

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
