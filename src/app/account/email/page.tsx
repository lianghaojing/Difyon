import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InfoCard } from "@/components/account/info-card";
import { ResendVerificationForm } from "@/components/account/resend-verification-form";

export default async function AccountEmailPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/account/email");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      emailVerified: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account/email");
  }

  return (
    <div className="space-y-6">
      <InfoCard
        title="邮箱状态"
        description="邮箱用于登录、验证和找回账户。"
      >
        <dl className="space-y-4">
          <div className="rounded-md bg-gray-50 p-4">
            <dt className="text-xs font-medium uppercase text-gray-500">
              当前邮箱
            </dt>
            <dd className="mt-1 break-words text-sm font-semibold text-gray-950">
              {user.email}
            </dd>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <dt className="text-xs font-medium uppercase text-gray-500">
              验证状态
            </dt>
            <dd className="mt-1 text-sm font-semibold text-gray-950">
              {user.emailVerified ? "已验证" : "未验证"}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          {user.emailVerified ? (
            <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
              当前邮箱已完成验证。
            </p>
          ) : (
            <ResendVerificationForm />
          )}
        </div>
      </InfoCard>
    </div>
  );
}

