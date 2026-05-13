"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const reset = searchParams.get("reset");
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
          className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700"
          role="status"
          aria-live="polite"
        >
          {successMessage}
        </div>
      )}
      {error && (
        <div
          className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          Google 登录失败，请重试
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
