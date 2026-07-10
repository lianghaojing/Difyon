"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLoading } from "@/components/ui/brand-loading";
import {
  authCopy,
  authLocales,
  type AuthLocale,
} from "@/lib/i18n/auth";
import { getInitialAuthLocale, persistAuthLocale } from "@/lib/auth-locale-client";

type VerifyState =
  | "loading"
  | "success"
  | "expired"
  | "invalid"
  | "check-email";

type VerifyPreview =
  | "success"
  | "expired"
  | "invalid"
  | "resend-success"
  | null;

const authIcons = {
  brandLogo: "/icons/auth/brand-logo.svg",
  checkEmailWatercolor: "/icons/auth/check-email-watercolor.png",
  emailDeliveryFailedWatercolor: "/icons/auth/email-delivery-failed-watercolor.png",
  verifyEmailSuccessWatercolor: "/icons/auth/verify-email-success-watercolor.png",
  verifyEmailExpiredWatercolor: "/icons/auth/verify-email-expired-watercolor.png",
  verifyEmailInvalidWatercolor: "/icons/auth/verify-email-invalid-watercolor.png",
  verifyEmailResendSuccessWatercolor: "/icons/auth/verify-email-resend-success-watercolor.png",
  check: "/icons/auth/check.svg",
  fontSelect: "/icons/auth/font-select.svg",
};

function getVerifyPreview(value: string | null): VerifyPreview {
  if (process.env.NODE_ENV === "production") return null;
  if (
    value === "success" ||
    value === "expired" ||
    value === "invalid" ||
    value === "resend-success"
  ) {
    return value;
  }
  return null;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const deliveryFailed = searchParams.get("delivery") === "failed";
  const preview = getVerifyPreview(searchParams.get("preview"));
  const previewState =
    preview === "success" || preview === "expired" || preview === "invalid"
      ? preview
      : preview === "resend-success"
        ? "check-email"
        : null;

  const [state, setState] = useState<VerifyState>(
    previewState ?? (token ? "loading" : "check-email")
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
    if (previewState) {
      setState(previewState);
    }
  }, [previewState]);

  useEffect(() => {
    if (preview !== "resend-success") return;
    setResendMessage(copy.verifyEmailResent);
    setEmail(emailParam ?? "visual.resend.review@example.com");
  }, [copy.verifyEmailResent, emailParam, preview]);

  useEffect(() => {
    setLocale(getInitialAuthLocale());
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
    if (preview) return;
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
  }, [emailParam, preview]);

  useEffect(() => {
    if (preview) return;
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
          // Clear the stale unverified registration session before sending
          // the user back to login with a freshly verified account.
          setTimeout(() => {
            void signOut({ redirect: false }).finally(() => {
              router.push("/login?verified=true");
            });
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
  }, [token, router, preview]);

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
            <Image
              src={authIcons.brandLogo}
              alt={copy.brand}
              width={595}
              height={162}
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
                    persistAuthLocale(item);
                    setIsLanguageOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-between rounded-[8px] px-3 text-left text-xs font-semibold transition-colors duration-300 ease-out ${
                    locale === item
                      ? "text-[#f953c6]"
                      : "text-[#55637f] hover:bg-[#f9fafb] hover:text-[#1a1e26]"
                  }`}
                  role="option"
                  aria-selected={locale === item}
                  tabIndex={isLanguageOpen ? 0 : -1}
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
        <Image
          src={authIcons.verifyEmailSuccessWatercolor}
          alt=""
          width={936}
          height={764}
          className="h-24 w-24 object-contain"
          priority
        />
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
        <Image
          src={authIcons.verifyEmailExpiredWatercolor}
          alt=""
          width={422}
          height={933}
          className="h-24 w-24 object-contain"
          priority
        />
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
        <BackToLoginLink label={copy.backToLogin} />
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
        <Image
          src={authIcons.verifyEmailInvalidWatercolor}
          alt=""
          width={822}
          height={826}
          className="h-24 w-24 object-contain"
          priority
        />
        <h2 className="text-lg font-semibold text-gray-900">
          {copy.verifyEmailInvalidTitle}
        </h2>
        <p className="text-sm text-gray-600">
          {copy.verifyEmailInvalidSubtitle}
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
        <BackToLoginLink label={copy.backToLogin} />
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

  // state === "check-email"
  return renderShell(
    <div className="flex flex-col items-center gap-4 py-8">
      <Image
        src={
          resendMessage
            ? authIcons.verifyEmailResendSuccessWatercolor
            : deliveryFailed
            ? authIcons.emailDeliveryFailedWatercolor
            : authIcons.checkEmailWatercolor
        }
        alt=""
        width={resendMessage ? 840 : deliveryFailed ? 373 : 799}
        height={resendMessage ? 604 : deliveryFailed ? 970 : 820}
        className="h-24 w-24 object-contain"
        priority
      />
      <h2 className="text-lg font-semibold text-gray-900">
        {copy.verifyEmailCheckTitle}
      </h2>
      <p className="text-center text-sm text-gray-600">
        {deliveryFailed
          ? copy.verifyEmailDeliveryFailed
          : copy.verifyEmailCheckSubtitle}
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
        className="mt-2 w-full hover:border-[#f953c6] hover:bg-[#f953c6] hover:text-white focus-visible:outline-[#f953c6]"
      >
        {copy.resend}
      </Button>
      <BackToLoginLink label={copy.backToLogin} />
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

function BackToLoginLink({ label }: { label: string }) {
  return (
    <Link
      href="/login"
      className="text-sm font-semibold text-[#55637f] transition-colors duration-300 ease-out hover:text-[#f953c6]"
    >
      {label} →
    </Link>
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
