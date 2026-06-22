"use client";

import { useActionState } from "react";
import Link from "next/link";
import { changePassword } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionMessage } from "@/components/account/action-message";

export function PasswordForm() {
  const [state, action, isPending] = useActionState(changePassword, {});

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700"
          >
            当前密码
          </label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            新密码
          </label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            确认新密码
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            disabled={isPending}
            required
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        密码至少 8 个字符，包含大写字母、小写字母和数字。
      </p>

      <ActionMessage error={state.error} success={state.success} />

      {state.success && (
        <Link
          href="/login"
          className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          前往重新登录
        </Link>
      )}

      <Button type="submit" loading={isPending} disabled={isPending}>
        更新密码
      </Button>
    </form>
  );
}

