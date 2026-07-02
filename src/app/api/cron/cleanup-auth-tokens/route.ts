import { NextRequest, NextResponse } from "next/server";
import { deleteExpiredAuthTokens } from "@/lib/tokens";

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await deleteExpiredAuthTokens();
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("Auth token cleanup error:", error);
    return NextResponse.json(
      { error: "Auth token cleanup failed" },
      { status: 500 }
    );
  }
}
