import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  RESEND_VERIFICATION_RATE_LIMIT,
} from "@/lib/rate-limit";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "邮箱不能为空" },
        { status: 400 }
      );
    }

    // Rate limiting by email (3 per 5 min)
    const rateLimitKey = `resend-verification:${email}`;
    const rateLimit = checkRateLimit(rateLimitKey, RESEND_VERIFICATION_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "发送过于频繁，请稍后重试", retryAfterMs: rateLimit.retryAfterMs },
        { status: 429 }
      );
    }

    // createVerificationToken already deletes previous tokens for the same email
    // before creating a new one, satisfying the "delete all existing tokens" requirement
    const token = await createVerificationToken(email);
    await sendVerificationEmail(email, token);

    return NextResponse.json({ success: true, message: "验证邮件已发送" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "发送失败，请稍后重试" },
      { status: 500 }
    );
  }
}
