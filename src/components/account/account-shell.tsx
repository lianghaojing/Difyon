import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

type AccountShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: "/account", label: "概览" },
  { href: "/account/profile", label: "资料" },
  { href: "/account/security", label: "安全" },
  { href: "/account/email", label: "邮箱" },
];

export function AccountShell({ children }: AccountShellProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              返回应用
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-gray-950">个人中心</h1>
            <p className="mt-1 text-sm text-gray-600">
              管理账户资料、登录安全和邮箱状态。
            </p>
          </div>
          <LogoutButton className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50" />
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <nav className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:grid-cols-4 lg:grid-cols-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
