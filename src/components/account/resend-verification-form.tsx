"use client";

import { useActionState } from "react";
import { resendVerificationFromAccount } from "@/actions/account";
import { Button } from "@/components/ui/button";
import { ActionMessage } from "@/components/account/action-message";

export function ResendVerificationForm() {
  const [state, action, isPending] = useActionState(
    resendVerificationFromAccount,
    {}
  );

  return (
    <form action={action} className="space-y-3">
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" loading={isPending} disabled={isPending}>
        重新发送验证邮件
      </Button>
    </form>
  );
}

