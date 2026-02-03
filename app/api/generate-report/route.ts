// ==========================================
// Rwanda Technology Institute Management System
// PDF Report Generation API Route
// ==========================================

import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import { auth } from '@/lib/auth';
import { formatDate, calculateGrade } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const reportType = searchParams.get('type') || 'transcript';

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    const student = await Student.findById(studentId)
      .populate('grades.classId', 'name classCode credits');

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    // Students can only generate their own reports
    if (session.user.role === 'student' && student.userId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Colors
    const primaryColor = rgb(0.12, 0.25, 0.68); // Rwanda Technology Institute blue
    const textColor = rgb(0.1, 0.1, 0.1);
    const grayColor = rgb(0.5, 0.5, 0.5);

    let yPosition = height - 50;

    // Header - University Name
    page.drawText('RWANDA TECHNOLOGY INSTITUTE', {
      x: 50,
      y: yPosition,
      size: 20,
      font: helveticaBold,
      color: primaryColor,
    });

    yPosition -= 25;
    page.drawText('Building Leaders for Christian Service', {
      x: 50,
      y: yPosition,
      size: 10,
      font: helvetica,
      color: grayColor,
    });

    // Horizontal line
    yPosition -= 15;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 2,
      color: primaryColor,
    });

    yPosition -= 30;

    // Report Title
    const title = reportType === 'transcript' ? 'ACADEMIC TRANSCRIPT' : 'REPORT CARD';
    page.drawText(title, {
      x: 50,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: textColor,
    });

    yPosition -= 30;

    // Student Information
    const studentInfo = [
      { label: 'Student Name:', value: student.name },
      { label: 'Student ID:', value: student.studentId },
      { label: 'Email:', value: student.email },
      { label: 'Department:', value: student.department },
      { label: 'Program:', value: student.program },
      { label: 'Year:', value: `Year ${student.year}, Semester ${student.semester}` },
      { label: 'Status:', value: student.status.charAt(0).toUpperCase() + student.status.slice(1) },
      { label: 'Generated:', value: formatDate(new Date()) },
    ];

    for (const info of studentInfo) {
      page.drawText(info.label, {
        x: 50,
        y: yPosition,
        size: 10,
        font: helveticaBold,
        color: textColor,
      });
      page.drawText(info.value, {
        x: 150,
        y: yPosition,
        size: 10,
        font: helvetica,
        color: textColor,
      });
      yPosition -= 18;
    }

    yPosition -= 20;

    // Grades Table Header
    page.drawText('ACADEMIC RECORD', {
      x: 50,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: primaryColor,
    });

    yPosition -= 25;

    // Table header
    const tableHeaders = ['Course', 'Code', 'Score', 'Grade', 'Semester', 'Year'];
    const tableX = [50, 200, 300, 360, 420, 500];

    tableHeaders.forEach((header, index) => {
      page.drawText(header, {
        x: tableX[index],
        y: yPosition,
        size: 10,
        font: helveticaBold,
        color: textColor,
      });
    });

    yPosition -= 5;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: grayColor,
    });

    yPosition -= 15;

    // Grade rows
    let totalScore = 0;
    let totalCredits = 0;

    for (const grade of student.grades) {
      const classInfo = grade.classId as { name?: string; classCode?: string; credits?: number } | null;
      const courseName = classInfo?.name || 'N/A';
      const courseCode = classInfo?.classCode || 'N/A';
      const credits = classInfo?.credits || 3;

      page.drawText(courseName.substring(0, 20), { x: tableX[0], y: yPosition, size: 9, font: helvetica, color: textColor });
      page.drawText(courseCode, { x: tableX[1], y: yPosition, size: 9, font: helvetica, color: textColor });
      page.drawText(grade.score.toString(), { x: tableX[2], y: yPosition, size: 9, font: helvetica, color: textColor });
      page.drawText(grade.grade, { x: tableX[3], y: yPosition, size: 9, font: helveticaBold, color: textColor });
      page.drawText(grade.semester, { x: tableX[4], y: yPosition, size: 9, font: helvetica, color: textColor });
      page.drawText(grade.academicYear, { x: tableX[5], y: yPosition, size: 9, font: helvetica, color: textColor });

      totalScore += grade.score * credits;
      totalCredits += credits;
      yPosition -= 18;

      if (yPosition < 100) {
        // Add new page if needed
        break;
      }
    }

    yPosition -= 10;
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 1,
      color: grayColor,
    });

    yPosition -= 20;

    // Summary
    const gpa = totalCredits > 0 ? (totalScore / totalCredits / 25).toFixed(2) : '0.00';
    const averageScore = totalCredits > 0 ? (totalScore / totalCredits).toFixed(1) : '0.0';

    page.drawText(`Total Credits: ${totalCredits}`, { x: 50, y: yPosition, size: 10, font: helvetica, color: textColor });
    page.drawText(`Average Score: ${averageScore}%`, { x: 200, y: yPosition, size: 10, font: helvetica, color: textColor });
    page.drawText(`GPA: ${gpa}/4.0`, { x: 350, y: yPosition, size: 10, font: helveticaBold, color: primaryColor });

    // Footer
    page.drawText('This is an official document of Rwanda Technology Institute', {
      x: 50,
      y: 50,
      size: 8,
      font: helvetica,
      color: grayColor,
    });

    page.drawText(`Document ID: RCU-${Date.now()}`, {
      x: width - 180,
      y: 50,
      size: 8,
      font: helvetica,
      color: grayColor,
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();

    // Return PDF response
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${student.studentId}_${reportType}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate PDF' }, { status: 500 });
  }
}
