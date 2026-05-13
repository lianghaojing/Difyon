import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validations";
import { verifyToken } from "@/lib/tokens";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, ...passwordData } = body;

    if (!token) {
      return NextResponse.json({ error: "缺少重置令牌" }, { status: 400 });
    }

    // Validate new password
    const validated = resetPasswordSchema.safeParse(passwordData);
    if (!validated.success) {
      return NextResponse.json(
        { error: "验证失败", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify token
    const result = await verifyToken(token, "passwordReset");
    if (!result.valid) {
      if (result.expired) {
        return NextResponse.json(
          { error: "重置链接已过期", expired: true },
          { status: 410 }
        );
      }
      return NextResponse.json({ error: "重置链接无效" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await hashPassword(validated.data.password);

    // Update user's password and increment tokenVersion
    await prisma.user.update({
      where: { email: result.identifier },
      data: {
        hashedPassword,
        tokenVersion: { increment: 1 },
      },
    });

    // Delete all password reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { identifier: result.identifier },
    });

    return NextResponse.json({ success: true, message: "密码已重置成功" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "重置密码失败，请稍后重试" },
      { status: 500 }
    );
  }
}
