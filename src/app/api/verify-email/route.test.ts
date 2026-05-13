import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
    verificationToken: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/tokens", () => ({
  verifyToken: vi.fn(),
  consumeToken: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from "@/lib/prisma";
import { verifyToken, consumeToken } from "@/lib/tokens";

function createRequest(token?: string): NextRequest {
  const url = token
    ? `http://localhost:3000/api/verify-email?token=${token}`
    : "http://localhost:3000/api/verify-email";
  return new NextRequest(url, { method: "GET" });
}

describe("GET /api/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when token query param is missing", async () => {
    const req = createRequest();

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("缺少验证令牌");
  });

  it("returns 410 when token is expired", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      valid: false,
      expired: true,
    });

    const req = createRequest("expired-token-123");

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(410);
    expect(data.error).toBe("验证链接已过期");
    expect(data.expired).toBe(true);
    expect(verifyToken).toHaveBeenCalledWith("expired-token-123", "verification");
  });

  it("returns 400 when token is invalid or not found", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      valid: false,
    });

    const req = createRequest("invalid-token-456");

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("验证链接无效");
    expect(verifyToken).toHaveBeenCalledWith("invalid-token-456", "verification");
  });

  it("updates emailVerified and consumes token on valid token", async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      valid: true,
      identifier: "user@example.com",
    });
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "user-id",
      email: "user@example.com",
      displayName: "User",
      hashedPassword: "hash",
      emailVerified: new Date(),
      image: null,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = createRequest("valid-token-789");

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe("邮箱验证成功");

    // Verify user's emailVerified was updated
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
      data: { emailVerified: expect.any(Date) },
    });

    // Verify token was consumed
    expect(consumeToken).toHaveBeenCalledWith("valid-token-789", "verification");
  });

  it("calls verifyToken with correct type", async () => {
    vi.mocked(verifyToken).mockResolvedValue({ valid: false });

    const req = createRequest("some-token");
    await GET(req);

    expect(verifyToken).toHaveBeenCalledWith("some-token", "verification");
  });

  it("consumes token after updating user (correct order)", async () => {
    const callOrder: string[] = [];

    vi.mocked(verifyToken).mockResolvedValue({
      valid: true,
      identifier: "user@example.com",
    });
    vi.mocked(prisma.user.update).mockImplementation((async () => {
      callOrder.push("user.update");
      return {
        id: "user-id",
        email: "user@example.com",
        displayName: "User",
        hashedPassword: "hash",
        emailVerified: new Date(),
        image: null,
        tokenVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }) as unknown as typeof prisma.user.update);
    vi.mocked(consumeToken).mockImplementation(async () => {
      callOrder.push("consumeToken");
    });

    const req = createRequest("valid-token");
    await GET(req);

    expect(callOrder).toEqual(["user.update", "consumeToken"]);
  });
});
