import { NextRequest, NextResponse } from "next/server";
import { verifyToken, consumeToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "缺少验证令牌" }, { status: 400 });
  }

  const result = await verifyToken(token, "verification");

  if (!result.valid) {
    if (result.expired) {
      return NextResponse.json(
        { error: "验证链接已过期", expired: true },
        { status: 410 }
      );
    }
    return NextResponse.json({ error: "验证链接无效" }, { status: 400 });
  }

  // Update user's emailVerified to current timestamp
  await prisma.user.update({
    where: { email: result.identifier },
    data: { emailVerified: new Date() },
  });

  // Consume (delete) the token after successful verification
  await consumeToken(token, "verification");

  return NextResponse.json({ success: true, message: "邮箱验证成功" });
}
