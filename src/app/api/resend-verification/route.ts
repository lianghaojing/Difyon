import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimitForRequest,
  RESEND_VERIFICATION_RATE_LIMIT,
} from "@/lib/rate-limit";
import { emailSchema } from "@/lib/validations";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const emailResult = emailSchema.safeParse(body.email);

    if (!emailResult.success) {
      // Return uniform success to prevent email enumeration
      return NextResponse.json({ success: true, message: "如果该邮箱需要验证，验证邮件已发送" });
    }

    const email = emailResult.data;

    // Rate limiting by email (3 per 5 min)
    const rateLimitKey = `resend-verification:${email}`;
    const rateLimit = await checkRateLimitForRequest(
      rateLimitKey,
      RESEND_VERIFICATION_RATE_LIMIT
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "发送过于频繁，请稍后重试", retryAfterMs: rateLimit.retryAfterMs },
        { status: 429 }
      );
    }

    // Only send if user exists AND email is not yet verified
    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    });

    if (user && !user.emailVerified) {
      const token = await createVerificationToken(email);
      await sendVerificationEmail(email, token);
    }

    // Always return uniform success response (prevent enumeration)
    return NextResponse.json({ success: true, message: "如果该邮箱需要验证，验证邮件已发送" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "发送失败，请稍后重试" },
      { status: 500 }
    );
  }
}
