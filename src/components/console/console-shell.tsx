"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { label: "仪表盘", href: "/console/dashboard" },
  { label: "账户", href: "/console/accounts" },
  { label: "钱包", href: "/console/wallet" },
  { label: "产品", href: "/console/product" },
  { label: "申请开户记录", href: "/console/application-opening-records" },
];

export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white text-[#14171a]">
      <nav className="flex h-[60px] items-center justify-between bg-[#000344] px-4 sm:px-6 lg:px-12">
        <div className="flex min-w-0 items-center gap-8 lg:gap-[60px]">
          <Link href="/console/dashboard" className="shrink-0">
            <Image
              src="/console-icons/acctable_logo.svg"
              alt="Acctable"
              width={112}
              height={24}
              priority
            />
          </Link>

          <div className="hidden items-center gap-[30px] md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap border-b-[3px] px-0 pb-[6px] pt-[6px] text-base leading-none transition-colors hover:text-white"
                  style={{
                    color: active ? "#ffffff" : "#7d8c94",
                    borderColor: active ? "#3b80f7" : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Image
              src="/console-icons/Wallet.svg"
              alt=""
              width={24}
              height={24}
            />
            <span className="whitespace-nowrap text-lg font-black text-white">
              13,731.72
            </span>
            <span className="hidden text-gray-300 sm:inline">USD</span>
          </div>

          <button
            className="flex h-[30px] w-[30px] items-center justify-center transition-opacity hover:opacity-80"
            aria-label="切换语言"
          >
            <span className="text-sm font-semibold text-[#e2e5e9]">中</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[rgba(59,128,247,0.5)]">
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#3b80f7] text-xs font-bold text-white">
                L
              </div>
            </div>
            <span className="hidden text-sm text-white sm:inline">haojing.liang</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[1356px] px-4 py-4 sm:px-6 lg:px-0">
        {children}
      </main>
    </div>
  );
}
