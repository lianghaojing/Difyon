"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLoading } from "@/components/ui/brand-loading";
import {
  authCopy,
  authLocales,
  resolveAuthLocale,
  type AuthLocale,
} from "@/lib/i18n/auth";

type VerifyState =
  | "loading"
  | "success"
  | "expired"
  | "invalid"
  | "check-email";

const authIcons = {
  brandLogo: "/icons/auth/组 41642.svg",
  check: "/icons/auth/check.svg",
  fontSelect: "/icons/auth/font-select.svg",
};

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
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languagePickerRef = useRef<HTMLDivElement>(null);

  // Resolve email from URL param or sessionStorage
  const [email, setEmail] = useState<string | null>(emailParam);
  const copy = authCopy[locale];

  useEffect(() => {
    setLocale(resolveAuthLocale(window.navigator.language));
  }, []);

  useEffect(() => {
    if (!isLanguageOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        languagePickerRef.current?.contains(target)
      ) {
        return;
      }
      setIsLanguageOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isLanguageOpen]);

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

  const renderShell = (children: ReactNode) => (
    <div className="min-h-dvh overflow-x-hidden bg-white font-['IBM_Plex_Sans','Noto_Sans_SC','Noto_Sans',sans-serif]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-5 sm:px-8 md:px-12 lg:h-dvh lg:px-16">
        <header className="relative flex h-[78px] shrink-0 items-center justify-center sm:justify-between">
          <Link href="/" className="inline-flex items-center" aria-label={copy.brand}>
            <img
              src={authIcons.brandLogo}
              alt={copy.brand}
              className="h-6 w-auto"
            />
          </Link>

          <div
            className="absolute right-[max(20px,calc(100%-370px))] top-1/2 -translate-y-1/2 sm:relative sm:right-auto sm:top-auto sm:translate-y-0"
            ref={languagePickerRef}
          >
            <button
              type="button"
              onClick={() => setIsLanguageOpen((value) => !value)}
              className="flex h-10 min-w-[72px] items-center justify-center gap-2 rounded-[12px] border border-[#ecedf3] bg-white px-3 text-xs font-semibold text-[#1a1e26] shadow-[inset_0_-2px_0_#ecedf3] outline-none transition-colors duration-300 ease-out hover:bg-[#f9fafb] focus-visible:border-[#f953c6] focus-visible:ring-2 focus-visible:ring-[#f953c6]/20"
              aria-haspopup="listbox"
              aria-expanded={isLanguageOpen}
            >
              <IconMask src={authIcons.fontSelect} color="#55637f" />
              {copy.languages[locale]}
            </button>

            <div
              className={`absolute right-0 top-12 z-20 w-[132px] overflow-hidden rounded-[12px] border border-[#ecedf3] bg-white p-1 shadow-[0_18px_45px_rgba(26,30,38,0.12)] transition duration-150 ease-out ${
                isLanguageOpen
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1.5 scale-[0.98] opacity-0"
              }`}
              role="listbox"
            >
              {authLocales.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setLocale(item);
                    setIsLanguageOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-between rounded-[8px] px-3 text-left text-xs font-semibold transition-colors duration-300 ease-out ${
                    locale === item
                      ? "text-[#f953c6]"
                      : "text-[#55637f] hover:bg-[#f9fafb] hover:text-[#1a1e26]"
                  }`}
                  role="option"
                  aria-selected={locale === item}
                >
                  {copy.languages[item]}
                  {locale === item && (
                    <IconMask src={authIcons.check} color="#f953c6" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="flex w-full min-w-0 flex-1 items-center justify-start py-8 sm:justify-center lg:py-0">
          <div className="w-[310px] min-w-0 sm:w-full sm:max-w-[420px]">
            {children}
          </div>
        </section>
      </div>
    </div>
  );

  if (state === "loading") {
    return renderShell(
      <div className="py-8">
        <BrandLoading label={copy.verifyEmailLoading} />
      </div>
    );
  }

  if (state === "success") {
    return renderShell(
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
    return renderShell(
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
    return renderShell(
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
  return renderShell(
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

function IconMask({
  src,
  color,
  className = "",
}: {
  src: string;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`h-[14px] w-[14px] shrink-0 ${className}`}
      aria-hidden="true"
      style={{
        backgroundColor: color,
        WebkitMask: `url(${src}) center / contain no-repeat`,
        mask: `url(${src}) center / contain no-repeat`,
      }}
    />
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
