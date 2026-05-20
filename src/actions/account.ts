"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema, displayNameSchema } from "@/lib/validations";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export type AccountActionState = {
  error?: string;
  success?: string;
};

function getUserId(session: { user?: { id?: string } } | null) {
  return session?.user?.id;
}

export async function updateDisplayName(
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const session = await auth();
  const userId = getUserId(session);

  if (!userId) {
    return { error: "请先登录" };
  }

  const displayName = formData.get("displayName");
  const validated = displayNameSchema.safeParse(displayName);

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "显示名称无效" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: validated.data,
      displayName: validated.data,
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");

  return { success: "显示名称已更新" };
}

export async function changePassword(
  _prevState: AccountActionState,
  formData: FormData
): Promise<AccountActionState> {
  const session = await auth();
  const userId = getUserId(session);

  if (!userId) {
    return { error: "请先登录" };
  }

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const validated = changePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "密码信息无效" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hashedPassword: true },
  });

  if (!user?.hashedPassword) {
    return { error: "当前账号暂不支持密码修改" };
  }

  const isCurrentPasswordValid = await verifyPassword(
    currentPassword,
    user.hashedPassword
  );

  if (!isCurrentPasswordValid) {
    return { error: "当前密码不正确" };
  }

  const isSamePassword = await verifyPassword(newPassword, user.hashedPassword);
  if (isSamePassword) {
    return { error: "新密码不能与当前密码相同" };
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: {
      hashedPassword,
      tokenVersion: { increment: 1 },
    },
  });

  return { success: "密码已更新。为保证安全，请重新登录。" };
}

export async function logoutAllDevices() {
  const session = await auth();
  const userId = getUserId(session);

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  await signOut({ redirectTo: "/login" });
}

export async function resendVerificationFromAccount(): Promise<AccountActionState> {
  const session = await auth();
  const userId = getUserId(session);

  if (!userId) {
    return { error: "请先登录" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  });

  if (!user?.email) {
    return { error: "未找到当前邮箱" };
  }

  if (user.emailVerified) {
    return { success: "当前邮箱已验证" };
  }

  try {
    const token = await createVerificationToken(user.email);
    await sendVerificationEmail(user.email, token);
    return { success: "验证邮件已发送，请检查邮箱" };
  } catch {
    return { error: "验证邮件发送失败，请稍后重试" };
  }
}
