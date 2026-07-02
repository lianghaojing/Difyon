import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
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

vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_password_123"),
}));

vi.mock("@/lib/tokens", () => ({
  createVerificationToken: vi.fn().mockResolvedValue("verification-token-abc"),
}));

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { hashPassword } from "@/lib/password";
import { createVerificationToken } from "@/lib/tokens";
import { resetRateLimitStore } from "@/lib/rate-limit";

function createRequest(body: unknown, ip = "127.0.0.1"): NextRequest {
  const req = new NextRequest("http://localhost:3000/api/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
  });
  return req;
}

describe("POST /api/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimitStore();
  });

  it("returns 400 when request body validation fails", async () => {
    const req = createRequest({
      email: "invalid-email",
      displayName: "A",
      password: "weak",
      confirmPassword: "weak",
      acceptedTerms: true,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("验证失败");
    expect(data.details).toBeDefined();
  });

  it("returns 400 when passwords do not match", async () => {
    const req = createRequest({
      email: "user@example.com",
      displayName: "Test User",
      password: "Password123",
      confirmPassword: "DifferentPass123",
      acceptedTerms: true,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("验证失败");
    expect(data.details.confirmPassword).toBeDefined();
  });

  it("returns the generic success response when email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing-user-id",
      email: "user@example.com",
      name: "Existing User",
      displayName: "Existing User",
      hashedPassword: "hash",
      emailVerified: null,
      image: null,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createRequest({
      email: "user@example.com",
      displayName: "Test User",
      password: "Password123",
      confirmPassword: "Password123",
      acceptedTerms: true,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.emailSent).toBe(true);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(createVerificationToken).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("returns 201 with userId on successful registration", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "new-user-id-123",
      email: "newuser@example.com",
      name: "New User",
      displayName: "New User",
      hashedPassword: "hashed_password_123",
      emailVerified: null,
      image: null,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createRequest({
      email: "newuser@example.com",
      displayName: "New User",
      password: "Password123",
      confirmPassword: "Password123",
      acceptedTerms: true,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.userId).toBe("new-user-id-123");
    expect(data.emailSent).toBe(true);
  });

  it("hashes password before storing", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-id",
      email: "user@example.com",
      name: "User",
      displayName: "User",
      hashedPassword: "hashed_password_123",
      emailVerified: null,
      image: null,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createRequest({
      email: "user@example.com",
      displayName: "User",
      password: "Password123",
      confirmPassword: "Password123",
      acceptedTerms: true,
    });

    await POST(req);

    expect(hashPassword).toHaveBeenCalledWith("Password123");
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "user@example.com",
        hashedPassword: "hashed_password_123",
        consentRecords: {
          create: {
            termsVersion: "2026-05-20",
            privacyVersion: "2026-05-20",
            method: "email",
          },
        },
      },
    });
  });

  it("generates verification token and sends email after user creation", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-id",
      email: "user@example.com",
      name: "User",
      displayName: "User",
      hashedPassword: "hashed_password_123",
      emailVerified: null,
      image: null,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createRequest({
      email: "user@example.com",
      displayName: "User",
      password: "Password123",
      confirmPassword: "Password123",
      acceptedTerms: true,
    });

    await POST(req);

    expect(createVerificationToken).toHaveBeenCalledWith("user@example.com");
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "user@example.com",
      "verification-token-abc"
    );
  });

  it("still returns 201 when verification email fails after user creation", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user-id",
      email: "user@example.com",
      name: "User",
      displayName: "User",
      hashedPassword: "hashed_password_123",
      emailVerified: null,
      image: null,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(sendVerificationEmail).mockRejectedValueOnce(
      new Error("Email provider unavailable")
    );

    const req = createRequest({
      email: "user@example.com",
      displayName: "User",
      password: "Password123",
      confirmPassword: "Password123",
      acceptedTerms: true,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.userId).toBe("user-id");
    expect(data.emailSent).toBe(false);
  });

  it("returns 500 when an unexpected error occurs", async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(
      new Error("Database connection failed")
    );

    const req = createRequest({
      email: "user@example.com",
      displayName: "User",
      password: "Password123",
      confirmPassword: "Password123",
      acceptedTerms: true,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("注册失败，请稍后重试");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const ip = "192.168.1.100";

    // Make 5 requests to exhaust the rate limit
    for (let i = 0; i < 5; i++) {
      const req = createRequest(
        {
          email: "invalid",
          displayName: "A",
          password: "x",
          confirmPassword: "x",
          acceptedTerms: true,
        },
        ip
      );
      await POST(req);
    }

    // 6th request should be rate limited
    const req = createRequest(
      {
        email: "user@example.com",
        displayName: "User",
        password: "Password123",
        confirmPassword: "Password123",
        acceptedTerms: true,
      },
      ip
    );

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toBe("尝试次数过多，请稍后重试");
    expect(data.retryAfterMs).toBeDefined();
  });
});
