import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { BrandLoading } from "@/components/ui/brand-loading";

function ResetPasswordLoading() {
  return (
    <div className="py-8">
      <BrandLoading />
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
