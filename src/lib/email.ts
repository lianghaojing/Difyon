// lib/email.ts

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface AuthEmailTemplateOptions {
  eyebrow: string;
  title: string;
  intro: string;
  buttonText: string;
  buttonUrl: string;
  expiryText: string;
  safetyText: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createAuthEmailHtml(options: AuthEmailTemplateOptions): string {
  const buttonUrl = escapeHtml(options.buttonUrl);
  const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/icons/auth/brand-logo.svg`;

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(options.title)}</title>
    <style>
      @media (max-width: 480px) {
        .email-page { padding: 0 20px !important; }
        .email-header { padding: 20px 0 !important; }
        .email-content { padding-top: 170px !important; width: 310px !important; }
        .email-title { font-size: 30px !important; }
      }
    </style>
  </head>
  <body style="margin:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans SC','Noto Sans',Arial,sans-serif;color:#1a1e26;">
    <div class="email-page" style="box-sizing:border-box;min-height:960px;background:#ffffff;padding:0 64px;">
      <div style="box-sizing:border-box;margin:0 auto;max-width:1312px;">
        <div class="email-header" style="box-sizing:border-box;display:flex;height:78px;align-items:center;justify-content:space-between;">
          <img src="${escapeHtml(logoUrl)}" width="88" alt="Difyon" style="display:block;height:24px;width:auto;border:0;" />
          <span style="display:inline-block;min-width:46px;border:1px solid #ecedf3;border-radius:12px;background:#ffffff;padding:10px 12px;color:#1a1e26;font-size:12px;font-weight:700;line-height:16px;text-align:center;box-shadow:inset 0 -2px 0 #ecedf3;">中文</span>
        </div>
        <div class="email-content" style="box-sizing:border-box;margin:0 auto;max-width:420px;padding-top:224px;">
          <h1 class="email-title" style="margin:0;font-size:34px;font-weight:800;line-height:1.2;color:#1a1e26;letter-spacing:0;">${escapeHtml(options.title)}</h1>
          <p style="margin:12px 0 0;font-size:17px;font-weight:500;line-height:28px;color:#55637f;">${escapeHtml(options.intro)}</p>
          <p style="margin:22px 0 0;border:1px solid #ecedf3;border-radius:12px;background:#ffffff;padding:16px;font-size:14px;font-weight:600;line-height:24px;color:#55637f;">${escapeHtml(options.expiryText)}</p>
          <a href="${buttonUrl}" style="display:block;margin:24px 0 0;height:42px;border-radius:8px;background:#f953c6;color:#ffffff;font-size:14px;font-weight:800;line-height:42px;text-align:center;text-decoration:none;">${escapeHtml(options.buttonText)} →</a>
          <p style="margin:18px 0 0;font-size:12px;font-weight:500;line-height:20px;color:#7f8aa3;">${escapeHtml(options.safetyText)}</p>
          <p style="margin:8px 0 0;word-break:break-all;overflow-wrap:anywhere;font-size:12px;font-weight:600;line-height:20px;color:#55637f;"><a href="${buttonUrl}" style="color:#f953c6;text-decoration:none;word-break:break-all;overflow-wrap:anywhere;">${buttonUrl}</a></p>
        </div>
      </div>
    </div>
  </body>
</html>`;
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
    html: createAuthEmailHtml({
      eyebrow: "Email verification",
      title: "验证您的邮箱地址",
      intro: "请确认这是您用于 Difyon 的邮箱。验证后即可继续使用注册登录功能。",
      buttonText: "验证邮箱",
      buttonUrl: verifyUrl,
      expiryText: "此链接将在 24 小时后过期。",
      safetyText: "如果您没有注册 Difyon，可以忽略这封邮件。",
    }),
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
    html: createAuthEmailHtml({
      eyebrow: "Password reset",
      title: "重置您的密码",
      intro: "我们收到了重置 Difyon 密码的请求。请使用下面的按钮设置新密码。",
      buttonText: "重置密码",
      buttonUrl: resetUrl,
      expiryText: "此链接将在 1 小时后过期。",
      safetyText: "如果您没有请求重置密码，请忽略此邮件。",
    }),
  });
}
