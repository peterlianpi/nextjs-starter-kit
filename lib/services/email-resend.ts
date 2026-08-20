import { Resend } from "resend";
import { getAppName } from "@/lib/utils/domain";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
  tags?: { name: string; value: string }[];
  idempotencyKey?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

let resend: Resend | null = null;

function getResend() {
  if (resend) return resend;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  resend = new Resend(apiKey);
  return resend;
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const client = getResend();
  const fromName = process.env.RESEND_FROM_NAME || getAppName();
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const from = options.from || `${fromName} <${fromEmail}>`;

  if (!client) {
    console.log("[Resend Email]", { to: options.to, subject: options.subject });
    return { success: true };
  }

  const { data, error } = await client.emails.send({
    from,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
    tags: options.tags,
    idempotencyKey: options.idempotencyKey,
  });

  if (error) {
    console.error("Resend email failed:", error);
    return { success: false, error: error.message };
  }

  return { success: true, messageId: data?.id };
}
