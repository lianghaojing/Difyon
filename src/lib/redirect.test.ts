import { describe, expect, it } from "vitest";
import { sanitizeCallbackUrl } from "./redirect";

describe("sanitizeCallbackUrl", () => {
  it("keeps root and internal app paths", () => {
    expect(sanitizeCallbackUrl("/")).toBe("/");
    expect(sanitizeCallbackUrl("/account/profile")).toBe("/account/profile");
    expect(sanitizeCallbackUrl("/account?tab=security#password")).toBe(
      "/account?tab=security#password"
    );
  });

  it("falls back to root for empty or missing values", () => {
    expect(sanitizeCallbackUrl()).toBe("/");
    expect(sanitizeCallbackUrl("")).toBe("/");
    expect(sanitizeCallbackUrl("   ")).toBe("/");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(sanitizeCallbackUrl("https://evil.example")).toBe("/");
    expect(sanitizeCallbackUrl("http://evil.example/path")).toBe("/");
    expect(sanitizeCallbackUrl("//evil.example/path")).toBe("/");
  });

  it("rejects non-path values and unsafe path syntax", () => {
    expect(sanitizeCallbackUrl("account")).toBe("/");
    expect(sanitizeCallbackUrl("\\\\evil.example\\path")).toBe("/");
    expect(sanitizeCallbackUrl("/\\evil.example")).toBe("/");
    expect(sanitizeCallbackUrl("/account\nSet-Cookie:test")).toBe("/");
  });
});
