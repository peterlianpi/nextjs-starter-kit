"use server";

import { sendEmail as sendEmailViaProvider } from "@/lib/services/email";
import { emailTemplates } from "@/features/mail/components/templates";

export interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams) {
  try {
    const result = await sendEmailViaProvider({
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[Server Action] Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendWelcomeEmail(name: string, email: string) {
  try {
    const { subject, html } = emailTemplates.welcome({
      name,
      email,
    });

    const result = await sendEmailViaProvider({
      to: email,
      subject: `[Action Required] ${subject}`,
      html,
    });

    console.log("[Server Action] Welcome email sent to:", email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("[Server Action] Failed to send welcome email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send welcome email",
    };
  }
}
