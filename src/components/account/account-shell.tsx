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
    <main className="min-h-screen bg-[#f9fafb] font-['IBM_Plex_Sans','Noto_Sans_SC','Noto_Sans',sans-serif] text-[#1a1e26]">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 py-8 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-4 border-b border-[#ecedf3] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold text-[#f953c6] transition-colors hover:text-[#ec3abb]"
            >
              返回应用
            </Link>
            <h1 className="mt-3 text-2xl font-bold">个人中心</h1>
            <p className="mt-1 text-sm text-[#55637f]">
              管理账户资料、登录安全和邮箱状态。
            </p>
          </div>
          <LogoutButton className="inline-flex h-[42px] items-center justify-center rounded-[8px] border border-[#ecedf3] bg-white px-5 text-sm font-semibold text-[#55637f] transition-colors duration-300 hover:bg-[#f4f5f8] disabled:cursor-not-allowed disabled:opacity-50" />
        </header>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <nav className="grid grid-cols-2 gap-2 rounded-[8px] border border-[#ecedf3] bg-white p-2 sm:grid-cols-4 lg:grid-cols-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[8px] px-3 py-2 text-sm font-semibold text-[#55637f] transition-colors duration-300 hover:bg-[#fff3fb] hover:text-[#ec3abb]"
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
