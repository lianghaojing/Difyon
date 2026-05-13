import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password service", () => {
  it("hashPassword returns a bcrypt hash string", async () => {
    const hash = await hashPassword("TestPass1");
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("verifyPassword returns true for correct password", async () => {
    const password = "MySecure1Pass";
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it("verifyPassword returns false for incorrect password", async () => {
    const hash = await hashPassword("CorrectPass1");
    const result = await verifyPassword("WrongPass1", hash);
    expect(result).toBe(false);
  });

  it("hashing the same password twice produces different hashes (unique salts)", async () => {
    const password = "SamePassword1";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });

  it("uses cost factor 10", async () => {
    const hash = await hashPassword("CostCheck1");
    // bcrypt hash format: $2b$10$...
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
  });
});
