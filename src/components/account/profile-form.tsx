"use client";

import { useActionState } from "react";
import { updateDisplayName } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionMessage } from "@/components/account/action-message";

type ProfileFormProps = {
  displayName: string;
};

export function ProfileForm({ displayName }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(updateDisplayName, {});

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-gray-700"
        >
          显示名称
        </label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          defaultValue={displayName}
          minLength={2}
          maxLength={50}
          disabled={isPending}
          autoComplete="name"
        />
        <p className="text-xs text-gray-500">
          2-50 个字符，不能包含前后空格。
        </p>
      </div>

      <ActionMessage error={state.error} success={state.success} />

      <Button type="submit" loading={isPending} disabled={isPending}>
        保存资料
      </Button>
    </form>
  );
}

