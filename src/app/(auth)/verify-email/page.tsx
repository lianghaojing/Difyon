"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type VerifyState =
  | "loading"
  | "success"
  | "expired"
  | "invalid"
  | "check-email";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [state, setState] = useState<VerifyState>(
    token ? "loading" : "check-email"
  );
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");

  // Resolve email from URL param or sessionStorage
  const [email, setEmail] = useState<string | null>(emailParam);

  useEffect(() => {
    if (emailParam) {
      // Store in sessionStorage for future use
      sessionStorage.setItem("verifyEmail", emailParam);
      setEmail(emailParam);
    } else {
      // Try to read from sessionStorage
      const stored = sessionStorage.getItem("verifyEmail");
      if (stored) {
        setEmail(stored);
      }
    }
  }, [emailParam]);

  useEffect(() => {
    if (!token) return;

    async function verifyEmail() {
      try {
        const response = await fetch(
          `/api/verify-email?token=${encodeURIComponent(token!)}`,
          { method: "GET" }
        );

        if (response.ok) {
          setState("success");
          // Clear stored email on successful verification
          sessionStorage.removeItem("verifyEmail");
          // Redirect to login with success message after a short delay
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 2000);
        } else if (response.status === 410) {
          setState("expired");
        } else {
          setState("invalid");
        }
      } catch {
        setState("invalid");
      }
    }

    verifyEmail();
  }, [token, router]);

  const handleResend = useCallback(async () => {
    const targetEmail = email || emailInput.trim();
    if (!targetEmail) {
      setResendError("请输入邮箱地址");
      return;
    }

    setResending(true);
    setResendMessage(null);
    setResendError(null);

    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      if (response.ok) {
        setResendMessage("验证邮件已重新发送，请检查您的邮箱");
        // Store the email for future use
        sessionStorage.setItem("verifyEmail", targetEmail);
        setEmail(targetEmail);
      } else if (response.status === 429) {
        setResendError("发送过于频繁，请稍后重试");
      } else {
        setResendError("发送失败，请稍后重试");
      }
    } catch {
      setResendError("发送失败，请稍后重试");
    } finally {
      setResending(false);
    }
  }, [email, emailInput]);

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Spinner size="lg" />
        <p className="text-sm text-gray-600">正在验证您的邮箱...</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">邮箱验证成功</h2>
        <p className="text-sm text-gray-600">
          正在跳转到登录页面...
        </p>
      </div>
    );
  }

  if (state === "expired") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <svg
            className="h-6 w-6 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">验证链接已过期</h2>
        <p className="text-sm text-gray-600">
          您的验证链接已过期，请重新发送验证邮件
        </p>
        {!email && (
          <div className="w-full">
            <Input
              type="email"
              placeholder="请输入您的邮箱地址"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              aria-label="邮箱地址"
            />
          </div>
        )}
        <Button
          onClick={handleResend}
          loading={resending}
          disabled={!email && !emailInput.trim()}
          className="mt-2 w-full"
        >
          重新发送验证邮件
        </Button>
        {resendMessage && (
          <p className="text-sm text-green-600" role="status">
            {resendMessage}
          </p>
        )}
        {resendError && (
          <p className="text-sm text-red-600" role="alert">
            {resendError}
          </p>
        )}
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">验证链接无效</h2>
        <p className="text-sm text-gray-600">
          该验证链接无效或已被使用，请重新注册或联系支持
        </p>
      </div>
    );
  }

  // state === "check-email"
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <svg
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">请检查您的邮箱</h2>
      <p className="text-center text-sm text-gray-600">
        我们已向您的邮箱发送了一封验证邮件，请点击邮件中的链接完成验证。
      </p>
      {!email && (
        <div className="w-full">
          <Input
            type="email"
            placeholder="请输入您的邮箱地址"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            aria-label="邮箱地址"
          />
        </div>
      )}
      <Button
        onClick={handleResend}
        loading={resending}
        disabled={!email && !emailInput.trim()}
        variant="outline"
        className="mt-2 w-full"
      >
        重新发送
      </Button>
      {resendMessage && (
        <p className="text-sm text-green-600" role="status">
          {resendMessage}
        </p>
      )}
      {resendError && (
        <p className="text-sm text-red-600" role="alert">
          {resendError}
        </p>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 py-8">
          <Spinner size="lg" />
          <p className="text-sm text-gray-600">加载中...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
