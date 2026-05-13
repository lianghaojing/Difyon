import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function Home() {
  const session = await auth();

  // Redirect unverified email users to verify-email page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (session?.user && !(session.user as any).emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email || "")}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Difyon</h1>
          <p className="mt-2 text-sm text-gray-600">欢迎回来</p>
        </div>

        {session?.user && (
          <div className="space-y-4">
            <div className="rounded-md bg-gray-50 p-4">
              <h2 className="text-sm font-medium text-gray-500">用户信息</h2>
              <dl className="mt-2 space-y-2">
                {session.user.name && (
                  <div>
                    <dt className="text-xs text-gray-500">名称</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {session.user.name}
                    </dd>
                  </div>
                )}
                {session.user.email && (
                  <div>
                    <dt className="text-xs text-gray-500">邮箱</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {session.user.email}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <LogoutButton className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" />
          </div>
        )}
      </div>
    </main>
  );
}
