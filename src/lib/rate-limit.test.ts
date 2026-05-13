import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  checkRateLimit,
  resetRateLimitStore,
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

  describe("predefined rate limit configs", () => {
    it("LOGIN_RATE_LIMIT has correct values", () => {
      expect(LOGIN_RATE_LIMIT.windowMs).toBe(15 * 60 * 1000);
      expect(LOGIN_RATE_LIMIT.maxAttempts).toBe(5);
      expect(LOGIN_RATE_LIMIT.lockoutMs).toBe(15 * 60 * 1000);
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
