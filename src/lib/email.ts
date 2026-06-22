// lib/email.ts

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Base email sending function.
 * In development, logs email details to console.
 * In production, deliver through Resend's HTTP API.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const from =
    process.env.EMAIL_FROM ||
    (process.env.NODE_ENV === "production" ? "" : "noreply@example.com");

  if (process.env.NODE_ENV === "production") {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || !from) {
      throw new Error(
        "Production email requires RESEND_API_KEY and EMAIL_FROM"
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Resend delivery failed (${response.status}): ${detail}`);
    }

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
