import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export function generateToken(): string {
  return crypto.randomUUID();
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createVerificationToken(email: string): Promise<string> {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete previous tokens for the same email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires,
    },
  });

  return token; // Return plaintext token for email link
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const token = generateToken();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete previous tokens for the same email
  await prisma.passwordResetToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.passwordResetToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires,
    },
  });

  return token;
}

export async function verifyToken(
  token: string,
  type: "verification" | "passwordReset"
): Promise<{ valid: boolean; identifier?: string; expired?: boolean }> {
  const hashedToken = hashToken(token);

  const record =
    type === "verification"
      ? await prisma.verificationToken.findFirst({
          where: { token: hashedToken },
        })
      : await prisma.passwordResetToken.findFirst({
          where: { token: hashedToken },
        });

  if (!record) return { valid: false };
  if (record.expires < new Date()) return { valid: false, expired: true };

  return { valid: true, identifier: record.identifier };
}

export async function consumeToken(
  token: string,
  type: "verification" | "passwordReset"
): Promise<void> {
  const hashedToken = hashToken(token);

  if (type === "verification") {
    await prisma.verificationToken.deleteMany({
      where: { token: hashedToken },
    });
  } else {
    await prisma.passwordResetToken.deleteMany({
      where: { token: hashedToken },
    });
  }
}

export async function deleteExpiredAuthTokens(now = new Date()): Promise<{
  verificationTokens: number;
  passwordResetTokens: number;
}> {
  const [verificationTokens, passwordResetTokens] = await prisma.$transaction([
    prisma.verificationToken.deleteMany({
      where: { expires: { lt: now } },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { expires: { lt: now } },
    }),
  ]);

  return {
    verificationTokens: verificationTokens.count,
    passwordResetTokens: passwordResetTokens.count,
  };
}
