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
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { z } from "zod";

import { forgotPasswordSchema } from "@/lib/validations";
import {
  authCopy,
  authLocales,
  translateValidationMessage,
  type AuthLocale,
} from "@/lib/i18n/auth";
import { getInitialAuthLocale, persistAuthLocale } from "@/lib/auth-locale-client";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const fieldBase =
  "peer block h-12 w-full box-border rounded-[8px] border bg-white px-4 text-sm font-medium text-[#a6b0c4] outline-none transition placeholder:text-transparent focus:border-2 focus:px-[15px]";

const fieldLabel =
  "pointer-events-none absolute left-3 bg-white px-1 font-medium transition-all duration-150";

const formAlert =
  "mb-4 rounded-[8px] border border-[#ffd5ec] bg-[#fff8fb] px-3.5 py-3 text-xs font-medium leading-5 text-[#ff4337]";

const authIcons = {
  arrow: "/icons/auth/arrow-muted.svg",
  brandLogo: "/icons/auth/brand-logo.svg",
  check: "/icons/auth/check.svg",
  cross: "/icons/auth/cross.svg",
  fontSelect: "/icons/auth/font-select.svg",
};

export function ForgotPasswordForm() {
  const languagePickerRef = useRef<HTMLDivElement>(null);
  const [locale, setLocale] = useState<AuthLocale>("en");
  const [formError, setFormError] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  const copy = authCopy[locale];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const emailValue = watch("email");
  const isSubmitDisabled = isPending || !isValid;
  const validation = useMemo(
    () => ({
      email: translateValidationMessage(locale, errors.email?.message),
    }),
    [errors.email?.message, locale]
  );

  const onSubmit = (data: ForgotPasswordFormValues) => {
    setFormError("");

    startTransition(async () => {
      const timeoutId = setTimeout(() => {
        setFormError(copy.timeout);
      }, 30000);

      try {
        const response = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          setFormError(copy.forgotPasswordGenericError);
          return;
        }

        setSubmitted(true);
      } catch {
        clearTimeout(timeoutId);
        setFormError(copy.forgotPasswordGenericError);
      }
    });
  };

  return (
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
            </motion.div>
          </div>
        </header>

        <section className="flex w-full min-w-0 flex-1 items-center justify-start py-8 sm:justify-center lg:py-0">
          <motion.div
            key={`${locale}-${submitted ? "sent" : "form"}`}
            className="w-[310px] min-w-0 sm:w-full sm:max-w-[420px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 text-left lg:mb-4">
              <h1 className="text-[30px] font-bold leading-tight text-[#1a1e26] sm:text-[36px] lg:text-[34px]">
                {submitted ? copy.checkEmailTitle : copy.forgotPasswordTitle}
              </h1>
              <p className="mt-3 text-base leading-7 text-[#55637f] sm:text-lg lg:mt-2">
                {submitted ? copy.checkEmailSubtitle : copy.forgotPasswordSubtitle}
              </p>
            </div>

            {submitted ? (
              <motion.div
                className="w-full"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.055 } },
                }}
              >
                <FormMotionRow className="rounded-[12px] border border-[#3B80F7] bg-[#EBF2FF] p-4 text-sm font-medium leading-6 text-[#1a1e26]">
                  {copy.checkEmailBody}
                </FormMotionRow>

                <FormMotionRow className="mt-8 lg:mt-5">
                  <Link
                    href="/login"
                    className="group flex h-[42px] w-full items-center justify-center rounded-[8px] bg-[#f953c6] text-sm font-semibold text-white transition-colors duration-300 ease-out hover:bg-[#ec3abb]"
                  >
                    {copy.backToLogin}
                    <MotionArrow className="ml-2" color="#ffffff" />
                  </Link>
                </FormMotionRow>
              </motion.div>
            ) : (
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
                {formError && (
                  <FormAlert message={formError} onClose={() => setFormError("")} />
                )}

                <div className="space-y-2 lg:space-y-1">
                  <FloatingInput
                    id="email"
                    label={copy.email}
                    placeholder={copy.emailPlaceholder}
                    type="email"
                    autoComplete="email"
                    value={emailValue}
                    error={validation.email}
                    disabled={isPending}
                    {...register("email")}
                  />
                </div>

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
                    {isPending ? copy.sendingResetLink : copy.sendResetLink}
                    <MotionArrow
                      className="ml-2"
                      color={isSubmitDisabled ? "#a6b0c4" : "#ffffff"}
                      disabled={isSubmitDisabled}
                    />
                  </motion.button>
                </FormMotionRow>

                <FormMotionRow className="mt-5 text-center text-sm font-medium text-[#55637f] lg:mt-3">
                  {copy.rememberedPassword}{" "}
                  <Link
                    href="/login"
                    className="group inline-flex items-center text-[#f953c6] transition-colors duration-300 ease-out hover:text-[#ec3abb]"
                  >
                    {copy.login}
                    <MotionArrow className="ml-1" />
                  </Link>
                </FormMotionRow>
              </motion.form>
            )}
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
