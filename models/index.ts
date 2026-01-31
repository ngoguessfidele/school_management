// ==========================================
// Rwanda Christian University Management System
// Models Index
// ==========================================

export { default as User } from './User';
export type { IUser } from './User';

export { default as Student } from './Student';
export type { IStudent, IGrade, IPDFDocument } from './Student';

export { default as Teacher } from './Teacher';
export type { ITeacher } from './Teacher';

export { default as Class } from './Class';
export type { IClass, IClassSchedule } from './Class';

export { default as Attendance } from './Attendance';
export type { IAttendance, IAttendanceRecord } from './Attendance';

export { default as Notification } from './Notification';
export type { INotification } from './Notification';
