import { NextResponse } from "next/server";
import {
  GOOGLE_CONSENT_COOKIE,
  getConsentCookieValue,
} from "@/lib/consent";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(GOOGLE_CONSENT_COOKIE, getConsentCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
