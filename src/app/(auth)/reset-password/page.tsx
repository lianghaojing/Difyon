import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

function ResetPasswordLoading() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">重置密码</h1>
        <p className="mt-2 text-sm text-gray-600">加载中...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
