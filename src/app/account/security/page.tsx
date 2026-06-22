import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/auth/logout-button";
import { InfoCard } from "@/components/account/info-card";
import { PasswordForm } from "@/components/account/password-form";

export default async function AccountSecurityPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/account/security");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      hashedPassword: true,
      accounts: {
        select: { provider: true },
      },
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account/security");
  }

  const providerNames = user.accounts
    .map((account) => account.provider)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <InfoCard
        title="修改密码"
        description="使用密码登录的账号可以在这里更新密码。"
      >
        {user.hashedPassword ? (
          <PasswordForm />
        ) : (
          <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-700">
            当前账号通过 {providerNames || "第三方登录"} 登录，暂不需要本地密码。
          </div>
        )}
      </InfoCard>

      <InfoCard
        title="登录会话"
        description="结束当前浏览器中的登录状态。"
      >
        <LogoutButton className="inline-flex h-[42px] items-center justify-center rounded-[8px] bg-[#f953c6] px-5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-[#ec3abb] disabled:cursor-not-allowed disabled:opacity-50" />
      </InfoCard>
    </div>
  );
}
