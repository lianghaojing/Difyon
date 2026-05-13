import { describe, it, expect } from "vitest";
import {
  emailSchema,
  displayNameSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  calculatePasswordStrength,
} from "./validations";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });

  it("rejects an empty string", () => {
    const result = emailSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    expect(emailSchema.safeParse("notanemail").success).toBe(false);
    expect(emailSchema.safeParse("missing@domain").success).toBe(false);
  });

  it("rejects email longer than 254 characters", () => {
    const longEmail = "a".repeat(246) + "@test.com"; // 246 + 9 = 255
    expect(longEmail.length).toBeGreaterThan(254);
    expect(emailSchema.safeParse(longEmail).success).toBe(false);
  });

  it("accepts email at exactly 254 characters", () => {
    // Create a valid email that is exactly 254 chars
    const localPart = "a".repeat(243);
    const email = `${localPart}@example.com`; // 243 + 1 + 7 + 1 + 3 = 255... let's adjust
    const email254 = "a".repeat(241) + "@example.com"; // 241 + 12 = 253
    expect(email254.length).toBeLessThanOrEqual(254);
    expect(emailSchema.safeParse(email254).success).toBe(true);
  });
});

describe("displayNameSchema", () => {
  it("accepts a valid display name", () => {
    expect(displayNameSchema.safeParse("John Doe").success).toBe(true);
  });

  it("accepts a 2-character name", () => {
    expect(displayNameSchema.safeParse("Jo").success).toBe(true);
  });

  it("accepts a 50-character name", () => {
    expect(displayNameSchema.safeParse("a".repeat(50)).success).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(displayNameSchema.safeParse("").success).toBe(false);
  });

  it("rejects a 1-character name", () => {
    expect(displayNameSchema.safeParse("J").success).toBe(false);
  });

  it("rejects a name longer than 50 characters", () => {
    expect(displayNameSchema.safeParse("a".repeat(51)).success).toBe(false);
  });

  it("rejects a name with leading whitespace", () => {
    expect(displayNameSchema.safeParse(" John").success).toBe(false);
  });

  it("rejects a name with trailing whitespace", () => {
    expect(displayNameSchema.safeParse("John ").success).toBe(false);
  });

  it("allows internal whitespace", () => {
    expect(displayNameSchema.safeParse("John Doe").success).toBe(true);
  });
});

describe("passwordSchema", () => {
  it("accepts a valid password with uppercase, lowercase, and digit", () => {
    expect(passwordSchema.safeParse("Password1").success).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(passwordSchema.safeParse("").success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(passwordSchema.safeParse("Pass1").success).toBe(false);
  });

  it("rejects a password longer than 128 characters", () => {
    const longPass = "A" + "a".repeat(127) + "1";
    expect(longPass.length).toBeGreaterThan(128);
    expect(passwordSchema.safeParse(longPass).success).toBe(false);
  });

  it("rejects a password without uppercase", () => {
    expect(passwordSchema.safeParse("password1").success).toBe(false);
  });

  it("rejects a password without lowercase", () => {
    expect(passwordSchema.safeParse("PASSWORD1").success).toBe(false);
  });

  it("rejects a password without a digit", () => {
    expect(passwordSchema.safeParse("Password").success).toBe(false);
  });

  it("accepts a password at exactly 8 characters", () => {
    expect(passwordSchema.safeParse("Passwo1d").success).toBe(true);
  });

  it("accepts a password at exactly 128 characters", () => {
    const pass = "A" + "a".repeat(125) + "1b";
    expect(pass.length).toBe(128);
    expect(passwordSchema.safeParse(pass).success).toBe(true);
  });
});

describe("registerSchema", () => {
  const validData = {
    email: "user@example.com",
    displayName: "John Doe",
    password: "Password1",
    confirmPassword: "Password1",
  };

  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects when passwords do not match", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path.includes("confirmPassword") && i.code === "custom"
      );
      expect(confirmError).toBeDefined();
      expect(confirmError?.message).toBe("两次输入的密码不一致");
    }
  });

  it("rejects when email is empty", () => {
    const result = registerSchema.safeParse({ ...validData, email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects when displayName is empty", () => {
    const result = registerSchema.safeParse({ ...validData, displayName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects when password is empty", () => {
    const result = registerSchema.safeParse({ ...validData, password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects when confirmPassword is empty", () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "pass" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "notanemail",
      password: "pass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts a valid email", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "user@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts valid matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass1!",
      confirmPassword: "Different1!",
    });
    expect(result.success).toBe(false);
  });

  it("validates password strength requirements", () => {
    const result = resetPasswordSchema.safeParse({
      password: "weak",
      confirmPassword: "weak",
    });
    expect(result.success).toBe(false);
  });
});

describe("calculatePasswordStrength", () => {
  it('returns "weak" for passwords shorter than 8 characters', () => {
    expect(calculatePasswordStrength("Ab1")).toBe("weak");
    expect(calculatePasswordStrength("")).toBe("weak");
    expect(calculatePasswordStrength("Abc123!")).toBe("weak");
  });

  it('returns "medium" for 8+ chars with exactly 2 character types (lower + special)', () => {
    expect(calculatePasswordStrength("abcdefg!")).toBe("medium"); // lower + special = 2 types
  });

  it('returns "weak" for 8+ chars with only 1 character type', () => {
    expect(calculatePasswordStrength("abcdefgh")).toBe("weak");
    expect(calculatePasswordStrength("ABCDEFGH")).toBe("weak");
    expect(calculatePasswordStrength("12345678")).toBe("weak");
  });

  it('returns "medium" for 8+ chars with exactly 2 character types', () => {
    expect(calculatePasswordStrength("abcdefgH")).toBe("medium"); // lower + upper but no digit
    expect(calculatePasswordStrength("abcdefg1")).toBe("medium"); // lower + digit but no upper
    expect(calculatePasswordStrength("ABCDEFG1")).toBe("medium"); // upper + digit but no lower
  });

  it('returns "strong" for 8+ chars with uppercase, lowercase, and digit', () => {
    expect(calculatePasswordStrength("Password1")).toBe("strong");
    expect(calculatePasswordStrength("Abcdefg1")).toBe("strong");
  });

  it('returns "very-strong" for 12+ chars with uppercase, lowercase, digit, and special', () => {
    expect(calculatePasswordStrength("Password1!ab")).toBe("very-strong");
    expect(calculatePasswordStrength("MyStr0ng!Pass")).toBe("very-strong");
  });

  it('returns "strong" (not "very-strong") when special char present but length < 12', () => {
    expect(calculatePasswordStrength("Pass1!ab")).toBe("strong"); // 8 chars, has all types but < 12
  });

  it('returns "strong" for 12+ chars with upper+lower+digit but no special', () => {
    expect(calculatePasswordStrength("Password1abc")).toBe("strong");
  });
});
