import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    verificationToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/email", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/tokens", () => ({
  createVerificationToken: vi.fn().mockResolvedValue("new-verification-token"),
}));

import { sendVerificationEmail } from "@/lib/email";
import { createVerificationToken } from "@/lib/tokens";
import { resetRateLimitStore } from "@/lib/rate-limit";

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/resend-verification", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("POST /api/resend-verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
  });

  it("returns 400 when email is missing", async () => {
    const req = createRequest({});

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("邮箱不能为空");
  });

  it("returns 400 when email is not a string", async () => {
    const req = createRequest({ email: 123 });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("邮箱不能为空");
  });

  it("returns 200 and sends verification email on success", async () => {
    const req = createRequest({ email: "user@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("验证邮件已发送");
    expect(createVerificationToken).toHaveBeenCalledWith("user@example.com");
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "user@example.com",
      "new-verification-token"
    );
  });

  it("returns 429 when rate limit is exceeded (3 per 5 min)", async () => {
    const email = "ratelimited@example.com";

    // Make 3 requests to exhaust the rate limit
    for (let i = 0; i < 3; i++) {
      const req = createRequest({ email });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 4th request should be rate limited
    const req = createRequest({ email });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe("发送过于频繁，请稍后重试");
    expect(data.retryAfterMs).toBeDefined();
  });

  it("rate limits per email independently", async () => {
    const email1 = "user1@example.com";
    const email2 = "user2@example.com";

    // Exhaust rate limit for email1
    for (let i = 0; i < 3; i++) {
      const req = createRequest({ email: email1 });
      await POST(req);
    }

    // email2 should still be allowed
    const req = createRequest({ email: email2 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 500 when an unexpected error occurs", async () => {
    vi.mocked(createVerificationToken).mockRejectedValueOnce(
      new Error("Database error")
    );

    const req = createRequest({ email: "user@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("发送失败，请稍后重试");
  });
});
