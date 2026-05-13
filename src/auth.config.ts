import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations";

/**
 * Edge-compatible Auth.js configuration.
 * This config is used by the middleware (which runs on the Edge runtime)
 * and excludes Node.js-only dependencies like Prisma and bcrypt.
 *
 * The full configuration with adapter and callbacks is in src/auth.ts.
 */
export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid email profile" },
      },
    }),
    Credentials({
      async authorize(credentials) {
        // Only validate the shape here; actual auth is done in the full config
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) return null;
        // Return null here - actual credential verification happens in src/auth.ts
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
} satisfies NextAuthConfig;
