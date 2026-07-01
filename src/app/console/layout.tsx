import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";

export const metadata = {
  title: "Difyon Accounts",
  description: "Advertising account management console",
};

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <ConsoleShell>{children}</ConsoleShell>;
}
