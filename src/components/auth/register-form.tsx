"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

import { registerSchema, calculatePasswordStrength } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/auth/form-field";
import { PasswordStrength } from "@/components/auth/password-strength";

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting, touchedFields, dirtyFields },
    getFieldState,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");
  const passwordStrength = passwordValue
    ? calculatePasswordStrength(passwordValue)
    : null;

  const isFieldValid = (fieldName: keyof RegisterFormData): boolean => {
    const state = getFieldState(fieldName);
    return state.isTouched && !state.error && !!dirtyFields[fieldName];
  };

  const handleBlur = async (fieldName: keyof RegisterFormData) => {
    await trigger(fieldName);
  };

  const onSubmit = async (data: RegisterFormData) => {
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
        setFormError(errorData.error || "注册失败，请稍后重试");
        return;
      }

      // Store email in sessionStorage for verify-email page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("verifyEmail", data.email);
      }

      // Registration successful, sign in and redirect to verify-email
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "TimeoutError"
      ) {
        setFormError("请求超时，请重试");
      } else {
        setFormError("注册失败，请稍后重试");
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
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">创建账户</h1>
        <p className="mt-2 text-sm text-gray-600">
          注册以开始使用
        </p>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={handleGoogleSignUp}
        loading={isGoogleLoading}
        disabled={isSubmitting}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
        使用 Google 注册
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">或</span>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {formError && (
          <div
            className="rounded-md bg-red-50 p-3 text-sm text-red-700"
            role="alert"
            aria-live="polite"
          >
            {formError}
          </div>
        )}

        <FormField
          label="邮箱地址"
          htmlFor="email"
          error={errors.email?.message}
          success={isFieldValid("email")}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={254}
            error={!!errors.email}
            success={isFieldValid("email")}
            {...register("email", {
              onBlur: () => handleBlur("email"),
            })}
          />
        </FormField>

        <FormField
          label="显示名称"
          htmlFor="displayName"
          error={errors.displayName?.message}
          success={isFieldValid("displayName")}
        >
          <Input
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder="您的名称"
            maxLength={50}
            error={!!errors.displayName}
            success={isFieldValid("displayName")}
            {...register("displayName", {
              onBlur: () => handleBlur("displayName"),
            })}
          />
        </FormField>

        <div className="space-y-2">
          <FormField
            label="密码"
            htmlFor="password"
            error={errors.password?.message}
            success={isFieldValid("password")}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="至少 8 个字符"
              maxLength={128}
              error={!!errors.password}
              success={isFieldValid("password")}
              {...register("password", {
                onBlur: () => handleBlur("password"),
              })}
            />
          </FormField>

          {passwordValue && passwordStrength && (
            <PasswordStrength strength={passwordStrength} />
          )}
        </div>

        <FormField
          label="确认密码"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          success={isFieldValid("confirmPassword")}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="再次输入密码"
            maxLength={128}
            error={!!errors.confirmPassword}
            success={isFieldValid("confirmPassword")}
            {...register("confirmPassword", {
              onBlur: () => handleBlur("confirmPassword"),
            })}
          />
        </FormField>

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={isGoogleLoading}
        >
          注册
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        已有账户？{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          登录
        </Link>
      </p>
    </div>
  );
}
