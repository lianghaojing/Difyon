"use client";

import { useTransition } from "react";
import { logoutAllDevices } from "@/actions/account";
import { Button } from "@/components/ui/button";

export function LogoutAllDevicesForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      loading={isPending}
      disabled={isPending}
      onClick={() => startTransition(() => logoutAllDevices())}
    >
      退出所有设备
    </Button>
  );
}

