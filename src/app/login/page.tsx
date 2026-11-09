import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { GuestOnly } from "@/components/auth/GuestOnly";
export const metadata = { title: "Sign in" };
export default function LoginPage() {
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
          title="Welcome back"
          subtitle="Sign in to your Nexus account."
        >
          <LoginForm />
        </AuthLayout>
      </GuestOnly>
    </Suspense>
  );
}
