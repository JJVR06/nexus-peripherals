import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { GuestOnly } from "@/components/auth/GuestOnly";
export const metadata = { title: "Create account" };
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="container-nexus py-24 text-center">
          Checking your session…
        </div>
      }
    >
      <GuestOnly>
        <AuthLayout
          title="Create your account"
          subtitle="Join Nexus and gear up faster."
        >
          <RegisterForm />
        </AuthLayout>
      </GuestOnly>
    </Suspense>
  );
}
