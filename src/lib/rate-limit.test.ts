import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  checkRateLimit,
  clearRateLimitForRequest,
  getRateLimitStatus,
  resetRateLimitStore,
  LOGIN_ACCOUNT_RATE_LIMIT,
  LOGIN_RATE_LIMIT,
  FORGOT_PASSWORD_RATE_LIMIT,
  RESEND_VERIFICATION_RATE_LIMIT,
  RateLimitConfig,
} from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkRateLimit", () => {
    const config: RateLimitConfig = {
      windowMs: 60_000, // 1 minute
      maxAttempts: 3,
      lockoutMs: 120_000, // 2 minutes
    };

    it("allows the first request", () => {
      const result = checkRateLimit("test-key", config);
      expect(result.allowed).toBe(true);
      expect(result.retryAfterMs).toBeUndefined();
    });

    it("allows requests below maxAttempts", () => {
      checkRateLimit("test-key", config);
      const result = checkRateLimit("test-key", config);
      expect(result.allowed).toBe(true);
    });

    it("rejects requests at maxAttempts", () => {
      checkRateLimit("test-key", config);
      checkRateLimit("test-key", config);
      checkRateLimit("test-key", config);
      const result = checkRateLimit("test-key", config);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBe(config.lockoutMs);
    });

    it("applies lockout and rejects during lockout period", () => {
      // Exhaust attempts
      for (let i = 0; i < config.maxAttempts; i++) {
        checkRateLimit("test-key", config);
      }
      // Trigger lockout
      checkRateLimit("test-key", config);

      // Still locked
      vi.advanceTimersByTime(60_000); // 1 minute into lockout
      const result = checkRateLimit("test-key", config);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBeLessThanOrEqual(config.lockoutMs!);
    });

    it("restores access after lockout period elapses", () => {
      // Exhaust attempts
      for (let i = 0; i < config.maxAttempts; i++) {
        checkRateLimit("test-key", config);
      }
      // Trigger lockout
      checkRateLimit("test-key", config);

      // Advance past lockout
      vi.advanceTimersByTime(config.lockoutMs! + 1);
      const result = checkRateLimit("test-key", config);
      expect(result.allowed).toBe(true);
    });

    it("uses sliding window - old timestamps expire", () => {
      checkRateLimit("test-key", config);
      checkRateLimit("test-key", config);

      // Advance past the window
      vi.advanceTimersByTime(config.windowMs + 1);

      // Old timestamps should be expired, so this should be allowed
      const result = checkRateLimit("test-key", config);
      expect(result.allowed).toBe(true);
    });

    it("returns retryAfterMs equal to windowMs when no lockoutMs configured", () => {
      const noLockoutConfig: RateLimitConfig = {
        windowMs: 60_000,
        maxAttempts: 2,
      };

      checkRateLimit("test-key", noLockoutConfig);
      checkRateLimit("test-key", noLockoutConfig);
      const result = checkRateLimit("test-key", noLockoutConfig);
      expect(result.allowed).toBe(false);
      expect(result.retryAfterMs).toBe(noLockoutConfig.windowMs);
    });

    it("tracks different keys independently", () => {
      for (let i = 0; i < config.maxAttempts; i++) {
        checkRateLimit("key-a", config);
      }
      // key-a is exhausted
      const resultA = checkRateLimit("key-a", config);
      expect(resultA.allowed).toBe(false);

      // key-b should still be allowed
      const resultB = checkRateLimit("key-b", config);
      expect(resultB.allowed).toBe(true);
    });
  });

  describe("getRateLimitStatus", () => {
    const config: RateLimitConfig = {
      windowMs: 60_000,
      maxAttempts: 2,
      lockoutMs: 120_000,
    };

    it("does not increment attempts while checking status", () => {
      expect(getRateLimitStatus("status-key", config).allowed).toBe(true);
      expect(getRateLimitStatus("status-key", config).allowed).toBe(true);
      expect(checkRateLimit("status-key", config).allowed).toBe(true);
      expect(checkRateLimit("status-key", config).allowed).toBe(true);
      expect(checkRateLimit("status-key", config).allowed).toBe(false);
    });

    it("reports a blocked key without adding another attempt", () => {
      checkRateLimit("blocked-key", config);
      checkRateLimit("blocked-key", config);

      const status = getRateLimitStatus("blocked-key", config);

      expect(status.allowed).toBe(false);
      expect(status.retryAfterMs).toBe(config.lockoutMs);
    });

    it("allows again after the stored window expires", () => {
      checkRateLimit("expired-window-key", config);
      checkRateLimit("expired-window-key", config);

      vi.advanceTimersByTime(config.windowMs + 1);

      expect(getRateLimitStatus("expired-window-key", config).allowed).toBe(
        true
      );
    });
  });

  describe("clearRateLimitForRequest", () => {
    const config: RateLimitConfig = {
      windowMs: 60_000,
      maxAttempts: 1,
      lockoutMs: 120_000,
    };

    it("clears stored failures in development and tests", async () => {
      checkRateLimit("clear-key", config);
      expect(checkRateLimit("clear-key", config).allowed).toBe(false);

      await clearRateLimitForRequest("clear-key");

      expect(checkRateLimit("clear-key", config).allowed).toBe(true);
    });
  });

  describe("predefined rate limit configs", () => {
    it("LOGIN_RATE_LIMIT has correct values", () => {
      expect(LOGIN_RATE_LIMIT.windowMs).toBe(15 * 60 * 1000);
      expect(LOGIN_RATE_LIMIT.maxAttempts).toBe(5);
      expect(LOGIN_RATE_LIMIT.lockoutMs).toBe(15 * 60 * 1000);
    });

    it("LOGIN_ACCOUNT_RATE_LIMIT has correct values", () => {
      expect(LOGIN_ACCOUNT_RATE_LIMIT.windowMs).toBe(15 * 60 * 1000);
      expect(LOGIN_ACCOUNT_RATE_LIMIT.maxAttempts).toBe(5);
      expect(LOGIN_ACCOUNT_RATE_LIMIT.lockoutMs).toBe(30 * 60 * 1000);
    });

    it("FORGOT_PASSWORD_RATE_LIMIT has correct values", () => {
      expect(FORGOT_PASSWORD_RATE_LIMIT.windowMs).toBe(15 * 60 * 1000);
      expect(FORGOT_PASSWORD_RATE_LIMIT.maxAttempts).toBe(3);
      expect(FORGOT_PASSWORD_RATE_LIMIT.lockoutMs).toBeUndefined();
    });

    it("RESEND_VERIFICATION_RATE_LIMIT has correct values", () => {
      expect(RESEND_VERIFICATION_RATE_LIMIT.windowMs).toBe(5 * 60 * 1000);
      expect(RESEND_VERIFICATION_RATE_LIMIT.maxAttempts).toBe(3);
      expect(RESEND_VERIFICATION_RATE_LIMIT.lockoutMs).toBeUndefined();
    });
  });
});
