"use client";

import { useAuth } from "@/components/authenticator";
import { Loader } from "@/components/loader";

export function OnboardingAuth({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return <>{children}</>;
}
