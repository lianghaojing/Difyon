import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InfoCard } from "@/components/account/info-card";
import { ProfileForm } from "@/components/account/profile-form";

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export default async function AccountProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/account/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      displayName: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/account/profile");
  }

  const displayName = user.displayName || user.name || "";
  const fallbackName = displayName || user.email;

  return (
    <div className="space-y-6">
      <InfoCard title="个人资料" description="管理账户展示名称。">
        <div className="mb-6 flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {initials(fallbackName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-950">
              {fallbackName}
            </p>
            <p className="truncate text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        <ProfileForm displayName={displayName} />
      </InfoCard>
    </div>
  );
}

