import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
    passwordResetToken: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/tokens", () => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn().mockResolvedValue("new-hashed-password"),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/tokens";
import { hashPassword } from "@/lib/password";

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("POST /api/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when token is missing", async () => {
    const req = createRequest({
      password: "NewPass123",
      confirmPassword: "NewPass123",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("缺少重置令牌");
  });

  it("returns 400 when password validation fails (too short)", async () => {
    const req = createRequest({
      token: "valid-token",
      password: "short",
      confirmPassword: "short",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("验证失败");
    expect(data.details).toBeDefined();
  });

  it("returns 400 when passwords do not match", async () => {
    const req = createRequest({
      token: "valid-token",
      password: "ValidPass123",
      confirmPassword: "DifferentPass123",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("验证失败");
  });

  it("returns 400 when password lacks uppercase letter", async () => {
    const req = createRequest({
      token: "valid-token",
      password: "lowercase123",
      confirmPassword: "lowercase123",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("验证失败");
  });

  it("returns 410 when token is expired", async () => {
    vi.mocked(verifyToken).mockResolvedValueOnce({
      valid: false,
      expired: true,
    });

    const req = createRequest({
      token: "expired-token",
      password: "NewPass123",
      confirmPassword: "NewPass123",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(410);
    expect(data.error).toBe("重置链接已过期");
    expect(data.expired).toBe(true);
  });

  it("returns 400 when token is invalid (not found)", async () => {
    vi.mocked(verifyToken).mockResolvedValueOnce({ valid: false });

    const req = createRequest({
      token: "invalid-token",
      password: "NewPass123",
      confirmPassword: "NewPass123",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("重置链接无效");
  });

  it("successfully resets password, increments tokenVersion, and deletes tokens", async () => {
    vi.mocked(verifyToken).mockResolvedValueOnce({
      valid: true,
      identifier: "user@example.com",
    });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      hashedPassword: "new-hashed-password",
      displayName: "User",
      emailVerified: null,
      image: null,
      tokenVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValueOnce({
      count: 1,
    });

    const req = createRequest({
      token: "valid-token",
      password: "NewPass123",
      confirmPassword: "NewPass123",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("密码已重置成功");

    // Verify password was hashed
    expect(hashPassword).toHaveBeenCalledWith("NewPass123");

    // Verify user was updated with new password and tokenVersion incremented
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      data: {
        hashedPassword: "new-hashed-password",
        tokenVersion: { increment: 1 },
      },
    });

    // Verify all password reset tokens for the user were deleted
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: "user@example.com" },
    });
  });

  it("verifies token with correct type (passwordReset)", async () => {
    vi.mocked(verifyToken).mockResolvedValueOnce({ valid: false });

    const req = createRequest({
      token: "some-token",
      password: "NewPass123",
      confirmPassword: "NewPass123",
    });

    await POST(req);

    expect(verifyToken).toHaveBeenCalledWith("some-token", "passwordReset");
  });

  it("returns 500 when an unexpected error occurs", async () => {
    vi.mocked(verifyToken).mockResolvedValueOnce({
      valid: true,
      identifier: "user@example.com",
    });
    vi.mocked(prisma.user.update).mockRejectedValueOnce(
      new Error("Database error")
    );

    const req = createRequest({
      token: "valid-token",
      password: "NewPass123",
      confirmPassword: "NewPass123",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("重置密码失败，请稍后重试");
  });

  it("increments tokenVersion to invalidate all existing JWT sessions", async () => {
    vi.mocked(verifyToken).mockResolvedValueOnce({
      valid: true,
      identifier: "user@example.com",
    });
    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user-1",
      email: "user@example.com",
      name: "User",
      hashedPassword: "new-hashed-password",
      displayName: "User",
      emailVerified: null,
      image: null,
      tokenVersion: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValueOnce({
      count: 1,
    });

    const req = createRequest({
      token: "valid-token",
      password: "StrongPass1",
      confirmPassword: "StrongPass1",
    });

    await POST(req);

    // The key requirement: tokenVersion must be incremented by 1
    const updateCall = vi.mocked(prisma.user.update).mock.calls[0][0];
    expect(updateCall.data.tokenVersion).toEqual({ increment: 1 });
  });
});
