import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

vi.mock("@/lib/tokens", () => ({
  deleteExpiredAuthTokens: vi.fn().mockResolvedValue({
    verificationTokens: 2,
    passwordResetTokens: 1,
  }),
}));

import { deleteExpiredAuthTokens } from "@/lib/tokens";

function createRequest(secret?: string): NextRequest {
  return new NextRequest(
    "http://localhost:3000/api/cron/cleanup-auth-tokens",
    {
      method: "POST",
      headers: secret ? { authorization: `Bearer ${secret}` } : undefined,
    }
  );
}

describe("POST /api/cron/cleanup-auth-tokens", () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-cron-secret";
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalCronSecret;
  });

  it("returns 401 when CRON_SECRET is missing", async () => {
    delete process.env.CRON_SECRET;

    const res = await POST(createRequest("test-cron-secret"));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(deleteExpiredAuthTokens).not.toHaveBeenCalled();
  });

  it("returns 401 when authorization is invalid", async () => {
    const res = await POST(createRequest("wrong-secret"));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(deleteExpiredAuthTokens).not.toHaveBeenCalled();
  });

  it("deletes expired auth tokens when authorized", async () => {
    const res = await POST(createRequest("test-cron-secret"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual({
      success: true,
      deleted: {
        verificationTokens: 2,
        passwordResetTokens: 1,
      },
    });
    expect(deleteExpiredAuthTokens).toHaveBeenCalledOnce();
  });
});
