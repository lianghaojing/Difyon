import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "邮箱不能为空")
  .max(254, "邮箱长度不能超过 254 个字符")
  .email("请输入有效的邮箱地址");

export const displayNameSchema = z
  .string()
  .min(1, "显示名称不能为空")
  .min(2, "显示名称至少需要 2 个字符")
  .max(50, "显示名称不能超过 50 个字符")
  .refine((val) => val === val.trim(), "显示名称不能包含前后空格");

export const passwordSchema = z
  .string()
  .min(1, "密码不能为空")
  .min(8, "密码至少需要 8 个字符")
  .max(128, "密码长度不能超过 128 个字符")
  .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
  .regex(/[a-z]/, "密码必须包含至少一个小写字母")
  .regex(/[0-9]/, "密码必须包含至少一个数字");

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "请确认密码"),
    acceptedTerms: z.literal(true, {
      error: "请先同意服务条款和隐私政策",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().min(1, "邮箱不能为空").email("请输入有效的邮箱地址"),
  password: z.string().min(1, "密码不能为空"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "请确认密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "请确认新密码"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的新密码不一致",
    path: ["confirmPassword"],
  });

// 密码强度计算
export type PasswordStrength = "weak" | "medium" | "strong" | "very-strong";

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return "weak";

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const typesCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  if (
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial &&
    password.length >= 12
  ) {
    return "very-strong";
  }
  if (hasUpper && hasLower && hasNumber) {
    return "strong";
  }
  if (typesCount >= 2) {
    return "medium";
  }
  return "weak";
}
