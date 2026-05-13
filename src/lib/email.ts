// lib/email.ts

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Base email sending function.
 * In development, logs email details to console.
 * In production, swap this implementation for Resend or Nodemailer.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const from = process.env.EMAIL_FROM || "noreply@example.com";

  if (process.env.NODE_ENV === "production") {
    if (!process.env.RESEND_API_KEY) {
      console.error(
        "[Email] CRITICAL: No email provider configured in production! " +
        "Set RESEND_API_KEY environment variable. Emails will NOT be sent."
      );
      return;
    }
    // TODO: Replace with Resend or Nodemailer in production
    // Example with Resend:
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({ from, to: options.to, subject: options.subject, html: options.html });
    //
    // Example with Nodemailer:
    //   const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);
    //   await transporter.sendMail({ from, to: options.to, subject: options.subject, html: options.html });
    console.log(`[Email] Sending email (production mode not configured)`);
    console.log(`  From: ${from}`);
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    return;
  }

  // Development: log email details to console
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📧 Email Sent (Development Mode)`);
  console.log(`${"=".repeat(50)}`);
  console.log(`From:    ${from}`);
  console.log(`To:      ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`${"─".repeat(50)}`);
  console.log(options.html);
  console.log(`${"=".repeat(50)}\n`);
}

/**
 * Send a verification email with a link to verify the user's email address.
 * The verification link expires in 24 hours.
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "验证您的邮箱地址",
    html: `
      <h1>邮箱验证</h1>
      <p>请点击下方链接验证您的邮箱地址：</p>
      <a href="${verifyUrl}">验证邮箱</a>
      <p>此链接将在 24 小时后过期。</p>
    `,
  });
}

/**
 * Send a password reset email with a link to reset the user's password.
 * The reset link expires in 1 hour.
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: "重置您的密码",
    html: `
      <h1>密码重置</h1>
      <p>请点击下方链接重置您的密码：</p>
      <a href="${resetUrl}">重置密码</a>
      <p>此链接将在 1 小时后过期。</p>
      <p>如果您没有请求重置密码，请忽略此邮件。</p>
    `,
  });
}
