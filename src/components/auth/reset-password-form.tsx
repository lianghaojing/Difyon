"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";

import { resetPasswordSchema, calculatePasswordStrength } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/auth/form-field";
import { PasswordStrength } from "@/components/auth/password-strength";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [formError, setFormError] = useState<string>("");
  const [tokenError, setTokenError] = useState<"expired" | "invalid" | null>(
    token ? null : "invalid"
  );
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, dirtyFields },
    getFieldState,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");
  const passwordStrength = passwordValue
    ? calculatePasswordStrength(passwordValue)
    : null;

  const isFieldValid = (fieldName: keyof ResetPasswordFormValues): boolean => {
    const state = getFieldState(fieldName);
    return state.isTouched && !state.error && !!dirtyFields[fieldName];
  };

  const handleBlur = async (fieldName: keyof ResetPasswordFormValues) => {
    await trigger(fieldName);
  };

  const onSubmit = (data: ResetPasswordFormValues) => {
    setFormError("");

    startTransition(async () => {
      const timeoutId = setTimeout(() => {
        setFormError("请求超时，请重试");
      }, 30000);

      try {
        const response = await fetch("/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            password: data.password,
            confirmPassword: data.confirmPassword,
          }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();

          if (response.status === 410) {
            setTokenError("expired");
            return;
          }

          if (response.status === 400 && errorData.error === "重置链接无效") {
            setTokenError("invalid");
            return;
          }

          setFormError(errorData.error || "重置密码失败，请稍后重试");
          return;
        }

        // Success - redirect to login with success message
        router.push("/login?message=password-reset-success");
      } catch {
        clearTimeout(timeoutId);
        setFormError("重置密码失败，请稍后重试");
      }
    });
  };

  // Token expired state
  if (tokenError === "expired") {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">链接已过期</h1>
          <p className="mt-2 text-sm text-gray-600">
            此密码重置链接已过期，请重新申请
          </p>
        </div>

        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
          密码重置链接有效期为 1 小时。请返回忘记密码页面重新申请。
        </div>

        <p className="text-center text-sm text-gray-600">
          <Link
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            返回忘记密码
          </Link>
        </p>
      </div>
    );
  }

  // Token invalid/missing state
  if (tokenError === "invalid") {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">链接无效</h1>
          <p className="mt-2 text-sm text-gray-600">
            此密码重置链接无效或已被使用
          </p>
        </div>

        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          该链接可能已过期、已被使用或不正确。请重新申请密码重置。
        </div>

        <p className="text-center text-sm text-gray-600">
          <Link
            href="/forgot-password"
            className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            返回忘记密码
          </Link>
        </p>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">重置密码</h1>
        <p className="mt-2 text-sm text-gray-600">
          请输入您的新密码
        </p>
      </div>

      {formError && (
        <div
          className="rounded-md bg-red-50 p-3 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <FormField
            label="新密码"
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
              disabled={isPending}
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
          label="确认新密码"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          success={isFieldValid("confirmPassword")}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="再次输入新密码"
            maxLength={128}
            error={!!errors.confirmPassword}
            success={isFieldValid("confirmPassword")}
            disabled={isPending}
            {...register("confirmPassword", {
              onBlur: () => handleBlur("confirmPassword"),
            })}
          />
        </FormField>

        <Button
          type="submit"
          loading={isPending}
          disabled={isPending}
          className="w-full"
        >
          重置密码
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600">
        记起密码了？{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          返回登录
        </Link>
      </p>
    </div>
  );
}
