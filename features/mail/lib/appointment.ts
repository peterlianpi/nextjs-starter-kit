import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/services/email";
import {
  generateAppointmentConfirmationEmail,
  generateAppointmentReminderEmail,
  generateAppointmentRescheduledEmail,
  generateAppointmentCancelledEmail,
  type AppointmentEmailData,
} from "@/features/mail/components/templates";

// ============================================
// HELPERS
// ============================================

const APPOINTMENT_SELECT = {
  id: true,
  title: true,
  description: true,
  startDateTime: true,
  endDateTime: true,
  duration: true,
  location: true,
  meetingUrl: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

type AppointmentWithUser = {
  id: string;
  title: string;
  description: string | null;
  startDateTime: Date;
  endDateTime: Date;
  duration: number;
  location: string | null;
  meetingUrl: string | null;
  user: { id: string; name: string | null; email: string };
};

function toEmailData(
  appointment: AppointmentWithUser,
): AppointmentEmailData | null {
  if (!appointment.user?.email) return null;
  return {
    name: appointment.user.name || appointment.user.email.split("@")[0],
    email: appointment.user.email,
    title: appointment.title,
    description: appointment.description ?? undefined,
    startDateTime: appointment.startDateTime,
    endDateTime: appointment.endDateTime,
    duration: appointment.duration,
    location: appointment.location ?? undefined,
    meetingUrl: appointment.meetingUrl ?? undefined,
  };
}

async function fetchAppointment(
  appointmentId: string,
): Promise<AppointmentWithUser | null> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: APPOINTMENT_SELECT,
  });
  return (appointment as unknown as AppointmentWithUser) ?? null;
}

// ============================================
// SINGLE-APPOINTMENT EMAILS
// ============================================

export async function sendAppointmentConfirmationAsync(
  appointmentId: string,
): Promise<void> {
  const appointment = await fetchAppointment(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  const data = toEmailData(appointment);
  if (!data) throw new Error("Appointment has no recipient email");

  const template = generateAppointmentConfirmationEmail(data);
  await sendEmail({ to: data.email, subject: template.subject, html: template.html });
}

export async function sendAppointmentReminderAsync(
  appointmentId: string,
): Promise<void> {
  const appointment = await fetchAppointment(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  const data = toEmailData(appointment);
  if (!data) throw new Error("Appointment has no recipient email");

  const template = generateAppointmentReminderEmail(data);
  await sendEmail({ to: data.email, subject: template.subject, html: template.html });
}

export async function sendAppointmentRescheduledAsync(
  appointmentId: string,
  oldStartDateTime?: Date,
  oldEndDateTime?: Date,
): Promise<void> {
  const appointment = await fetchAppointment(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  const data = toEmailData(appointment);
  if (!data) throw new Error("Appointment has no recipient email");

  const template = generateAppointmentRescheduledEmail({
    ...data,
    oldStartDateTime,
    oldEndDateTime,
  });
  await sendEmail({ to: data.email, subject: template.subject, html: template.html });
}

export async function sendAppointmentCancelledAsync(
  appointmentId: string,
  cancelReason?: string,
): Promise<void> {
  const appointment = await fetchAppointment(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  const data = toEmailData(appointment);
  if (!data) throw new Error("Appointment has no recipient email");

  const template = generateAppointmentCancelledEmail({ ...data, cancelReason });
  await sendEmail({ to: data.email, subject: template.subject, html: template.html });
}

// ============================================
// BULK REMINDERS (cron)
// ============================================

export interface SendBulkRemindersOptions {
  testMode?: string;
  testIntervalMinutes?: number;
}

export interface SendBulkRemindersResult {
  total: number;
  sent: number;
  failed: number;
  emailsSent: number;
  inAppSent: number;
}

export async function sendBulkReminders(
  options: SendBulkRemindersOptions = {},
): Promise<SendBulkRemindersResult> {
  const testRecipient = options.testMode;
  const windowMinutes =
    options.testIntervalMinutes && options.testIntervalMinutes > 0
      ? options.testIntervalMinutes
      : 60;

  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMinutes * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "SCHEDULED",
      deletedAt: null,
      reminderSent: false,
      startDateTime: { gte: now, lte: windowEnd },
    },
    select: {
      ...APPOINTMENT_SELECT,
      reminderSent: true,
    },
  });

  let sent = 0;
  let failed = 0;
  let emailsSent = 0;
  let inAppSent = 0;

  for (const apt of appointments) {
    try {
      const data = toEmailData(apt as unknown as AppointmentWithUser);
      if (data) {
        // Test mode redirects all reminders to a single inbox
        const recipient = testRecipient ?? data.email;
        const template = generateAppointmentReminderEmail(data);
        await sendEmail({
          to: recipient,
          subject: template.subject,
          html: template.html,
        });
        emailsSent += 1;
      }

      await prisma.appointment.update({
        where: { id: apt.id },
        data: { reminderSent: true, reminderSentAt: new Date() },
      });

      sent += 1;
    } catch (error) {
      console.error(
        `[Mail] Failed to send reminder for appointment ${apt.id}:`,
        error,
      );
      failed += 1;
    }
  }

  inAppSent = sent;

  return { total: appointments.length, sent, failed, emailsSent, inAppSent };
}
