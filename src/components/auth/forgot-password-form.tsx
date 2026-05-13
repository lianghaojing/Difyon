"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";

import { forgotPasswordSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/auth/form-field";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    setFormError("");

    startTransition(async () => {
      const timeoutId = setTimeout(() => {
        setFormError("请求超时，请重试");
      }, 30000);

      try {
        const response = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          setFormError(errorData.error || "操作失败，请稍后重试");
          return;
        }

        // Always show success message regardless of whether email exists
        setSubmitted(true);
      } catch {
        clearTimeout(timeoutId);
        setFormError("操作失败，请稍后重试");
      }
    });
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">检查您的邮箱</h1>
          <p className="mt-2 text-sm text-gray-600">
            如果该邮箱已注册，重置链接已发送
          </p>
        </div>

        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          如果该邮箱已注册，重置链接已发送到您的邮箱。请检查收件箱（包括垃圾邮件文件夹）。
        </div>

        <p className="text-center text-sm text-gray-600">
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

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">忘记密码</h1>
        <p className="mt-2 text-sm text-gray-600">
          输入您的邮箱地址，我们将发送重置链接
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
        <FormField
          label="邮箱地址"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            maxLength={254}
            error={!!errors.email}
            disabled={isPending}
            {...register("email")}
          />
        </FormField>

        <Button
          type="submit"
          loading={isPending}
          disabled={isPending}
          className="w-full"
        >
          发送重置链接
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
