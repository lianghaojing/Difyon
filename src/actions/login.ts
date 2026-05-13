"use server";

import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit, LOGIN_RATE_LIMIT } from "@/lib/rate-limit";
import { AuthError } from "next-auth";
import { headers } from "next/headers";

export async function login(values: {
  email: string;
  password: string;
  callbackUrl?: string;
}) {
  const validated = loginSchema.safeParse(values);
  if (!validated.success) {
    return { error: "请输入有效的邮箱和密码" };
  }

  // Rate limiting by IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const rateLimitKey = `login:${ip}`;
  const rateLimit = checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT);

  if (!rateLimit.allowed) {
    return { error: "尝试次数过多，请稍后重试", retryAfterMs: rateLimit.retryAfterMs };
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirectTo: values.callbackUrl || "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "邮箱或密码错误" };
        default:
          return { error: "登录失败，请稍后重试" };
      }
    }
    throw error; // Re-throw redirect errors from next-auth
  }
}
