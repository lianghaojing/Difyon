"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLoading } from "@/components/ui/brand-loading";
import {
  authCopy,
  resolveAuthLocale,
  type AuthLocale,
} from "@/lib/i18n/auth";

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
  const [locale, setLocale] = useState<AuthLocale>("en");

  // Resolve email from URL param or sessionStorage
  const [email, setEmail] = useState<string | null>(emailParam);
  const copy = authCopy[locale];

  useEffect(() => {
    setLocale(resolveAuthLocale(window.navigator.language));
  }, []);

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
      setResendError(copy.verifyEmailAddressRequired);
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
        setResendMessage(copy.verifyEmailResent);
        // Store the email for future use
        sessionStorage.setItem("verifyEmail", targetEmail);
        setEmail(targetEmail);
      } else if (response.status === 429) {
        setResendError(copy.verifyEmailRateLimited);
      } else {
        setResendError(copy.verifyEmailResendFailed);
      }
    } catch {
      setResendError(copy.verifyEmailResendFailed);
    } finally {
      setResending(false);
    }
  }, [copy, email, emailInput]);

  if (state === "loading") {
    return (
      <div className="py-8">
        <BrandLoading label={copy.verifyEmailLoading} />
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
        <h2 className="text-lg font-semibold text-gray-900">
          {copy.verifyEmailSuccessTitle}
        </h2>
        <p className="text-sm text-gray-600">
          {copy.verifyEmailSuccessSubtitle}
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
        <h2 className="text-lg font-semibold text-gray-900">
          {copy.verifyEmailExpiredTitle}
        </h2>
        <p className="text-sm text-gray-600">
          {copy.verifyEmailExpiredSubtitle}
        </p>
        {!email && (
          <div className="w-full">
            <Input
              type="email"
              placeholder={copy.emailPlaceholder}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              aria-label={copy.email}
            />
          </div>
        )}
        <Button
          onClick={handleResend}
          loading={resending}
          disabled={!email && !emailInput.trim()}
          className="mt-2 w-full"
        >
          {copy.resendVerificationEmail}
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
        <h2 className="text-lg font-semibold text-gray-900">
          {copy.verifyEmailInvalidTitle}
        </h2>
        <p className="text-sm text-gray-600">
          {copy.verifyEmailInvalidSubtitle}
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
      <h2 className="text-lg font-semibold text-gray-900">
        {copy.verifyEmailCheckTitle}
      </h2>
      <p className="text-center text-sm text-gray-600">
        {copy.verifyEmailCheckSubtitle}
      </p>
      {!email && (
        <div className="w-full">
          <Input
            type="email"
            placeholder={copy.emailPlaceholder}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            aria-label={copy.email}
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
        {copy.resend}
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
        <div className="py-8">
          <BrandLoading />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
