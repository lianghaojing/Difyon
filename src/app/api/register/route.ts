import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";
import { hashPassword } from "@/lib/password";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, type RateLimitConfig } from "@/lib/rate-limit";

const REGISTER_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
};

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rateLimitKey = `register:${ip}`;
    const rateLimit = checkRateLimit(rateLimitKey, REGISTER_RATE_LIMIT);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "尝试次数过多，请稍后重试",
          retryAfterMs: rateLimit.retryAfterMs,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "验证失败", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, displayName, password } = validated.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    // Create user record in database
    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        hashedPassword,
      },
    });

    // Generate verification token and send verification email
    const token = await createVerificationToken(email);
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
