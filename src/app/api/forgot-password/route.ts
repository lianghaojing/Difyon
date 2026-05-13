import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations";
import { checkRateLimit, FORGOT_PASSWORD_RATE_LIMIT } from "@/lib/rate-limit";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rateLimitKey = `forgot-password:${ip}`;
    const rateLimit = checkRateLimit(rateLimitKey, FORGOT_PASSWORD_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "尝试次数过多，请稍后重试", retryAfterMs: rateLimit.retryAfterMs },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = forgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    const { email } = validated.data;

    // Always return the same response regardless of whether email exists
    // This prevents email enumeration attacks
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = await createPasswordResetToken(email);
      await sendPasswordResetEmail(email, token);
    }

    // Uniform response - same for existing and non-existing emails
    return NextResponse.json({
      success: true,
      message: "如果该邮箱已注册，重置链接已发送",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "操作失败，请稍后重试" },
      { status: 500 }
    );
  }
}
