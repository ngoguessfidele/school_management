// ==========================================
// Rwanda Christian University Management System
// Email Service with Nodemailer
// ==========================================

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const mailOptions = {
    from: `"Rwanda Christian University" <${process.env.SMTP_USER}>`,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  await transporter.sendMail(mailOptions);
}

export function generateWelcomeEmail(name: string, role: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rwanda Christian University</h1>
          <p>Management System</p>
        </div>
        <div class="content">
          <h2>Welcome, ${name}!</h2>
          <p>Your account has been successfully created as a <strong>${role}</strong>.</p>
          <p>You can now log in to the Rwanda Christian University Management System to access your dashboard and features.</p>
          <p>If you have any questions, please contact the administration office.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Rwanda Christian University. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateNotificationEmail(
  title: string,
  message: string,
  recipientName: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .notification { background: white; padding: 15px; border-left: 4px solid #1e40af; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Rwanda Christian University</h1>
        </div>
        <div class="content">
          <p>Dear ${recipientName},</p>
          <div class="notification">
            <h3>${title}</h3>
            <p>${message}</p>
          </div>
          <p>Log in to your account for more details.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Rwanda Christian University. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
