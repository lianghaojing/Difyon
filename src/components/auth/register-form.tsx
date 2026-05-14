"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import gsap from "gsap";
import { z } from "zod";

import { registerSchema, calculatePasswordStrength } from "@/lib/validations";
import {
  authCopy,
  authLocales,
  resolveAuthLocale,
  translateValidationMessage,
  type AuthLocale,
} from "@/lib/i18n/auth";
import { PasswordStrength } from "@/components/auth/password-strength";

type RegisterFormData = z.infer<typeof registerSchema>;

const fieldBase =
  "peer block h-[42px] w-full rounded-[8px] border bg-white px-4 text-sm font-medium text-[#1a1e26] outline-none transition placeholder:text-transparent";

const fieldLabel =
  "pointer-events-none absolute left-3 bg-white px-1 font-medium transition-all duration-150";

const authIcons = {
  arrow: "/icons/auth/arrow-muted.svg",
  eye: "/icons/auth/eye.svg",
  eyeOff: "/icons/auth/eye-off.svg",
  fontSelect: "/icons/auth/font-select.svg",
};

export function RegisterForm() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const languagePickerRef = useRef<HTMLDivElement>(null);
  const [locale, setLocale] = useState<AuthLocale>("en");
  const [formError, setFormError] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

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

  const copy = authCopy[locale];

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting, isSubmitted, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");
  const emailValue = watch("email");
  const displayNameValue = watch("displayName");
  const confirmPasswordValue = watch("confirmPassword");
  const passwordStrength = passwordValue
    ? calculatePasswordStrength(passwordValue)
    : null;

  const isBusy = isSubmitting || isGoogleLoading;
  const isSubmitDisabled = isBusy || !acceptedTerms || !isValid;

  useEffect(() => {
    if (!heroRef.current || !formRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-title",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
      );
      gsap.fromTo(
        ".gsap-rule",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.65, ease: "power3.out", delay: 0.2 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, [locale]);

  const validation = useMemo(
    () => {
      const shouldShowError = (value?: string) =>
        isSubmitted || Boolean(value && value.length > 0);

      return {
        email: shouldShowError(emailValue)
          ? translateValidationMessage(locale, errors.email?.message)
          : undefined,
        displayName: shouldShowError(displayNameValue)
          ? translateValidationMessage(locale, errors.displayName?.message)
          : undefined,
        password: shouldShowError(passwordValue)
          ? translateValidationMessage(locale, errors.password?.message)
          : undefined,
        confirmPassword: shouldShowError(confirmPasswordValue)
          ? translateValidationMessage(locale, errors.confirmPassword?.message)
          : undefined,
      };
    },
    [
      confirmPasswordValue,
      displayNameValue,
      emailValue,
      errors,
      isSubmitted,
      locale,
      passwordValue,
    ]
  );

  const onSubmit = async (data: RegisterFormData) => {
    if (!acceptedTerms) return;
    setFormError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFormError(errorData.error || copy.genericError);
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("verifyEmail", data.email);
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        setFormError(copy.timeout);
      } else {
        setFormError(copy.genericError);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-white font-['IBM_Plex_Sans','Noto_Sans_SC','Noto_Sans',sans-serif]">
      <motion.div
        className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-6 sm:px-8 md:px-12 lg:px-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-base font-bold tracking-[0] text-[#1a1e26]"
          >
            {copy.brand}
          </Link>

          <div className="relative" ref={languagePickerRef}>
            <button
              type="button"
              onClick={() => setIsLanguageOpen((value) => !value)}
              className="flex h-10 min-w-[72px] items-center justify-center gap-2 rounded-[12px] border border-[#ecedf3] bg-white px-3 text-xs font-semibold text-[#1a1e26] shadow-[inset_0_-2px_0_#ecedf3] transition hover:bg-[#f9fafb]"
              aria-haspopup="listbox"
              aria-expanded={isLanguageOpen}
            >
              <IconMask src={authIcons.fontSelect} color="#55637f" />
              {copy.languages[locale]}
            </button>

            <motion.div
              className="absolute right-0 top-12 z-20 w-[112px] overflow-hidden rounded-[12px] border border-[#ecedf3] bg-white p-1 shadow-[0_18px_45px_rgba(26,30,38,0.12)]"
              role="listbox"
              initial={false}
              animate={
                isLanguageOpen
                  ? { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" }
                  : { opacity: 0, y: -6, scale: 0.98, pointerEvents: "none" }
              }
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {authLocales.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setLocale(item);
                    setIsLanguageOpen(false);
                  }}
                  className={`flex h-9 w-full items-center rounded-[8px] px-3 text-left text-xs font-semibold transition ${
                    locale === item
                      ? "bg-[#1a1e26] text-white"
                      : "text-[#55637f] hover:bg-[#f9fafb] hover:text-[#1a1e26]"
                  }`}
                  role="option"
                  aria-selected={locale === item}
                >
                  {copy.languages[item]}
                </button>
              ))}
            </motion.div>
          </div>
        </header>

        <section className="flex flex-1 items-start justify-center pt-12 sm:pt-16 md:pt-20 lg:pt-[88px]">
          <div className="grid w-full max-w-[1030px] grid-cols-1 gap-10 lg:grid-cols-[420px_1fr] lg:gap-16 xl:gap-24">
            <div ref={heroRef} className="lg:pt-2">
              <motion.p
                className="mb-5 inline-flex rounded-full border border-[#ecedf3] px-3 py-1 text-xs font-semibold text-[#55637f] shadow-[inset_0_-2px_0_#ecedf3]"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.05 }}
              >
                {copy.brand}
              </motion.p>
              <h1 className="gsap-title max-w-[620px] text-4xl font-bold leading-tight tracking-[0] text-[#1a1e26] sm:text-[44px] lg:text-[36px]">
                {copy.registerTitle}
              </h1>
              <p className="gsap-title mt-4 max-w-[520px] text-base leading-7 text-[#55637f] sm:text-lg lg:text-[18px]">
                {copy.registerSubtitle}
              </p>
              <div className="gsap-rule mt-8 h-px w-full max-w-[420px] origin-left bg-[#f0f1f5]" />
            </div>

            <motion.form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-[420px] justify-self-center lg:justify-self-start"
              noValidate
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.055 } },
              }}
            >
              <FormMotionRow>
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isBusy}
                  className="flex h-[42px] w-full items-center justify-center gap-3 rounded-[12px] border border-[#ecedf3] bg-white text-sm font-semibold text-[#1a1e26] shadow-[inset_0_-2px_0_#ecedf3] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <GoogleIcon />
                  {copy.continueWithGoogle}
                </button>
              </FormMotionRow>

              <FormMotionRow className="my-7 flex items-center gap-4">
                <span className="h-px flex-1 bg-[#f0f1f5]" />
                <span className="text-sm font-medium text-[#a6b0c4]">
                  {copy.separator}
                </span>
                <span className="h-px flex-1 bg-[#f0f1f5]" />
              </FormMotionRow>

              {formError && (
                <FormMotionRow
                  className="mb-4 rounded-[8px] border border-[#ff4337] bg-[#fff8f8] px-4 py-3 text-sm font-medium text-[#ff4337]"
                  role="alert"
                  aria-live="polite"
                >
                  {formError}
                </FormMotionRow>
              )}

              <div className="space-y-5">
                <FloatingInput
                  id="email"
                  label={copy.email}
                  placeholder={copy.emailPlaceholder}
                  type="email"
                  autoComplete="email"
                  value={emailValue}
                  error={validation.email}
                  {...register("email", { onBlur: () => trigger("email") })}
                />

                <FloatingInput
                  id="displayName"
                  label={copy.displayName}
                  placeholder={copy.displayNamePlaceholder}
                  type="text"
                  autoComplete="name"
                  value={displayNameValue}
                  error={validation.displayName}
                  {...register("displayName", {
                    onBlur: () => trigger("displayName"),
                  })}
                />

                <FloatingInput
                  id="password"
                  label={copy.password}
                  placeholder={copy.passwordPlaceholder}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={passwordValue}
                  error={validation.password}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-[#55637f] transition hover:text-[#f953c6]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <IconMask
                        src={showPassword ? authIcons.eye : authIcons.eyeOff}
                        color="#55637f"
                      />
                    </button>
                  }
                  {...register("password", {
                    onBlur: () => trigger("password"),
                  })}
                />

                {passwordValue && passwordStrength && (
                  <FormMotionRow>
                    <PasswordStrength strength={passwordStrength} />
                  </FormMotionRow>
                )}

                <FloatingInput
                  id="confirmPassword"
                  label={copy.confirmPassword}
                  placeholder={copy.confirmPasswordPlaceholder}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPasswordValue}
                  error={validation.confirmPassword}
                  {...register("confirmPassword", {
                    onBlur: () => trigger("confirmPassword"),
                  })}
                />
              </div>

              <FormMotionRow className="mt-6">
                <label className="flex items-start gap-3 text-sm font-medium leading-5 text-[#55637f]">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px] rounded-[4px] border-[#ecedf3] accent-[#f953c6]"
                  />
                  <span>
                    {copy.agreePrefix}{" "}
                    <span className="text-[#1a1e26]">{copy.terms}</span>
                    {" & "}
                    <span className="text-[#1a1e26]">{copy.privacy}</span>
                  </span>
                </label>
              </FormMotionRow>

              <FormMotionRow className="mt-10">
                <motion.button
                  type="submit"
                  disabled={isSubmitDisabled}
                  whileTap={!isSubmitDisabled ? { scale: 0.99 } : undefined}
                  whileHover={!isSubmitDisabled ? { y: -1 } : undefined}
                  className={`group flex h-[42px] w-full items-center justify-center rounded-[8px] text-sm font-semibold transition ${
                    isSubmitDisabled
                      ? "bg-[#ecedf3] text-[#a6b0c4]"
                      : "bg-[#f953c6] text-white shadow-[0_12px_30px_rgba(249,83,198,0.24)] hover:bg-[#ec3abb]"
                  }`}
                >
                  {isSubmitting ? copy.loading : copy.createAccount}
                  <MotionArrow
                    className="ml-2"
                    color={isSubmitDisabled ? "#a6b0c4" : "#ffffff"}
                    disabled={isSubmitDisabled}
                  />
                </motion.button>
              </FormMotionRow>

              <FormMotionRow className="mt-5 text-center text-sm font-medium text-[#55637f]">
                {copy.alreadyHaveAccount}{" "}
                <Link
                  href="/login"
                  className="group inline-flex items-center text-[#f953c6] transition hover:text-[#ec3abb]"
                >
                  {copy.login}
                  <MotionArrow className="ml-1" />
                </Link>
              </FormMotionRow>
            </motion.form>
          </div>
        </section>
      </motion.div>
    </div>
  );
}

function FormMotionRow({
  children,
  className = "",
  role,
  "aria-live": ariaLive,
}: {
  children: ReactNode;
  className?: string;
  role?: string;
  "aria-live"?: "off" | "polite" | "assertive";
}) {
  return (
    <motion.div
      className={className}
      role={role}
      aria-live={ariaLive}
      variants={{
        hidden: { y: 14, opacity: 0 },
        show: { y: 0, opacity: 1 },
      }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type FloatingInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  endAdornment?: ReactNode;
  value?: string;
};

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  function FloatingInput(
    {
      id,
      label,
      error,
      endAdornment,
      className = "",
      value,
      onFocus,
      onBlur,
      ...props
    },
    ref: ForwardedRef<HTMLInputElement>
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = typeof value === "string" && value.length > 0;
    const isFloating = isFocused || hasValue || !!error;
    const borderClass = error
      ? "border-[#ff4337] focus:border-[#ff4337]"
      : "border-[#ecedf3] focus:border-[#f953c6]";
    const labelClass = error
      ? "text-[#ff4337]"
      : "text-[#a6b0c4] peer-focus:text-[#f953c6]";
    const labelPositionClass = isFloating
      ? "top-[-8px] text-xs"
      : "top-1/2 -translate-y-1/2 text-sm";

    return (
      <FormMotionRow>
        <div className="relative">
          <input
            id={id}
            ref={ref}
            className={`${fieldBase} ${borderClass} ${
              endAdornment ? "pr-12" : ""
            } ${className}`}
            value={value}
            onFocus={(event) => {
              setIsFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsFocused(false);
              onBlur?.(event);
            }}
            aria-invalid={error ? "true" : undefined}
            {...props}
          />
          <label
            htmlFor={id}
            className={`${fieldLabel} ${labelClass} ${labelPositionClass}`}
          >
            {label}
          </label>
          {endAdornment && (
            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center">
              {endAdornment}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm font-medium text-[#ff4337]">{error}</p>
        )}
      </FormMotionRow>
    );
  }
);

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
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

function MotionArrow({
  color = "#f953c6",
  className = "",
  disabled = false,
}: {
  color?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <span
      className={`inline-flex translate-x-0 transition-transform duration-200 ease-out ${
        disabled ? "" : "group-hover:translate-x-1"
      } ${className}`}
      aria-hidden="true"
    >
      <IconMask src={authIcons.arrow} color={color} />
    </span>
  );
}
