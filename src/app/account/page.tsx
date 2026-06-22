import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InfoCard } from "@/components/account/info-card";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function AccountOverviewPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/account");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      displayName: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account");
  }

  const displayName = user.displayName || user.name || user.email;

  return (
    <div className="space-y-6">
      <InfoCard
        title="账户概览"
        description="查看当前登录身份和账户状态。"
      >
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[8px] bg-[#f9fafb] p-4">
            <dt className="text-xs font-medium text-[#55637f]">
              显示名称
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[#1a1e26]">
              {displayName}
            </dd>
          </div>
          <div className="rounded-[8px] bg-[#f9fafb] p-4">
            <dt className="text-xs font-medium text-[#55637f]">
              邮箱
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[#1a1e26]">
              {user.email}
            </dd>
          </div>
          <div className="rounded-[8px] bg-[#f9fafb] p-4">
            <dt className="text-xs font-medium text-[#55637f]">
              邮箱状态
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#1a1e26]">
              {user.emailVerified ? "已验证" : "未验证"}
            </dd>
          </div>
          <div className="rounded-[8px] bg-[#f9fafb] p-4">
            <dt className="text-xs font-medium text-[#55637f]">
              注册时间
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#1a1e26]">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>
      </InfoCard>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickAction
          href="/account/profile"
          title="编辑资料"
          description="更新显示名称和查看头像。"
        />
        <QuickAction
          href="/account/security"
          title="账户安全"
          description="修改密码或退出当前账户。"
        />
        <QuickAction
          href="/account/email"
          title="邮箱状态"
          description="查看验证状态并重新发送验证邮件。"
        />
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[8px] border border-[#ecedf3] bg-white p-5 transition-colors duration-300 hover:border-[#f953c6] hover:bg-[#fff8fb]"
    >
      <h2 className="text-base font-semibold text-[#1a1e26]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#55637f]">{description}</p>
    </Link>
  );
}
