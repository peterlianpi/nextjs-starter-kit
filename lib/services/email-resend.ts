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

  // Resend's CreateEmailOptions requires at least one of html/text/react/template;
  // since EmailOptions makes them optional, narrow via the actual send signature.
  const payload = {
    from,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
    tags: options.tags,
  } as unknown as Parameters<typeof client.emails.send>[0];

  const { data, error } = await client.emails.send(
    payload,
    { idempotencyKey: options.idempotencyKey },
  );

  if (error) {
    console.error("Resend email failed:", error);
    return { success: false, error: error.message };
  }

  return { success: true, messageId: data?.id };
}
