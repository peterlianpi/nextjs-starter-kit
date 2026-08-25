import "dotenv/config";
import nodemailer from "nodemailer";

async function main() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.SMTP_FROM_EMAIL || user;

  console.log("SMTP config:", { host, port, user: user ? "(set)" : "(missing)", pass: pass ? "(set)" : "(missing)", from });

  if (!host || !user || !pass) {
    console.error("Missing SMTP config. Check SMTP_HOST, SMTP_USER, SMTP_PASS/SMTP_PASSWORD in .env");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  console.log("Verifying connection...");
  await transporter.verify();
  console.log("✅ SMTP connection verified!");

  console.log("Sending test email to peterpausianlian2020@gmail.com...");
  const info = await transporter.sendMail({
    from,
    to: "peterpausianlian2020@gmail.com",
    subject: "✅ Next.js Starter Kit — Email Test",
    text: "This is a test email from the Next.js Starter Kit. If you received this, email is working!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #667eea;">✅ Email is Working!</h2>
        <p>This is a test email from the <strong>Next.js Starter Kit</strong>.</p>
        <p>If you received this, your SMTP email configuration is correct.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Sent at ${new Date().toISOString()}</p>
      </div>
    `,
  });

  console.log("✅ Email sent successfully!");
  console.log("Message ID:", info.messageId);
}

main().catch((err) => {
  console.error("❌ Failed:", err.message);
  process.exit(1);
});
