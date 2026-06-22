"use server";

import { signIn } from "@/auth";
import { loginSchema } from "@/lib/validations";
import {
  checkRateLimitForRequest,
  LOGIN_RATE_LIMIT,
} from "@/lib/rate-limit";
import { AuthError } from "next-auth";
import { headers } from "next/headers";

export async function login(values: {
  email: string;
  password: string;
  callbackUrl?: string;
}) {
  const validated = loginSchema.safeParse(values);
  if (!validated.success) {
    return { errorKey: "loginInvalidInput" as const };
  }

  // Rate limiting by IP
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const rateLimitKey = `login:${ip}`;
  const rateLimit = await checkRateLimitForRequest(
    rateLimitKey,
    LOGIN_RATE_LIMIT
  );

  if (!rateLimit.allowed) {
    return {
      errorKey: "loginRateLimited" as const,
      retryAfterMs: rateLimit.retryAfterMs,
    };
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
          return { errorKey: "loginInvalidCredentials" as const };
        default:
          return { errorKey: "loginGenericError" as const };
      }
    }
    throw error; // Re-throw redirect errors from next-auth
  }
}
