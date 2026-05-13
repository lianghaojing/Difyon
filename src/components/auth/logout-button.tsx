"use client";

import { useTransition } from "react";
import { logout } from "@/actions/logout";
import { Spinner } from "@/components/ui/spinner";

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      }
      aria-label="退出登录"
    >
      {isPending ? (
        <>
          <Spinner className="h-4 w-4" />
          <span>退出中...</span>
        </>
      ) : (
        children ?? <span>退出登录</span>
      )}
    </button>
  );
}
