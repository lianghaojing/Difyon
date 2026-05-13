import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateToken, hashToken, createVerificationToken, createPasswordResetToken, verifyToken, consumeToken } from "./tokens";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    verificationToken: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    passwordResetToken: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn().mockResolvedValue(null),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const mockedPrisma = vi.mocked(prisma, true);

describe("token service - pure functions", () => {
  describe("generateToken", () => {
    it("returns a valid UUID v4 string", () => {
      const token = generateToken();
      expect(token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("generates unique tokens on each call", () => {
      const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
      expect(tokens.size).toBe(100);
    });
  });

  describe("hashToken", () => {
    it("returns a 64-character hex string (SHA-256)", () => {
      const hash = hashToken("test-token");
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it("is deterministic - same input produces same output", () => {
      const token = "my-token-123";
      expect(hashToken(token)).toBe(hashToken(token));
    });

    it("produces different hashes for different inputs", () => {
      const hash1 = hashToken("token-a");
      const hash2 = hashToken("token-b");
      expect(hash1).not.toBe(hash2);
    });
  });
});

describe("token service - database functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createVerificationToken", () => {
    it("deletes previous tokens for the same email before creating a new one", async () => {
      const email = "user@example.com";
      await createVerificationToken(email);

      expect(mockedPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: email },
      });
      expect(mockedPrisma.verificationToken.create).toHaveBeenCalledTimes(1);
    });

    it("creates a token with 24-hour expiry", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      await createVerificationToken("user@example.com");

      const createCall = mockedPrisma.verificationToken.create.mock.calls[0][0];
      const expires = createCall.data.expires as Date;
      const expectedExpiry = now + 24 * 60 * 60 * 1000;
      expect(expires.getTime()).toBe(expectedExpiry);

      vi.restoreAllMocks();
    });

    it("stores the hashed token, not the plaintext token", async () => {
      const plainToken = await createVerificationToken("user@example.com");

      const createCall = mockedPrisma.verificationToken.create.mock.calls[0][0];
      const storedToken = createCall.data.token;

      // Stored token should be the SHA-256 hash of the returned plaintext token
      expect(storedToken).toBe(hashToken(plainToken));
      expect(storedToken).not.toBe(plainToken);
    });

    it("returns a plaintext token (UUID format)", async () => {
      const token = await createVerificationToken("user@example.com");
      expect(token).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });

  describe("createPasswordResetToken", () => {
    it("deletes previous tokens for the same email before creating a new one", async () => {
      const email = "user@example.com";
      await createPasswordResetToken(email);

      expect(mockedPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: email },
      });
      expect(mockedPrisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
    });

    it("creates a token with 1-hour expiry", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      await createPasswordResetToken("user@example.com");

      const createCall = mockedPrisma.passwordResetToken.create.mock.calls[0][0];
      const expires = createCall.data.expires as Date;
      const expectedExpiry = now + 60 * 60 * 1000;
      expect(expires.getTime()).toBe(expectedExpiry);

      vi.restoreAllMocks();
    });

    it("stores the hashed token, not the plaintext token", async () => {
      const plainToken = await createPasswordResetToken("user@example.com");

      const createCall = mockedPrisma.passwordResetToken.create.mock.calls[0][0];
      const storedToken = createCall.data.token;

      expect(storedToken).toBe(hashToken(plainToken));
      expect(storedToken).not.toBe(plainToken);
    });
  });

  describe("verifyToken", () => {
    it("returns { valid: false } when token is not found", async () => {
      mockedPrisma.verificationToken.findFirst.mockResolvedValue(null);

      const result = await verifyToken("nonexistent-token", "verification");
      expect(result).toEqual({ valid: false });
    });

    it("returns { valid: false, expired: true } when token is expired", async () => {
      const pastDate = new Date(Date.now() - 1000);
      mockedPrisma.verificationToken.findFirst.mockResolvedValue({
        id: "1",
        identifier: "user@example.com",
        token: "hashed",
        expires: pastDate,
      });

      const result = await verifyToken("some-token", "verification");
      expect(result).toEqual({ valid: false, expired: true });
    });

    it("returns { valid: true, identifier } when token is valid and not expired", async () => {
      const futureDate = new Date(Date.now() + 60000);
      mockedPrisma.verificationToken.findFirst.mockResolvedValue({
        id: "1",
        identifier: "user@example.com",
        token: "hashed",
        expires: futureDate,
      });

      const result = await verifyToken("some-token", "verification");
      expect(result).toEqual({ valid: true, identifier: "user@example.com" });
    });

    it("uses passwordResetToken model when type is passwordReset", async () => {
      const futureDate = new Date(Date.now() + 60000);
      mockedPrisma.passwordResetToken.findFirst.mockResolvedValue({
        id: "1",
        identifier: "user@example.com",
        token: "hashed",
        expires: futureDate,
      });

      const result = await verifyToken("some-token", "passwordReset");
      expect(result).toEqual({ valid: true, identifier: "user@example.com" });
      expect(mockedPrisma.passwordResetToken.findFirst).toHaveBeenCalled();
    });

    it("hashes the token before looking it up", async () => {
      const rawToken = "my-raw-token";
      const expectedHash = hashToken(rawToken);

      await verifyToken(rawToken, "verification");

      expect(mockedPrisma.verificationToken.findFirst).toHaveBeenCalledWith({
        where: { token: expectedHash },
      });
    });
  });

  describe("consumeToken", () => {
    it("deletes verification token by hashed value", async () => {
      const rawToken = "my-token";
      const expectedHash = hashToken(rawToken);

      await consumeToken(rawToken, "verification");

      expect(mockedPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { token: expectedHash },
      });
    });

    it("deletes password reset token by hashed value", async () => {
      const rawToken = "my-token";
      const expectedHash = hashToken(rawToken);

      await consumeToken(rawToken, "passwordReset");

      expect(mockedPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
        where: { token: expectedHash },
      });
    });
  });
});
