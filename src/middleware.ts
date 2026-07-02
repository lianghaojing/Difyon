import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const publicRoutes = [
  "/login",
  "/register",
  "/terms",
  "/privacy",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/api/register",
  "/api/verify-email",
  "/api/forgot-password",
  "/api/reset-password",
  "/api/resend-verification",
  "/api/cron",
  "/console",
];
const authRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isEmailVerified = (req.auth?.user as any)?.emailVerified;

  // Auth API 路由始终允许
  if (isApiAuthRoute) return NextResponse.next();

  // 已登录用户访问登录/注册页面 → 重定向到首页
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 未登录用户访问受保护页面 → 重定向到登录页
  if (!isPublicRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // 已登录但未验证邮箱的用户只能访问公开认证页面/API
  if (!isPublicRoute && isLoggedIn && !isEmailVerified) {
    const email = req.auth?.user?.email || "";
    return NextResponse.redirect(
      new URL(`/verify-email?email=${encodeURIComponent(email)}`, nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
