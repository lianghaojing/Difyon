import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Difyon",
  description: "Authentication system",
  icons: {
    icon: "/icons/auth/app-icon.svg",
    shortcut: "/icons/auth/app-icon.svg",
    apple: "/icons/auth/app-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
