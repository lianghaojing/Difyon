import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { verifyPassword } from "@/lib/password";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
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
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) return null;

        const { email, password } = validated.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;

        const isValid = await verifyPassword(password, user.hashedPassword);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google OAuth users are always allowed to sign in
      if (account?.provider === "google") return true;

      // Credentials users: check if email is verified
      if (account?.provider === "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true },
        });
        // Allow sign-in but we'll handle unverified state in the session
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // Fetch current tokenVersion and emailVerified from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { tokenVersion: true, emailVerified: true },
        });
        token.tokenVersion = dbUser?.tokenVersion ?? 0;
        token.emailVerified = !!dbUser?.emailVerified;
      }

      // On every request, verify tokenVersion against database
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { tokenVersion: true, emailVerified: true },
        });
        if (!dbUser || dbUser.tokenVersion !== token.tokenVersion) {
          // tokenVersion mismatch - session has been revoked
          return { ...token, invalid: true };
        }
        // Update emailVerified status in token
        token.emailVerified = !!dbUser.emailVerified;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.invalid) {
        // Return empty session to force re-authentication
        return { ...session, user: undefined } as any;
      }
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).emailVerified = token.emailVerified as boolean;
      }
      return session;
    },
  },
  events: {
    async linkAccount({ user }) {
      // Auto-verify email when OAuth account is linked
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
});
