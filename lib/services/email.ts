import * as nodemailer from "./email-nodemailer";
import * as resend from "./email-resend";

export type EmailOptions = nodemailer.EmailOptions;
export type EmailResult = nodemailer.EmailResult;

export type EmailProvider = "nodemailer" | "resend";

function getProvider(): EmailProvider {
  return (process.env.EMAIL_PROVIDER as EmailProvider) || "nodemailer";
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const provider = getProvider();

  switch (provider) {
    case "resend":
      return resend.sendEmail(options);
    case "nodemailer":
    default:
      return nodemailer.sendEmail(options);
  }
}

export { nodemailer, resend };
