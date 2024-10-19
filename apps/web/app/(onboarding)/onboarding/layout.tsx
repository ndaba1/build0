import React from "react";
import { OnboardingAuth } from "./auth";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // block rendering children until auth is loaded
  return <OnboardingAuth>{children}</OnboardingAuth>;
}
