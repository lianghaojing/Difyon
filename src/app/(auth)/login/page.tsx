"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const reset = searchParams.get("reset") || searchParams.get("message");
  const verified = searchParams.get("verified");
  const searchParamsString = searchParams.toString();

  const successMessage = reset
    ? "密码已重置成功，请使用新密码登录"
    : verified
      ? "邮箱验证成功，请登录"
      : null;

  useEffect(() => {
    if (!successMessage) {
      setShowSuccessMessage(false);
      return;
    }

    setShowSuccessMessage(true);

    const hideTimer = window.setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3600);

    const clearUrlTimer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParamsString);
      nextParams.delete("verified");
      nextParams.delete("reset");
      nextParams.delete("message");

      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `/login?${nextQuery}` : "/login", {
        scroll: false,
      });
    }, 4000);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearUrlTimer);
    };
  }, [router, searchParamsString, successMessage]);

  return (
    <>
      {successMessage && (
        <div
          className={`fixed left-1/2 top-0 z-50 flex h-12 w-[calc(100%-40px)] max-w-[420px] -translate-x-1/2 items-center justify-center rounded-b-[12px] border border-t-0 border-[#d6efdf] bg-[#EBF8F0] px-4 text-center text-sm font-medium leading-[1.6] text-[#1a1e26] transition-all duration-300 ease-out ${
            showSuccessMessage
              ? "translate-y-0 opacity-100"
              : "-translate-y-1.5 opacity-0"
          }`}
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
