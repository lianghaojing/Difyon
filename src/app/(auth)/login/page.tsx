"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

function LoginContent() {
  const searchParams = useSearchParams();
  const reset = searchParams.get("reset") || searchParams.get("message");
  const verified = searchParams.get("verified");

  const successMessage = reset
    ? "密码已重置成功，请使用新密码登录"
    : verified
      ? "邮箱验证成功，请登录"
      : null;

  return (
    <>
      {successMessage && (
        <div
          className="flex h-12 items-center justify-center bg-[#EBF8F0] px-4 text-center text-sm font-medium leading-[1.6] text-[#1a1e26]"
          role="status"
          aria-live="polite"
        >
          {successMessage}
        </div>
      )}
      <LoginForm />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
