import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
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

import { prisma } from "@/lib/prisma";
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
    // Default: user exists and is unverified
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      emailVerified: null,
    } as any);
  });

  it("returns uniform success when email is missing (no enumeration)", async () => {
    const req = createRequest({});

    const res = await POST(req);
    const data = await res.json();

    // Uniform response - doesn't reveal whether email is valid
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(createVerificationToken).not.toHaveBeenCalled();
  });

  it("returns uniform success when email is invalid format", async () => {
    const req = createRequest({ email: "not-an-email" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(createVerificationToken).not.toHaveBeenCalled();
  });

  it("sends verification email when user exists and is unverified", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      emailVerified: null,
    } as any);

    const req = createRequest({ email: "user@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(createVerificationToken).toHaveBeenCalledWith("user@example.com");
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "user@example.com",
      "new-verification-token"
    );
  });

  it("does NOT send email when user is already verified", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      emailVerified: new Date(),
    } as any);

    const req = createRequest({ email: "verified@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(createVerificationToken).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("does NOT send email when user does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const req = createRequest({ email: "nonexistent@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(createVerificationToken).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limit is exceeded (3 per 5 min)", async () => {
    // Make 3 requests to exhaust the rate limit
    for (let i = 0; i < 3; i++) {
      const req = createRequest({ email: "user@example.com" });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 4th request should be rate limited
    const req = createRequest({ email: "user@example.com" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe("发送过于频繁，请稍后重试");
    expect(data.retryAfterMs).toBeDefined();
  });

  it("returns 500 when an unexpected error occurs", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(
      new Error("Database error")
    );

    const req = createRequest({ email: "user@example.com" });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("发送失败，请稍后重试");
  });
});
