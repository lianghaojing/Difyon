import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendEmail, sendVerificationEmail, sendPasswordResetEmail } from "./email";

describe("email service", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe("sendEmail", () => {
    it("logs email details in development mode", async () => {
      vi.stubEnv("NODE_ENV", "development");

      await sendEmail({
        to: "user@example.com",
        subject: "Test Subject",
        html: "<p>Test body</p>",
      });

      expect(consoleSpy).toHaveBeenCalled();
      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("user@example.com");
      expect(allCalls).toContain("Test Subject");
      expect(allCalls).toContain("<p>Test body</p>");
    });

    it("uses EMAIL_FROM env variable when available", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("EMAIL_FROM", "custom@myapp.com");

      await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Body</p>",
      });

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("custom@myapp.com");
    });

    it("uses default EMAIL_FROM when env is not set", async () => {
      vi.stubEnv("NODE_ENV", "development");
      delete process.env.EMAIL_FROM;

      await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Body</p>",
      });

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("noreply@example.com");
    });

    it("throws in production when email configuration is missing", async () => {
      vi.stubEnv("NODE_ENV", "production");

      await expect(
        sendEmail({
          to: "user@example.com",
          subject: "Test",
          html: "<p>Body</p>",
        })
      ).rejects.toThrow("RESEND_API_KEY");
    });

    it("sends through Resend in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("RESEND_API_KEY", "re_test");
      vi.stubEnv("EMAIL_FROM", "Difyon <noreply@difyon.com>");
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "email-id" }), { status: 200 })
      );
      vi.stubGlobal("fetch", fetchMock);

      await sendEmail({
        to: "user@example.com",
        subject: "Test",
        html: "<p>Body</p>",
      });

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer re_test",
          }),
        })
      );
    });

    it("throws when Resend rejects delivery", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("RESEND_API_KEY", "re_test");
      vi.stubEnv("EMAIL_FROM", "Difyon <noreply@difyon.com>");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("rejected", { status: 422 }))
      );

      await expect(
        sendEmail({
          to: "user@example.com",
          subject: "Test",
          html: "<p>Body</p>",
        })
      ).rejects.toThrow("Resend delivery failed");
    });
  });

  describe("sendVerificationEmail", () => {
    it("sends email with correct verification URL", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://myapp.com");

      await sendVerificationEmail("user@example.com", "test-token-123");

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("user@example.com");
      expect(allCalls).toContain("验证您的邮箱地址");
      expect(allCalls).toContain("https://myapp.com/verify-email?token=test-token-123");
    });

    it("uses default base URL when NEXT_PUBLIC_APP_URL is not set", async () => {
      vi.stubEnv("NODE_ENV", "development");
      delete process.env.NEXT_PUBLIC_APP_URL;

      await sendVerificationEmail("user@example.com", "abc-token");

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("http://localhost:3000/verify-email?token=abc-token");
    });

    it("includes 24-hour expiry notice in email body", async () => {
      vi.stubEnv("NODE_ENV", "development");

      await sendVerificationEmail("user@example.com", "token");

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("24 小时");
    });
  });

  describe("sendPasswordResetEmail", () => {
    it("sends email with correct reset URL", async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://myapp.com");

      await sendPasswordResetEmail("user@example.com", "reset-token-456");

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("user@example.com");
      expect(allCalls).toContain("重置您的密码");
      expect(allCalls).toContain("https://myapp.com/reset-password?token=reset-token-456");
    });

    it("uses default base URL when NEXT_PUBLIC_APP_URL is not set", async () => {
      vi.stubEnv("NODE_ENV", "development");
      delete process.env.NEXT_PUBLIC_APP_URL;

      await sendPasswordResetEmail("user@example.com", "xyz-token");

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("http://localhost:3000/reset-password?token=xyz-token");
    });

    it("includes 1-hour expiry notice in email body", async () => {
      vi.stubEnv("NODE_ENV", "development");

      await sendPasswordResetEmail("user@example.com", "token");

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("1 小时");
    });

    it("includes ignore notice for unrequested resets", async () => {
      vi.stubEnv("NODE_ENV", "development");

      await sendPasswordResetEmail("user@example.com", "token");

      const allCalls = consoleSpy.mock.calls.flat().join("\n");
      expect(allCalls).toContain("如果您没有请求重置密码，请忽略此邮件");
    });
  });
});
