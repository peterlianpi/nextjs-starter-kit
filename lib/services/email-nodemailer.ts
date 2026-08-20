import nodemailer from "nodemailer";
import { getAppName } from "@/lib/utils/domain";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const transport = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME || getAppName();
  const fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@starterkit.dev";
  const from = options.from || `${fromName} <${fromEmail}>`;

  if (!transport) {
    console.log("[Email]", { to: options.to, subject: options.subject });
    return { success: true };
  }

  try {
    const info = await transport.sendMail({
      from,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
