"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ForwardedRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { z } from "zod";

import { loginSchema } from "@/lib/validations";
import {
  authCopy,
  authLocales,
  resolveAuthLocale,
  translateValidationMessage,
  type AuthLocale,
} from "@/lib/i18n/auth";

type LoginFormValues = z.infer<typeof loginSchema>;
type LoginErrorKey =
  | "timeout"
  | "loginGenericError"
  | "loginInvalidInput"
  | "loginInvalidCredentials"
  | "loginRateLimited";

const fieldBase =
  "peer block h-12 w-full box-border rounded-[8px] border bg-white px-4 text-sm font-medium text-[#a6b0c4] outline-none transition placeholder:text-transparent focus:border-2 focus:px-[15px]";

const fieldLabel =
  "pointer-events-none absolute left-3 bg-white px-1 font-medium transition-all duration-150";

const formAlert =
  "mb-4 rounded-[8px] border border-[#ffd5ec] bg-[#fff8fb] px-3.5 py-3 text-xs font-medium leading-5 text-[#ff4337]";

const formStatus =
  "mb-4 rounded-[8px] border border-[#ecedf3] bg-white px-3.5 py-3 text-xs font-medium leading-5 text-[#55637f]";

const authIcons = {
  arrow: "/icons/auth/arrow-muted.svg",
  brandLogo: "/icons/auth/组 41642.svg",
  check: "/icons/auth/check.svg",
  cross: "/icons/auth/cross.svg",
  eye: "/icons/auth/eye.svg",
  eyeOff: "/icons/auth/eye-off.svg",
  fontSelect: "/icons/auth/font-select.svg",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const languagePickerRef = useRef<HTMLDivElement>(null);

  const [locale, setLocale] = useState<AuthLocale>("en");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrorKey, setFormErrorKey] = useState<LoginErrorKey | null>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");
  const isSubmitDisabled = isPending || !isValid;
  const message = searchParams.get("message");
  const verified = searchParams.get("verified");
  const formError = formErrorKey ? copy[formErrorKey] : "";
  const validation = useMemo(
    () => ({
      email: translateValidationMessage(locale, errors.email?.message),
      password: translateValidationMessage(locale, errors.password?.message),
    }),
    [errors.email?.message, errors.password?.message, locale]
  );

  const onSubmit = (data: LoginFormValues) => {
    setFormErrorKey(null);

    startTransition(async () => {
      const timeoutId = setTimeout(() => {
        setFormErrorKey("timeout");
        setValue("password", "");
      }, 30000);

      try {
        const { login } = await import("@/actions/login");
        const result = await login({
          email: data.email,
          password: data.password,
          callbackUrl,
        });

        clearTimeout(timeoutId);

        if (result?.errorKey) {
          setFormErrorKey(result.errorKey);
          setValue("password", "");
        }
      } catch {
        clearTimeout(timeoutId);
        setFormErrorKey("loginGenericError");
        setValue("password", "");
      }
    });
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl });
  };

  return (
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

            <motion.div
              className="absolute right-0 top-12 z-20 w-[132px] overflow-hidden rounded-[12px] border border-[#ecedf3] bg-white p-1 shadow-[0_18px_45px_rgba(26,30,38,0.12)]"
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
            </motion.div>
          </div>
        </header>

        <section className="flex w-full min-w-0 flex-1 items-start justify-start pt-8 sm:justify-center sm:pt-8 md:pt-8 lg:pt-2">
          <motion.div
            key={locale}
            className="w-[310px] min-w-0 sm:w-full sm:max-w-[420px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="mb-5 text-left lg:mb-4">
              <h1 className="text-[30px] font-bold leading-tight text-[#1a1e26] sm:text-[36px] lg:text-[34px]">
                {copy.loginTitle}
              </h1>
              <p className="mt-3 text-base leading-7 text-[#55637f] sm:text-lg lg:mt-2">
                {copy.loginSubtitle}
              </p>
            </div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full"
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
                  onClick={handleGoogleLogin}
                  disabled={isPending}
                  className="flex h-[42px] w-full items-center justify-center gap-3 rounded-[12px] border border-[#ecedf3] bg-white text-sm font-semibold text-[#1a1e26] shadow-[inset_0_-2px_0_#ecedf3] transition-colors duration-300 ease-out hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <GoogleIcon />
                  {copy.continueWithGoogle}
                </button>
              </FormMotionRow>

              <FormMotionRow className="my-6 flex items-center gap-4 lg:my-4">
                <span className="h-px flex-1 bg-[#f0f1f5]" />
                <span className="text-sm font-medium text-[#a6b0c4]">
                  {copy.separator}
                </span>
                <span className="h-px flex-1 bg-[#f0f1f5]" />
              </FormMotionRow>

              {formError && (
                <FormAlert
                  message={formError}
                  onClose={() => setFormErrorKey(null)}
                />
              )}

              {!formError && (verified === "true" || message === "password-reset-success") && (
                <FormMotionRow
                  className={formStatus}
                  role="status"
                  aria-live="polite"
                >
                  {verified === "true"
                    ? copy.emailVerifiedSuccess
                    : copy.passwordResetSuccess}
                </FormMotionRow>
              )}

              <div className="space-y-2 lg:space-y-1">
                <FloatingInput
                  id="email"
                  label={copy.email}
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  value={emailValue}
                  error={validation.email}
                  {...register("email")}
                />

                <FloatingInput
                  id="password"
                  label={copy.password}
                  placeholder={copy.passwordPlaceholder}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={passwordValue}
                  error={validation.password}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="flex h-6 w-6 items-center justify-center text-[#55637f] transition-colors duration-300 ease-out hover:text-[#f953c6]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <IconMask
                        src={showPassword ? authIcons.eye : authIcons.eyeOff}
                        color="#55637f"
                      />
                    </button>
                  }
                  {...register("password")}
                />
              </div>

              <FormMotionRow className="mt-2 flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#55637f] transition-colors duration-300 ease-out hover:text-[#f953c6]"
                >
                  {copy.forgotPassword}
                </Link>
              </FormMotionRow>

              <FormMotionRow className="mt-8 lg:mt-5">
                <motion.button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`group flex h-[42px] w-full items-center justify-center rounded-[8px] text-sm font-semibold transition-colors duration-300 ease-out ${
                    isSubmitDisabled
                      ? "cursor-not-allowed bg-[#ecedf3] text-[#a6b0c4]"
                      : "bg-[#f953c6] text-white hover:bg-[#ec3abb]"
                  }`}
                >
                  {copy.login}
                  <MotionArrow
                    className="ml-2"
                    color={isSubmitDisabled ? "#a6b0c4" : "#ffffff"}
                    disabled={isSubmitDisabled}
                  />
                </motion.button>
              </FormMotionRow>
            </motion.form>

            <FormMotionRow className="mt-5 text-center text-sm font-medium text-[#55637f] lg:mt-3">
              {copy.noAccount}{" "}
              <Link
                href="/register"
                className="group inline-flex items-center text-[#f953c6] transition-colors duration-300 ease-out hover:text-[#ec3abb]"
              >
                {copy.signUp}
                <MotionArrow className="ml-1" />
              </Link>
            </FormMotionRow>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

function FormAlert({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <FormMotionRow className={formAlert} role="alert" aria-live="polite">
      <span className="flex items-start justify-between gap-3">
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="-mr-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[#ff4337] transition-colors duration-300 ease-out hover:text-[#d92d25]"
          aria-label="Dismiss error"
        >
          <IconMask
            src={authIcons.cross}
            color="currentColor"
            className="h-3.5 w-3.5"
          />
        </button>
      </span>
    </FormMotionRow>
  );
}

type FloatingInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  endAdornment?: ReactNode;
  value?: string;
};

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

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  function FloatingInput(
    { id, label, error, endAdornment, value, onFocus, onBlur, ...props },
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
            }`}
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
        <p
          className={`mt-1.5 min-h-4 text-xs font-medium leading-4 ${
            error ? "text-[#ff4337]" : "text-transparent"
          }`}
          aria-hidden={error ? undefined : "true"}
        >
          {error || "."}
        </p>
      </FormMotionRow>
    );
  }
);

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
      className={`inline-flex translate-x-0 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        disabled ? "" : "group-hover:translate-x-1"
      } ${className}`}
      aria-hidden="true"
    >
      <IconMask src={authIcons.arrow} color={color} />
    </span>
  );
}
