import { prisma } from "@/lib/prisma";

export const TERMS_VERSION = "2026-05-20";
export const PRIVACY_VERSION = "2026-05-20";
export const GOOGLE_CONSENT_COOKIE = "difyon_google_consent";

export type ConsentMethod = "email" | "google";

export function getConsentCookieValue() {
  return `${TERMS_VERSION}:${PRIVACY_VERSION}`;
}

export async function recordConsent(userId: string, method: ConsentMethod) {
  return prisma.consentRecord.upsert({
    where: {
      userId_termsVersion_privacyVersion: {
        userId,
        termsVersion: TERMS_VERSION,
        privacyVersion: PRIVACY_VERSION,
      },
    },
    create: {
      userId,
      termsVersion: TERMS_VERSION,
      privacyVersion: PRIVACY_VERSION,
      method,
    },
    update: {
      method,
      acceptedAt: new Date(),
    },
  });
}
