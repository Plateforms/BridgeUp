import nodemailer from 'nodemailer';
import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const env = getEnv();
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const env = getEnv();
  try {
    const info = await getTransporter().sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return info;
  } catch (err) {
    logger.error('Failed to send email', { to, subject, error: err.message });
    throw err;
  }
}

export async function notifyApplicationReceived(studentEmail, studentName, internshipTitle, companyName) {
  await sendEmail({
    to: studentEmail,
    subject: `Application Received - ${internshipTitle}`,
    text: `Hi ${studentName},\n\nYour application for "${internshipTitle}" at ${companyName} has been received successfully.\n\nBest regards,\nInternship Portal`,
  });
}

export async function notifyStatusChange(studentEmail, studentName, internshipTitle, status) {
  await sendEmail({
    to: studentEmail,
    subject: `Application ${status} - ${internshipTitle}`,
    text: `Hi ${studentName},\n\nYour application for "${internshipTitle}" has been updated to: ${status}.\n\nBest regards,\nInternship Portal`,
  });
}

export async function notifyInterviewScheduled(studentEmail, studentName, internshipTitle, scheduledAt, meetingLink) {
  await sendEmail({
    to: studentEmail,
    subject: `Interview Scheduled - ${internshipTitle}`,
    text: `Hi ${studentName},\n\nAn interview has been scheduled for "${internshipTitle}" on ${new Date(scheduledAt).toLocaleString()}.\n${meetingLink ? `Meeting link: ${meetingLink}` : ''}\n\nBest regards,\nInternship Portal`,
  });
}
