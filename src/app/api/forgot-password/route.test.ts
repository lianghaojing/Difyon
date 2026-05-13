import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/tokens", () => ({
  createPasswordResetToken: vi.fn().mockResolvedValue("reset-token-123"),
}));

vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { resetRateLimitStore } from "@/lib/rate-limit";

function createRequest(
  body: unknown,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest("http://localhost:3000/api/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

describe("POST /api/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
  });

  it("returns 400 when email is missing", async () => {
    const req = createRequest({});

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("请输入有效的邮箱地址");
  });

  it("returns 400 when email is invalid format", async () => {
    const req = createRequest({ email: "not-an-email" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("请输入有效的邮箱地址");
  });

  it("returns same success response when email exists in database", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user-1",
      email: "existing@example.com",
      hashedPassword: "hashed",
      displayName: "User",
      emailVerified: null,
      image: null,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createRequest({ email: "existing@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("如果该邮箱已注册，重置链接已发送");
    expect(createPasswordResetToken).toHaveBeenCalledWith(
      "existing@example.com"
    );
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      "existing@example.com",
      "reset-token-123"
    );
  });

  it("returns same success response when email does NOT exist in database", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const req = createRequest({ email: "nonexistent@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("如果该邮箱已注册，重置链接已发送");
    expect(createPasswordResetToken).not.toHaveBeenCalled();
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("response is identical for existing and non-existing emails (anti-enumeration)", async () => {
    // Request with existing email
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: "user-1",
      email: "exists@example.com",
      hashedPassword: "hashed",
      displayName: "User",
      emailVerified: null,
      image: null,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req1 = createRequest({ email: "exists@example.com" });
    const res1 = await POST(req1);
    const data1 = await res1.json();

    // Request with non-existing email
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const req2 = createRequest({ email: "notexists@example.com" });
    const res2 = await POST(req2);
    const data2 = await res2.json();

    // Both responses must be structurally identical
    expect(res1.status).toBe(res2.status);
    expect(Object.keys(data1).sort()).toEqual(Object.keys(data2).sort());
    expect(data1.success).toBe(data2.success);
    expect(data1.message).toBe(data2.message);
  });

  it("returns 429 when rate limit is exceeded (3 per 15 min by IP)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    // Make 3 requests to exhaust the rate limit
    for (let i = 0; i < 3; i++) {
      const req = createRequest({ email: `user${i}@example.com` });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 4th request should be rate limited
    const req = createRequest({ email: "another@example.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe("尝试次数过多，请稍后重试");
    expect(data.retryAfterMs).toBeDefined();
  });

  it("rate limits by IP address, not by email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    // Exhaust rate limit from default IP (no x-forwarded-for header)
    for (let i = 0; i < 3; i++) {
      const req = createRequest({ email: `user${i}@example.com` });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // Same IP, different email - should still be rate limited
    const req = createRequest({ email: "new@example.com" });
    const res = await POST(req);
    expect(res.status).toBe(429);

    // Different IP should still be allowed
    const reqDiffIp = createRequest(
      { email: "new@example.com" },
      { "x-forwarded-for": "192.168.1.100" }
    );
    const resDiffIp = await POST(reqDiffIp);
    expect(resDiffIp.status).toBe(200);
  });

  it("returns 500 when an unexpected error occurs", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(
      new Error("Database error")
    );

    const req = createRequest({ email: "user@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("操作失败，请稍后重试");
  });
});
